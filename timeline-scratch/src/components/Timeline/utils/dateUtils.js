/**
 * Date utility functions for timeline
 * Handles ISO 8601 dates with BCE/CE (BC/AD) support
 */

/**
 * Parse ISO 8601 date string
 * Negative years represent BCE (year 0 = 1 BCE, year -1 = 2 BCE)
 * @param {string} dateString - ISO 8601 date string (e.g., "-0099-07-12", "0476-01-01")
 * @returns {Date} JavaScript Date object
 */
export function parseISODate(dateString) {
  if (!dateString) return null;

  const match = dateString.match(/^(-?\d{1,4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = match[2] ? parseInt(match[2], 10) - 1 : 0; // JS months are 0-indexed
  const day = match[3] ? parseInt(match[3], 10) : 1;

  // JavaScript Date doesn't handle negative years well, so we'll use year 0 as 1 BCE
  // and work around this in our coordinate system
  return new Date(year, month, day);
}

/**
 * Get year from ISO date string
 * @param {string} dateString - ISO 8601 date string
 * @returns {number} Year (negative for BCE)
 */
export function getYear(dateString) {
  if (!dateString) return null;

  const match = dateString.match(/^(-?\d{1,4})/);
  if (!match) return null;

  return parseInt(match[1], 10);
}

/**
 * Format date for display
 * @param {string} dateString - ISO 8601 date string
 * @param {string} dateCertainty - "complete date", "year only", or "circa"
 * @param {string} eraLabels - "BC/AD" or "BCE/CE"
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, dateCertainty = 'year only', eraLabels = 'BC/AD') {
  if (!dateString) return '';

  const match = dateString.match(/^(-?\d{1,4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!match) return '';

  const year = parseInt(match[1], 10);
  const month = match[2] ? parseInt(match[2], 10) : null;
  const day = match[3] ? parseInt(match[3], 10) : null;

  const [bcLabel, adLabel] = eraLabels === 'BC/AD' ? ['BC', 'AD'] : ['BCE', 'CE'];

  // Convert year for display (negative years -> BCE)
  const displayYear = year <= 0 ? Math.abs(year - 1) + 1 : year;
  const eraLabel = year <= 0 ? bcLabel : adLabel;

  // Add circa prefix if needed
  const circaPrefix = dateCertainty === 'circa' ? 'c. ' : '';

  // Year only
  if (dateCertainty === 'year only' || dateCertainty === 'circa' || !month) {
    return `${circaPrefix}${displayYear} ${eraLabel}`;
  }

  // Month names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthName = monthNames[month - 1];

  // Month and year
  if (!day) {
    return `${monthName} ${displayYear} ${eraLabel}`;
  }

  // Full date
  return `${monthName} ${day}, ${displayYear} ${eraLabel}`;
}

/**
 * Format date range for display
 * @param {string} startDate - ISO 8601 start date
 * @param {string} endDate - ISO 8601 end date
 * @param {string} startCertainty - Date certainty for start
 * @param {string} endCertainty - Date certainty for end
 * @param {string} eraLabels - "BC/AD" or "BCE/CE"
 * @returns {string} Formatted date range
 */
export function formatDateRange(startDate, endDate, startCertainty = 'year only', endCertainty = 'year only', eraLabels = 'BC/AD') {
  if (!startDate) return '';

  const start = formatDate(startDate, startCertainty, eraLabels);

  if (!endDate) return start;

  const end = formatDate(endDate, endCertainty, eraLabels);

  return `${start} – ${end}`;
}

/**
 * Get year range from date strings
 * @param {string} startDate - ISO 8601 start date
 * @param {string} endDate - ISO 8601 end date (optional)
 * @returns {{start: number, end: number}} Year range
 */
export function getYearRange(startDate, endDate) {
  const start = getYear(startDate);
  const end = endDate ? getYear(endDate) : start;

  return { start, end };
}

/**
 * Check if two date ranges overlap
 * @param {number} start1 - First range start year
 * @param {number} end1 - First range end year
 * @param {number} start2 - Second range start year
 * @param {number} end2 - Second range end year
 * @returns {boolean} True if ranges overlap
 */
export function rangesOverlap(start1, end1, start2, end2) {
  return start1 <= end2 && start2 <= end1;
}
