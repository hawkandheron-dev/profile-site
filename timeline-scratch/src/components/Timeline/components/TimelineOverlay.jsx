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
  const laneOrder = config.laneOrder || ['people', 'periods', 'points'];

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
    const laneY = layout.lanePositions.people - panOffsetY;
    const rowHeight = layout.sizes.personRowHeight;
    const padding = layout.sizes.lanePadding;

    return people.map(person => {
      const { start, end } = getYearRange(person.startDate, person.endDate);

      const startX = yearToPixel(start, viewportStartYear, yearsPerPixel);
      const endX = yearToPixel(end, viewportStartYear, yearsPerPixel);
      const y = laneY + padding + (person.row * rowHeight) + (rowHeight / 2) - 4;

      // Sticky behavior: stick to left edge if box extends left
      let labelX = startX;
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
          className={`person-label ${isSticky ? 'sticky' : ''}`}
          style={{
            position: 'absolute',
            left: `${labelX}px`,
            top: `${y}px`,
            pointerEvents: 'none',
            fontSize: '12px',
            fontWeight: '500',
            color: '#fff',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
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
    const laneY = layout.lanePositions.periods - panOffsetY;
    const rowHeight = layout.sizes.periodRowHeight;
    const padding = layout.sizes.lanePadding;

    return periods.map(period => {
      const { start, end } = getYearRange(period.startDate, period.endDate);

      const startX = yearToPixel(start, viewportStartYear, yearsPerPixel);
      const endX = yearToPixel(end, viewportStartYear, yearsPerPixel);
      const centerX = (startX + endX) / 2;
      const y = laneY + padding + (period.row * rowHeight) + 35;

      // Hide if completely off screen
      if (endX < 0 || startX > width) {
        return null;
      }

      return (
        <div
          key={period.id}
          className="period-label"
          style={{
            position: 'absolute',
            left: `${centerX}px`,
            top: `${y}px`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            fontSize: '13px',
            fontWeight: '600',
            color: period.color || '#00838f',
            whiteSpace: 'nowrap'
          }}
        >
          {period.name}
        </div>
      );
    });
  }

  function renderPointCallouts() {
    const points = layout.stackedPoints || [];
    const laneY = layout.lanePositions.points - panOffsetY;
    const rowHeight = layout.sizes.pointRowHeight;
    const padding = layout.sizes.lanePadding;

    return points.map(point => {
      const year = getYearRange(point.date).start;

      const x = yearToPixel(year, viewportStartYear, yearsPerPixel);
      const y = laneY + padding + (point.row * rowHeight) + (rowHeight / 2);

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
            top: `${y - 35}px`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            fontSize: '11px',
            fontWeight: '500',
            color: '#333',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>
            {displayYear} {era}
          </div>
          <div>{point.name}</div>
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
