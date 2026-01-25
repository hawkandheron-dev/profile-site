/**
 * Icon component for loading SVG icons from the Antiquarian icon set
 */

import { useState, useEffect } from 'react';

// Map of icon names to their collection and file
const iconMap = {
  // Shapes (from universal)
  'diamond': { collection: 'universal', id: 'diamond' },
  'square': { collection: 'universal', id: 'square' },
  'circle': { collection: 'universal', id: 'circle' },
  'triangle': { collection: 'universal', id: 'triangle' },
  // UI icons
  'plus': { collection: 'universal', id: 'plus' },
  'minus': { collection: 'universal', id: 'minus' },
  'close': { collection: 'universal', id: 'close-x' },
  'arrow-left': { collection: 'universal', id: 'arrow-left' },
  'arrow-right': { collection: 'universal', id: 'arrow-right' },
  'arrow-up': { collection: 'universal', id: 'arrow-up' },
  'arrow-down': { collection: 'universal', id: 'arrow-down' },
  'book': { collection: 'universal', id: 'book' },
  // Period-themed icons
  'crown': { collection: 'medieval', id: 'crown' },
  'sword': { collection: 'medieval', id: 'sword' },
  'shield': { collection: 'medieval', id: 'shield-heater' },
  'tower': { collection: 'medieval', id: 'tower' },
  'chalice': { collection: 'medieval', id: 'chalice' },
  'amphora': { collection: 'classical', id: 'amphora' },
  'olive-branch': { collection: 'classical', id: 'olive-branch' },
  'quatrefoil': { collection: 'medieval', id: 'quatrefoil' },
  'trefoil': { collection: 'medieval', id: 'trefoil' },
  'dagger': { collection: 'renaissance', id: 'dagger' },
  'reference': { collection: 'renaissance', id: 'reference-mark' },
};

// Cache for loaded SVG content
const svgCache = new Map();

export function Icon({ name, size = 24, color = 'currentColor', className = '' }) {
  const [svgContent, setSvgContent] = useState(null);

  useEffect(() => {
    const iconInfo = iconMap[name];
    if (!iconInfo) {
      console.warn(`Icon "${name}" not found in icon map`);
      return;
    }

    const cacheKey = `${iconInfo.collection}/${iconInfo.id}`;

    // Check cache first
    if (svgCache.has(cacheKey)) {
      setSvgContent(svgCache.get(cacheKey));
      return;
    }

    // Fetch the SVG
    fetch(`/icons/${iconInfo.collection}/${iconInfo.id}.svg`)
      .then(res => res.text())
      .then(text => {
        svgCache.set(cacheKey, text);
        setSvgContent(text);
      })
      .catch(err => console.error(`Failed to load icon: ${name}`, err));
  }, [name]);

  if (!svgContent) {
    return <span className={`icon icon-placeholder ${className}`} style={{ width: size, height: size }} />;
  }

  // Process SVG to apply size and color
  // Insert width/height after <svg tag, replace currentColor
  const processedSvg = svgContent
    .replace(/<svg([^>]*)>/, `<svg$1 width="${size}" height="${size}">`)
    .replace(/currentColor/g, color);

  return (
    <span
      className={`icon ${className}`}
      style={{ display: 'inline-flex', width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: processedSvg }}
    />
  );
}

// Render an icon for legend shapes with proper fill
export function ShapeIcon({ shape, color, size = 18 }) {
  const [svgContent, setSvgContent] = useState(null);
  const iconInfo = iconMap[shape];

  useEffect(() => {
    if (!iconInfo) return;

    const cacheKey = `${iconInfo.collection}/${iconInfo.id}`;

    if (svgCache.has(cacheKey)) {
      setSvgContent(svgCache.get(cacheKey));
      return;
    }

    fetch(`/icons/${iconInfo.collection}/${iconInfo.id}.svg`)
      .then(res => res.text())
      .then(text => {
        svgCache.set(cacheKey, text);
        setSvgContent(text);
      })
      .catch(err => console.error(`Failed to load shape icon: ${shape}`, err));
  }, [shape, iconInfo]);

  if (!svgContent || !iconInfo) {
    // Fallback to simple colored shape
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill={color} stroke="#333" strokeWidth="1" />
      </svg>
    );
  }

  // Process SVG to use fill instead of stroke for colored shapes
  const processedSvg = svgContent
    .replace(/<svg([^>]*)>/, `<svg$1 width="${size}" height="${size}">`)
    .replace(/fill="none"/g, `fill="${color}"`)
    .replace(/stroke="currentColor"/g, `stroke="#333"`)
    .replace(/stroke-width="[^"]*"/g, `stroke-width="1"`);

  return (
    <span
      className="shape-icon"
      style={{ display: 'inline-flex', width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: processedSvg }}
    />
  );
}
