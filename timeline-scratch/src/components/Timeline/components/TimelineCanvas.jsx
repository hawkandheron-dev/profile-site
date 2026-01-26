/**
 * Canvas layer for timeline rendering
 */

import { useRef, useEffect } from 'react';
import { yearToPixel, getYearLabelInterval } from '../utils/coordinates.js';
import { getYearRange } from '../utils/dateUtils.js';
import {
  clearCanvas,
  drawTimeAxis,
  drawPersonBox,
  drawPeriodBracket,
  getCurlyBracePath,
  drawPointMarker
} from '../utils/rendering.js';

export function TimelineCanvas({
  width,
  height,
  viewportStartYear,
  yearsPerPixel,
  panOffsetY,
  layout,
  config,
  hoveredItem,
  hoveredPeriod,
  onItemHover,
  onItemClick
}) {
  const canvasRef = useRef(null);
  const hitMapRef = useRef(new Map()); // For click detection

  // Get hovered period date range for highlighting
  const hoveredPeriodRange = hoveredPeriod ? getYearRange(hoveredPeriod.startDate, hoveredPeriod.endDate) : null;

  // Check if an item falls within the hovered period
  const isInHoveredPeriod = (startYear, endYear) => {
    if (!hoveredPeriodRange) return true; // No period hovered, all items are "in"
    // Item overlaps with period if item start <= period end AND item end >= period start
    return startYear <= hoveredPeriodRange.end && endYear >= hoveredPeriodRange.start;
  };

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    clearCanvas(ctx, width, height);

    // Clear hit map
    hitMapRef.current.clear();

    // Draw time axis
    const labelInterval = getYearLabelInterval(yearsPerPixel);
    const axisY = layout.axisY - panOffsetY;

    // Render periods BEFORE axis so year labels appear on top of period fills
    renderPeriods(ctx, layout.stackedPeriods, axisY);

    drawTimeAxis(
      ctx,
      width,
      height,
      axisY,
      viewportStartYear,
      yearsPerPixel,
      labelInterval,
      config.eraLabels
    );

    // Render all other items (they already have y positions calculated)
    renderPeople(ctx, layout.stackedPeople);
    renderPoints(ctx, layout.stackedPoints);
  }, [width, height, viewportStartYear, yearsPerPixel, panOffsetY, layout, config, hoveredItem, hoveredPeriod]);

  // Render people
  function renderPeople(ctx, people) {
    people.forEach(person => {
      const { start, end } = getYearRange(person.startDate, person.endDate);

      const x = yearToPixel(start, viewportStartYear, yearsPerPixel);
      const boxWidth = yearToPixel(end, viewportStartYear, yearsPerPixel) - x;
      const y = person.y - panOffsetY;
      const boxHeight = person.height - 8;

      // Min width for readability
      const displayWidth = Math.max(boxWidth, 60);

      // Get color
      const color = getPersonColor(person, config);

      // Check if hovered
      const isHovered = hoveredItem?.id === person.id && hoveredItem?.type === 'person';

      // Apply opacity based on period highlighting
      const inPeriod = isInHoveredPeriod(start, end);
      const opacity = hoveredPeriod ? (inPeriod ? 1.0 : 0.3) : 1.0;

      // Save context state for opacity
      ctx.save();
      ctx.globalAlpha = opacity;

      // Draw box
      drawPersonBox(ctx, x, displayWidth, y, boxHeight, color, isHovered);

      // Restore context
      ctx.restore();

      // Store in hit map for click detection
      hitMapRef.current.set(person.id, {
        type: 'person',
        item: person,
        bounds: { x, y, width: displayWidth, height: boxHeight }
      });
    });
  }

  // Render periods
  // Periods now have bracketHeight (for the curly brace) and height (total including points area)
  function renderPeriods(ctx, periods, axisY) {
    periods.forEach(period => {
      const { start, end } = getYearRange(period.startDate, period.endDate);

      const x = yearToPixel(start, viewportStartYear, yearsPerPixel);
      const periodWidth = yearToPixel(end, viewportStartYear, yearsPerPixel) - x;
      const y = period.y - panOffsetY;
      // Use bracketHeight for the actual bracket, falling back to height for backwards compatibility
      const bracketHeight = period.bracketHeight || period.height;

      // Get color
      const color = period.color || '#00838f';

      // Apply opacity based on period highlighting
      const isThisPeriodHovered = hoveredPeriod?.id === period.id;
      const opacity = hoveredPeriod ? (isThisPeriodHovered ? 1.0 : 0.3) : 1.0;

      ctx.save();
      ctx.globalAlpha = opacity;

      // Convert color to rgba for fill (slightly stronger when hovered)
      const fillAlpha = isThisPeriodHovered ? 0.25 : 0.15;
      const fillColor = hexToRgba(color, fillAlpha);

      const braceY = period.aboveTimeline ? y + bracketHeight : y;
      const braceHeight = period.aboveTimeline ? -bracketHeight : bracketHeight;

      // Get the curly brace path
      const path = getCurlyBracePath(x, periodWidth, braceY, braceHeight);

      // Draw filled area between bracket and axis using the curly brace curve
      ctx.fillStyle = fillColor;
      ctx.beginPath();

      if (period.aboveTimeline) {
        // Above timeline: bracket points up, fill from bracket to axis below
        // Start at left top corner
        ctx.moveTo(path.x1, path.y1);
        // Draw left side of bracket curve
        ctx.quadraticCurveTo(path.qx1, path.qy1, path.qx2, path.qy2);
        ctx.quadraticCurveTo(path.tc1x, path.tc1y, path.tx1, path.ty1);
        // Draw right side of bracket curve (reverse direction from center to right)
        ctx.quadraticCurveTo(path.tc2x, path.tc2y, path.qx4, path.qy4);
        ctx.quadraticCurveTo(path.qx3, path.qy3, path.x2, path.y2);
        // Draw line down to axis
        ctx.lineTo(path.x2, axisY);
        // Draw along axis
        ctx.lineTo(path.x1, axisY);
        // Close path back to start
        ctx.closePath();
      } else {
        // Below timeline: bracket points down, fill from axis line to bracket
        // The fill reaches the axis line itself (behind year labels)
        // Start at left edge of axis line
        ctx.moveTo(path.x1, axisY);
        // Draw down to bracket left edge
        ctx.lineTo(path.x1, path.y1);
        // Draw left side of bracket curve
        ctx.quadraticCurveTo(path.qx1, path.qy1, path.qx2, path.qy2);
        ctx.quadraticCurveTo(path.tc1x, path.tc1y, path.tx1, path.ty1);
        // Draw right side of bracket curve (reverse direction from center to right)
        ctx.quadraticCurveTo(path.tc2x, path.tc2y, path.qx4, path.qy4);
        ctx.quadraticCurveTo(path.qx3, path.qy3, path.x2, path.y2);
        // Draw line back up to axis
        ctx.lineTo(path.x2, axisY);
        // Draw along axis
        ctx.lineTo(path.x1, axisY);
        // Close path
        ctx.closePath();
      }

      ctx.fill();

      // Draw bracket
      drawPeriodBracket(ctx, x, periodWidth, braceY, braceHeight, color);

      // Restore context
      ctx.restore();

      // Store in hit map
      hitMapRef.current.set(period.id, {
        type: 'period',
        item: period,
        bounds: { x, y, width: periodWidth, height: bracketHeight }
      });
    });
  }

  // Render points
  function renderPoints(ctx, points) {
    points.forEach(point => {
      const year = getYearRange(point.date).start;

      const x = yearToPixel(year, viewportStartYear, yearsPerPixel);
      const y = point.y - panOffsetY + (point.height / 2);

      // Point markers are now rendered inside labels, so we don't draw them on canvas
      // Just set up hit detection

      // Store in hit map for clicking (use label area)
      const hitSize = 80; // Wider to match label width
      hitMapRef.current.set(point.id, {
        type: 'point',
        item: point,
        bounds: { x: x - hitSize/2, y: y - 40, width: hitSize, height: 35 }
      });
    });
  }

  // Convert hex color to rgba
  function hexToRgba(hex, alpha) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Get person color based on period mapping
  function getPersonColor(person, config) {
    if (person.color) return person.color;

    // Find period color from legend
    const periodId = person.periodId;
    if (periodId && config.legend) {
      const legendItem = config.legend.find(item => item.id === periodId);
      if (legendItem?.color) return legendItem.color;
    }

    // Default color
    return '#5b7ee8';
  }

  // Handle mouse move for hover detection
  function handleMouseMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check hit map
    let foundItem = null;

    for (const [id, hitData] of hitMapRef.current) {
      const { bounds } = hitData;

      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
      ) {
        foundItem = hitData;
        break;
      }
    }

    if (foundItem) {
      canvas.style.cursor = 'pointer';
      onItemHover?.(foundItem.type, foundItem.item);
    } else {
      canvas.style.cursor = 'grab';
      onItemHover?.(null, null);
    }
  }

  // Handle click
  function handleClick(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check hit map
    for (const [id, hitData] of hitMapRef.current) {
      const { bounds } = hitData;

      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
      ) {
        onItemClick?.(hitData.type, hitData.item);
        return;
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    />
  );
}
