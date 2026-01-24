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
