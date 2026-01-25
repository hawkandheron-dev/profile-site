/**
 * Canvas rendering utilities for timeline
 */

/**
 * Draw a rounded rectangle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {number} radius - Corner radius
 */
export function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw a medievalized diamond (with slightly convex sides)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} size - Size
 */
export function drawMedievalDiamond(ctx, cx, cy, size) {
  const half = size / 2;
  const curve = size * 0.1; // Curvature amount

  ctx.beginPath();
  // Top point
  ctx.moveTo(cx, cy - half);
  // Top-right to right point (convex curve)
  ctx.quadraticCurveTo(cx + curve, cy - curve, cx + half, cy);
  // Right to bottom point (convex curve)
  ctx.quadraticCurveTo(cx + curve, cy + curve, cx, cy + half);
  // Bottom to left point (convex curve)
  ctx.quadraticCurveTo(cx - curve, cy + curve, cx - half, cy);
  // Left to top point (convex curve)
  ctx.quadraticCurveTo(cx - curve, cy - curve, cx, cy - half);
  ctx.closePath();
}

/**
 * Draw a medievalized square (with slightly convex sides)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} size - Size
 */
export function drawMedievalSquare(ctx, cx, cy, size) {
  const half = size / 2;
  const curve = size * 0.08;

  ctx.beginPath();
  // Top-left corner
  ctx.moveTo(cx - half, cy - half + curve);
  // Top edge (convex)
  ctx.quadraticCurveTo(cx, cy - half - curve, cx + half - curve, cy - half);
  // Right edge (convex)
  ctx.quadraticCurveTo(cx + half + curve, cy, cx + half - curve, cy + half);
  // Bottom edge (convex)
  ctx.quadraticCurveTo(cx, cy + half + curve, cx - half + curve, cy + half);
  // Left edge (convex)
  ctx.quadraticCurveTo(cx - half - curve, cy, cx - half, cy - half + curve);
  ctx.closePath();
}

/**
 * Draw a circle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} radius - Radius
 */
export function drawCircle(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
}

/**
 * Draw a medievalized triangle (with slightly convex sides)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} size - Size
 */
export function drawMedievalTriangle(ctx, cx, cy, size) {
  const half = size / 2;
  const height = (Math.sqrt(3) / 2) * size;
  const curve = size * 0.1;

  ctx.beginPath();
  // Top point
  ctx.moveTo(cx, cy - height / 2);
  // Top to bottom-right (convex)
  ctx.quadraticCurveTo(
    cx + half / 2 + curve,
    cy,
    cx + half,
    cy + height / 2
  );
  // Bottom-right to bottom-left (convex)
  ctx.quadraticCurveTo(
    cx,
    cy + height / 2 + curve,
    cx - half,
    cy + height / 2
  );
  // Bottom-left to top (convex)
  ctx.quadraticCurveTo(
    cx - half / 2 - curve,
    cy,
    cx,
    cy - height / 2
  );
  ctx.closePath();
}

/**
 * Draw a point marker based on shape type
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Size
 * @param {string} shape - Shape type ("diamond", "square", "circle", "triangle")
 * @param {string} color - Fill color
 */
export function drawPointMarker(ctx, x, y, size, shape, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;

  switch (shape) {
    case 'diamond':
      drawMedievalDiamond(ctx, x, y, size);
      break;
    case 'square':
      drawMedievalSquare(ctx, x, y, size);
      break;
    case 'circle':
      drawCircle(ctx, x, y, size / 2);
      break;
    case 'triangle':
      drawMedievalTriangle(ctx, x, y, size);
      break;
    default:
      drawCircle(ctx, x, y, size / 2);
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Calculate curly brace path data
 * Uses the mathematical formula from https://gist.github.com/alexhornbake/6005176
 * @param {number} x - Start X position
 * @param {number} width - Width
 * @param {number} y - Y position (top of bracket)
 * @param {number} height - Bracket height
 * @returns {Object} Path data with control points and center point
 */
export function getCurlyBracePath(x, width, y, height) {
  // Endpoints: left edge (x1,y1) to right edge (x2,y2) at top
  const x1 = x;
  const y1 = y;
  const x2 = x + width;
  const y2 = y;
  const w = height;  // Perpendicular width of the brace
  const q = 0.6;     // Quality/expressiveness factor

  // Calculate direction vector
  const dx = x1 - x2;
  const dy = y1 - y2;
  const len = Math.sqrt(dx * dx + dy * dy);
  const dxn = dx / len;  // Normalized
  const dyn = dy / len;

  // Calculate control points using perpendicular offsets
  // First curve (left side)
  const qx1 = x1 + q * w * dyn;
  const qy1 = y1 - q * w * dxn;
  const qx2 = (x1 - 0.25 * len * dxn) + (1 - q) * w * dyn;
  const qy2 = (y1 - 0.25 * len * dyn) - (1 - q) * w * dxn;

  // Center point
  const tx1 = (x1 - 0.5 * len * dxn) + w * dyn;
  const ty1 = (y1 - 0.5 * len * dyn) - w * dxn;

  // Second curve (right side)
  const qx3 = x2 + q * w * dyn;
  const qy3 = y2 - q * w * dxn;
  const qx4 = (x1 - 0.75 * len * dxn) + (1 - q) * w * dyn;
  const qy4 = (y1 - 0.75 * len * dyn) - (1 - q) * w * dxn;

  // T command control points
  const tc1x = 2 * qx2 - qx1;
  const tc1y = 2 * qy2 - qy1;
  const tc2x = 2 * qx4 - qx3;
  const tc2y = 2 * qy4 - qy3;

  return {
    x1, y1, x2, y2,
    qx1, qy1, qx2, qy2,
    qx3, qy3, qx4, qy4,
    tc1x, tc1y, tc2x, tc2y,
    tx1, ty1  // Center point
  };
}

/**
 * Draw a period bracket (single } rotated 90° clockwise)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Start X position
 * @param {number} width - Width
 * @param {number} y - Y position (top of bracket)
 * @param {number} height - Bracket height
 * @param {string} color - Color
 */
export function drawPeriodBracket(ctx, x, width, y, height, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const path = getCurlyBracePath(x, width, y, height);

  ctx.beginPath();

  // First half: left edge to center point
  ctx.moveTo(path.x1, path.y1);
  ctx.quadraticCurveTo(path.qx1, path.qy1, path.qx2, path.qy2);
  ctx.quadraticCurveTo(path.tc1x, path.tc1y, path.tx1, path.ty1);

  // Second half: right edge to center point
  ctx.moveTo(path.x2, path.y2);
  ctx.quadraticCurveTo(path.qx3, path.qy3, path.qx4, path.qy4);
  ctx.quadraticCurveTo(path.tc2x, path.tc2y, path.tx1, path.ty1);

  ctx.stroke();

  ctx.restore();
}

/**
 * Draw a person lifespan box
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Start X position
 * @param {number} width - Width
 * @param {number} y - Y position
 * @param {number} height - Height
 * @param {string} color - Fill color
 * @param {boolean} isHovered - Whether this item is hovered
 */
export function drawPersonBox(ctx, x, width, y, height, color, isHovered = false) {
  ctx.save();

  // Shadow for hovered state
  if (isHovered) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
  }

  // Draw box
  ctx.fillStyle = color;
  drawRoundedRect(ctx, x, y, width, height, 4);
  ctx.fill();

  // Border
  ctx.strokeStyle = isHovered ? '#000' : 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = isHovered ? 2 : 1;
  ctx.stroke();

  ctx.restore();
}

/**
 * Clear canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Draw the time axis with year labels
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height (for reference)
 * @param {number} axisY - Y position of axis
 * @param {number} viewportStartYear - Starting year of viewport
 * @param {number} yearsPerPixel - Scale factor
 * @param {number} labelInterval - Year interval between labels
 * @param {string} eraLabels - "BC/AD" or "BCE/CE"
 */
export function drawTimeAxis(ctx, width, height, axisY, viewportStartYear, yearsPerPixel, labelInterval, eraLabels = 'BC/AD') {
  ctx.save();
  ctx.strokeStyle = '#ccc';
  ctx.fillStyle = '#666';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Draw axis line
  ctx.beginPath();
  ctx.moveTo(0, axisY);
  ctx.lineTo(width, axisY);
  ctx.stroke();

  // Calculate first label year (rounded to interval)
  const firstLabelYear = Math.ceil(viewportStartYear / labelInterval) * labelInterval;
  const [bcLabel, adLabel] = eraLabels === 'BC/AD' ? ['BC', 'AD'] : ['BCE', 'CE'];

  // Draw year labels
  for (let year = firstLabelYear; year < viewportStartYear + (width * yearsPerPixel); year += labelInterval) {
    const x = (year - viewportStartYear) / yearsPerPixel;

    if (x < 0 || x > width) continue;

    // Draw tick mark
    ctx.beginPath();
    ctx.moveTo(x, axisY);
    ctx.lineTo(x, axisY + 8);
    ctx.stroke();

    // Format year label
    const displayYear = year <= 0 ? Math.abs(year - 1) + 1 : year;
    const era = year <= 0 ? bcLabel : adLabel;
    const label = `${displayYear} ${era}`;

    // Draw label
    ctx.fillText(label, x, axisY + 12);
  }

  ctx.restore();
}
