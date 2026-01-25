/**
 * Custom hook for managing zoom and pan state
 */

import { useState, useCallback, useRef } from 'react';
import { calculateZoomAroundPoint, clamp } from '../utils/coordinates.js';

/**
 * Hook for zoom and pan functionality
 * @param {Object} config - Configuration
 * @param {number} config.initialViewportStartYear - Initial viewport start year
 * @param {number} config.initialYearsPerPixel - Initial scale
 * @param {number} config.minYearsPerPixel - Minimum zoom (most zoomed in)
 * @param {number} config.maxYearsPerPixel - Maximum zoom (most zoomed out)
 * @param {number} config.minYear - Minimum allowed year
 * @param {number} config.maxYear - Maximum allowed year
 * @returns {Object} Zoom/pan state and controls
 */
export function useZoomPan({
  initialViewportStartYear = 1,
  initialYearsPerPixel = 1,
  minYearsPerPixel = 0.01, // Very zoomed in
  maxYearsPerPixel = 50, // Very zoomed out
  minYear = -3000,
  maxYear = 2100
}) {
  const [viewportStartYear, setViewportStartYear] = useState(initialViewportStartYear);
  const [yearsPerPixel, setYearsPerPixel] = useState(initialYearsPerPixel);
  const [panOffsetY, setPanOffsetY] = useState(0);

  // Track if currently panning
  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  /**
   * Handle zoom centered on a point
   */
  const handleZoom = useCallback((zoomDelta, mouseX, canvasWidth) => {
    setViewportStartYear(prevStart => {
      setYearsPerPixel(prevYPP => {
        const { viewportStartYear: newStart, yearsPerPixel: newYPP } =
          calculateZoomAroundPoint(zoomDelta, mouseX, prevStart, prevYPP);

        // Clamp years per pixel to zoom limits
        const clampedYPP = clamp(newYPP, minYearsPerPixel, maxYearsPerPixel);

        // If we hit zoom limits, recalculate to keep mouse position stable
        if (clampedYPP !== newYPP) {
          const yearAtMouse = prevStart + (mouseX * prevYPP);
          const clampedStart = yearAtMouse - (mouseX * clampedYPP);

          // Clamp to valid year range
          const viewportYearSpan = canvasWidth * clampedYPP;
          const finalStart = clamp(clampedStart, minYear, maxYear - viewportYearSpan);

          setViewportStartYear(finalStart);
          return clampedYPP;
        }

        // Clamp viewport to valid year range
        const viewportYearSpan = canvasWidth * clampedYPP;
        const clampedStart = clamp(newStart, minYear, maxYear - viewportYearSpan);

        setViewportStartYear(clampedStart);
        return clampedYPP;
      });

      return viewportStartYear; // Dummy return, actual update happens in nested setter
    });
  }, [minYearsPerPixel, maxYearsPerPixel, minYear, maxYear]);

  /**
   * Handle horizontal pan (time scrolling)
   */
  const handlePanX = useCallback((deltaPixels, canvasWidth) => {
    setViewportStartYear(prevStart => {
      const deltaYears = deltaPixels * yearsPerPixel;
      const newStart = prevStart - deltaYears;

      // Clamp to valid range
      const viewportYearSpan = canvasWidth * yearsPerPixel;
      return clamp(newStart, minYear, maxYear - viewportYearSpan);
    });
  }, [yearsPerPixel, minYear, maxYear]);

  /**
   * Handle vertical pan (lane scrolling)
   */
  const handlePanY = useCallback((deltaPixels, maxOffset = 0) => {
    setPanOffsetY(prev => {
      const newOffset = prev - deltaPixels;
      // Clamp to valid range (0 to maxOffset)
      return clamp(newOffset, 0, maxOffset);
    });
  }, []);

  /**
   * Start panning
   */
  const startPan = useCallback((x, y) => {
    isPanning.current = true;
    lastMousePos.current = { x, y };
  }, []);

  /**
   * Update pan position
   */
  const updatePan = useCallback((x, y, canvasWidth, maxOffsetY = 0) => {
    if (!isPanning.current) return;

    const deltaX = x - lastMousePos.current.x;
    const deltaY = y - lastMousePos.current.y;

    handlePanX(deltaX, canvasWidth);
    handlePanY(deltaY, maxOffsetY);

    lastMousePos.current = { x, y };
  }, [handlePanX, handlePanY]);

  /**
   * End panning
   */
  const endPan = useCallback(() => {
    isPanning.current = false;
  }, []);

  /**
   * Reset to initial viewport
   */
  const reset = useCallback(() => {
    setViewportStartYear(initialViewportStartYear);
    setYearsPerPixel(initialYearsPerPixel);
    setPanOffsetY(0);
  }, [initialViewportStartYear, initialYearsPerPixel]);

  /**
   * Jump to a specific year
   */
  const jumpToYear = useCallback((year, canvasWidth) => {
    // Center the viewport on the target year
    const viewportYearSpan = canvasWidth * yearsPerPixel;
    const newStart = year - (viewportYearSpan / 2);

    // Clamp to valid range
    const clampedStart = clamp(newStart, minYear, maxYear - viewportYearSpan);
    setViewportStartYear(clampedStart);
  }, [yearsPerPixel, minYear, maxYear]);

  return {
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
    isPanning: isPanning.current
  };
}
