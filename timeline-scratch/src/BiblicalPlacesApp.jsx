import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBiblicalPlacesData } from './data/biblicalPlacesSupabaseAdapter.js';
import { BiblicalPlacesMap } from './components/BiblicalPlaces/BiblicalPlacesMap.jsx';
import { NarrativeAgeFilter } from './components/BiblicalPlaces/NarrativeAgeFilter.jsx';
import { BiblicalPlacesSearch } from './components/BiblicalPlaces/BiblicalPlacesSearch.jsx';
import { PlaceModal } from './components/BiblicalPlaces/PlaceModal.jsx';
import { PersonModal } from './components/BiblicalPlaces/PersonModal.jsx';
import { EventModal } from './components/BiblicalPlaces/EventModal.jsx';
import './BiblicalPlacesApp.css';

const BIRD_LOGO = new URL('../../../resources/logos/Windhover_BLK.png', import.meta.url).href;

function BiblicalPlacesApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalStack, setModalStack] = useState([]); // [{ type, id }]
  const [activeAgeFilter, setActiveAgeFilter] = useState(null);
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
    closeAllModals();
    mapRef.current?.reset?.();
  }, [closeAllModals]);

  // ── Age filter ──────────────────────────────────────────────────────────

  const handleAgeFilter = useCallback((ageId) => {
    const newFilter = activeAgeFilter === ageId ? null : ageId;
    setActiveAgeFilter(newFilter);

    // Zoom to the geographic region for this age
    if (newFilter && data) {
      const age = data.ageMap.get(newFilter);
      if (age?.map_bounds) {
        // map_bounds is [sw_lng, sw_lat, ne_lng, ne_lat]
        const b = age.map_bounds;
        mapRef.current?.fitBounds?.([[b[0], b[1]], [b[2], b[3]]]);
      } else {
        // Fall back: fit to all visible places for this age
        const visiblePlaces = data.places.filter(p => {
          const events = data.placeEventsMap.get(p.place_id) || [];
          return events.some(e => e.narrative_age_id === newFilter);
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

  // ── Search → fly to place ──────────────────────────────────────────────

  const handleSearchSelect = useCallback((type, id) => {
    handleSelectEntity(type, id);
  }, [handleSelectEntity]);

  return (
    <div className="bp-app">
      {/* Header overlay */}
      <header className="bp-header">
        <div className="bp-header-brand">
          <a href="../../index.html" className="bp-home-link" title="Back to Windhover">
            <img src={BIRD_LOGO} alt="Windhover" className="bp-bird-logo" />
          </a>
          <h1 className="bp-title">Biblical Places</h1>
          {(activeAgeFilter || modalStack.length > 0) && (
            <button className="bp-reset-btn" onClick={handleReset} title="Reset view">
              Reset
            </button>
          )}
        </div>
        {data && (
          <div className="bp-header-search">
            <BiblicalPlacesSearch
              data={data}
              onSelect={handleSearchSelect}
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
            ageMap={data.ageMap}
            activeAgeFilter={activeAgeFilter}
            onSelectPlace={(placeId) => handleSelectEntity('place', placeId)}
          />
          <NarrativeAgeFilter
            ages={data.ages}
            activeAgeFilter={activeAgeFilter}
            onFilter={handleAgeFilter}
          />
        </>
      )}

      {/* Modals */}
      {currentModal?.type === 'place' && data && (
        <PlaceModal
          place={data.placeMap.get(currentModal.id)}
          events={data.placeEventsMap.get(currentModal.id) || []}
          people={data.placePeopleMap.get(currentModal.id) || []}
          ageMap={data.ageMap}
          eventPeopleMap={data.eventPeopleMap}
          sourceMap={data.sourceMap}
          resourceMap={data.resourceMap}
          onSelectEntity={handleSelectEntity}
          onClose={popModal}
          canGoBack={modalStack.length > 1}
          onBack={popModal}
        />
      )}
      {currentModal?.type === 'person' && data && (
        <PersonModal
          person={data.personMap.get(currentModal.id)}
          ages={data.personAgesMap.get(currentModal.id) || []}
          places={data.personPlacesMap.get(currentModal.id) || []}
          events={data.personEventsMap.get(currentModal.id) || []}
          ageMap={data.ageMap}
          placeMap={data.placeMap}
          sourceMap={data.sourceMap}
          resourceMap={data.resourceMap}
          onSelectEntity={handleSelectEntity}
          onClose={popModal}
          canGoBack={modalStack.length > 1}
          onBack={popModal}
        />
      )}
      {currentModal?.type === 'event' && data && (
        <EventModal
          event={data.eventMap.get(currentModal.id)}
          people={data.eventPeopleMap.get(currentModal.id) || []}
          ageMap={data.ageMap}
          placeMap={data.placeMap}
          sourceMap={data.sourceMap}
          resourceMap={data.resourceMap}
          onSelectEntity={handleSelectEntity}
          onClose={popModal}
          canGoBack={modalStack.length > 1}
          onBack={popModal}
        />
      )}
    </div>
  );
}

export default BiblicalPlacesApp;
