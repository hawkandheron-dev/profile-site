import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { filterByDate } from '@openhistoricalmap/maplibre-gl-dates';
import MaplibreLanguage from '@openhistoricalmap/maplibre-gl-language';
import { churchColor } from '../../data/firstCenturyChurchSupabaseAdapter.js';
import './ChurchMap.css';

const OHM_STYLE_URL = 'https://www.openhistoricalmap.org/map-styles/main/main.json';

// Centered on the eastern Mediterranean, framing the first-century churches.
const DEFAULT_CENTER = [26, 37];
const DEFAULT_ZOOM = 4.2;
// The world of the apostles, roughly mid-first century.
const MAP_YEAR = '0050';

/**
 * Full-screen MapLibre map with a pin and flag for each first-century church.
 * Uses a clustered GeoJSON source. Optionally overlays a missionary journey
 * as a numbered polyline.
 */
export const ChurchMap = forwardRef(function ChurchMap(
  { churches, churchPersonCount, selectedChurchId, onSelectChurch, journeyStops, journeyColor },
  ref,
) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  useImperativeHandle(ref, () => ({
    flyTo(lng, lat) {
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 6.5, duration: 1200 });
      }
    },
    fitBounds(bounds, options) {
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, { padding: 80, duration: 1200, ...options });
      }
    },
    reset() {
      if (mapRef.current) {
        mapRef.current.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 1000 });
      }
    },
  }), []);

  // Build the church-pins GeoJSON
  const buildChurchGeoJSON = useCallback(() => {
    const features = (churches || []).map(c => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
      properties: {
        church_id: c.church_id,
        name: c.name,
        color: churchColor(c),
        personCount: churchPersonCount?.get(c.church_id) || 0,
        selected: c.church_id === selectedChurchId,
      },
    }));
    return { type: 'FeatureCollection', features };
  }, [churches, churchPersonCount, selectedChurchId]);

  // Keep the latest builder in a ref so the mount-time load handler avoids
  // a stale closure. Assigned in an effect (never during render).
  const buildChurchGeoJSONRef = useRef(buildChurchGeoJSON);
  useEffect(() => {
    buildChurchGeoJSONRef.current = buildChurchGeoJSON;
  }, [buildChurchGeoJSON]);

  // Build journey overlay GeoJSON (line + numbered stop points)
  const buildJourneyGeoJSON = useCallback(() => {
    const stops = (journeyStops || []).filter(s => s.lat != null && s.lng != null);
    const lineFeatures = stops.length > 1
      ? [{
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: stops.map(s => [s.lng, s.lat]) },
          properties: {},
        }]
      : [];
    const pointFeatures = stops.map((s, i) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: {
        stopNum: String(i + 1),
        label: s.displayName,
        description: s.description || '',
        church_id: s.church_id || '',
      },
    }));
    return {
      line: { type: 'FeatureCollection', features: lineFeatures },
      points: { type: 'FeatureCollection', features: pointFeatures },
    };
  }, [journeyStops]);

  // Initialize map (mount once)
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
      // Church pins source (clustered)
      map.addSource('churches', {
        type: 'geojson',
        data: buildChurchGeoJSONRef.current(),
        cluster: true,
        clusterMaxZoom: 6,
        clusterRadius: 44,
      });

      // Journey overlay sources
      map.addSource('journey-line', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addSource('journey-stops', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

      // Journey route line
      map.addLayer({
        id: 'journey-line',
        type: 'line',
        source: 'journey-line',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#b05ca0',
          'line-width': 3,
          'line-opacity': 0.85,
          'line-dasharray': [2, 1.5],
        },
      });

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'churches',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#6b5b45',
          'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 12, 30],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#faf6eb',
        },
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'churches',
        filter: ['has', 'point_count'],
        layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Open Sans Bold'], 'text-size': 13 },
        paint: { 'text-color': '#faf6eb' },
      });

      // Selection ring behind the pin
      map.addLayer({
        id: 'church-selection-ring',
        type: 'circle',
        source: 'churches',
        filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'selected'], true]],
        paint: {
          'circle-color': 'transparent',
          'circle-radius': 18,
          'circle-stroke-width': 3,
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 0.6,
        },
      });

      // Individual church pins — sized by how many people are connected
      map.addLayer({
        id: 'church-pins',
        type: 'circle',
        source: 'churches',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['linear'], ['get', 'personCount'], 0, 6, 5, 9, 25, 16],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#faf6eb',
        },
      });

      // Church name labels
      map.addLayer({
        id: 'church-labels',
        type: 'symbol',
        source: 'churches',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 12,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'text-color': '#2c2418',
          'text-halo-color': '#faf6eb',
          'text-halo-width': 1.5,
        },
      });

      // Journey stop circles
      map.addLayer({
        id: 'journey-stop-circles',
        type: 'circle',
        source: 'journey-stops',
        paint: {
          'circle-color': '#b05ca0',
          'circle-radius': 11,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#faf6eb',
        },
      });
      map.addLayer({
        id: 'journey-stop-labels',
        type: 'symbol',
        source: 'journey-stops',
        layout: { 'text-field': ['get', 'stopNum'], 'text-font': ['Open Sans Bold'], 'text-size': 12, 'text-allow-overlap': true },
        paint: { 'text-color': '#faf6eb' },
      });

      // ── Interactions ──────────────────────────────────────────────────
      map.on('click', 'church-pins', (e) => {
        const f = e.features[0];
        if (f) onSelectChurch(f.properties.church_id);
      });

      map.on('click', 'journey-stop-circles', (e) => {
        const f = e.features[0];
        if (f?.properties?.church_id) onSelectChurch(f.properties.church_id);
      });

      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource('churches');
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          map.easeTo({ center: features[0].geometry.coordinates, zoom });
        } catch { /* ignore */ }
      });

      const showPopup = (e, htmlBuilder) => {
        map.getCanvas().style.cursor = 'pointer';
        const f = e.features[0];
        if (!f) return;
        popupRef.current = new maplibregl.Popup({
          offset: 14, closeButton: false, closeOnClick: false, className: 'fcc-map-tooltip',
        })
          .setLngLat(f.geometry.coordinates.slice())
          .setHTML(htmlBuilder(f))
          .addTo(map);
      };
      const hidePopup = () => {
        map.getCanvas().style.cursor = '';
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      };

      map.on('mouseenter', 'church-pins', (e) => showPopup(e, (f) => {
        const n = f.properties.personCount;
        return `<strong>${f.properties.name}</strong>${n > 0 ? `<br><span class="fcc-popup-count">${n} ${n === 1 ? 'person' : 'people'}</span>` : ''}`;
      }));
      map.on('mouseleave', 'church-pins', hidePopup);

      map.on('mouseenter', 'journey-stop-circles', (e) => showPopup(e, (f) => (
        `<strong>${f.properties.label}</strong>${f.properties.description ? `<br><span class="fcc-popup-count">${f.properties.description}</span>` : ''}`
      )));
      map.on('mouseleave', 'journey-stop-circles', hidePopup);

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    });

    // Pin the basemap to the first-century world.
    map.once('styledata', () => {
      try { filterByDate(map, MAP_YEAR); } catch { /* ignore */ }
    });

    return () => {
      mapRef.current = null;
      if (popupRef.current) popupRef.current.remove();
      map.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update church pins when data / selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const src = map.getSource('churches');
      if (!src) return false;
      src.setData(buildChurchGeoJSON());
      return true;
    };
    if (!update()) {
      const onLoad = () => update();
      map.once('load', onLoad);
      return () => map.off('load', onLoad);
    }
  }, [buildChurchGeoJSON]);

  // Update journey overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const lineSrc = map.getSource('journey-line');
      const stopSrc = map.getSource('journey-stops');
      if (!lineSrc || !stopSrc) return false;
      const { line, points } = buildJourneyGeoJSON();
      lineSrc.setData(line);
      stopSrc.setData(points);
      if (journeyColor) {
        try {
          map.setPaintProperty('journey-line', 'line-color', journeyColor);
          map.setPaintProperty('journey-stop-circles', 'circle-color', journeyColor);
        } catch { /* layer not ready */ }
      }
      return true;
    };
    if (!update()) {
      const onLoad = () => update();
      map.once('load', onLoad);
      return () => map.off('load', onLoad);
    }
  }, [buildJourneyGeoJSON, journeyColor]);

  return <div className="fcc-map-container" ref={mapContainerRef} />;
});
