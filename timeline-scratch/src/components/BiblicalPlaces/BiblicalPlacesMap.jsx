import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { filterByDate } from '@openhistoricalmap/maplibre-gl-dates';
import MaplibreLanguage from '@openhistoricalmap/maplibre-gl-language';
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
 */
export const BiblicalPlacesMap = forwardRef(function BiblicalPlacesMap(
  { places, placeEventsMap, placePeopleMap, ageMap, activeAgeFilter, mapYear, onSelectPlace },
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
        if (!activeAgeFilter) return true;
        // Show places connected to the active age via events OR person-place links
        return getPlaceAgeIds(place.place_id).has(activeAgeFilter);
      })
      .map(place => {
        let color = '#8b7355'; // default neutral

        if (activeAgeFilter) {
          // When an age is selected, all visible dots use that age's color
          const selectedAge = ageMap.get(activeAgeFilter);
          if (selectedAge?.color) color = selectedAge.color;
        } else {
          // No filter: use the earliest connected age's color
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
  }, [places, placeEventsMap, placePeopleMap, ageMap, activeAgeFilter, getPlaceAgeIds]);

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
  }, [activeAgeFilter, buildGeoJSON]);

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
