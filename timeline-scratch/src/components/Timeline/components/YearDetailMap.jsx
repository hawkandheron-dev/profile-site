import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { filterByDate } from '@openhistoricalmap/maplibre-gl-dates';
import { getCoordinatesForLocation } from '../../../data/locationCoordinates.js';

const OHM_STYLE_URL = 'https://www.openhistoricalmap.org/map-styles/main/main.json';

/**
 * Renders an Open Historical Map with pins for all people alive in a given year,
 * supporting bidirectional hover highlighting with external pill list.
 */
export function YearDetailMap({ people, year, hoveredPersonId, onHoverPerson }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map()); // personId -> { marker, el }

  // Resolve people to those with valid coordinates
  const peopleWithCoords = people
    .map(p => {
      const coords = getCoordinatesForLocation(p.location);
      if (!coords) return null;
      return { ...p, coords };
    })
    .filter(Boolean);

  // Compute bounds that fit all pins
  const getBounds = useCallback(() => {
    if (peopleWithCoords.length === 0) return null;
    if (peopleWithCoords.length === 1) return null; // single point — just center on it
    const lngs = peopleWithCoords.map(p => p.coords[1]);
    const lats = peopleWithCoords.map(p => p.coords[0]);
    return new maplibregl.LngLatBounds(
      [Math.min(...lngs) , Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    );
  }, [peopleWithCoords.length]);

  useEffect(() => {
    if (peopleWithCoords.length === 0 || !mapContainerRef.current) return;

    const bounds = getBounds();
    const firstPerson = peopleWithCoords[0];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OHM_STYLE_URL,
      center: bounds
        ? bounds.getCenter().toArray()
        : [firstPerson.coords[1], firstPerson.coords[0]],
      zoom: 5,
      attributionControl: true,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add markers for each person
    for (const person of peopleWithCoords) {
      const [lat, lng] = person.coords;

      const el = document.createElement('div');
      el.className = 'year-map-pin';
      el.style.setProperty('--pin-color', person.color || '#c0392b');
      el.setAttribute('data-person-id', person.id);

      // Hover events on the pin
      el.addEventListener('mouseenter', () => {
        onHoverPerson?.(person.id);
      });
      el.addEventListener('mouseleave', () => {
        onHoverPerson?.(null);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.set(person.id, { marker, el });
    }

    // Fit bounds once loaded
    map.once('load', () => {
      if (bounds) {
        map.fitBounds(bounds, { padding: 50, maxZoom: 8 });
      }

      // Filter map to historical date
      if (year != null) {
        const yearStr = formatYearForOHM(year);
        try {
          filterByDate(map, yearStr);
        } catch {
          // silently ignore if style doesn't support date filtering
        }
      }
    });

    return () => {
      markersRef.current.clear();
      mapRef.current = null;
      map.remove();
    };
  }, [peopleWithCoords.length, year]);

  // Update highlight state on markers when hoveredPersonId changes
  useEffect(() => {
    for (const [id, { el }] of markersRef.current) {
      if (hoveredPersonId && id === hoveredPersonId) {
        el.classList.add('year-map-pin-highlighted');
      } else if (hoveredPersonId && id !== hoveredPersonId) {
        el.classList.add('year-map-pin-dimmed');
      } else {
        el.classList.remove('year-map-pin-highlighted', 'year-map-pin-dimmed');
      }
    }
  }, [hoveredPersonId]);

  if (peopleWithCoords.length === 0) return null;

  return (
    <div className="historical-map-section">
      <h3>Historical Map</h3>
      <div className="historical-map-container year-detail-map-container" ref={mapContainerRef} />
      {year != null && (
        <p className="historical-map-date">
          Showing borders c. {formatDisplayYear(year)}
        </p>
      )}
    </div>
  );
}

function formatYearForOHM(year) {
  if (year < 0) {
    return '-' + String(Math.abs(year)).padStart(4, '0');
  }
  return String(year).padStart(4, '0');
}

function formatDisplayYear(year) {
  if (year <= 0) {
    return `${Math.abs(year - 1) + 1} BC`;
  }
  return `${year} AD`;
}
