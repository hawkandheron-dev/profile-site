/**
 * Main Timeline component
 * Combines Canvas rendering, overlays, and interactivity
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useZoomPan } from './hooks/useZoomPan.js';
import { useTimelineLayout } from './hooks/useTimelineLayout.js';
import { TimelineCanvas } from './components/TimelineCanvas.jsx';
import { TimelineOverlay } from './components/TimelineOverlay.jsx';
import { TimelineModal } from './components/TimelineModal.jsx';
import { YearSummaryModal } from './components/YearSummaryModal.jsx';
import { TimelineLegend } from './components/TimelineLegend.jsx';
import { Icon } from './components/Icon.jsx';
import { getYear, getYearRange } from './utils/dateUtils.js';
import './Timeline.css';

export function Timeline({ data, config, onViewportChange, onItemClick }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState({
    people: true,
    emperors: true,
    periods: true,
    councils: true,
    documents: true,
    events: true
  });
  // Cursor line and year summary state
  const [pinnedYear, setPinnedYear] = useState(null);
  const [yearSummaryOpen, setYearSummaryOpen] = useState(false);
  const [isOverControls, setIsOverControls] = useState(false);

  // Default config
  const defaultConfig = {
    initialViewport: {
      startDate: '0001-01-01',
      endDate: '0200-12-31'
    },
    eraLabels: 'BC/AD',
    maxTimeSpan: 6000,
    laneOrder: ['people', 'periods', 'points'],
    legend: [],
    ...config
  };

  // Parse initial viewport
  const initialStartYear = getYear(defaultConfig.initialViewport.startDate);
  const initialEndYear = getYear(defaultConfig.initialViewport.endDate);
  const initialYearsPerPixel = (initialEndYear - initialStartYear) / dimensions.width;

  // Zoom and pan state
  const {
    viewportStartYear,
    yearsPerPixel,
    panOffsetY,
    handleZoom,
    handlePanX,
    handlePanY,
    startPan,
    updatePan,
    endPan,
    reset,
    jumpToYear,
    isPanning
  } = useZoomPan({
    initialViewportStartYear: initialStartYear,
    initialYearsPerPixel: initialYearsPerPixel,
    minYearsPerPixel: 0.1,
    maxYearsPerPixel: 50,
    minYear: -3000,
    maxYear: 2100
  });

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    const { people = [], points = [], periods = [] } = data;

    const filteredPeople = people.filter(person => {
      if (person.isEmperor) {
        return filters.emperors;
      }
      return filters.people;
    });

    const filteredPoints = points.filter(point => {
      if (point.itemType === 'councils') return filters.councils;
      if (point.itemType === 'documents') return filters.documents;
      if (point.itemType === 'events') return filters.events;
      return true; // Default show if no itemType
    });

    const filteredPeriods = filters.periods ? periods : [];

    return {
      people: filteredPeople,
      points: filteredPoints,
      periods: filteredPeriods
    };
  }, [data, filters]);

  const itemIndex = useMemo(() => {
    const map = new Map();
    data.people?.forEach(person => {
      map.set(person.id, { type: 'person', item: person });
    });
    data.points?.forEach(point => {
      map.set(point.id, { type: 'point', item: point });
    });
    data.periods?.forEach(period => {
      map.set(period.id, { type: 'period', item: period });
    });
    return map;
  }, [data]);

  // Layout calculation
  const layout = useTimelineLayout(
    filteredData,
    defaultConfig.laneOrder,
    yearsPerPixel,
    {
      personRowHeight: 40,
      pointRowHeight: 50,
      periodRowHeight: 60,
      lanePadding: 20,
      axisHeight: 40
    }
  );

  // Handle container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Handle wheel for zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    handleZoom(e.deltaY / 100, mouseX, dimensions.width);
  }, [handleZoom, dimensions.width]);

  // Handle mouse down for pan or blank click
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left click

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Store click position to detect if it was a click vs drag
    containerRef.current._clickStart = { x, y, time: Date.now() };

    startPan(x, y);
    container.style.cursor = 'grabbing';
  }, [startPan]);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    if (isPanning) {
      const maxOffsetY = Math.max(0, layout.totalHeight - dimensions.height);
      updatePan(x, y, dimensions.width, maxOffsetY);
    }
  }, [isPanning, updatePan, dimensions, layout.totalHeight]);

  // Calculate cursor year from mouse X position (needs to be before handleMouseUp)
  const cursorYear = useMemo(() => {
    return Math.round(viewportStartYear + mousePos.x * yearsPerPixel);
  }, [viewportStartYear, mousePos.x, yearsPerPixel]);

  // Handle mouse up
  const handleMouseUp = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return;

    // Check if this was a click (minimal movement and short duration)
    // Don't trigger if any modal is open or hovering over controls
    const clickStart = container._clickStart;
    if (clickStart && !hoveredItem && !isOverControls && !selectedItem && !yearSummaryOpen) {
      const dx = Math.abs(mousePos.x - clickStart.x);
      const dy = Math.abs(mousePos.y - clickStart.y);
      const duration = Date.now() - clickStart.time;

      // If minimal movement and short duration, treat as click
      if (dx < 5 && dy < 5 && duration < 300) {
        setPinnedYear(cursorYear);
        setYearSummaryOpen(true);
      }
    }
    container._clickStart = null;

    endPan();
    container.style.cursor = 'grab';
  }, [endPan, hoveredItem, mousePos, cursorYear, isOverControls, selectedItem, yearSummaryOpen]);

  // Handle item hover
  const handleItemHover = useCallback((type, item) => {
    if (type && item) {
      setHoveredItem({ type, item, mouseX: mousePos.x, mouseY: mousePos.y });
    } else {
      setHoveredItem(null);
    }
  }, [mousePos]);

  // Handle item click
  const handleItemClickInternal = useCallback((type, item) => {
    setSelectedItem({ type, item });
    onItemClick?.(type, item);
  }, [onItemClick]);

  const handleModalItemSelect = useCallback((type, item) => {
    setSelectedItem({ type, item });
    onItemClick?.(type, item);
  }, [onItemClick]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Handle filter toggle
  const handleFilterToggle = useCallback((filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  }, []);

  // Check if cursor is over an item (to hide the year line)
  const isOverItem = hoveredItem !== null;

  // Get the hovered period (for highlighting related items)
  const hoveredPeriod = useMemo(() => {
    if (hoveredItem?.type === 'period') {
      return hoveredItem.item;
    }
    return null;
  }, [hoveredItem]);

  // Calculate year summary data for a given year
  const getYearSummary = useCallback((year) => {
    const { people = [], points = [], periods = [] } = filteredData;

    // Find periods that contain this year
    const activePeriods = periods.filter(p => {
      const start = getYear(p.startDate);
      const end = getYear(p.endDate);
      return year >= start && year <= end;
    });

    // Find people alive in this year
    const alivePeople = people.filter(p => {
      const start = getYear(p.startDate);
      const end = getYear(p.endDate);
      return year >= start && year <= end;
    });

    // Find points that occurred in this exact year
    const yearPoints = points.filter(p => {
      const pointYear = getYear(p.date);
      return pointYear === year;
    });

    return { year, activePeriods, alivePeople, yearPoints };
  }, [filteredData]);

  // Handle click on blank space (for year summary)
  const handleBlankClick = useCallback((e) => {
    // Only handle if not over an item and not panning
    if (!hoveredItem && !isPanning) {
      setPinnedYear(cursorYear);
      setYearSummaryOpen(true);
    }
  }, [hoveredItem, isPanning, cursorYear]);

  // Close year summary modal
  const handleYearSummaryClose = useCallback(() => {
    setYearSummaryOpen(false);
    // Clear pinned year only if cursor has moved to a different position
    // This is handled by checking in the render
  }, []);

  // Handle zoom buttons
  const handleZoomIn = useCallback(() => {
    const centerX = dimensions.width / 2;
    handleZoom(-2, centerX, dimensions.width); // Negative delta = zoom in
  }, [handleZoom, dimensions.width]);

  const handleZoomOut = useCallback(() => {
    const centerX = dimensions.width / 2;
    handleZoom(2, centerX, dimensions.width); // Positive delta = zoom out
  }, [handleZoom, dimensions.width]);

  // Notify viewport changes
  useEffect(() => {
    if (onViewportChange) {
      const endYear = viewportStartYear + (dimensions.width * yearsPerPixel);
      onViewportChange({
        startYear: viewportStartYear,
        endYear: endYear,
        yearsPerPixel: yearsPerPixel
      });
    }
  }, [viewportStartYear, yearsPerPixel, dimensions.width, onViewportChange]);

  return (
    <div
      ref={containerRef}
      className="timeline-container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Cursor year line - behind all elements */}
      {!isOverItem && !isPanning && !yearSummaryOpen && !isOverControls && (
        <div
          className="cursor-year-line"
          style={{
            position: 'absolute',
            left: `${mousePos.x}px`,
            top: 0,
            width: '1px',
            height: '100%',
            backgroundColor: 'rgba(100, 100, 100, 0.5)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      {/* Pinned year line - stays visible when modal open */}
      {yearSummaryOpen && pinnedYear !== null && (
        <div
          className="pinned-year-line"
          style={{
            position: 'absolute',
            left: `${(pinnedYear - viewportStartYear) / yearsPerPixel}px`,
            top: 0,
            width: '2px',
            height: '100%',
            backgroundColor: 'rgba(25, 118, 210, 0.7)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      <TimelineCanvas
        width={dimensions.width}
        height={dimensions.height}
        viewportStartYear={viewportStartYear}
        yearsPerPixel={yearsPerPixel}
        panOffsetY={panOffsetY}
        layout={layout}
        config={defaultConfig}
        hoveredItem={hoveredItem}
        hoveredPeriod={hoveredPeriod}
        onItemHover={handleItemHover}
        onItemClick={handleItemClickInternal}
      />

      <TimelineOverlay
        width={dimensions.width}
        height={dimensions.height}
        viewportStartYear={viewportStartYear}
        yearsPerPixel={yearsPerPixel}
        panOffsetY={panOffsetY}
        layout={layout}
        config={defaultConfig}
        hoveredItem={hoveredItem}
        hoveredPeriod={hoveredPeriod}
      />

      {/* Cursor year display - follows cursor */}
      {!isOverItem && !isPanning && !yearSummaryOpen && !isOverControls && (
        <div
          className="cursor-year-display"
          style={{
            position: 'absolute',
            left: `${mousePos.x + 12}px`,
            top: `${mousePos.y - 10}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            pointerEvents: 'none',
            zIndex: 200,
            whiteSpace: 'nowrap'
          }}
        >
          {cursorYear <= 0 ? `${Math.abs(cursorYear - 1)} BC` : `${cursorYear} AD`}
        </div>
      )}

      <TimelineLegend
        legend={defaultConfig.legend}
        isVisible={true}
        filters={filters}
        onFilterToggle={handleFilterToggle}
        onMouseEnter={() => setIsOverControls(true)}
        onMouseLeave={() => setIsOverControls(false)}
      />

      <TimelineModal
        isOpen={selectedItem !== null}
        item={selectedItem?.item}
        itemType={selectedItem?.type}
        config={defaultConfig}
        onClose={handleModalClose}
        itemIndex={itemIndex}
        onSelectItem={handleModalItemSelect}
      />

      {/* Year Summary Modal */}
      {yearSummaryOpen && pinnedYear !== null && (
        <YearSummaryModal
          year={pinnedYear}
          summary={getYearSummary(pinnedYear)}
          config={defaultConfig}
          onClose={handleYearSummaryClose}
        />
      )}

      {/* Controls */}
      <div
        className="timeline-controls"
        onMouseEnter={() => setIsOverControls(true)}
        onMouseLeave={() => setIsOverControls(false)}
      >
        <button onClick={handleZoomIn} title="Zoom in" className="icon-button">
          <Icon name="plus" size={16} />
          <span>Zoom in</span>
        </button>
        <button onClick={handleZoomOut} title="Zoom out" className="icon-button">
          <Icon name="minus" size={16} />
          <span>Zoom out</span>
        </button>
        <button onClick={reset} title="Reset view" className="icon-button">
          <Icon name="quatrefoil" size={16} />
          <span>Reset</span>
        </button>
        <div className="zoom-info">
          <Icon name="diamond" size={14} />
          <span>{yearsPerPixel > 0 ? (1 / yearsPerPixel).toFixed(2) : '1.00'}x</span>
        </div>
      </div>
    </div>
  );
}
