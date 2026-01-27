/**
 * Modal component for displaying full timeline item details
 */

import { useEffect, useMemo, useCallback } from 'react';
import { formatDateRange } from '../utils/dateUtils.js';
import { Icon } from './Icon.jsx';
import './TimelineModal.css';

function linkifyDescription(description, itemIndex, currentItemId) {
  if (!description || !itemIndex) return description;

  const entries = Array.from(itemIndex.values())
    .map(({ item: entryItem, type }) => ({
      id: entryItem.id,
      name: entryItem.name,
      type
    }))
    .filter(entry => entry.name && entry.id !== currentItemId)
    .map(entry => ({ ...entry, lowerName: entry.name.toLowerCase() }))
    .sort((a, b) => b.name.length - a.name.length);

  if (entries.length === 0) return description;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${description}</div>`, 'text/html');
  const root = doc.body.firstChild;
  if (!root) return description;

  const textNodes = [];
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node?.parentElement) continue;
    if (node.parentElement.closest('a, button')) continue;
    if (!node.textContent?.trim()) continue;
    textNodes.push(node);
  }

  const isWordChar = (char) => /[A-Za-z0-9]/.test(char);

  textNodes.forEach(node => {
    const text = node.textContent;
    const lowerText = text.toLowerCase();
    let position = 0;
    const fragment = doc.createDocumentFragment();

    while (position < text.length) {
      let bestMatch = null;

      entries.forEach(entry => {
        const index = lowerText.indexOf(entry.lowerName, position);
        if (index === -1) return;

        const beforeChar = index > 0 ? text[index - 1] : '';
        const afterChar = text[index + entry.name.length] || '';
        if ((beforeChar && isWordChar(beforeChar)) || (afterChar && isWordChar(afterChar))) {
          return;
        }

        if (!bestMatch || index < bestMatch.index || (index === bestMatch.index && entry.name.length > bestMatch.entry.name.length)) {
          bestMatch = { index, entry };
        }
      });

      if (!bestMatch) {
        fragment.appendChild(doc.createTextNode(text.slice(position)));
        break;
      }

      if (bestMatch.index > position) {
        fragment.appendChild(doc.createTextNode(text.slice(position, bestMatch.index)));
      }

      const button = doc.createElement('button');
      button.setAttribute('type', 'button');
      button.className = 'modal-reference';
      button.textContent = text.slice(bestMatch.index, bestMatch.index + bestMatch.entry.name.length);
      button.setAttribute('data-item-id', bestMatch.entry.id);
      button.setAttribute('data-item-type', bestMatch.entry.type);
      fragment.appendChild(button);

      position = bestMatch.index + bestMatch.entry.name.length;
    }

    node.replaceWith(fragment);
  });

  return root.innerHTML;
}

export function TimelineModal({ isOpen, item, itemType, config, onClose, itemIndex, onSelectItem }) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const connections = useMemo(() => {
    if (itemType !== 'person' || !item?.connections?.length || !itemIndex) return [];
    return item.connections
      .map(connection => {
        const entry = itemIndex.get(connection.id);
        if (!entry) return null;
        return {
          id: connection.id,
          type: connection.type || 'known',
          item: entry.item,
          itemType: entry.type
        };
      })
      .filter(Boolean);
  }, [itemType, item, itemIndex]);

  const periodEntry = useMemo(() => {
    if (!item?.periodId || !itemIndex) return null;
    const entry = itemIndex.get(item.periodId);
    if (!entry || entry.type !== 'period') return null;
    return entry;
  }, [item, itemIndex]);

  const relatedPoints = useMemo(() => {
    if (!item?.relatedPoints?.length || !itemIndex) return [];
    return item.relatedPoints
      .map(id => {
        const entry = itemIndex.get(id);
        return entry?.type === 'point' ? entry : null;
      })
      .filter(Boolean);
  }, [item, itemIndex]);

  const relatedPeriods = useMemo(() => {
    if (!item?.relatedPeriods?.length || !itemIndex) return [];
    return item.relatedPeriods
      .map(id => {
        const entry = itemIndex.get(id);
        return entry?.type === 'period' ? entry : null;
      })
      .filter(Boolean);
  }, [item, itemIndex]);

  const descriptionHtml = useMemo(() => {
    if (!item?.description) return '';
    return linkifyDescription(item.description, itemIndex, item.id);
  }, [item, itemIndex]);

  const handleReferenceClick = useCallback((event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest('[data-item-id]');
    if (!button) return;
    const id = button.getAttribute('data-item-id');
    if (!id || !itemIndex) return;
    const entry = itemIndex.get(id);
    if (!entry) return;
    onSelectItem?.(entry.type, entry.item);
  }, [itemIndex, onSelectItem]);

  if (!isOpen || !item) return null;

  // Format date based on item type
  let dateString = '';
  if (itemType === 'person') {
    dateString = formatDateRange(
      item.startDate,
      item.endDate,
      item.startCertainty || 'year only',
      item.endCertainty || 'year only',
      config.eraLabels
    );
  } else if (itemType === 'point') {
    dateString = formatDateRange(
      item.date,
      null,
      item.dateCertainty || 'year only',
      null,
      config.eraLabels
    );
  } else if (itemType === 'period') {
    dateString = formatDateRange(
      item.startDate,
      item.endDate,
      item.dateCertainty || 'year only',
      item.dateCertainty || 'year only',
      config.eraLabels
    );
  }

  return (
    <div className="timeline-modal" onClick={onClose}>
      <div className="modal-backdrop" />
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="modal-image"
          />
        )}

        <h2 className="modal-title">
          {item.isEmperor && (
            <Icon name="crown" size={24} color="#ffd700" className="emperor-crown" />
          )}
          {item.name}
        </h2>

        {dateString && (
          <p className="modal-date">{dateString}</p>
        )}

        {item.location && (
          <p className="modal-location">{item.location}</p>
        )}

        {item.periodName && (
          <p className="modal-period">
            Era:{' '}
            {periodEntry ? (
              <button
                type="button"
                className="modal-reference"
                data-item-id={periodEntry.item.id}
                data-item-type={periodEntry.type}
                onClick={handleReferenceClick}
              >
                {item.periodName}
              </button>
            ) : (
              item.periodName
            )}
          </p>
        )}

        {item.description && (
          <div
            className="modal-description"
            onClick={handleReferenceClick}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}

        {connections.length > 0 && (
          <div className="modal-links">
            <h3>Known connections</h3>
            <ul className="modal-reference-list">
              {connections.map(connection => (
                <li key={connection.id}>
                  <button
                    type="button"
                    className="modal-reference"
                    data-item-id={connection.id}
                    data-item-type={connection.itemType}
                    onClick={handleReferenceClick}
                  >
                    {connection.item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {relatedPoints.length > 0 && (
          <div className="modal-links">
            <h3>Related points</h3>
            <ul className="modal-reference-list">
              {relatedPoints.map(point => (
                <li key={point.item.id}>
                  <button
                    type="button"
                    className="modal-reference"
                    data-item-id={point.item.id}
                    data-item-type={point.type}
                    onClick={handleReferenceClick}
                  >
                    {point.item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {relatedPeriods.length > 0 && (
          <div className="modal-links">
            <h3>Related periods</h3>
            <ul className="modal-reference-list">
              {relatedPeriods.map(period => (
                <li key={period.item.id}>
                  <button
                    type="button"
                    className="modal-reference"
                    data-item-id={period.item.id}
                    data-item-type={period.type}
                    onClick={handleReferenceClick}
                  >
                    {period.item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.links && item.links.length > 0 && (
          <div className="modal-links">
            <h3>Links:</h3>
            <ul>
              {item.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
