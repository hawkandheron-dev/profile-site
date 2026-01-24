/**
 * Coordinate system utilities for timeline
 * Handles conversion between time (years) and screen pixels
 */

/**
 * Convert year to pixel position
 * @param {number} year - Year value
 * @param {number} viewportStartYear - Leftmost year visible in viewport
 * @param {number} yearsPerPixel - Scale factor
 * @returns {number} X position in pixels
 */
export function yearToPixel(year, viewportStartYear, yearsPerPixel) {
  return (year - viewportStartYear) / yearsPerPixel;
}

/**
 * Convert pixel position to year
 * @param {number} x - X position in pixels
 * @param {number} viewportStartYear - Leftmost year visible in viewport
 * @param {number} yearsPerPixel - Scale factor
 * @returns {number} Year value
 */
export function pixelToYear(x, viewportStartYear, yearsPerPixel) {
  return viewportStartYear + (x * yearsPerPixel);
}

/**
 * Calculate years per pixel based on zoom level
 * Higher zoom = fewer years per pixel (more zoomed in)
 * @param {number} zoomLevel - Zoom level (1 = base, 2 = 2x zoom, etc.)
 * @param {number} baseYearsPerPixel - Base scale (default 1 year per pixel)
 * @returns {number} Years per pixel
 */
export function calculateYearsPerPixel(zoomLevel, baseYearsPerPixel = 1) {
  return baseYearsPerPixel / zoomLevel;
}

/**
 * Calculate zoom level from years per pixel
 * @param {number} yearsPerPixel - Current years per pixel
 * @param {number} baseYearsPerPixel - Base scale
 * @returns {number} Zoom level
 */
export function calculateZoomLevel(yearsPerPixel, baseYearsPerPixel = 1) {
  return baseYearsPerPixel / yearsPerPixel;
}

/**
 * Get appropriate year label interval based on zoom level
 * @param {number} yearsPerPixel - Current years per pixel
 * @param {number} pixelsPerLabel - Desired pixels between labels (default 100)
 * @returns {number} Year interval for labels (e.g., 1, 5, 10, 50, 100, 500)
 */
export function getYearLabelInterval(yearsPerPixel, pixelsPerLabel = 100) {
  const yearsPerLabel = yearsPerPixel * pixelsPerLabel;

  // Round to nice intervals
  if (yearsPerLabel < 2) return 1;
  if (yearsPerLabel < 5) return 5;
  if (yearsPerLabel < 10) return 10;
  if (yearsPerLabel < 25) return 25;
  if (yearsPerLabel < 50) return 50;
  if (yearsPerLabel < 100) return 100;
  if (yearsPerLabel < 250) return 250;
  if (yearsPerLabel < 500) return 500;
  if (yearsPerLabel < 1000) return 1000;

  // For very zoomed out views, use multiples of 1000
  return Math.ceil(yearsPerLabel / 1000) * 1000;
}

/**
 * Calculate the bounds of visible timeline data
 * @param {number} canvasWidth - Width of canvas in pixels
 * @param {number} viewportStartYear - Leftmost year visible
 * @param {number} yearsPerPixel - Scale factor
 * @returns {{startYear: number, endYear: number}} Visible year range
 */
export function getVisibleYearRange(canvasWidth, viewportStartYear, yearsPerPixel) {
  const endYear = viewportStartYear + (canvasWidth * yearsPerPixel);

  return {
    startYear: viewportStartYear,
    endYear: endYear
  };
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate new viewport position after zoom
 * Zooms centered on a specific point (usually mouse position)
 * @param {number} zoomDelta - Change in zoom (positive = zoom in)
 * @param {number} mouseX - Mouse X position in pixels
 * @param {number} currentViewportStartYear - Current viewport start
 * @param {number} currentYearsPerPixel - Current scale
 * @returns {{viewportStartYear: number, yearsPerPixel: number}} New viewport state
 */
export function calculateZoomAroundPoint(
  zoomDelta,
  mouseX,
  currentViewportStartYear,
  currentYearsPerPixel
) {
  // Calculate new years per pixel
  const zoomFactor = Math.pow(1.1, -zoomDelta); // negative because wheel down = zoom in
  const newYearsPerPixel = currentYearsPerPixel * zoomFactor;

  // Calculate the year at mouse position before zoom
  const yearAtMouse = currentViewportStartYear + (mouseX * currentYearsPerPixel);

  // Calculate new viewport start to keep yearAtMouse at the same pixel position
  const newViewportStartYear = yearAtMouse - (mouseX * newYearsPerPixel);

  return {
    viewportStartYear: newViewportStartYear,
    yearsPerPixel: newYearsPerPixel
  };
}
