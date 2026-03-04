import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchAfricanKingdomsData } from './data/africanKingdomsSupabaseAdapter.js';
import { AfricanKingdomsMap } from './components/AfricanKingdoms/AfricanKingdomsMap.jsx';
import { KingdomFilter } from './components/AfricanKingdoms/KingdomFilter.jsx';
import { DetailModal } from './components/AfricanKingdoms/DetailModal.jsx';
import { Timeline } from './components/Timeline/Timeline.jsx';
import './AfricanKingdomsApp.css';

function formatYear(year) {
  if (year == null) return '';
  if (year < 0) return `${Math.abs(year)} BC`;
  if (year === 0) return '1 BC';
  return `${year} AD`;
}

function AfricanKingdomsApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeEraFilter, setActiveEraFilter] = useState(null);
  const [mapYear, setMapYear] = useState(1000);
  const [selectedItem, setSelectedItem] = useState(null); // { type, item }
  const mapRef = useRef(null);
  const timelineRef = useRef(null);

  // Fetch data
  useEffect(() => {
    fetchAfricanKingdomsData()
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load African Kingdoms data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Timeline viewport change → update map year
  const handleViewportChange = useCallback((viewport) => {
    const midYear = Math.round((viewport.startYear + viewport.endYear) / 2);
    setMapYear(midYear);
  }, []);

  // Timeline config
  const timelineConfig = useMemo(() => {
    if (!data) return {};
    return {
      initialViewport: {
        startDate: '0800-01-01',
        endDate: '1400-12-31',
      },
      eraLabels: 'BC/AD',
      maxTimeSpan: 3000,
      laneOrder: ['people', 'periods', 'points'],
      siteTitle: 'African Kingdoms',
      legend: (data.eras || []).map(era => ({
        label: era.name,
        color: era.color,
        shape: 'bar',
      })),
    };
  }, [data]);

  // Filter timeline data by active era
  const filteredTimelineData = useMemo(() => {
    if (!data) return { people: [], points: [], periods: [] };
    const { timelineData } = data;
    if (!activeEraFilter) return timelineData;
    return {
      people: timelineData.people.filter(p => p.periodId === activeEraFilter),
      points: timelineData.points,
      periods: timelineData.periods,
    };
  }, [data, activeEraFilter]);

  // Handle kingdom click from timeline
  const handleTimelineItemClick = useCallback((type, item) => {
    if (!data) return;
    if (type === 'person' && item.isKingdom) {
      // Kingdom bars are rendered as "people" in the timeline
      const kingdom = data.kingdomMap.get(item.id);
      if (kingdom) {
        setSelectedItem({ type: 'kingdom', item: kingdom });
        // Fly to kingdom on map
        if (kingdom.territory_label_lng && kingdom.territory_label_lat) {
          mapRef.current?.flyTo(kingdom.territory_label_lng, kingdom.territory_label_lat, 5);
        }
      }
    } else if (type === 'point') {
      const event = data.eventMap.get(item.id);
      if (event) {
        setSelectedItem({ type: 'event', item: event });
        // Fly to event location
        if (event.place_id) {
          const place = data.placeMap.get(event.place_id);
          if (place) mapRef.current?.flyTo(place.lng, place.lat, 7);
        }
      }
    }
  }, [data]);

  // Handle place click from map
  const handleSelectPlace = useCallback((placeId) => {
    if (!data) return;
    const place = data.placeMap.get(placeId);
    if (place) setSelectedItem({ type: 'place', item: place });
  }, [data]);

  // Handle kingdom click from map
  const handleSelectKingdom = useCallback((kingdomId) => {
    if (!data) return;
    const kingdom = data.kingdomMap.get(kingdomId);
    if (kingdom) setSelectedItem({ type: 'kingdom', item: kingdom });
  }, [data]);

  // Handle entity navigation from detail modal
  const handleSelectEntity = useCallback((type, item) => {
    setSelectedItem({ type, item });
    if (type === 'place' && item.lng && item.lat) {
      mapRef.current?.flyTo(item.lng, item.lat, 7);
    } else if (type === 'kingdom' && item.territory_label_lng) {
      mapRef.current?.flyTo(item.territory_label_lng, item.territory_label_lat, 5);
    }
  }, []);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  if (loading) {
    return (
      <div className="ak-loading">
        <div className="ak-loading-spinner" />
        <p>Loading African Kingdoms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ak-error">
        <h2>Failed to load data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="ak-app">
      {/* Header bar */}
      <header className="ak-header">
        <a className="ak-home-link" href="/" title="Back to The Mews">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>
        <h1 className="ak-title">African Kingdoms</h1>
        <span className="ak-subtitle">Timeline &amp; Atlas</span>
        <span className="ak-year-display">{formatYear(mapYear)}</span>
      </header>

      {/* Map area */}
      <div className="ak-map-area">
        <AfricanKingdomsMap
          ref={mapRef}
          places={data.places}
          kingdoms={data.kingdoms}
          tradeRoutes={data.tradeRoutes}
          activeEraFilter={activeEraFilter}
          mapYear={mapYear}
          eraMap={data.eraMap}
          onSelectPlace={handleSelectPlace}
          onSelectKingdom={handleSelectKingdom}
        />
      </div>

      {/* Era filter bar */}
      <KingdomFilter
        eras={data.eras}
        activeEraFilter={activeEraFilter}
        onEraSelect={setActiveEraFilter}
      />

      {/* Timeline strip */}
      <div className="ak-timeline-area">
        <Timeline
          ref={timelineRef}
          data={filteredTimelineData}
          config={timelineConfig}
          onViewportChange={handleViewportChange}
          onItemClick={handleTimelineItemClick}
          suppressModal={true}
        />
      </div>

      {/* Detail modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem.item}
          type={selectedItem.type}
          onClose={handleCloseModal}
          onSelectEntity={handleSelectEntity}
          data={data}
        />
      )}
    </div>
  );
}

export default AfricanKingdomsApp;
