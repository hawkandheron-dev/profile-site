import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBiblicalPlacesData } from './data/biblicalPlacesSupabaseAdapter.js';
import { BiblicalPlacesMap } from './components/BiblicalPlaces/BiblicalPlacesMap.jsx';
import { NarrativeAgeFilter } from './components/BiblicalPlaces/NarrativeAgeFilter.jsx';
import { BiblicalPlacesSearch } from './components/BiblicalPlaces/BiblicalPlacesSearch.jsx';
import { PlaceModal } from './components/BiblicalPlaces/PlaceModal.jsx';
import { PersonModal } from './components/BiblicalPlaces/PersonModal.jsx';
import { EventModal } from './components/BiblicalPlaces/EventModal.jsx';
import './BiblicalPlacesApp.css';

function formatYear(year) {
  if (year == null) return '';
  if (year < 0) return `${Math.abs(year)} BC`;
  if (year === 0) return '1 BC';
  return `${year} AD`;
}

/**
 * Compute evenly spaced tick values between start and end, snapped to nice
 * round numbers.  Drops any that would overlap the start/end labels or each
 * other (using a minimum-distance threshold expressed as a percentage of the
 * total span).
 */
function computeTicks(start, end) {
  const span = end - start;
  if (span <= 0) return [];

  // Pick a nice step
  const rawStep = span / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(rawStep))));
  const niceMultiples = [1, 2, 5, 10];
  let step = magnitude;
  for (const m of niceMultiples) {
    if (magnitude * m >= rawStep) { step = magnitude * m; break; }
  }

  // Generate ticks
  const firstTick = Math.ceil(start / step) * step;
  let ticks = [];
  for (let t = firstTick; t <= end; t += step) {
    if (t > start && t < end) ticks.push(t);
  }

  // Thin to at most 3
  while (ticks.length > 3) {
    ticks = ticks.filter((_, i) => i % 2 === 0);
  }

  // Drop ticks that are too close to start, end, or each other.
  // "Too close" = within 18% of the span (roughly the width of a label).
  const minGap = span * 0.18;
  const result = [];
  for (const t of ticks) {
    if (t - start < minGap) continue;          // too close to start label
    if (end - t < minGap) continue;            // too close to end label
    const prev = result[result.length - 1];
    if (prev != null && t - prev < minGap) continue; // too close to previous tick
    result.push(t);
  }
  return result;
}

function BiblicalPlacesApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalStack, setModalStack] = useState([]); // [{ type, id }]
  const [activeAgeFilter, setActiveAgeFilter] = useState(null);
  const [mapYear, setMapYear] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchBiblicalPlacesData();
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Modal stack management ──────────────────────────────────────────────

  const pushModal = useCallback((type, id) => {
    setModalStack(prev => [...prev, { type, id }]);
  }, []);

  const popModal = useCallback(() => {
    setModalStack(prev => prev.slice(0, -1));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  const currentModal = modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;

  // ── Entity selection handler (used by modals and search) ────────────────

  const handleSelectEntity = useCallback((type, id) => {
    pushModal(type, id);
    // If selecting a place, fly the map to it
    if (type === 'place' && data) {
      const place = data.placeMap.get(id);
      if (place && mapRef.current?.flyTo) {
        mapRef.current.flyTo(place.lng, place.lat);
      }
    }
  }, [pushModal, data]);

  // ── Reset view ─────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setActiveAgeFilter(null);
    setMapYear(null);
    closeAllModals();
    mapRef.current?.reset?.();
  }, [closeAllModals]);

  // ── Age filter ──────────────────────────────────────────────────────────

  const handleAgeFilter = useCallback((ageId) => {
    const newFilter = activeAgeFilter === ageId ? null : ageId;
    setActiveAgeFilter(newFilter);

    // Set map year to midpoint of the age's date range and apply immediately
    if (newFilter && data) {
      const age = data.ageMap.get(newFilter);
      if (age?.approx_start_year != null && age?.approx_end_year != null) {
        const midpoint = Math.round((age.approx_start_year + age.approx_end_year) / 2);
        setMapYear(midpoint);
        mapRef.current?.setYear?.(midpoint);
      } else {
        setMapYear(null);
      }
    } else {
      setMapYear(null);
    }

    // Zoom to the geographic region for this age
    if (newFilter && data) {
      const age = data.ageMap.get(newFilter);
      if (age?.map_bounds) {
        // map_bounds is [sw_lng, sw_lat, ne_lng, ne_lat]
        const b = age.map_bounds;
        mapRef.current?.fitBounds?.([[b[0], b[1]], [b[2], b[3]]]);
      } else {
        // Fall back: fit to all visible places for this age (events + person-place links)
        const visiblePlaces = data.places.filter(p => {
          const events = data.placeEventsMap.get(p.place_id) || [];
          const people = data.placePeopleMap.get(p.place_id) || [];
          return events.some(e => e.narrative_age_id === newFilter)
              || people.some(pp => pp.age?.age_id === newFilter);
        });
        if (visiblePlaces.length > 1) {
          const lngs = visiblePlaces.map(p => p.lng);
          const lats = visiblePlaces.map(p => p.lat);
          mapRef.current?.fitBounds?.([
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ]);
        } else if (visiblePlaces.length === 1) {
          mapRef.current?.flyTo?.(visiblePlaces[0].lng, visiblePlaces[0].lat);
        }
      }
    } else if (!newFilter) {
      mapRef.current?.reset?.();
    }
  }, [activeAgeFilter, data]);

  // ── Age change from PlaceModal nav (always sets, never toggles) ────────

  const handleAgeChange = useCallback((ageId) => {
    if (!ageId || !data) return;
    setActiveAgeFilter(ageId);
    const age = data.ageMap.get(ageId);
    if (age?.approx_start_year != null && age?.approx_end_year != null) {
      const midpoint = Math.round((age.approx_start_year + age.approx_end_year) / 2);
      setMapYear(midpoint);
      mapRef.current?.setYear?.(midpoint);
    } else {
      setMapYear(null);
    }
    if (age?.map_bounds) {
      const b = age.map_bounds;
      mapRef.current?.fitBounds?.([[b[0], b[1]], [b[2], b[3]]]);
    }
  }, [data]);

  // ── Search → fly to place ──────────────────────────────────────────────

  const handleSearchSelect = useCallback((type, id) => {
    handleSelectEntity(type, id);
  }, [handleSelectEntity]);

  const showReset = !!(activeAgeFilter || modalStack.length > 0);

  return (
    <div className="bp-app">
      {/* Header overlay */}
      <header className="bp-header">
        {data && (
          <div className="bp-header-search">
            <BiblicalPlacesSearch
              data={data}
              onSelect={handleSearchSelect}
              homeHref="../../index.html"
            />
          </div>
        )}
      </header>

      {/* Main content */}
      {loading && (
        <div className="bp-loading">Loading data from Supabase...</div>
      )}
      {error && (
        <div className="bp-error">Error: {error}</div>
      )}
      {!loading && !error && data && (
        <>
          <BiblicalPlacesMap
            ref={mapRef}
            places={data.places}
            placeEventsMap={data.placeEventsMap}
            placePeopleMap={data.placePeopleMap}
            ageMap={data.ageMap}
            activeAgeFilter={activeAgeFilter}
            mapYear={mapYear}
            onSelectPlace={(placeId) => handleSelectEntity('place', placeId)}
          />
          <NarrativeAgeFilter
            ages={data.ages}
            activeAgeFilter={activeAgeFilter}
            onFilter={handleAgeFilter}
            showReset={showReset}
            onReset={handleReset}
            siteTitle="Bible Atlas: who's where when?"
          />

          {/* Date range + year slider for active narrative age */}
          {activeAgeFilter && (() => {
            const age = data.ageMap.get(activeAgeFilter);
            if (!age) return null;
            const startY = age.approx_start_year;
            const endY = age.approx_end_year;
            if (startY == null || endY == null) return null;
            const ticks = computeTicks(startY, endY);
            return (
              <div className="bp-date-range">
                <span className="bp-date-range-label">{age.name}</span>
                <span className="bp-date-range-years">
                  {formatYear(mapYear)}
                </span>
                <div className="bp-year-slider-wrap">
                  <input
                    type="range"
                    className="bp-year-slider"
                    min={startY}
                    max={endY}
                    value={mapYear ?? Math.round((startY + endY) / 2)}
                    onChange={(e) => setMapYear(Number(e.target.value))}
                  />
                  <div className="bp-year-slider-labels">
                    <span>{formatYear(startY)}</span>
                    {ticks.map(t => (
                      <span
                        key={t}
                        style={{ left: `${((t - startY) / (endY - startY)) * 100}%` }}
                        className="bp-year-slider-tick"
                      >
                        {formatYear(t)}
                      </span>
                    ))}
                    <span>{formatYear(endY)}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Side panel */}
      {currentModal && data && (
        <div className="bp-side-panel">
          {currentModal.type === 'place' && (
            <PlaceModal
              place={data.placeMap.get(currentModal.id)}
              events={data.placeEventsMap.get(currentModal.id) || []}
              people={data.placePeopleMap.get(currentModal.id) || []}
              ageMap={data.ageMap}
              eventPeopleMap={data.eventPeopleMap}
              sourceMap={data.sourceMap}
              ages={data.ages}
              activeAgeFilter={activeAgeFilter}
              placeNamesMap={data.placeNamesMap}
              placeAgeSummariesMap={data.placeAgeSummariesMap}
              onAgeChange={handleAgeChange}
              onSelectEntity={handleSelectEntity}
              onClose={closeAllModals}
            />
          )}
          {currentModal.type === 'person' && (
            <PersonModal
              person={data.personMap.get(currentModal.id)}
              ages={data.personAgesMap.get(currentModal.id) || []}
              places={data.personPlacesMap.get(currentModal.id) || []}
              events={data.personEventsMap.get(currentModal.id) || []}
              ageMap={data.ageMap}
              placeMap={data.placeMap}
              sourceMap={data.sourceMap}
              onSelectEntity={handleSelectEntity}
              onClose={popModal}
              canGoBack={modalStack.length > 1}
              onBack={popModal}
            />
          )}
          {currentModal.type === 'event' && (
            <EventModal
              event={data.eventMap.get(currentModal.id)}
              people={data.eventPeopleMap.get(currentModal.id) || []}
              ageMap={data.ageMap}
              placeMap={data.placeMap}
              sourceMap={data.sourceMap}
              onSelectEntity={handleSelectEntity}
              onClose={popModal}
              canGoBack={modalStack.length > 1}
              onBack={popModal}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default BiblicalPlacesApp;
