import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { filterByDate } from '@openhistoricalmap/maplibre-gl-dates';
import './AfricanKingdomsMap.css';

const OHM_STYLE_URL = 'https://www.openhistoricalmap.org/map-styles/main/main.json';

// Center on Africa
const DEFAULT_CENTER = [20, 5];
const DEFAULT_ZOOM = 3.5;

function formatYearForOHM(year) {
  if (year < 0) return '-' + String(Math.abs(year)).padStart(4, '0');
  return String(year).padStart(4, '0');
}

export const AfricanKingdomsMap = forwardRef(function AfricanKingdomsMap(
  { places, kingdoms, tradeRoutes, activeEraFilter, mapYear, onSelectPlace, onSelectKingdom, eraMap },
  ref
) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  useImperativeHandle(ref, () => ({
    flyTo(lng, lat, zoom) {
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: zoom || 6, duration: 1200 });
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
      try { filterByDate(map, formatYearForOHM(year)); } catch { /* ignore */ }
    },
    reset() {
      if (mapRef.current) {
        mapRef.current.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 1000 });
      }
    }
  }), []);

  // Build territory GeoJSON from kingdoms
  const buildTerritoryGeoJSON = useCallback(() => {
    const features = (kingdoms || [])
      .filter(k => k.territory_geojson)
      .filter(k => {
        if (!activeEraFilter) return true;
        return k.era_id === activeEraFilter;
      })
      .filter(k => {
        if (mapYear == null) return true;
        return k.start_year <= mapYear && k.end_year >= mapYear;
      })
      .map(k => ({
        type: 'Feature',
        geometry: k.territory_geojson,
        properties: {
          kingdom_id: k.kingdom_id,
          name: k.name,
          color: k.color || '#8b7355',
          opacity: 0.15,
        },
      }));
    return { type: 'FeatureCollection', features };
  }, [kingdoms, activeEraFilter, mapYear]);

  // Build territory labels
  const buildTerritoryLabels = useCallback(() => {
    const features = (kingdoms || [])
      .filter(k => k.territory_label_lng && k.territory_label_lat)
      .filter(k => {
        if (!activeEraFilter) return true;
        return k.era_id === activeEraFilter;
      })
      .filter(k => {
        if (mapYear == null) return true;
        return k.start_year <= mapYear && k.end_year >= mapYear;
      })
      .map(k => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [k.territory_label_lng, k.territory_label_lat] },
        properties: {
          kingdom_id: k.kingdom_id,
          name: k.name,
          color: k.color || '#8b7355',
          type: 'kingdom',
        },
      }));
    return { type: 'FeatureCollection', features };
  }, [kingdoms, activeEraFilter, mapYear]);

  // Build place pins GeoJSON
  const buildPlacesGeoJSON = useCallback(() => {
    const features = (places || []).map(place => {
      let color = '#8b7355';
      if (activeEraFilter) {
        const era = eraMap?.get(activeEraFilter);
        if (era?.color) color = era.color;
      }
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [place.lng, place.lat] },
        properties: {
          place_id: place.place_id,
          name: place.name,
          region: place.region || '',
          place_type: place.place_type || 'city',
          color,
        },
      };
    });
    return { type: 'FeatureCollection', features };
  }, [places, activeEraFilter, eraMap]);

  // Build trade route lines
  const buildTradeRoutesGeoJSON = useCallback(() => {
    const features = (tradeRoutes || [])
      .filter(r => r.route_geojson)
      .filter(r => {
        if (mapYear == null) return true;
        if (r.active_start_year && mapYear < r.active_start_year) return false;
        if (r.active_end_year && mapYear > r.active_end_year) return false;
        return true;
      })
      .map(r => ({
        type: 'Feature',
        geometry: r.route_geojson,
        properties: {
          route_id: r.route_id,
          name: r.name,
          color: r.color || '#D4A574',
        },
      }));
    return { type: 'FeatureCollection', features };
  }, [tradeRoutes, mapYear]);

  // Refs for latest builders
  const buildPlacesRef = useRef(buildPlacesGeoJSON);
  buildPlacesRef.current = buildPlacesGeoJSON;
  const buildTerritoryRef = useRef(buildTerritoryGeoJSON);
  buildTerritoryRef.current = buildTerritoryGeoJSON;
  const buildLabelsRef = useRef(buildTerritoryLabels);
  buildLabelsRef.current = buildTerritoryLabels;
  const buildRoutesRef = useRef(buildTradeRoutesGeoJSON);
  buildRoutesRef.current = buildTradeRoutesGeoJSON;

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
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Territory polygons
      map.addSource('territories', {
        type: 'geojson',
        data: buildTerritoryRef.current(),
      });

      map.addSource('territory-labels', {
        type: 'geojson',
        data: buildLabelsRef.current(),
      });

      map.addLayer({
        id: 'territory-fill',
        type: 'fill',
        source: 'territories',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['get', 'opacity'],
        },
      });

      map.addLayer({
        id: 'territory-borders',
        type: 'line',
        source: 'territories',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.5,
          'line-dasharray': [4, 3],
        },
      });

      map.addLayer({
        id: 'territory-labels',
        type: 'symbol',
        source: 'territory-labels',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold'],
          'text-size': 13,
          'text-allow-overlap': false,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.15,
          'text-variable-anchor': ['center', 'top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.5,
          'text-max-width': 10,
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-opacity': 0.75,
          'text-halo-color': '#faf6eb',
          'text-halo-width': 1.5,
        },
      });

      // Trade routes
      map.addSource('trade-routes', {
        type: 'geojson',
        data: buildRoutesRef.current(),
      });

      map.addLayer({
        id: 'trade-route-lines',
        type: 'line',
        source: 'trade-routes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-opacity': 0.6,
          'line-dasharray': [6, 4],
        },
      });

      // Place pins with clustering
      map.addSource('places', {
        type: 'geojson',
        data: buildPlacesRef.current(),
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 50,
      });

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
        paint: { 'text-color': '#faf6eb' },
      });

      map.addLayer({
        id: 'place-pins',
        type: 'circle',
        source: 'places',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#faf6eb',
        },
      });

      map.addLayer({
        id: 'place-labels',
        type: 'symbol',
        source: 'places',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 11,
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

      // Click handlers
      map.on('click', 'place-pins', (e) => {
        const feature = e.features[0];
        if (feature) onSelectPlace?.(feature.properties.place_id);
      });

      map.on('click', 'territory-fill', (e) => {
        const feature = e.features[0];
        if (feature) onSelectKingdom?.(feature.properties.kingdom_id);
      });

      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        try {
          const zoom = await map.getSource('places').getClusterExpansionZoom(clusterId);
          map.easeTo({ center: features[0].geometry.coordinates, zoom });
        } catch { /* ignore */ }
      });

      // Hover
      map.on('mouseenter', 'place-pins', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const f = e.features[0];
        if (f) {
          popupRef.current = new maplibregl.Popup({
            offset: 12, closeButton: false, closeOnClick: false, className: 'ak-map-tooltip',
          })
            .setLngLat(f.geometry.coordinates.slice())
            .setHTML(`<strong>${f.properties.name}</strong>${f.properties.region ? ` <em>${f.properties.region}</em>` : ''}`)
            .addTo(map);
        }
      });

      map.on('mouseleave', 'place-pins', () => {
        map.getCanvas().style.cursor = '';
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      });

      map.on('mouseenter', 'territory-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'territory-fill', () => { map.getCanvas().style.cursor = ''; });

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    });

    // Default date filter
    map.once('styledata', () => {
      try { filterByDate(map, formatYearForOHM(1000)); } catch { /* ignore */ }
    });

    return () => {
      mapRef.current = null;
      if (popupRef.current) popupRef.current.remove();
      map.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update data when filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const ps = map.getSource('places');
      const ts = map.getSource('territories');
      const tl = map.getSource('territory-labels');
      const tr = map.getSource('trade-routes');
      if (ps) ps.setData(buildPlacesGeoJSON());
      if (ts) ts.setData(buildTerritoryGeoJSON());
      if (tl) tl.setData(buildTerritoryLabels());
      if (tr) tr.setData(buildTradeRoutesGeoJSON());
      return !!ps;
    };
    if (!update()) {
      const onLoad = () => update();
      map.once('load', onLoad);
      return () => map.off('load', onLoad);
    }
  }, [activeEraFilter, mapYear, buildPlacesGeoJSON, buildTerritoryGeoJSON, buildTerritoryLabels, buildTradeRoutesGeoJSON]);

  // Update OHM date filter
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const year = mapYear != null ? mapYear : 1000;
    const apply = () => {
      try { filterByDate(map, formatYearForOHM(year)); } catch { /* ignore */ }
    };
    if (map.isStyleLoaded()) apply();
    else {
      map.once('styledata', apply);
      return () => map.off('styledata', apply);
    }
  }, [mapYear]);

  return <div className="ak-map-container" ref={mapContainerRef} />;
});
