import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { filterByDate } from '@openhistoricalmap/maplibre-gl-dates';
import MaplibreLanguage from '@openhistoricalmap/maplibre-gl-language';
import { smoothRoute } from '../../utils/smoothRoute.js';
import { useJourneyRouteEditor } from './useJourneyRouteEditor.js';
import './BiblicalPlacesMap.css';

const OHM_STYLE_URL = 'https://www.openhistoricalmap.org/map-styles/main/main.json';

// Default center: roughly the Holy Land
const DEFAULT_CENTER = [35.23, 31.77];
const DEFAULT_ZOOM = 6;

function formatYearForOHM(year) {
  if (year < 0) {
    return '-' + String(Math.abs(year)).padStart(4, '0');
  }
  return String(year).padStart(4, '0');
}

/**
 * Full-screen MapLibre map with place pins.
 * Uses GeoJSON source with clustering for performance.
 * Supports journey polyline overlays and theme/women filtering.
 */
export const BiblicalPlacesMap = forwardRef(function BiblicalPlacesMap(
  { places, placeEventsMap, placePeopleMap, ageMap, activeAgeFilter, mapYear, onSelectPlace,
    activeJourney, journeyStops, journeyColor, journeyWaypoints,
    isEditingRoute, adminGetToken, onWaypointsChanged,
    activeTheme, themeStopPlaceIds, themeColor,
    womenPlaceIds },
  ref
) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  // Expose flyTo, fitBounds, reset, and setYear to parent
  useImperativeHandle(ref, () => ({
    flyTo(lng, lat) {
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 9, duration: 1200 });
      }
    },
    fitBounds(bounds, options) {
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, { padding: 50, duration: 1200, ...options });
      }
    },
    setYear(year) {
      const map = mapRef.current;
      if (!map) return;
      try {
        filterByDate(map, formatYearForOHM(year));
      } catch { /* ignore */ }
    },
    reset() {
      if (mapRef.current) {
        mapRef.current.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 1000 });
        try {
          filterByDate(mapRef.current, formatYearForOHM(-1000));
        } catch { /* ignore */ }
      }
    }
  }), []);

  // Collect all age IDs connected to a place (via events and person-place links)
  const getPlaceAgeIds = useCallback((placeId) => {
    const ids = new Set();
    const events = placeEventsMap.get(placeId) || [];
    events.forEach(e => { if (e.narrative_age_id) ids.add(e.narrative_age_id); });
    const people = placePeopleMap.get(placeId) || [];
    people.forEach(p => { if (p.age?.age_id) ids.add(p.age.age_id); });
    return ids;
  }, [placeEventsMap, placePeopleMap]);

  // Build GeoJSON from places
  const buildGeoJSON = useCallback(() => {
    const features = places
      .filter(place => {
        // Theme filter: only show places in the theme stops
        if (activeTheme && activeTheme !== '__women__' && themeStopPlaceIds) {
          return themeStopPlaceIds.has(place.place_id);
        }
        // Women filter: only show places connected to women
        if (activeTheme === '__women__' && womenPlaceIds) {
          return womenPlaceIds.has(place.place_id);
        }
        // Journey filter: show all places but journey stops get highlighted below
        if (activeAgeFilter) {
          return getPlaceAgeIds(place.place_id).has(activeAgeFilter);
        }
        return true;
      })
      .map(place => {
        let color = '#8b7355'; // default neutral

        if (activeTheme && activeTheme !== '__women__' && themeColor) {
          color = themeColor;
        } else if (activeTheme === '__women__') {
          color = '#C47AC0';
        } else if (activeAgeFilter) {
          const selectedAge = ageMap.get(activeAgeFilter);
          if (selectedAge?.color) color = selectedAge.color;
        } else {
          const ageIds = getPlaceAgeIds(place.place_id);
          let earliest = null;
          for (const id of ageIds) {
            const age = ageMap.get(id);
            if (age && (earliest === null || age.sort_order < earliest.sort_order)) {
              earliest = age;
            }
          }
          if (earliest?.color) color = earliest.color;
        }

        const events = placeEventsMap.get(place.place_id) || [];
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [place.lng, place.lat],
          },
          properties: {
            place_id: place.place_id,
            name: place.name,
            region: place.region || '',
            color,
            eventCount: events.length,
          },
        };
      });

    return { type: 'FeatureCollection', features };
  }, [places, placeEventsMap, placePeopleMap, ageMap, activeAgeFilter, getPlaceAgeIds,
      activeTheme, themeStopPlaceIds, themeColor, womenPlaceIds]);

  // Store latest buildGeoJSON in a ref so the mount-time load handler always
  // has access to the most recent version (avoids stale closure)
  const buildGeoJSONRef = useRef(buildGeoJSON);
  buildGeoJSONRef.current = buildGeoJSON;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OHM_STYLE_URL,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: true,
    });

    mapRef.current = map;

    map.addControl(new MaplibreLanguage({ defaultLanguage: 'en' }));
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      const geojson = buildGeoJSONRef.current();

      // Add GeoJSON source with clustering
      map.addSource('places', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 50,
      });

      // Journey route source (initially empty)
      map.addSource('journey-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Journey route line layer
      map.addLayer({
        id: 'journey-route-line',
        type: 'line',
        source: 'journey-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-opacity': 0.8,
          'line-dasharray': [2, 3],
        },
      });

      // Journey stop markers source
      map.addSource('journey-stops', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Journey stop number circles
      map.addLayer({
        id: 'journey-stop-circles',
        type: 'circle',
        source: 'journey-stops',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 12,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#faf6eb',
        },
      });

      // Journey stop number labels
      map.addLayer({
        id: 'journey-stop-labels',
        type: 'symbol',
        source: 'journey-stops',
        layout: {
          'text-field': ['get', 'stopNum'],
          'text-font': ['Open Sans Bold'],
          'text-size': 11,
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#faf6eb',
        },
      });

      // Journey stop name labels (below the numbered circle)
      map.addLayer({
        id: 'journey-stop-name-labels',
        type: 'symbol',
        source: 'journey-stops',
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 11,
          'text-offset': [0, 2],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'text-color': '#2c2418',
          'text-halo-color': '#faf6eb',
          'text-halo-width': 1.5,
        },
      });

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'places',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#8b7355',
          'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 30],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#faf6eb',
        },
      });

      // Cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'places',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold'],
          'text-size': 13,
        },
        paint: {
          'text-color': '#faf6eb',
        },
      });

      // Individual place pins
      map.addLayer({
        id: 'place-pins',
        type: 'circle',
        source: 'places',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#faf6eb',
        },
      });

      // Place name labels
      map.addLayer({
        id: 'place-labels',
        type: 'symbol',
        source: 'places',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 12,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'text-color': '#2c2418',
          'text-halo-color': '#faf6eb',
          'text-halo-width': 1.5,
        },
      });

      // Click on individual pin
      map.on('click', 'place-pins', (e) => {
        const feature = e.features[0];
        if (feature) {
          onSelectPlace(feature.properties.place_id);
        }
      });

      // Click on journey stop → open as place
      map.on('click', 'journey-stop-circles', (e) => {
        const feature = e.features[0];
        if (feature?.properties?.place_id) {
          onSelectPlace(feature.properties.place_id);
        }
      });

      // Click on cluster -> zoom to show all individual places
      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        const pointCount = features[0].properties.point_count;
        const source = map.getSource('places');

        try {
          const leaves = await source.getClusterLeaves(clusterId, pointCount, 0);
          if (!leaves || leaves.length === 0) {
            const zoom = await source.getClusterExpansionZoom(clusterId);
            map.easeTo({ center: features[0].geometry.coordinates, zoom });
            return;
          }

          // Compute bounds around all leaves and fit to them
          const bounds = new maplibregl.LngLatBounds();
          leaves.forEach(leaf => {
            bounds.extend(leaf.geometry.coordinates);
          });
          map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 });
        } catch {
          // Fallback to expansion zoom
          try {
            const zoom = await source.getClusterExpansionZoom(clusterId);
            map.easeTo({ center: features[0].geometry.coordinates, zoom });
          } catch { /* silently fail */ }
        }
      });

      // Hover effects on pins
      map.on('mouseenter', 'place-pins', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = e.features[0];
        if (feature) {
          const coords = feature.geometry.coordinates.slice();
          const name = feature.properties.name;
          const region = feature.properties.region;
          const eventCount = feature.properties.eventCount;

          const html = `<strong>${name}</strong>${region ? ` <em>${region}</em>` : ''}${eventCount > 0 ? `<br><span class="bp-popup-count">${eventCount} event${eventCount !== 1 ? 's' : ''}</span>` : ''}`;

          popupRef.current = new maplibregl.Popup({
            offset: 12,
            closeButton: false,
            closeOnClick: false,
            className: 'bp-map-tooltip',
          })
            .setLngLat(coords)
            .setHTML(html)
            .addTo(map);
        }
      });

      map.on('mouseleave', 'place-pins', () => {
        map.getCanvas().style.cursor = '';
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      });

      // Hover on journey stops
      map.on('mouseenter', 'journey-stop-circles', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = e.features[0];
        if (feature) {
          const coords = feature.geometry.coordinates.slice();
          const label = feature.properties.label;
          const desc = feature.properties.description;
          const html = `<strong>${label}</strong>${desc ? `<br><span class="bp-popup-count">${desc}</span>` : ''}`;
          popupRef.current = new maplibregl.Popup({
            offset: 16,
            closeButton: false,
            closeOnClick: false,
            className: 'bp-map-tooltip',
          })
            .setLngLat(coords)
            .setHTML(html)
            .addTo(map);
        }
      });

      map.on('mouseleave', 'journey-stop-circles', () => {
        map.getCanvas().style.cursor = '';
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      });

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    // Date filtering on style data ready
    map.once('styledata', () => {
      // Default: show an ancient date (roughly 1000 BC)
      try {
        filterByDate(map, formatYearForOHM(-1000));
      } catch {
        // silently ignore
      }
    });

    return () => {
      mapRef.current = null;
      if (popupRef.current) popupRef.current.remove();
      map.remove();
    };
  }, []); // Mount once

  // Update GeoJSON when filter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const update = () => {
      const source = map.getSource('places');
      if (source) {
        source.setData(buildGeoJSON());
        return true;
      }
      return false;
    };

    // Try immediately; if the source isn't ready yet, wait for load
    if (!update()) {
      const onLoad = () => update();
      map.once('load', onLoad);
      return () => map.off('load', onLoad);
    }
  }, [activeAgeFilter, activeTheme, buildGeoJSON]);

  // Update journey route overlay (skip when edit mode — the editor hook owns the route)
  useEffect(() => {
    if (isEditingRoute) return;

    const map = mapRef.current;
    if (!map) return;

    const update = () => {
      const routeSource = map.getSource('journey-route');
      const stopsSource = map.getSource('journey-stops');
      if (!routeSource || !stopsSource) return false;

      if (!activeJourney || !journeyStops || journeyStops.length === 0) {
        routeSource.setData({ type: 'FeatureCollection', features: [] });
        stopsSource.setData({ type: 'FeatureCollection', features: [] });
        return true;
      }

      const color = journeyColor || '#8b7355';

      // Build line coordinates from stops, then smooth with Catmull-Rom splines
      const rawCoords = journeyStops
        .filter(s => s.place)
        .map(s => [s.place.lng, s.place.lat]);

      // Build a waypoints map (segment index → [[lng,lat],...]) if available
      let waypointsMap = null;
      if (journeyWaypoints && journeyWaypoints.size > 0) {
        waypointsMap = journeyWaypoints;
      }

      const coords = rawCoords.length >= 2
        ? smoothRoute(rawCoords, { tension: 0.5, pointsPerSegment: 12 }, waypointsMap)
        : rawCoords;

      const routeFeatures = coords.length >= 2 ? [{
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: { color },
      }] : [];

      // Build stop point features
      const stopFeatures = journeyStops
        .filter(s => s.place)
        .map((s, i) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.place.lng, s.place.lat] },
          properties: {
            place_id: s.place_id,
            label: s.label || s.place.name,
            description: s.description || '',
            stopNum: String(i + 1),
            color,
          },
        }));

      routeSource.setData({ type: 'FeatureCollection', features: routeFeatures });
      stopsSource.setData({ type: 'FeatureCollection', features: stopFeatures });
      return true;
    };

    if (!update()) {
      const onLoad = () => update();
      map.once('load', onLoad);
      return () => map.off('load', onLoad);
    }
  }, [activeJourney, journeyStops, journeyColor, journeyWaypoints, isEditingRoute]);

  // Journey route editor (admin drag-to-edit waypoints)
  useJourneyRouteEditor(mapRef, {
    isEditing: isEditingRoute,
    activeJourney,
    journeyStops,
    journeyColor,
    getToken: adminGetToken,
    onWaypointsChanged,
  });

  // Update OHM date filter when mapYear changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyFilter = () => {
      const year = mapYear != null ? mapYear : -1000;
      try {
        filterByDate(map, formatYearForOHM(year));
      } catch { /* ignore */ }
    };

    if (map.isStyleLoaded()) {
      applyFilter();
    } else {
      map.once('styledata', applyFilter);
      return () => map.off('styledata', applyFilter);
    }
  }, [mapYear]);

  return (
    <div className="bp-map-container" ref={mapContainerRef} />
  );
});
