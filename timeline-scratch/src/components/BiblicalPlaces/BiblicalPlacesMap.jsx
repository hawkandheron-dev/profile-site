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
  { places, placeEventsMap, ageMap, activeAgeFilter, onSelectPlace },
  ref
) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  // Expose flyTo to parent
  useImperativeHandle(ref, () => ({
    flyTo(lng, lat) {
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 9, duration: 1200 });
      }
    }
  }), []);

  // Build GeoJSON from places
  const buildGeoJSON = useCallback(() => {
    const features = places
      .filter(place => {
        if (!activeAgeFilter) return true;
        // Only show places that have events in the active age
        const events = placeEventsMap.get(place.place_id) || [];
        return events.some(e => e.narrative_age_id === activeAgeFilter);
      })
      .map(place => {
        // Determine pin color from the earliest event's narrative age
        const events = placeEventsMap.get(place.place_id) || [];
        let color = '#8b7355'; // default neutral
        if (events.length > 0) {
          const firstAge = ageMap.get(events[0].narrative_age_id);
          if (firstAge?.color) color = firstAge.color;
        }
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
  }, [places, placeEventsMap, ageMap, activeAgeFilter]);

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
      const geojson = buildGeoJSON();

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

      // Click on cluster -> zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('places').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
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

    // Date filtering on style load
    map.once('style.load', () => {
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
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('places');
    if (source) {
      source.setData(buildGeoJSON());
    }

    // Update OHM date filter
    if (activeAgeFilter) {
      const age = ageMap.get(activeAgeFilter);
      if (age?.approx_start_year != null) {
        try {
          filterByDate(map, formatYearForOHM(age.approx_start_year));
        } catch { /* ignore */ }
      }
    } else {
      // Reset to a default ancient date
      try {
        filterByDate(map, formatYearForOHM(-1000));
      } catch { /* ignore */ }
    }
  }, [activeAgeFilter, buildGeoJSON, ageMap]);

  return (
    <div className="bp-map-container" ref={mapContainerRef} />
  );
});
