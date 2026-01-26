/**
 * SVG/HTML overlay layer for labels and previews
 */

import { yearToPixel } from '../utils/coordinates.js';
import { getYearRange } from '../utils/dateUtils.js';
import { Icon, ShapeIcon } from './Icon.jsx';
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
  const parseColor = (color) => {
    if (!color) return null;

    const normalized = color.trim().toLowerCase();
    let r, g, b;

    if (normalized.startsWith('#')) {
      let hex = normalized.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map((value) => value + value).join('');
      }
      if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      }
    } else if (normalized.startsWith('rgb')) {
      const matches = normalized.match(/\d+(\.\d+)?/g);
      if (matches && matches.length >= 3) {
        r = Number(matches[0]);
        g = Number(matches[1]);
        b = Number(matches[2]);
      }
    }

    if ([r, g, b].some((value) => Number.isNaN(value) || value === undefined)) {
      return null;
    }

    return { r, g, b };
  };

  const getLabelTextColor = (backgroundColor) => {
    const rgb = parseColor(backgroundColor);
    if (!rgb) return '#fff';

    const toLinear = (value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    };

    const luminance = 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);

    return luminance > 0.6 ? '#000' : '#fff';
  };

  const getLabelBackground = (backgroundColor, alpha = 0.85) => {
    const rgb = parseColor(backgroundColor);
    if (!rgb) return backgroundColor || `rgba(0, 0, 0, ${alpha})`;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

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

    // Calculate visible years to determine if we should show year ranges
    const visibleYears = width * yearsPerPixel;
    const showYearRange = visibleYears <= 300;

    // For emperors, hide short reigns when zoomed out
    const minEmperorReignToShow = visibleYears > 200 ? 10 : visibleYears > 100 ? 5 : 0;

    return people.map(person => {
      const { start, end } = getYearRange(person.startDate, person.endDate);
      const reignLength = end - start;

      // Hide short-reign emperors when zoomed out
      if (person.isEmperor && reignLength < minEmperorReignToShow) {
        return null;
      }

      const startX = yearToPixel(start, viewportStartYear, yearsPerPixel);
      const endX = yearToPixel(end, viewportStartYear, yearsPerPixel);
      const boxWidth = Math.max(endX - startX, 60); // Min width for readability
      const boxHeight = person.height - 8;
      const boxY = person.y - panOffsetY;

      // Position label - stagger vertically based on row to avoid overlap
      // Even rows: label at bottom, Odd rows: label at top
      let labelX = startX + 6; // 6px from left edge of box
      const row = person.row || 0;

      // For emperors, use 5 vertical positions with labels extending outside boxes
      let labelY;
      if (person.isEmperor) {
        // 5 stagger positions to spread labels out vertically
        const rowPosition = row % 5;
        if (rowPosition === 0) {
          labelY = boxY + boxHeight - 22; // Inside at bottom
        } else if (rowPosition === 1) {
          labelY = boxY - 24; // Above the box
        } else if (rowPosition === 2) {
          labelY = boxY + (boxHeight / 2) - 10; // Inside at middle
        } else if (rowPosition === 3) {
          labelY = boxY + boxHeight + 4; // Below the box
        } else {
          labelY = boxY + 4; // Inside at top
        }
      } else {
        // For regular people, alternate between bottom and top
        const isOddRow = row % 2 === 1;
        labelY = isOddRow
          ? boxY + 4  // Top of box for odd rows
          : boxY + boxHeight - 22; // Bottom of box for even rows
      }

      // Sticky behavior: stick to left edge if box extends left of viewport
      const isSticky = startX < 0 && endX > 0;
      if (isSticky) {
        labelX = 10; // Stick to left edge with padding
      }

      // Hide if completely off screen
      if (endX < 0 || startX > width) {
        return null;
      }

      // Format year range (only shown when zoomed in enough)
      let yearRange = '';
      if (showYearRange) {
        const startYear = start <= 0 ? Math.abs(start - 1) + 1 : start;
        const endYear = end <= 0 ? Math.abs(end - 1) + 1 : end;
        const bcLabel = config.eraLabels === 'BC/AD' ? 'BC' : 'BCE';
        const startIsBC = start <= 0;
        const endIsBC = end <= 0;

        // Format: "X BC" for BC years, just "X" for AD years
        const startStr = startIsBC ? `${startYear} ${bcLabel}` : `${startYear}`;
        const endStr = endIsBC ? `${endYear} ${bcLabel}` : `${endYear}`;

        yearRange = startYear !== endYear
          ? ` (${startStr}-${endStr})`
          : ` (${startStr})`;
      }

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
            zIndex: isSticky ? 10 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {person.isEmperor && (
            <Icon name="crown" size={12} color="#ffd700" />
          )}
          <span>{person.name}</span>
          <span style={{ opacity: 0.9, fontSize: '11px' }}>{yearRange}</span>
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
      const labelMargin = 1;  // Margin between label and bracket point
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

      const labelBackground = period.color || '#00838f';
      const labelTextColor = getLabelTextColor(labelBackground);
      const labelBackgroundColor = getLabelBackground(labelBackground);

      return (
        <div
          key={period.id}
          className="period-label"
          style={{
            position: 'absolute',
            left: `${labelX}px`,
            top: `${bracketY + labelOffsetY}px`,
            transform: period.aboveTimeline ? 'translate(-50%, -100%)' : 'translateX(-50%)',
            pointerEvents: 'none',
            fontSize: '13px',
            fontWeight: '600',
            color: labelTextColor,
            backgroundColor: labelBackgroundColor,
            padding: '4px 12px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            zIndex: (isLeftSticky || isRightSticky) ? 10 : 1,
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

    return points.map(point => {
      const year = getYearRange(point.date).start;

      const x = yearToPixel(year, viewportStartYear, yearsPerPixel);
      const y = point.y - panOffsetY + (point.height / 2);

      // Hide if off screen
      if (x < -50 || x > width + 50) {
        return null;
      }

      // Format date display - support date ranges for documents
      const [bcLabel, adLabel] = config.eraLabels === 'BC/AD' ? ['BC', 'AD'] : ['BCE', 'CE'];
      const formatYear = (yr) => {
        const displayYr = yr <= 0 ? Math.abs(yr - 1) + 1 : yr;
        const era = yr <= 0 ? bcLabel : adLabel;
        // Only show era label for BC years
        return yr <= 0 ? `${displayYr} ${era}` : `${displayYr}`;
      };

      let dateDisplay;
      if (point.endDate) {
        // Date range (e.g., documents with early/late dates)
        const endYear = getYearRange(point.endDate).start;
        dateDisplay = `${formatYear(year)}-${formatYear(endYear)}`;
      } else {
        // Single date
        const displayYear = year <= 0 ? Math.abs(year - 1) + 1 : year;
        const era = year <= 0 ? bcLabel : adLabel;
        dateDisplay = `${displayYear} ${era}`;
      }

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
            <ShapeIcon shape={point.shape || 'circle'} color={point.color || '#ff6f00'} size={14} />
            <div style={{ fontSize: '12px', fontWeight: '600' }}>{point.name}</div>
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7, paddingLeft: '20px' }}>
            {dateDisplay}
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
