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

  const midX = x + width / 2;
  const bottomY = y + height;

  // A curly brace } rotated 90° clockwise has these segments:
  // 1. Top-left to shoulder (gentle outward curve)
  // 2. Shoulder to center point (sharp inward curve)
  // 3. Center point to shoulder (sharp outward curve)
  // 4. Shoulder to top-right (gentle outward curve)

  const shoulderY = y + height * 0.3;  // Shoulder height (30% down)
  const shoulderOffset = width * 0.08;  // How far out the shoulders extend

  ctx.beginPath();

  // Start at left edge, top
  ctx.moveTo(x, y);

  // Segment 1: Left edge to left shoulder (gentle outward curve)
  ctx.bezierCurveTo(
    x - shoulderOffset * 0.3, y + height * 0.1,  // Control 1: slightly out and down
    x - shoulderOffset, y + height * 0.2,        // Control 2: more out (shoulder bulge)
    x - shoulderOffset, shoulderY                // End: left shoulder point
  );

  // Segment 2: Left shoulder to center bottom point (sharp inward S-curve)
  ctx.bezierCurveTo(
    x - shoulderOffset, shoulderY + height * 0.15,  // Control 1: continue from shoulder
    x + width * 0.15, bottomY - height * 0.15,      // Control 2: sharp turn inward
    midX, bottomY                                    // End: center bottom point
  );

  // Segment 3: Center bottom point to right shoulder (sharp outward S-curve, mirror)
  ctx.bezierCurveTo(
    x + width * 0.85, bottomY - height * 0.15,      // Control 1: sharp turn outward
    x + width + shoulderOffset, shoulderY + height * 0.15,  // Control 2: continue to shoulder
    x + width + shoulderOffset, shoulderY           // End: right shoulder point
  );

  // Segment 4: Right shoulder to right edge (gentle outward curve, mirror)
  ctx.bezierCurveTo(
    x + width + shoulderOffset, y + height * 0.2,   // Control 1: shoulder bulge
    x + width + shoulderOffset * 0.3, y + height * 0.1,  // Control 2: slightly out and up
    x + width, y                                     // End: right edge at top
  );

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
