import DOMPurify from 'dompurify';

/**
 * Sanitize HTML, allowing SVG elements for icon rendering.
 */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['svg', 'path', 'g', 'circle', 'rect', 'line', 'polyline', 'polygon', 'text', 'use', 'defs', 'clipPath'],
    ADD_ATTR: ['viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'transform', 'points', 'xmlns', 'clip-path'],
  });
}
