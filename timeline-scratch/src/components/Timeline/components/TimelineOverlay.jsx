/**
 * SVG/HTML overlay layer for labels and previews
 */

import { yearToPixel } from '../utils/coordinates.js';
import { getYearRange } from '../utils/dateUtils.js';
import './TimelineOverlay.css';

export function TimelineOverlay({
  width,
  height,
  viewportStartYear,
  yearsPerPixel,
  panOffsetY,
  layout,
  config,
  hoveredItem
}) {
  return (
    <div
      className="timeline-overlay"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none'
      }}
    >
      {/* Render people labels (sticky) */}
      {renderPeopleLabels()}

      {/* Render period labels */}
      {renderPeriodLabels()}

      {/* Render point callouts */}
      {renderPointCallouts()}

      {/* Render hover preview */}
      {hoveredItem && renderHoverPreview()}
    </div>
  );

  function renderPeopleLabels() {
    const people = layout.stackedPeople || [];

    return people.map(person => {
      const { start, end } = getYearRange(person.startDate, person.endDate);

      const startX = yearToPixel(start, viewportStartYear, yearsPerPixel);
      const endX = yearToPixel(end, viewportStartYear, yearsPerPixel);
      const boxWidth = Math.max(endX - startX, 60); // Min width for readability
      const boxHeight = person.height - 8;
      const boxY = person.y - panOffsetY;

      // Position label at bottom-left of the box, overlaid
      let labelX = startX + 6; // 6px from left edge of box
      const labelY = boxY + boxHeight - 22; // 22px from bottom of box

      // Sticky behavior: stick to left edge if box extends left of viewport
      const isSticky = startX < 0 && endX > 0;
      if (isSticky) {
        labelX = 10; // Stick to left edge with padding
      }

      // Hide if completely off screen
      if (endX < 0 || startX > width) {
        return null;
      }

      // Show year range if available
      const startYear = start <= 0 ? Math.abs(start - 1) + 1 : start;
      const endYear = end <= 0 ? Math.abs(end - 1) + 1 : end;
      const [bcLabel, adLabel] = config.eraLabels === 'BC/AD' ? ['BC', 'AD'] : ['BCE', 'CE'];
      const startEra = start <= 0 ? bcLabel : adLabel;
      const endEra = end <= 0 ? bcLabel : adLabel;

      const yearRange = startYear !== endYear
        ? `(${startYear} ${startEra} - ${endYear} ${endEra})`
        : `(${startYear} ${startEra})`;

      return (
        <div
          key={person.id}
          className="person-label"
          style={{
            position: 'absolute',
            left: `${labelX}px`,
            top: `${labelY}px`,
            pointerEvents: 'none',
            fontSize: '12px',
            fontWeight: '500',
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            padding: '3px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            zIndex: isSticky ? 10 : 1
          }}
        >
          {person.name} <span style={{ opacity: 0.9, fontSize: '11px' }}>{yearRange}</span>
        </div>
      );
    });
  }

  function renderPeriodLabels() {
    const periods = layout.stackedPeriods || [];

    return periods.map(period => {
      const { start, end } = getYearRange(period.startDate, period.endDate);

      const startX = yearToPixel(start, viewportStartYear, yearsPerPixel);
      const endX = yearToPixel(end, viewportStartYear, yearsPerPixel);
      const centerX = (startX + endX) / 2;
      const bracketY = period.y - panOffsetY;
      const bracketWidth = endX - startX;

      // Hide if completely off screen
      if (endX < 0 || startX > width) {
        return null;
      }

      // Calculate bracket center point using curly brace formula
      // This is the "point" of the bracket where it reaches furthest from the top edge
      const w = period.height;  // Perpendicular width of the brace
      const bracketCenterY = bracketY + w;  // The point extends by the full height

      // Label position: on outer side of bracket, with margin from bracket point
      // For above timeline, label goes above bracket; for below, label goes below
      const labelMargin = 15;  // Margin between label and bracket point
      const labelOffsetY = period.aboveTimeline
        ? -labelMargin  // Above bracket, measured from bracket point
        : w + labelMargin;  // Below bracket, measured from bracket top edge

      let labelX = centerX;

      // Sticky behavior: when center point scrolls off viewport, stick label to edge
      // but keep it within the bracket bounds
      const isLeftSticky = centerX < 0 && endX > 0;
      const isRightSticky = centerX > width && startX < width;

      if (isLeftSticky) {
        labelX = Math.max(10, startX); // Stick to left edge but not before start
      } else if (isRightSticky) {
        labelX = Math.min(width - 10, endX); // Stick to right edge but not after end
      }

      return (
        <div
          key={period.id}
          className="period-label"
          style={{
            position: 'absolute',
            left: `${labelX}px`,
            top: `${bracketY + labelOffsetY}px`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            fontSize: '13px',
            fontWeight: '600',
            color: '#fff',
            backgroundColor: period.color || '#00838f',
            padding: '4px 12px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            zIndex: (isLeftSticky || isRightSticky) ? 10 : 1,
            WebkitTextStroke: '0.5px rgba(100, 100, 100, 0.3)',
            textShadow: '0 0 2px rgba(0, 0, 0, 0.3)'
          }}
        >
          {period.name}
        </div>
      );
    });
  }

  function renderPointCallouts() {
    const points = layout.stackedPoints || [];

    // Helper to render shape icon
    const renderShapeIcon = (shape, color, size = 16) => {
      const half = size / 2;
      const curve = size * 0.1;

      switch (shape) {
        case 'diamond':
          return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
              <path
                d={`M ${half} 0 Q ${half + curve} ${half - curve} ${size} ${half} Q ${half + curve} ${half + curve} ${half} ${size} Q ${half - curve} ${half + curve} 0 ${half} Q ${half - curve} ${half - curve} ${half} 0 Z`}
                fill={color}
                stroke="#333"
                strokeWidth="1"
              />
            </svg>
          );
        case 'square':
          return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
              <path
                d={`M 0 ${curve} Q ${half} ${-curve} ${size - curve} 0 Q ${size + curve} ${half} ${size - curve} ${size} Q ${half} ${size + curve} ${curve} ${size} Q ${-curve} ${half} 0 ${curve} Z`}
                fill={color}
                stroke="#333"
                strokeWidth="1"
              />
            </svg>
          );
        case 'circle':
          return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
              <circle cx={half} cy={half} r={half - 1} fill={color} stroke="#333" strokeWidth="1" />
            </svg>
          );
        case 'triangle':
          const height = (Math.sqrt(3) / 2) * size;
          return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
              <path
                d={`M ${half} ${(size - height) / 2} Q ${half + half / 2 + curve} ${size / 2} ${size} ${(size + height) / 2} Q ${half} ${(size + height) / 2 + curve} 0 ${(size + height) / 2} Q ${half - half / 2 - curve} ${size / 2} ${half} ${(size - height) / 2} Z`}
                fill={color}
                stroke="#333"
                strokeWidth="1"
              />
            </svg>
          );
        default:
          return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
              <circle cx={half} cy={half} r={half - 1} fill={color} stroke="#333" strokeWidth="1" />
            </svg>
          );
      }
    };

    return points.map(point => {
      const year = getYearRange(point.date).start;

      const x = yearToPixel(year, viewportStartYear, yearsPerPixel);
      const y = point.y - panOffsetY + (point.height / 2);

      // Hide if off screen
      if (x < -50 || x > width + 50) {
        return null;
      }

      const displayYear = year <= 0 ? Math.abs(year - 1) + 1 : year;
      const [bcLabel, adLabel] = config.eraLabels === 'BC/AD' ? ['BC', 'AD'] : ['BCE', 'CE'];
      const era = year <= 0 ? bcLabel : adLabel;

      return (
        <div
          key={point.id}
          className="point-callout"
          style={{
            position: 'absolute',
            left: `${x}px`,
            top: `${y - 40}px`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            color: '#333',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            {renderShapeIcon(point.shape || 'circle', point.color || '#ff6f00', 14)}
            <div style={{ fontSize: '12px', fontWeight: '600' }}>{point.name}</div>
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7, paddingLeft: '20px' }}>
            {displayYear} {era}
          </div>
        </div>
      );
    });
  }

  function renderHoverPreview() {
    const { type, item, mouseX, mouseY } = hoveredItem;

    if (!item) return null;

    // Position preview near mouse
    const previewX = Math.min(mouseX + 15, width - 250);
    const previewY = mouseY + 15;

    return (
      <div
        className="hover-preview"
        style={{
          position: 'absolute',
          left: `${previewX}px`,
          top: `${previewY}px`,
          width: '240px',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '12px',
          pointerEvents: 'none',
          zIndex: 100,
          fontSize: '13px',
          lineHeight: '1.5'
        }}
      >
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: '100%',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '4px',
              marginBottom: '8px'
            }}
          />
        )}
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          {item.name}
        </div>
        {item.preview && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            {item.preview.length > 150
              ? item.preview.substring(0, 150) + '...'
              : item.preview}
          </div>
        )}
      </div>
    );
  }
}
