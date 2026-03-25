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
  { places, kingdoms, landmarks, tradeRoutes, activeEraFilter, mapYear, onSelectPlace, onSelectKingdom, onSelectLandmark, eraMap, selectedItem },
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

  // Build territory GeoJSON — invisible click targets (OHM provides the visual borders)
  const buildTerritoryGeoJSON = useCallback(() => {
    const features = (kingdoms || [])
      .filter(k => k.territory_geojson)
      .filter(k => !activeEraFilter || k.era_id === activeEraFilter)
      .filter(k => mapYear == null || (k.start_year <= mapYear && k.end_year >= mapYear))
      .map(k => ({
        type: 'Feature',
        geometry: k.territory_geojson,
        properties: {
          kingdom_id: k.kingdom_id,
          name: k.name,
          color: k.color || '#8b7355',
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

  // Build landmark pins GeoJSON
  const buildLandmarksGeoJSON = useCallback(() => {
    const features = (landmarks || [])
      .filter(l => {
        if (mapYear == null) return true;
        if (l.built_year != null && l.built_year > mapYear) return false;
        if (l.end_year != null && l.end_year < mapYear) return false;
        return true;
      })
      .map(l => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [l.lng, l.lat] },
        properties: {
          landmark_id: l.landmark_id,
          name: l.name,
          landmark_type: l.landmark_type || 'monument',
        },
      }));
    return { type: 'FeatureCollection', features };
  }, [landmarks, mapYear]);

  // Refs for latest builders
  const buildPlacesRef = useRef(buildPlacesGeoJSON);
  buildPlacesRef.current = buildPlacesGeoJSON;
  const buildTerritoryRef = useRef(buildTerritoryGeoJSON);
  buildTerritoryRef.current = buildTerritoryGeoJSON;
  const buildLabelsRef = useRef(buildTerritoryLabels);
  buildLabelsRef.current = buildTerritoryLabels;
  const buildRoutesRef = useRef(buildTradeRoutesGeoJSON);
  buildRoutesRef.current = buildTradeRoutesGeoJSON;
  const buildLandmarksRef = useRef(buildLandmarksGeoJSON);
  buildLandmarksRef.current = buildLandmarksGeoJSON;

  // Refs for callbacks to avoid stale closures in map events
  const onSelectPlaceRef = useRef(onSelectPlace);
  onSelectPlaceRef.current = onSelectPlace;
  const onSelectKingdomRef = useRef(onSelectKingdom);
  onSelectKingdomRef.current = onSelectKingdom;
  const onSelectLandmarkRef = useRef(onSelectLandmark);
  onSelectLandmarkRef.current = onSelectLandmark;

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
      // Territory polygons — invisible fill used only as click targets.
      // OHM's own boundary layers provide the accurate visual borders.
      map.addSource('territories', {
        type: 'geojson',
        data: buildTerritoryRef.current(),
      });

      map.addSource('territory-labels', {
        type: 'geojson',
        data: buildLabelsRef.current(),
      });

      // Invisible click target layer
      map.addLayer({
        id: 'territory-fill',
        type: 'fill',
        source: 'territories',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0,
        },
      });

      // Selected territory highlight — colored fill visible only when selected
      map.addLayer({
        id: 'territory-highlight-fill',
        type: 'fill',
        source: 'territories',
        filter: ['==', 'kingdom_id', ''],
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.2,
        },
      });

      map.addLayer({
        id: 'territory-highlight',
        type: 'line',
        source: 'territories',
        filter: ['==', 'kingdom_id', ''],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });

      // Kingdom name labels (colored, positioned at label coordinates)
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

      // Selected place highlight — larger ring behind the pin
      map.addLayer({
        id: 'place-highlight',
        type: 'circle',
        source: 'places',
        filter: ['all', ['!', ['has', 'point_count']], ['==', 'place_id', '']],
        paint: {
          'circle-color': 'transparent',
          'circle-radius': 14,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#d4a017',
          'circle-opacity': 1,
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

      // Landmark pins (gold star symbols)
      map.addSource('landmarks', {
        type: 'geojson',
        data: buildLandmarksRef.current(),
      });

      map.addLayer({
        id: 'landmark-pins',
        type: 'symbol',
        source: 'landmarks',
        layout: {
          'text-field': '\u2605',
          'text-font': ['Open Sans Bold'],
          'text-size': 18,
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#d4a017',
          'text-halo-color': '#2c2418',
          'text-halo-width': 1.5,
        },
      });

      map.addLayer({
        id: 'landmark-labels',
        type: 'symbol',
        source: 'landmarks',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 10,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'text-color': '#8b6914',
          'text-halo-color': '#faf6eb',
          'text-halo-width': 1.5,
        },
      });

      // Landmark highlight ring
      map.addLayer({
        id: 'landmark-highlight',
        type: 'circle',
        source: 'landmarks',
        filter: ['==', 'landmark_id', ''],
        paint: {
          'circle-color': 'transparent',
          'circle-radius': 16,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#d4a017',
        },
      });

      // Click handler — priority: landmark-pins → place-pins → clusters → territory-fill
      map.on('click', (e) => {
        // Check landmark pins first (highest priority — small targets)
        const landmarkFeatures = map.queryRenderedFeatures(e.point, { layers: ['landmark-pins'] });
        if (landmarkFeatures.length > 0) {
          onSelectLandmarkRef.current?.(landmarkFeatures[0].properties.landmark_id);
          return;
        }

        // Then place pins
        const placeFeatures = map.queryRenderedFeatures(e.point, { layers: ['place-pins'] });
        if (placeFeatures.length > 0) {
          onSelectPlaceRef.current?.(placeFeatures[0].properties.place_id);
          return;
        }

        // Then clusters
        const clusterFeatures = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (clusterFeatures.length > 0) {
          const clusterId = clusterFeatures[0].properties.cluster_id;
          map.getSource('places').getClusterExpansionZoom(clusterId).then(zoom => {
            map.easeTo({ center: clusterFeatures[0].geometry.coordinates, zoom });
          }).catch(() => {});
          return;
        }

        // Then territories (lowest priority — invisible fill used as click target)
        const territoryFeatures = map.queryRenderedFeatures(e.point, { layers: ['territory-fill'] });
        if (territoryFeatures.length > 0) {
          onSelectKingdomRef.current?.(territoryFeatures[0].properties.kingdom_id);
          return;
        }
      });

      // Hover cursors
      map.on('mouseenter', 'landmark-pins', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const f = e.features[0];
        if (f) {
          popupRef.current = new maplibregl.Popup({
            offset: 12, closeButton: false, closeOnClick: false, className: 'ak-map-tooltip',
          })
            .setLngLat(f.geometry.coordinates.slice())
            .setHTML(`<strong>\u2605 ${f.properties.name}</strong><em>${f.properties.landmark_type || ''}</em>`)
            .addTo(map);
        }
      });

      map.on('mouseleave', 'landmark-pins', () => {
        map.getCanvas().style.cursor = '';
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      });

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
      const lm = map.getSource('landmarks');
      if (ps) ps.setData(buildPlacesGeoJSON());
      if (ts) ts.setData(buildTerritoryGeoJSON());
      if (tl) tl.setData(buildTerritoryLabels());
      if (tr) tr.setData(buildTradeRoutesGeoJSON());
      if (lm) lm.setData(buildLandmarksGeoJSON());
      return !!ps;
    };
    if (!update()) {
      const onLoad = () => update();
      map.once('load', onLoad);
      return () => map.off('load', onLoad);
    }
  }, [activeEraFilter, mapYear, buildPlacesGeoJSON, buildTerritoryGeoJSON, buildTerritoryLabels, buildTradeRoutesGeoJSON, buildLandmarksGeoJSON]);

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

  // Highlight selected item on the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    try {
      // Update territory highlight filter
      if (selectedItem?.type === 'kingdom' && selectedItem.item?.kingdom_id) {
        map.setFilter('territory-highlight', ['==', 'kingdom_id', selectedItem.item.kingdom_id]);
        map.setFilter('territory-highlight-fill', ['==', 'kingdom_id', selectedItem.item.kingdom_id]);
      } else {
        map.setFilter('territory-highlight', ['==', 'kingdom_id', '']);
        map.setFilter('territory-highlight-fill', ['==', 'kingdom_id', '']);
      }

      // Update place highlight filter
      if (selectedItem?.type === 'place' && selectedItem.item?.place_id) {
        map.setFilter('place-highlight', ['all', ['!', ['has', 'point_count']], ['==', 'place_id', selectedItem.item.place_id]]);
      } else {
        map.setFilter('place-highlight', ['all', ['!', ['has', 'point_count']], ['==', 'place_id', '']]);
      }

      // Update landmark highlight filter
      if (selectedItem?.type === 'landmark' && selectedItem.item?.landmark_id) {
        map.setFilter('landmark-highlight', ['==', 'landmark_id', selectedItem.item.landmark_id]);
      } else {
        map.setFilter('landmark-highlight', ['==', 'landmark_id', '']);
      }
    } catch { /* layers may not exist yet */ }
  }, [selectedItem]);

  return <div className="ak-map-container" ref={mapContainerRef} />;
});
