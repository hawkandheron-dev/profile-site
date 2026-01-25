/**
 * Stacking algorithms for laying out overlapping timeline items
 */

import { getYear, getYearRange, rangesOverlap } from './dateUtils.js';

/**
 * Stack people using stair-step ascending pattern
 * Sorted by birth date, then alphabetically
 * Placed in lowest available row, ascending vertically (earliest births higher up)
 *
 * @param {Array} people - Array of person items
 * @returns {Array} People with row assignments
 */
export function stackPeople(people) {
  if (!people || people.length === 0) return [];

  // Sort by start date (birth), then alphabetically
  const sorted = [...people].sort((a, b) => {
    const aStart = getYear(a.startDate);
    const bStart = getYear(b.startDate);

    if (aStart !== bStart) return aStart - bStart;

    // Alphabetical tiebreaker
    return (a.name || '').localeCompare(b.name || '');
  });

  // Track occupied rows: array of arrays, each containing year ranges
  const rows = [];

  // Assign each person to a row
  const withRows = sorted.map(person => {
    const { start, end } = getYearRange(person.startDate, person.endDate);

    // Find the first (lowest index = visually higher) row where this person fits
    let rowIndex = 0;
    let foundRow = false;

    for (let i = 0; i < rows.length; i++) {
      // Check if person overlaps with any item in this row
      const overlaps = rows[i].some(item => rangesOverlap(start, end, item.start, item.end));

      if (!overlaps) {
        // Found a row with no overlap
        rowIndex = i;
        foundRow = true;
        break;
      }
    }

    // If no existing row works, create a new one
    if (!foundRow) {
      rowIndex = rows.length;
      rows.push([]);
    }

    // Add this person to the row
    rows[rowIndex].push({ start, end, person });

    return {
      ...person,
      row: rowIndex
    };
  });

  return withRows;
}

/**
 * Stack points vertically when they overlap in time
 * Sorted by date, then alphabetically
 *
 * @param {Array} points - Array of point items
 * @param {number} pointWidth - Width of point marker + label in pixels (for overlap detection)
 * @param {number} yearsPerPixel - Current zoom scale
 * @returns {Array} Points with row assignments
 */
export function stackPoints(points, pointWidth = 150, yearsPerPixel = 1) {
  if (!points || points.length === 0) return [];

  // Calculate effective year range for each point based on callout/label width
  const pointYearWidth = pointWidth * yearsPerPixel;

  // Sort by date, then alphabetically
  const sorted = [...points].sort((a, b) => {
    const aYear = getYear(a.date);
    const bYear = getYear(b.date);

    if (aYear !== bYear) return aYear - bYear;

    return (a.name || '').localeCompare(b.name || '');
  });

  const rows = [];

  const withRows = sorted.map(point => {
    const year = getYear(point.date);
    const start = year - pointYearWidth / 2;
    const end = year + pointYearWidth / 2;

    // Find first row where point fits
    let rowIndex = 0;
    let foundRow = false;

    for (let i = 0; i < rows.length; i++) {
      const overlaps = rows[i].some(item => rangesOverlap(start, end, item.start, item.end));

      if (!overlaps) {
        rowIndex = i;
        foundRow = true;
        break;
      }
    }

    if (!foundRow) {
      rowIndex = rows.length;
      rows.push([]);
    }

    rows[rowIndex].push({ start, end, point });

    return {
      ...point,
      row: rowIndex
    };
  });

  return withRows;
}

/**
 * Stack periods (brackets) vertically when they overlap
 * No specific sort order required, just avoid visual overlap
 *
 * @param {Array} periods - Array of period items
 * @returns {Array} Periods with row assignments
 */
export function stackPeriods(periods) {
  if (!periods || periods.length === 0) return [];

  // Sort by start date for consistency
  const sorted = [...periods].sort((a, b) => {
    const aStart = getYear(a.startDate);
    const bStart = getYear(b.startDate);
    return aStart - bStart;
  });

  const rows = [];

  const withRows = sorted.map(period => {
    const { start, end } = getYearRange(period.startDate, period.endDate);

    // Find first row where period fits
    let rowIndex = 0;
    let foundRow = false;

    for (let i = 0; i < rows.length; i++) {
      const overlaps = rows[i].some(item => rangesOverlap(start, end, item.start, item.end));

      if (!overlaps) {
        rowIndex = i;
        foundRow = true;
        break;
      }
    }

    if (!foundRow) {
      rowIndex = rows.length;
      rows.push([]);
    }

    rows[rowIndex].push({ start, end, period });

    return {
      ...period,
      row: rowIndex
    };
  });

  return withRows;
}

/**
 * Calculate total height needed for a lane based on stacked items
 * @param {Array} items - Items with row assignments
 * @param {number} rowHeight - Height per row in pixels
 * @param {number} padding - Padding in pixels
 * @returns {number} Total height in pixels
 */
export function calculateLaneHeight(items, rowHeight, padding = 10) {
  if (!items || items.length === 0) return 0;

  const maxRow = Math.max(...items.map(item => item.row));
  return (maxRow + 1) * rowHeight + padding * 2;
}

/**
 * Stack people and points together in shared lanes
 * They use the same overlap detection with margin buffer
 *
 * @param {Array} people - Array of person items
 * @param {Array} points - Array of point items
 * @param {number} pointWidth - Width of point label in pixels
 * @param {number} yearsPerPixel - Current zoom scale
 * @param {number} marginYears - Margin buffer in years to prevent overlaps
 * @returns {Object} { people: [...], points: [...] } with row assignments
 */
export function stackPeopleAndPoints(people, points, pointWidth = 150, yearsPerPixel = 1, marginYears = 5) {
  const allItems = [];

  // Add people to items array
  if (people && people.length > 0) {
    people.forEach(person => {
      const { start, end } = getYearRange(person.startDate, person.endDate);
      allItems.push({
        type: 'person',
        data: person,
        start: start - marginYears,
        end: end + marginYears,
        sortKey: start
      });
    });
  }

  // Add points to items array
  if (points && points.length > 0) {
    const pointYearWidth = pointWidth * yearsPerPixel;
    points.forEach(point => {
      const year = getYear(point.date);
      allItems.push({
        type: 'point',
        data: point,
        start: year - pointYearWidth / 2 - marginYears,
        end: year + pointYearWidth / 2 + marginYears,
        sortKey: year
      });
    });
  }

  // Sort by chronological order, then by type (people first)
  allItems.sort((a, b) => {
    if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
    if (a.type === 'person' && b.type === 'point') return -1;
    if (a.type === 'point' && b.type === 'person') return 1;
    return (a.data.name || '').localeCompare(b.data.name || '');
  });

  const rows = [];

  // Assign each item to a row
  allItems.forEach(item => {
    let rowIndex = 0;
    let foundRow = false;

    for (let i = 0; i < rows.length; i++) {
      const overlaps = rows[i].some(rowItem =>
        rangesOverlap(item.start, item.end, rowItem.start, rowItem.end)
      );

      if (!overlaps) {
        rowIndex = i;
        foundRow = true;
        break;
      }
    }

    if (!foundRow) {
      rowIndex = rows.length;
      rows.push([]);
    }

    rows[rowIndex].push(item);
    item.data.row = rowIndex;
  });

  // Separate back into people and points
  const stackedPeople = allItems
    .filter(item => item.type === 'person')
    .map(item => item.data);

  const stackedPoints = allItems
    .filter(item => item.type === 'point')
    .map(item => item.data);

  return { people: stackedPeople, points: stackedPoints };
}

/**
 * Stack all timeline items with above/below timeline separation
 * Layout from axis: Periods (with points inside) → People further out
 * Points are placed within the period bracket area
 *
 * @param {Object} data - Timeline data { people, points, periods }
 * @param {number} pointWidth - Width for point collision detection
 * @param {number} yearsPerPixel - Current zoom scale
 * @returns {Object} Stacked items separated by above/below: { above: {...}, below: {...} }
 */
export function stackTimelineItems(data, pointWidth = 150, yearsPerPixel = 1) {
  const { people = [], points = [], periods = [] } = data;

  // Split items by aboveTimeline (default to true)
  const abovePeople = people.filter(p => p.aboveTimeline !== false);
  const belowPeople = people.filter(p => p.aboveTimeline === false);

  const abovePoints = points.filter(p => p.aboveTimeline !== false);
  const belowPoints = points.filter(p => p.aboveTimeline === false);

  const abovePeriods = periods.filter(p => p.aboveTimeline !== false);
  const belowPeriods = periods.filter(p => p.aboveTimeline === false);

  // Stack each type separately
  // Points will be positioned within the period area in the layout hook
  const abovePeriodsStacked = stackPeriods(abovePeriods);
  const belowPeriodsStacked = stackPeriods(belowPeriods);

  const abovePeopleStacked = stackPeople(abovePeople);
  const belowPeopleStacked = stackPeople(belowPeople);

  const abovePointsStacked = stackPoints(abovePoints, pointWidth, yearsPerPixel);
  const belowPointsStacked = stackPoints(belowPoints, pointWidth, yearsPerPixel);

  return {
    above: {
      periods: abovePeriodsStacked,
      people: abovePeopleStacked,
      points: abovePointsStacked
    },
    below: {
      periods: belowPeriodsStacked,
      people: belowPeopleStacked,
      points: belowPointsStacked
    }
  };
}
