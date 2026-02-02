/**
 * Mobile-optimized vertical timeline component
 * Uses DOM elements (not canvas) for better mobile performance and accessibility
 * Vertical scrolling with year axis on the left, items as cards on the right
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { getYear, getYearRange, formatDateRange } from '../utils/dateUtils.js';
import { getYearLabelInterval } from '../utils/coordinates.js';
import { Icon, ShapeIcon } from './Icon.jsx';
import { TimelineModal } from './TimelineModal.jsx';
import { YearSummaryModal } from './YearSummaryModal.jsx';
import './MobileTimeline.css';

// Vertical pixels per year at default zoom
const DEFAULT_PIXELS_PER_YEAR = 8;
const MIN_PIXELS_PER_YEAR = 1.5;
const MAX_PIXELS_PER_YEAR = 40;

export function MobileTimeline({ data, config, onItemClick }) {
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

  // Pinch-zoom tracking
  const pinchRef = useRef({ active: false, startDist: 0, startPPY: 0, lastPPY: 0 });

  // Config defaults
  const defaultConfig = useMemo(() => ({
    initialViewport: { startDate: '0001-01-01', endDate: '0200-12-31' },
    eraLabels: 'BC/AD',
    legend: [],
    ...config
  }), [config]);

  // Calculate data bounds
  const dataBounds = useMemo(() => {
    const { people = [], points = [], periods = [] } = data;
    let minYear = Infinity;
    let maxYear = -Infinity;

    people.forEach(p => {
      const s = getYear(p.startDate);
      const e = getYear(p.endDate);
      if (s != null && s < minYear) minYear = s;
      if (e != null && e > maxYear) maxYear = e;
    });

    points.forEach(p => {
      const y = getYear(p.date);
      if (y != null) {
        if (y < minYear) minYear = y;
        if (y > maxYear) maxYear = y;
      }
    });

    periods.forEach(p => {
      const s = getYear(p.startDate);
      const e = getYear(p.endDate);
      if (s != null && s < minYear) minYear = s;
      if (e != null && e > maxYear) maxYear = e;
    });

    if (!isFinite(minYear)) { minYear = 0; maxYear = 200; }

    // Add padding
    const span = maxYear - minYear;
    const pad = Math.max(span * 0.05, 10);
    return { minYear: Math.floor(minYear - pad), maxYear: Math.ceil(maxYear + pad) };
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    const { people = [], points = [], periods = [] } = data;

    const filteredPeople = people.filter(p =>
      p.isEmperor ? filters.emperors : filters.people
    );
    const filteredPoints = points.filter(p => {
      if (p.itemType === 'councils') return filters.councils;
      if (p.itemType === 'documents') return filters.documents;
      if (p.itemType === 'events') return filters.events;
      return true;
    });
    const filteredPeriods = filters.periods ? periods : [];

    return { people: filteredPeople, points: filteredPoints, periods: filteredPeriods };
  }, [data, filters]);

  // Build item index for modals
  const itemIndex = useMemo(() => {
    const map = new Map();
    data.people?.forEach(person => map.set(person.id, { type: 'person', item: person }));
    data.points?.forEach(point => map.set(point.id, { type: 'point', item: point }));
    data.periods?.forEach(period => map.set(period.id, { type: 'period', item: period }));
    return map;
  }, [data]);

  // Convert year to vertical pixel position
  const yearToY = useCallback((year) => {
    return (year - dataBounds.minYear) * pixelsPerYear;
  }, [dataBounds.minYear, pixelsPerYear]);

  // Total height of the scrollable area
  const totalHeight = useMemo(() => {
    return (dataBounds.maxYear - dataBounds.minYear) * pixelsPerYear;
  }, [dataBounds, pixelsPerYear]);

  // Year axis markers
  const yearMarkers = useMemo(() => {
    const yearsPerPixel = 1 / pixelsPerYear;
    const interval = getYearLabelInterval(yearsPerPixel, 80);
    const markers = [];
    const [bcLabel, adLabel] = defaultConfig.eraLabels === 'BC/AD' ? ['BC', 'AD'] : ['BCE', 'CE'];

    const firstYear = Math.ceil(dataBounds.minYear / interval) * interval;
    for (let year = firstYear; year <= dataBounds.maxYear; year += interval) {
      const displayYear = year <= 0 ? Math.abs(year - 1) + 1 : year;
      const era = year <= 0 ? bcLabel : adLabel;
      markers.push({
        year,
        y: yearToY(year),
        label: `${displayYear} ${era}`
      });
    }
    return markers;
  }, [dataBounds, pixelsPerYear, yearToY, defaultConfig.eraLabels]);

  // Assign horizontal columns to people to avoid overlap
  const peopleLayout = useMemo(() => {
    const people = [...filteredData.people].sort((a, b) => {
      const aStart = getYear(a.startDate);
      const bStart = getYear(b.startDate);
      return aStart - bStart;
    });

    // Simple column assignment: each person gets a column (0-based)
    // We track end years per column to find the first available one
    const columns = []; // Each entry: endYear of last item in that column

    return people.map(person => {
      const { start, end } = getYearRange(person.startDate, person.endDate);

      // Find first column where this person fits (start > column's endYear + small gap)
      let col = 0;
      let found = false;
      for (let i = 0; i < columns.length; i++) {
        if (start > columns[i] + 2) { // 2-year gap
          col = i;
          found = true;
          break;
        }
      }
      if (!found) {
        col = columns.length;
        columns.push(0);
      }
      columns[col] = end;

      return { ...person, column: col, totalColumns: 0 }; // totalColumns updated below
    }).map(p => ({ ...p, totalColumns: columns.length }));
  }, [filteredData.people]);

  // Scroll to initial viewport on mount
  useEffect(() => {
    const startYear = getYear(defaultConfig.initialViewport.startDate);
    if (scrollRef.current && startYear != null) {
      const targetY = yearToY(startYear);
      scrollRef.current.scrollTop = Math.max(0, targetY - 40);
    }
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  // Pinch zoom handlers
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      pinchRef.current = {
        active: true,
        startDist: dist,
        startPPY: pixelsPerYear,
        lastPPY: pixelsPerYear
      };
    }
  }, [pixelsPerYear]);

  const handleTouchMove = useCallback((e) => {
    if (pinchRef.current.active && e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / pinchRef.current.startDist;
      const newPPY = Math.min(MAX_PIXELS_PER_YEAR, Math.max(MIN_PIXELS_PER_YEAR, pinchRef.current.startPPY * scale));
      pinchRef.current.lastPPY = newPPY;
      setPixelsPerYear(newPPY);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchRef.current.active = false;
  }, []);

  // Item click handler
  const handleItemClick = useCallback((type, item) => {
    setSelectedItem({ type, item });
    onItemClick?.(type, item);
  }, [onItemClick]);

  const handleModalClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleModalItemSelect = useCallback((type, item) => {
    setSelectedItem({ type, item });
    onItemClick?.(type, item);
  }, [onItemClick]);

  // Year summary
  const getYearSummary = useCallback((year) => {
    const { people = [], points = [], periods = [] } = filteredData;
    const activePeriods = periods.filter(p => {
      const s = getYear(p.startDate);
      const e = getYear(p.endDate);
      return year >= s && year <= e;
    });
    const alivePeople = people.filter(p => {
      const s = getYear(p.startDate);
      const e = getYear(p.endDate);
      return year >= s && year <= e;
    });
    const yearPoints = points.filter(p => getYear(p.date) === year);
    return { year, activePeriods, alivePeople, yearPoints };
  }, [filteredData]);

  const handleYearMarkerClick = useCallback((year) => {
    setPinnedYear(year);
    setYearSummaryOpen(true);
  }, []);

  const handleYearSummaryClose = useCallback(() => {
    setYearSummaryOpen(false);
  }, []);

  // Filter toggle
  const handleFilterToggle = useCallback((filterKey) => {
    setFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setPixelsPerYear(prev => Math.min(MAX_PIXELS_PER_YEAR, prev * 1.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPixelsPerYear(prev => Math.max(MIN_PIXELS_PER_YEAR, prev / 1.5));
  }, []);

  const handleZoomReset = useCallback(() => {
    setPixelsPerYear(DEFAULT_PIXELS_PER_YEAR);
  }, []);

  // Format year helper
  const formatYear = useCallback((year) => {
    const [bcLabel, adLabel] = defaultConfig.eraLabels === 'BC/AD' ? ['BC', 'AD'] : ['BCE', 'CE'];
    if (year <= 0) return `${Math.abs(year - 1) + 1} ${bcLabel}`;
    return `${year} ${adLabel}`;
  }, [defaultConfig.eraLabels]);

  // Person color helper
  const getPersonColor = useCallback((person) => {
    if (person.color) return person.color;
    if (person.periodId && defaultConfig.legend) {
      const legendItem = defaultConfig.legend.find(l => l.id === person.periodId);
      if (legendItem?.color) return legendItem.color;
    }
    return '#5b7ee8';
  }, [defaultConfig.legend]);

  const isModalOpen = selectedItem !== null || yearSummaryOpen;

  return (
    <div className="mobile-timeline">
      {/* Top bar with filter toggle and zoom */}
      <div className="mobile-timeline-toolbar">
        <button
          className="mobile-toolbar-btn"
          onClick={() => setFiltersOpen(prev => !prev)}
        >
          <Icon name="diamond" size={14} />
          <span>Filter</span>
        </button>
        <div className="mobile-zoom-controls">
          <button className="mobile-toolbar-btn" onClick={handleZoomOut}>
            <Icon name="minus" size={14} />
          </button>
          <span className="mobile-zoom-label">{pixelsPerYear.toFixed(1)}px/yr</span>
          <button className="mobile-toolbar-btn" onClick={handleZoomIn}>
            <Icon name="plus" size={14} />
          </button>
          <button className="mobile-toolbar-btn" onClick={handleZoomReset}>
            <Icon name="quatrefoil" size={14} />
          </button>
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
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleFilterToggle(item.filterKey)}
                  />
                )}
                {item.type === 'people' && (
                  <span className="mobile-filter-swatch" style={{ backgroundColor: item.color }} />
                )}
                {item.type === 'bracket' && (
                  <span className="mobile-filter-swatch" style={{ backgroundColor: item.color }} />
                )}
                {item.type === 'point' && (
                  <ShapeIcon shape={item.shape} color={item.color} size={14} />
                )}
                {item.isEmperor && (
                  <Icon name="crown" size={12} color={item.color} />
                )}
                <span>{item.name}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Scrollable timeline area */}
      <div
        ref={scrollRef}
        className="mobile-timeline-scroll"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mobile-timeline-content" style={{ height: `${totalHeight + 80}px` }}>
          {/* Vertical axis line */}
          <div className="mobile-axis-line" />

          {/* Year markers */}
          {yearMarkers.map(marker => (
            <button
              key={marker.year}
              className="mobile-year-marker"
              style={{ top: `${marker.y}px` }}
              onClick={() => handleYearMarkerClick(marker.year)}
            >
              <span className="mobile-year-label">{marker.label}</span>
              <span className="mobile-year-tick" />
            </button>
          ))}

          {/* Period backgrounds */}
          {filteredData.periods.map(period => {
            const { start, end } = getYearRange(period.startDate, period.endDate);
            const topY = yearToY(start);
            const height = yearToY(end) - topY;
            const color = period.color || '#00838f';

            return (
              <button
                key={period.id}
                className="mobile-period-bar"
                style={{
                  top: `${topY}px`,
                  height: `${Math.max(height, 2)}px`,
                  borderLeftColor: color,
                  backgroundColor: `${color}15`
                }}
                onClick={() => handleItemClick('period', period)}
              >
                <span className="mobile-period-label" style={{ color }}>
                  {period.name}
                </span>
              </button>
            );
          })}

          {/* People bars */}
          {peopleLayout.map(person => {
            const { start, end } = getYearRange(person.startDate, person.endDate);
            const topY = yearToY(start);
            const height = yearToY(end) - topY;
            const color = getPersonColor(person);
            const startYear = start <= 0 ? Math.abs(start - 1) + 1 : start;
            const endYear = end <= 0 ? Math.abs(end - 1) + 1 : end;

            // Stagger horizontally based on column assignment
            const colWidth = Math.min(60, Math.floor((100 - 5) / Math.max(person.totalColumns, 1)));
            const leftPercent = 5 + person.column * colWidth;
            const widthPercent = Math.max(colWidth - 2, 20);

            return (
              <button
                key={person.id}
                className="mobile-person-bar"
                style={{
                  top: `${topY}px`,
                  height: `${Math.max(height, 24)}px`,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  backgroundColor: color
                }}
                onClick={() => handleItemClick('person', person)}
              >
                <span className="mobile-person-name">
                  {person.isEmperor && <Icon name="crown" size={10} color="#ffd700" />}
                  {person.name}
                </span>
                <span className="mobile-person-years">
                  {startYear}–{endYear}
                </span>
              </button>
            );
          })}

          {/* Point markers */}
          {filteredData.points.map(point => {
            const year = getYear(point.date);
            const topY = yearToY(year);

            return (
              <button
                key={point.id}
                className="mobile-point-marker"
                style={{ top: `${topY}px` }}
                onClick={() => handleItemClick('point', point)}
              >
                <span className="mobile-point-icon">
                  <ShapeIcon shape={point.shape || 'circle'} color={point.color || '#ff6f00'} size={16} />
                </span>
                <span className="mobile-point-name">{point.name}</span>
                <span className="mobile-point-year">{formatYear(year)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals (reuse existing) */}
      <TimelineModal
        isOpen={selectedItem !== null}
        item={selectedItem?.item}
        itemType={selectedItem?.type}
        config={defaultConfig}
        onClose={handleModalClose}
        itemIndex={itemIndex}
        onSelectItem={handleModalItemSelect}
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
}
