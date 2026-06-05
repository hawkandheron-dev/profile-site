import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { filterByDate } from '@openhistoricalmap/maplibre-gl-dates';
import MaplibreLanguage from '@openhistoricalmap/maplibre-gl-language';
import './PlaygroundMap.css';

const OHM_STYLE_URL = 'https://www.openhistoricalmap.org/map-styles/main/main.json';
const DEFAULT_CENTER = [26, 37];
const DEFAULT_ZOOM = 4.2;

// Apply a skin's layerRules to whatever layers currently exist on the map.
// Rule matching is by regex against layer.id; the property to set is
// inferred from the layer's `type` (fill / line / symbol / background).
function applySkin(map, skin) {
  if (!map || !skin) return;
  const layers = map.getStyle()?.layers || [];
  for (const layer of layers) {
    for (const rule of skin.layerRules || []) {
      if (!rule.match.test(layer.id)) continue;
      for (const [prop, value] of Object.entries(rule.paint || {})) {
        try { map.setPaintProperty(layer.id, prop, value); } catch (_) { /* prop not valid for layer type */ }
      }
      for (const [prop, value] of Object.entries(rule.layout || {})) {
        try { map.setLayoutProperty(layer.id, prop, value); } catch (_) { /* ignore */ }
      }
    }
  }
}

export function PlaygroundMap({ activeSkin, year }) {
  const mapContainerRef = useRef(null);
  const overlayRef = useRef(null);
  const mapRef = useRef(null);
  const [styleReady, setStyleReady] = useState(false);

  // Mount once.
  useEffect(() => {
    if (!mapContainerRef.current) return undefined;

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

    map.on('load', () => setStyleReady(true));

    return () => {
      setStyleReady(false);
      mapRef.current = null;
      map.remove();
    };
  }, []);

  // Re-apply skin whenever it changes, or when the style finishes loading.
  // Listening on `styledata` covers both initial load and any future
  // setStyle calls (so the OHM-default reset path re-skins correctly).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady) return undefined;
    applySkin(map, activeSkin);
    const onStyleData = () => applySkin(map, activeSkin);
    map.on('styledata', onStyleData);
    return () => { map.off('styledata', onStyleData); };
  }, [activeSkin, styleReady]);

  // Apply the year filter on every style/skin change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady || !year) return;
    try { filterByDate(map, year); } catch (_) { /* ignore */ }
  }, [year, styleReady, activeSkin]);

  // Update the CSS texture overlay based on the active skin.
  const overlay = activeSkin?.overlay;
  const overlayStyle = overlay
    ? {
        backgroundImage: `url(${overlay.texture})`,
        mixBlendMode: overlay.blendMode || 'multiply',
        opacity: overlay.opacity ?? 0.5,
      }
    : { display: 'none' };

  return (
    <div className="hmp-map-wrap">
      <div className="hmp-map-container" ref={mapContainerRef} />
      <div ref={overlayRef} className="hmp-skin-overlay" style={overlayStyle} />
    </div>
  );
}
