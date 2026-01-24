/**
 * Main Timeline component
 * Combines Canvas rendering, overlays, and interactivity
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useZoomPan } from './hooks/useZoomPan.js';
import { useTimelineLayout } from './hooks/useTimelineLayout.js';
import { TimelineCanvas } from './components/TimelineCanvas.jsx';
import { TimelineOverlay } from './components/TimelineOverlay.jsx';
import { TimelineModal } from './components/TimelineModal.jsx';
import { TimelineLegend } from './components/TimelineLegend.jsx';
import './Timeline.css';

export function Timeline({ data, config, onViewportChange, onItemClick }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
  const initialStartYear = parseInt(defaultConfig.initialViewport.startDate.split('-')[0]);
  const initialEndYear = parseInt(defaultConfig.initialViewport.endDate.split('-')[0]);
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

  // Layout calculation
  const layout = useTimelineLayout(
    data,
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

  // Handle mouse down for pan
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left click

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    endPan();
    container.style.cursor = 'grab';
  }, [endPan]);

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

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

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
      <TimelineCanvas
        width={dimensions.width}
        height={dimensions.height}
        viewportStartYear={viewportStartYear}
        yearsPerPixel={yearsPerPixel}
        panOffsetY={panOffsetY}
        layout={layout}
        config={defaultConfig}
        hoveredItem={hoveredItem}
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
      />

      <TimelineLegend
        legend={defaultConfig.legend}
        isVisible={true}
      />

      <TimelineModal
        isOpen={selectedItem !== null}
        item={selectedItem?.item}
        itemType={selectedItem?.type}
        config={defaultConfig}
        onClose={handleModalClose}
      />

      {/* Controls */}
      <div className="timeline-controls">
        <button onClick={reset} title="Reset view">
          Reset
        </button>
        <div className="zoom-info">
          Zoom: {(1 / yearsPerPixel).toFixed(2)}x
        </div>
      </div>
    </div>
  );
}
