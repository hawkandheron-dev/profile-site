/**
 * Mobile-optimized vertical timeline component
 * Swimlane / Gantt layout: year axis pinned left, person lanes scroll horizontally
 * Each person gets a fixed-width column so bars never overlap or truncate
 */

import { useState, useRef, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { getYear, getYearRange } from '../utils/dateUtils.js';
import { getYearLabelInterval } from '../utils/coordinates.js';
import { Icon, ShapeIcon } from './Icon.jsx';
import { TimelineModal } from './TimelineModal.jsx';
import { YearSummaryModal } from './YearSummaryModal.jsx';
import './MobileTimeline.css';

const DEFAULT_PIXELS_PER_YEAR = 8;
const MIN_PIXELS_PER_YEAR = 1.5;
const MAX_PIXELS_PER_YEAR = 40;
const LANE_WIDTH = 100;
const LANE_GAP = 4;
const GUTTER_WIDTH = 60;

/** Lighten a hex color for readability on dark backgrounds */
function lightenColor(hex, floor = 160) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  // Boost each channel so the minimum is `floor`
  const lr = Math.min(255, Math.max(r, floor) + Math.round((255 - Math.max(r, floor)) * 0.3));
  const lg = Math.min(255, Math.max(g, floor) + Math.round((255 - Math.max(g, floor)) * 0.3));
  const lb = Math.min(255, Math.max(b, floor) + Math.round((255 - Math.max(b, floor)) * 0.3));
  return `rgb(${lr}, ${lg}, ${lb})`;
}

export const MobileTimeline = forwardRef(function MobileTimeline({ data, config, onItemClick, authContext, allPeople, adminContext, onEntityUpdated }, ref) {
  const scrollRef = useRef(null);
  const [pixelsPerYear, setPixelsPerYear] = useState(DEFAULT_PIXELS_PER_YEAR);
  const [selectedItem, setSelectedItem] = useState(null);
  const [yearSummaryOpen, setYearSummaryOpen] = useState(false);
  const [pinnedYear, setPinnedYear] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    people: true,
    emperors: true,
    periods: true,
    councils: true,
    documents: true,
    events: true
  });
  // Search highlight state
  const [searchHighlight, setSearchHighlight] = useState(null);

  const pinchRef = useRef({ active: false, startDist: 0, startPPY: 0 });

  const defaultConfig = useMemo(() => ({
    initialViewport: { startDate: '0001-01-01', endDate: '0200-12-31' },
    eraLabels: 'BC/AD',
    legend: [],
    ...config
  }), [config]);

  const dataBounds = useMemo(() => {
    const { people = [], points = [], periods = [] } = data;
    let minYear = Infinity, maxYear = -Infinity;
    for (const p of people) {
      const s = getYear(p.startDate), e = getYear(p.endDate);
      if (s != null && s < minYear) minYear = s;
      if (e != null && e > maxYear) maxYear = e;
    }
    for (const p of points) {
      const y = getYear(p.date);
      if (y != null) { if (y < minYear) minYear = y; if (y > maxYear) maxYear = y; }
    }
    for (const p of periods) {
      const s = getYear(p.startDate), e = getYear(p.endDate);
      if (s != null && s < minYear) minYear = s;
      if (e != null && e > maxYear) maxYear = e;
    }
    if (!isFinite(minYear)) { minYear = 0; maxYear = 200; }
    const span = maxYear - minYear;
    const pad = Math.max(span * 0.05, 10);
    return { minYear: Math.floor(minYear - pad), maxYear: Math.ceil(maxYear + pad) };
  }, [data]);

  const filteredData = useMemo(() => {
    const { people = [], points = [], periods = [] } = data;
    return {
      people: people.filter(p => p.isEmperor ? filters.emperors : filters.people),
      points: points.filter(p => {
        if (p.itemType === 'councils') return filters.councils;
        if (p.itemType === 'documents') return filters.documents;
        if (p.itemType === 'events') return filters.events;
        return true;
      }),
      periods: filters.periods ? periods : []
    };
  }, [data, filters]);

  const itemIndex = useMemo(() => {
    const map = new Map();
    data.people?.forEach(p => map.set(p.id, { type: 'person', item: p }));
    data.points?.forEach(p => map.set(p.id, { type: 'point', item: p }));
    data.periods?.forEach(p => map.set(p.id, { type: 'period', item: p }));
    return map;
  }, [data]);

  const yearToY = useCallback((year) => {
    return (year - dataBounds.minYear) * pixelsPerYear;
  }, [dataBounds.minYear, pixelsPerYear]);

  const totalHeight = useMemo(() => {
    return (dataBounds.maxYear - dataBounds.minYear) * pixelsPerYear;
  }, [dataBounds, pixelsPerYear]);

  const yearMarkers = useMemo(() => {
    const yearsPerPixel = 1 / pixelsPerYear;
    const interval = getYearLabelInterval(yearsPerPixel, 80);
    const markers = [];
    const [bcLabel, adLabel] = defaultConfig.eraLabels === 'BC/AD' ? ['BC', 'AD'] : ['BCE', 'CE'];
    const firstYear = Math.ceil(dataBounds.minYear / interval) * interval;
    for (let year = firstYear; year <= dataBounds.maxYear; year += interval) {
      const displayYear = year <= 0 ? Math.abs(year - 1) + 1 : year;
      markers.push({ year, y: yearToY(year), label: `${displayYear} ${year <= 0 ? bcLabel : adLabel}` });
    }
    return markers;
  }, [dataBounds, pixelsPerYear, yearToY, defaultConfig.eraLabels]);

  const { peopleLayout, numColumns } = useMemo(() => {
    const people = [...filteredData.people].sort((a, b) => getYear(a.startDate) - getYear(b.startDate));
    const columnEnds = [];
    const laid = people.map(person => {
      const { start, end } = getYearRange(person.startDate, person.endDate);
      let col = -1;
      for (let i = 0; i < columnEnds.length; i++) {
        if (start > columnEnds[i] + 2) { col = i; break; }
      }
      if (col === -1) { col = columnEnds.length; columnEnds.push(0); }
      columnEnds[col] = end;
      return { ...person, column: col };
    });
    return { peopleLayout: laid, numColumns: columnEnds.length };
  }, [filteredData.people]);

  const contentWidth = useMemo(() => {
    return Math.max(numColumns * (LANE_WIDTH + LANE_GAP) + LANE_GAP, 300);
  }, [numColumns]);

  useEffect(() => {
    const startYear = getYear(defaultConfig.initialViewport.startDate);
    if (scrollRef.current && startYear != null) {
      scrollRef.current.scrollTop = Math.max(0, yearToY(startYear) - 40);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { active: true, startDist: Math.sqrt(dx * dx + dy * dy), startPPY: pixelsPerYear };
    }
  }, [pixelsPerYear]);

  const handleTouchMove = useCallback((e) => {
    if (pinchRef.current.active && e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / pinchRef.current.startDist;
      setPixelsPerYear(Math.min(MAX_PIXELS_PER_YEAR, Math.max(MIN_PIXELS_PER_YEAR, pinchRef.current.startPPY * scale)));
    }
  }, []);

  const handleTouchEnd = useCallback(() => { pinchRef.current.active = false; }, []);

  const handleItemClick = useCallback((type, item) => {
    setSelectedItem({ type, item });
    onItemClick?.(type, item);
  }, [onItemClick]);

  const handleModalClose = useCallback(() => setSelectedItem(null), []);

  const handleModalItemSelect = useCallback((type, item) => {
    setSelectedItem({ type, item });
    onItemClick?.(type, item);
  }, [onItemClick]);

  const getYearSummary = useCallback((year) => {
    const { people = [], points = [], periods = [] } = filteredData;
    return {
      year,
      activePeriods: periods.filter(p => { const s = getYear(p.startDate), e = getYear(p.endDate); return year >= s && year <= e; }),
      alivePeople: people.filter(p => { const s = getYear(p.startDate), e = getYear(p.endDate); return year >= s && year <= e; }),
      yearPoints: points.filter(p => getYear(p.date) === year),
      nearbyPoints: points
        .filter(p => { const py = getYear(p.date); return py >= year - 25 && py <= year + 25; })
        .map(p => ({ ...p, pointYear: getYear(p.date), yearDelta: getYear(p.date) - year }))
        .sort((a, b) => a.pointYear - b.pointYear)
    };
  }, [filteredData]);

  const handleYearMarkerClick = useCallback((year) => { setPinnedYear(year); setYearSummaryOpen(true); }, []);
  const handleYearSummaryClose = useCallback(() => setYearSummaryOpen(false), []);
  const handleFilterToggle = useCallback((key) => setFilters(prev => ({ ...prev, [key]: !prev[key] })), []);

  // --- Search handlers ---
  // Handle search autocomplete selection — scroll to item and open modal
  const handleSearchSelect = useCallback((type, item) => {
    setSearchHighlight(null);
    // Get the item's year
    const year = type === 'point' ? getYear(item.date) : getYear(item.startDate);
    if (year != null && scrollRef.current) {
      // Scroll to the year, centered vertically
      const targetY = yearToY(year);
      const viewportHeight = scrollRef.current.clientHeight;
      scrollRef.current.scrollTop = Math.max(0, targetY - viewportHeight / 2);
    }
    // Open the modal
    setSelectedItem({ type, item });
    onItemClick?.(type, item);
  }, [yearToY, onItemClick]);

  // Handle search find mode — highlight matches and scroll to current
  const handleSearchHighlight = useCallback((matches, currentIdx, query) => {
    setSearchHighlight({ matches, currentIdx, query });
    if (matches.length > 0 && currentIdx >= 0 && currentIdx < matches.length) {
      const match = matches[currentIdx];
      const year = match.type === 'point' ? getYear(match.item.date) : getYear(match.item.startDate);
      if (year != null && scrollRef.current) {
        const targetY = yearToY(year);
        const viewportHeight = scrollRef.current.clientHeight;
        scrollRef.current.scrollTop = Math.max(0, targetY - viewportHeight / 2);
      }
    }
  }, [yearToY]);

  // Clear search highlights
  const handleSearchClearHighlight = useCallback(() => {
    setSearchHighlight(null);
  }, []);

  // Expose search methods to parent via ref
  useImperativeHandle(ref, () => ({
    selectItem: handleSearchSelect,
    highlight: handleSearchHighlight,
    clearHighlight: handleSearchClearHighlight,
  }), [handleSearchSelect, handleSearchHighlight, handleSearchClearHighlight]);

  // Compute highlighted item IDs
  const highlightedItemIds = useMemo(() => {
    if (!searchHighlight || searchHighlight.matches.length === 0) return new Set();
    return new Set(searchHighlight.matches.map(m => m.id));
  }, [searchHighlight]);

  const currentHighlightId = useMemo(() => {
    if (!searchHighlight || searchHighlight.matches.length === 0) return null;
    return searchHighlight.matches[searchHighlight.currentIdx]?.id ?? null;
  }, [searchHighlight]);

  const handleBackgroundClick = useCallback((e) => {
    // Don't handle clicks on interactive elements (buttons, links) — those have their own handlers
    if (e.target.closest('button, a')) return;
    // The scroll container is the parent; use its viewport rect + scrollTop
    // to convert the click's clientY into a position within the content.
    const scrollEl = e.currentTarget.parentElement;
    const scrollRect = scrollEl.getBoundingClientRect();
    const y = e.clientY - scrollRect.top + scrollEl.scrollTop;
    const year = Math.round(dataBounds.minYear + y / pixelsPerYear);
    setPinnedYear(year);
    setYearSummaryOpen(true);
  }, [dataBounds.minYear, pixelsPerYear]);

  const handleZoomIn = useCallback(() => setPixelsPerYear(p => Math.min(MAX_PIXELS_PER_YEAR, p * 1.5)), []);
  const handleZoomOut = useCallback(() => setPixelsPerYear(p => Math.max(MIN_PIXELS_PER_YEAR, p / 1.5)), []);
  const handleZoomReset = useCallback(() => setPixelsPerYear(DEFAULT_PIXELS_PER_YEAR), []);

  const formatYear = useCallback((year) => {
    const [bc, ad] = defaultConfig.eraLabels === 'BC/AD' ? ['BC', 'AD'] : ['BCE', 'CE'];
    return year <= 0 ? `${Math.abs(year - 1) + 1} ${bc}` : `${year} ${ad}`;
  }, [defaultConfig.eraLabels]);

  const getPersonColor = useCallback((person) => {
    if (person.color) return person.color;
    if (person.periodId && defaultConfig.legend) {
      const leg = defaultConfig.legend.find(l => l.id === person.periodId);
      if (leg?.color) return leg.color;
    }
    return '#5b7ee8';
  }, [defaultConfig.legend]);

  return (
    <div className="mobile-timeline">
      {/* Toolbar */}
      <div className="mobile-timeline-toolbar">
        <button className="mobile-toolbar-btn" onClick={() => setFiltersOpen(p => !p)}>
          <Icon name="diamond" size={14} />
          <span>Filter</span>
        </button>
        <div className="mobile-zoom-controls">
          <button className="mobile-toolbar-btn" onClick={handleZoomOut}><Icon name="minus" size={14} /></button>
          <span className="mobile-zoom-label">{pixelsPerYear.toFixed(1)}px/yr</span>
          <button className="mobile-toolbar-btn" onClick={handleZoomIn}><Icon name="plus" size={14} /></button>
          <button className="mobile-toolbar-btn" onClick={handleZoomReset}><Icon name="quatrefoil" size={14} /></button>
        </div>
      </div>

      {/* Filter drawer */}
      {filtersOpen && (
        <div className="mobile-filter-drawer">
          {defaultConfig.legend.map(item => {
            const isActive = item.filterKey ? filters[item.filterKey] !== false : true;
            return (
              <label key={item.id} className={`mobile-filter-item ${!isActive ? 'inactive' : ''}`}>
                {item.filterKey && (
                  <input type="checkbox" checked={isActive} onChange={() => handleFilterToggle(item.filterKey)} />
                )}
                {(item.type === 'people' || item.type === 'bracket') && (
                  <span className="mobile-filter-swatch" style={{ backgroundColor: item.color }} />
                )}
                {item.type === 'point' && <ShapeIcon shape={item.shape} color={item.color} size={14} />}
                {item.isEmperor && <Icon name="crown" size={12} color={item.color} />}
                <span>{item.name}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Main scroll area */}
      <div
        ref={scrollRef}
        className="mobile-timeline-scroll"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="mobile-timeline-content"
          style={{ height: `${totalHeight + 80}px`, width: `${contentWidth + GUTTER_WIDTH}px` }}
          onClick={handleBackgroundClick}
        >
          {/* Horizontal gridlines (behind everything) */}
          {yearMarkers.map(m => (
            <div
              key={`grid-${m.year}`}
              className="mobile-gridline"
              style={{ top: `${m.y}px`, width: `${contentWidth + GUTTER_WIDTH}px` }}
            />
          ))}

          {/* ── Lanes area (people + periods, scrolls with content) ── */}
          <div className="mobile-lanes-area" style={{ left: `${GUTTER_WIDTH}px`, width: `${contentWidth}px` }}>
            {/* Person lane columns */}
            {peopleLayout.map(person => {
              const { start, end } = getYearRange(person.startDate, person.endDate);
              const topY = yearToY(start);
              const height = yearToY(end) - topY;
              const color = getPersonColor(person);
              const x = person.column * (LANE_WIDTH + LANE_GAP) + LANE_GAP;
              const isHighlighted = highlightedItemIds.has(person.id);
              const isCurrent = person.id === currentHighlightId;

              return (
                <button
                  key={person.id}
                  className={`mobile-person-lane${isHighlighted ? ' highlighted' : ''}${isCurrent ? ' current-highlight' : ''}`}
                  style={{
                    top: `${topY}px`,
                    height: `${Math.max(height, 28)}px`,
                    left: `${x}px`,
                    width: `${LANE_WIDTH}px`,
                    '--person-color': color
                  }}
                  onClick={() => handleItemClick('person', person)}
                >
                  <span className="mobile-person-header">
                    {person.isEmperor && <Icon name="crown" size={10} color="#ffd700" />}
                    <span className="mobile-person-name">{person.name}</span>
                  </span>
                  <span className="mobile-person-dates">
                    {formatYear(start)} – {formatYear(end)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Point markers (positioned at gutter edge, sticky label) ── */}
          {filteredData.points.map(point => {
            const year = getYear(point.date);
            const topY = yearToY(year);
            return (
              <button
                key={point.id}
                className="mobile-point-marker"
                style={{ top: `${topY}px`, left: `${GUTTER_WIDTH + 2}px` }}
                onClick={() => handleItemClick('point', point)}
              >
                <span className="mobile-point-content">
                  <span className="mobile-point-icon">
                    <ShapeIcon shape={point.shape || 'circle'} color={point.color || '#ff6f00'} size={14} />
                  </span>
                  <span className="mobile-point-text">
                    <span className="mobile-point-name">{point.name}</span>
                    <span className="mobile-point-year">{formatYear(year)}</span>
                  </span>
                </span>
              </button>
            );
          })}

          {/* ── Year gutter overlay (dark bg, sticky left, in front of lanes) ── */}
          <div className="mobile-year-gutter">
            <div className="mobile-axis-line" />
            {yearMarkers.map(m => (
              <button
                key={m.year}
                className="mobile-year-marker"
                style={{ top: `${m.y}px` }}
                onClick={() => handleYearMarkerClick(m.year)}
              >
                <span className="mobile-year-label">{m.label}</span>
                <span className="mobile-year-tick" />
              </button>
            ))}
          </div>

          {/* ── Period banners (in front of year gutter, sticky in both axes) ── */}
          {/* Container is pointer-events:none so taps pass through to background;
              only the label itself is clickable. */}
          {filteredData.periods.map(period => {
            const { start, end } = getYearRange(period.startDate, period.endDate);
            const topY = yearToY(start);
            const height = yearToY(end) - topY;
            const color = period.color || '#00838f';
            const lightColor = lightenColor(color);
            return (
              <div
                key={period.id}
                className="mobile-period-banner"
                style={{
                  top: `${topY}px`,
                  height: `${Math.max(height, 4)}px`
                }}
              >
                <button
                  className="mobile-period-banner-label"
                  style={{ borderLeftColor: lightColor, color: lightColor }}
                  onClick={() => handleItemClick('period', period)}
                >
                  {period.name}
                  <span className="mobile-period-banner-dates">
                    {formatYear(start)} – {formatYear(end)}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <TimelineModal
        isOpen={selectedItem !== null}
        item={selectedItem?.item}
        itemType={selectedItem?.type}
        config={defaultConfig}
        onClose={handleModalClose}
        itemIndex={itemIndex}
        onSelectItem={handleModalItemSelect}
        authContext={authContext}
        allPeople={allPeople}
        adminContext={adminContext}
        onEntityUpdated={onEntityUpdated}
      />
      {yearSummaryOpen && pinnedYear !== null && (
        <YearSummaryModal
          year={pinnedYear}
          summary={getYearSummary(pinnedYear)}
          config={defaultConfig}
          onClose={handleYearSummaryClose}
          itemIndex={itemIndex}
          onSelectItem={handleModalItemSelect}
        />
      )}
    </div>
  );
});
