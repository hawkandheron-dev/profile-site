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
  onItemHover,
  onItemClick
}) {
  const canvasRef = useRef(null);
  const hitMapRef = useRef(new Map()); // For click detection

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
    drawTimeAxis(
      ctx,
      width,
      height,
      layout.sizes.axisHeight - 10,
      viewportStartYear,
      yearsPerPixel,
      labelInterval,
      config.eraLabels
    );

    // Draw each lane
    const laneOrder = config.laneOrder || ['people', 'periods', 'points'];

    laneOrder.forEach(laneType => {
      const laneY = layout.lanePositions[laneType] - panOffsetY;

      switch (laneType) {
        case 'people':
          renderPeople(ctx, layout.stackedPeople, laneY, layout.sizes.personRowHeight, layout.sizes.lanePadding);
          break;
        case 'periods':
          renderPeriods(ctx, layout.stackedPeriods, laneY, layout.sizes.periodRowHeight, layout.sizes.lanePadding);
          break;
        case 'points':
          renderPoints(ctx, layout.stackedPoints, laneY, layout.sizes.pointRowHeight, layout.sizes.lanePadding);
          break;
      }
    });
  }, [width, height, viewportStartYear, yearsPerPixel, panOffsetY, layout, config, hoveredItem]);

  // Render people
  function renderPeople(ctx, people, laneY, rowHeight, padding) {
    people.forEach(person => {
      const { start, end } = getYearRange(person.startDate, person.endDate);

      const x = yearToPixel(start, viewportStartYear, yearsPerPixel);
      const width = yearToPixel(end, viewportStartYear, yearsPerPixel) - x;
      const y = laneY + padding + (person.row * rowHeight);
      const boxHeight = rowHeight - 8;

      // Min width for readability
      const displayWidth = Math.max(width, 60);

      // Get color
      const color = getPersonColor(person, config);

      // Check if hovered
      const isHovered = hoveredItem?.id === person.id && hoveredItem?.type === 'person';

      // Draw box
      drawPersonBox(ctx, x, displayWidth, y, boxHeight, color, isHovered);

      // Store in hit map for click detection
      hitMapRef.current.set(person.id, {
        type: 'person',
        item: person,
        bounds: { x, y, width: displayWidth, height: boxHeight }
      });
    });
  }

  // Render periods
  function renderPeriods(ctx, periods, laneY, rowHeight, padding) {
    periods.forEach(period => {
      const { start, end } = getYearRange(period.startDate, period.endDate);

      const x = yearToPixel(start, viewportStartYear, yearsPerPixel);
      const width = yearToPixel(end, viewportStartYear, yearsPerPixel) - x;
      const y = laneY + padding + (period.row * rowHeight);
      const bracketHeight = 30;

      // Get color
      const color = period.color || '#00838f';

      // Draw bracket
      drawPeriodBracket(ctx, x, width, y, bracketHeight, color);

      // Store in hit map
      hitMapRef.current.set(period.id, {
        type: 'period',
        item: period,
        bounds: { x, y, width, height: bracketHeight }
      });
    });
  }

  // Render points
  function renderPoints(ctx, points, laneY, rowHeight, padding) {
    points.forEach(point => {
      const year = getYearRange(point.date).start;

      const x = yearToPixel(year, viewportStartYear, yearsPerPixel);
      const y = laneY + padding + (point.row * rowHeight) + (rowHeight / 2);

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
