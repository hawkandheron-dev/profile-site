/**
 * Main Timeline component
 * Combines Canvas rendering, overlays, and interactivity
 */

import { useState, useRef, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useZoomPan } from './hooks/useZoomPan.js';
import { useTimelineLayout } from './hooks/useTimelineLayout.js';
import { useMobileDetect } from './hooks/useMobileDetect.js';
import { useSmoothPan } from './hooks/useSmoothPan.js';
import { TimelineCanvas } from './components/TimelineCanvas.jsx';
import { TimelineOverlay } from './components/TimelineOverlay.jsx';
import { TimelineModal } from './components/TimelineModal.jsx';
import { YearSummaryModal } from './components/YearSummaryModal.jsx';
import { TimelineLegend } from './components/TimelineLegend.jsx';
import { MobileTimeline } from './components/MobileTimeline.jsx';
import { Icon } from './components/Icon.jsx';
import { getYear, getYearRange } from './utils/dateUtils.js';
import bgManuscript from '../../assets/bg-manuscript.jpg';
import './Timeline.css';

export const Timeline = forwardRef(function Timeline({ data, config, onViewportChange, onItemClick, suppressModal = false, authContext, allPeople, adminContext, contributorContext, onEntityUpdated, onDataChanged }, ref) {
  const isMobile = useMobileDetect();

  // Render mobile timeline on small viewports
  if (isMobile) {
    return (
      <MobileTimeline
        ref={ref}
        data={data}
        config={config}
        onItemClick={onItemClick}
        authContext={authContext}
        allPeople={allPeople}
        adminContext={adminContext}
        contributorContext={contributorContext}
        onEntityUpdated={onEntityUpdated}
        onDataChanged={onDataChanged}
      />
    );
  }

  return (
    <DesktopTimeline
      ref={ref}
      data={data}
      config={config}
      onViewportChange={onViewportChange}
      onItemClick={onItemClick}
      suppressModal={suppressModal}
      authContext={authContext}
      allPeople={allPeople}
      adminContext={adminContext}
      contributorContext={contributorContext}
      onEntityUpdated={onEntityUpdated}
      onDataChanged={onDataChanged}
    />
  );
});

const DesktopTimeline = forwardRef(function DesktopTimeline({ data, config, onViewportChange, onItemClick, suppressModal = false, authContext, allPeople, adminContext, contributorContext, onEntityUpdated, onDataChanged }, ref) {
  const containerRef = useRef(null);
  const wasDraggingRef = useRef(false);
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
  // Search highlight state: { matches: [], currentIdx: number, query: string } | null
  const [searchHighlight, setSearchHighlight] = useState(null);

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

  // Parse initial viewport — keep zoom level from config, but center on year 1000
  const initialStartYear = getYear(defaultConfig.initialViewport.startDate);
  const initialEndYear = getYear(defaultConfig.initialViewport.endDate);
  const initialYearsPerPixel = (initialEndYear - initialStartYear) / dimensions.width;
  const initialCenterYear = 1000;
  const centeredViewportStart = initialCenterYear - (dimensions.width / 2 * initialYearsPerPixel);

  // Derive min/max year from actual data extent (not just initial viewport)
  const dataExtent = useMemo(() => {
    let min = initialStartYear;
    let max = initialEndYear;
    const allItems = [
      ...(data.people || []),
      ...(data.periods || []),
    ];
    for (const item of allItems) {
      const s = getYear(item.startDate);
      const e = getYear(item.endDate);
      if (s < min) min = s;
      if (e > max) max = e;
    }
    for (const point of (data.points || [])) {
      const y = getYear(point.date);
      if (y < min) min = y;
      if (y > max) max = y;
      if (point.endDate) {
        const e = getYear(point.endDate);
        if (e > max) max = e;
      }
    }
    return { min, max };
  }, [data, initialStartYear, initialEndYear]);

  const yearPadding = Math.max((dataExtent.max - dataExtent.min) * 0.1, 200);
  const derivedMinYear = Math.floor(dataExtent.min - yearPadding);
  const derivedMaxYear = Math.ceil(dataExtent.max + yearPadding);

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
    setVerticalOffset,
    isPanning
  } = useZoomPan({
    initialViewportStartYear: centeredViewportStart,
    initialYearsPerPixel: initialYearsPerPixel,
    minYearsPerPixel: 0.1,
    maxYearsPerPixel: 50,
    minYear: derivedMinYear,
    maxYear: derivedMaxYear
  });

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    const { people = [], points = [], periods = [] } = data;

    const filteredPeople = people.filter(person => {
      if (person.isMonarch) {
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

  // Re-select the current item from fresh data after a refetch
  useEffect(() => {
    if (selectedItem && itemIndex) {
      const fresh = itemIndex.get(selectedItem.item?.id);
      if (fresh) {
        setSelectedItem({ type: fresh.type, item: fresh.item });
      }
    }
  }, [itemIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Layout calculation
  const layout = useTimelineLayout(
    filteredData,
    defaultConfig.laneOrder,
    yearsPerPixel,
    {
      personRowHeight: 34,
      pointRowHeight: 20,
      periodRowHeight: 40,
      lanePadding: 8,
      axisHeight: 30
    }
  );

  // Center the axis vertically on initial load
  const initialCenterDone = useRef(false);
  useEffect(() => {
    if (!initialCenterDone.current && layout.axisY > 0 && dimensions.height > 0) {
      initialCenterDone.current = true;
      const targetOffset = Math.max(0, layout.axisY - dimensions.height / 2);
      const maxOffset = Math.max(0, layout.totalHeight - dimensions.height);
      setVerticalOffset(Math.min(targetOffset, maxOffset));
    }
  }, [layout.axisY, layout.totalHeight, dimensions.height, setVerticalOffset]);

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

  const isModalOpen = selectedItem !== null || yearSummaryOpen;

  // Handle wheel for zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (isModalOpen) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    handleZoom(e.deltaY / 100, mouseX, dimensions.width);
  }, [handleZoom, dimensions.width, isModalOpen]);

  // Handle mouse down for pan or blank click
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left click
    if (isModalOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Store click position to detect if it was a click vs drag
    containerRef.current._clickStart = { x, y, time: Date.now() };

    startPan(x, y);
    container.style.cursor = 'grabbing';
  }, [isModalOpen, startPan]);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return;
    if (isModalOpen) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    if (isPanning) {
      const maxOffsetY = Math.max(0, layout.totalHeight - dimensions.height);
      updatePan(x, y, dimensions.width, maxOffsetY);
    }
  }, [isModalOpen, isPanning, updatePan, dimensions, layout.totalHeight]);

  // Calculate cursor year from mouse X position (needs to be before handleMouseUp)
  const cursorYear = useMemo(() => {
    return Math.round(viewportStartYear + mousePos.x * yearsPerPixel);
  }, [viewportStartYear, mousePos.x, yearsPerPixel]);

  // Handle mouse up
  const handleMouseUp = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return;
    if (isModalOpen) return;

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

    // If any significant movement happened, suppress the next canvas click
    if (clickStart) {
      const dx = Math.abs(mousePos.x - clickStart.x);
      const dy = Math.abs(mousePos.y - clickStart.y);
      if (dx >= 5 || dy >= 5) {
        wasDraggingRef.current = true;
        requestAnimationFrame(() => { wasDraggingRef.current = false; });
      }
    }
  }, [endPan, hoveredItem, isModalOpen, mousePos, cursorYear, isOverControls, selectedItem, yearSummaryOpen]);

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
    setHoveredItem(null);
    if (!suppressModal) {
      setSelectedItem({ type, item });
    }
    onItemClick?.(type, item);
  }, [onItemClick, suppressModal]);

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

  // --- Search handlers ---
  // Find an item's Y position in the layout for vertical centering
  const getItemY = useCallback((type, itemId) => {
    if (type === 'person') {
      const found = layout.stackedPeople?.find(p => p.id === itemId);
      return found ? found.y + (found.height || 0) / 2 : null;
    }
    if (type === 'point') {
      const found = layout.stackedPoints?.find(p => p.id === itemId);
      return found ? found.y : null;
    }
    if (type === 'period') {
      const found = layout.stackedPeriods?.find(p => p.id === itemId);
      return found ? found.y + (found.bracketHeight || 0) / 2 : null;
    }
    return null;
  }, [layout]);

  // Handle search autocomplete selection — scroll to item and open modal
  const handleSearchSelect = useCallback((type, item) => {
    // Clear any find highlights
    setSearchHighlight(null);

    // Get the item's year and scroll horizontally
    const year = type === 'point' ? getYear(item.date) : getYear(item.startDate);
    if (year != null) {
      jumpToYear(year, dimensions.width);
    }

    // Calculate vertical offset to center the item
    const itemY = getItemY(type, item.id);
    if (itemY != null) {
      const targetOffset = Math.max(0, itemY - dimensions.height / 2);
      const maxOffset = Math.max(0, layout.totalHeight - dimensions.height);
      setVerticalOffset(Math.min(targetOffset, maxOffset));
    }

    // Open the modal
    if (!suppressModal) {
      setSelectedItem({ type, item });
    }
    onItemClick?.(type, item);
  }, [jumpToYear, dimensions, getItemY, layout.totalHeight, setVerticalOffset, suppressModal, onItemClick]);

  // Handle search find mode — highlight matches and scroll to current
  const handleSearchHighlight = useCallback((matches, currentIdx, query) => {
    setSearchHighlight({ matches, currentIdx, query });

    // Scroll to the current match
    if (matches.length > 0 && currentIdx >= 0 && currentIdx < matches.length) {
      const match = matches[currentIdx];
      const year = match.type === 'point' ? getYear(match.item.date) : getYear(match.item.startDate);
      if (year != null) {
        jumpToYear(year, dimensions.width);
      }
      const itemY = getItemY(match.type, match.item.id);
      if (itemY != null) {
        const targetOffset = Math.max(0, itemY - dimensions.height / 2);
        const maxOffset = Math.max(0, layout.totalHeight - dimensions.height);
        setVerticalOffset(Math.min(targetOffset, maxOffset));
      }
    }
  }, [jumpToYear, dimensions, getItemY, layout.totalHeight, setVerticalOffset]);

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

  // Compute set of highlighted item IDs for rendering
  const highlightedItemIds = useMemo(() => {
    if (!searchHighlight || searchHighlight.matches.length === 0) return new Set();
    return new Set(searchHighlight.matches.map(m => m.id));
  }, [searchHighlight]);

  const currentHighlightId = useMemo(() => {
    if (!searchHighlight || searchHighlight.matches.length === 0) return null;
    return searchHighlight.matches[searchHighlight.currentIdx]?.id ?? null;
  }, [searchHighlight]);

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
    // For monarchs, filter by reign dates so only actually reigning
    // emperors appear under "Reigning Emperor(s)"
    const alivePeople = people.filter(p => {
      if (p.isMonarch && p.reignStartYear != null && p.reignEndYear != null) {
        return year >= p.reignStartYear && year <= p.reignEndYear;
      }
      const start = getYear(p.startDate);
      const end = getYear(p.endDate);
      return year >= start && year <= end;
    });

    // Find points that occurred in this exact year
    const yearPoints = points.filter(p => {
      const pointYear = getYear(p.date);
      return pointYear === year;
    });

    // Find events and texts within ±25 years (50-year window)
    const nearbyPoints = points
      .filter(p => {
        const pointYear = getYear(p.date);
        return pointYear >= year - 25 && pointYear <= year + 25;
      })
      .map(p => ({
        ...p,
        pointYear: getYear(p.date),
        yearDelta: getYear(p.date) - year
      }))
      .sort((a, b) => a.pointYear - b.pointYear);

    return { year, activePeriods, alivePeople, yearPoints, nearbyPoints };
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

  // Smooth accelerating directional navigation (arrow keys + compass rose)
  const { startDirection, stopDirection, activeDirections } = useSmoothPan({
    handlePanX,
    handlePanY,
    dimensions,
    layoutTotalHeight: layout.totalHeight,
  });

  // Keyboard arrow key navigation with hold-to-accelerate
  useEffect(() => {
    const keyToDir = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    };

    const handleKeyDown = (e) => {
      if (isModalOpen) return;
      const dir = keyToDir[e.key];
      if (dir) {
        e.preventDefault();
        startDirection(dir);
      }
    };

    const handleKeyUp = (e) => {
      const dir = keyToDir[e.key];
      if (dir) stopDirection(dir);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isModalOpen, startDirection, stopDirection]);

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
      {/* Background manuscript image with parallax */}
      <div
        className="timeline-bg-image"
        style={{
          backgroundImage: `url(${bgManuscript})`,
          transform: `translate(${-33.33 + viewportStartYear * -0.002}%, ${-33.33 + panOffsetY * -0.008}%)`,
        }}
      />
      {/* Semi-transparent overlay on top of background */}
      <div className="timeline-bg-overlay" />

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
        wasDraggingRef={wasDraggingRef}
        highlightedItemIds={highlightedItemIds}
        currentHighlightId={currentHighlightId}
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
        highlightedItemIds={highlightedItemIds}
        currentHighlightId={currentHighlightId}
        onItemHover={handleItemHover}
        onItemClick={handleItemClickInternal}
        wasDraggingRef={wasDraggingRef}
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
        siteTitle={defaultConfig.siteTitle}
      />

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
        contributorContext={contributorContext}
        onEntityUpdated={onEntityUpdated}
        onItemDeleted={(type, id) => {
          setSelectedItem(null);
        }}
        onDataChanged={onDataChanged}
      />

      {/* Year Summary Modal */}
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

      {/* Controls */}
      <div
        className="timeline-controls"
        onMouseEnter={() => setIsOverControls(true)}
        onMouseLeave={() => setIsOverControls(false)}
      >
        {/* Compass rose — self-contained cross of 4 arrows + center */}
        <div className="compass-rose">
          <button
            onMouseDown={() => startDirection('up')}
            onMouseUp={() => stopDirection('up')}
            onMouseLeave={() => stopDirection('up')}
            title="Scroll up"
            className={`btn btn-icon compass-btn compass-up${activeDirections.has('up') ? ' active' : ''}`}
          >
            <Icon name="arrow-up" size={12} />
          </button>
          <div className="compass-middle-row">
            <button
              onMouseDown={() => startDirection('left')}
              onMouseUp={() => stopDirection('left')}
              onMouseLeave={() => stopDirection('left')}
              title="Scroll left"
              className={`btn btn-icon compass-btn compass-left${activeDirections.has('left') ? ' active' : ''}`}
            >
              <Icon name="arrow-left" size={12} />
            </button>
            <button onClick={reset} title="Reset view" className="btn btn-icon compass-btn compass-center">
              <Icon name="quatrefoil" size={12} />
            </button>
            <button
              onMouseDown={() => startDirection('right')}
              onMouseUp={() => stopDirection('right')}
              onMouseLeave={() => stopDirection('right')}
              title="Scroll right"
              className={`btn btn-icon compass-btn compass-right${activeDirections.has('right') ? ' active' : ''}`}
            >
              <Icon name="arrow-right" size={12} />
            </button>
          </div>
          <button
            onMouseDown={() => startDirection('down')}
            onMouseUp={() => stopDirection('down')}
            onMouseLeave={() => stopDirection('down')}
            title="Scroll down"
            className={`btn btn-icon compass-btn compass-down${activeDirections.has('down') ? ' active' : ''}`}
          >
            <Icon name="arrow-down" size={12} />
          </button>
        </div>

        {/* Zoom controls — aligned to compass middle row */}
        <div className="zoom-controls">
          <button onClick={handleZoomIn} title="Zoom in" className="btn btn-sm">
            <Icon name="plus" size={14} />
            <span>Zoom in</span>
          </button>
          <button onClick={handleZoomOut} title="Zoom out" className="btn btn-sm">
            <Icon name="minus" size={14} />
            <span>Zoom out</span>
          </button>
          <span className="zoom-info">
            {yearsPerPixel > 0 ? (1 / yearsPerPixel).toFixed(1) : '1.0'}x
          </span>
        </div>
      </div>
    </div>
  );
});
