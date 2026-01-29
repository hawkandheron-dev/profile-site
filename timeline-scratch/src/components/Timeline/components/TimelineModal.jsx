/**
 * Modal component for displaying full timeline item details
 */

import { useEffect, useMemo, useCallback } from 'react';
import { formatDateRange, getYear } from '../utils/dateUtils.js';
import { Icon } from './Icon.jsx';
import { getWorksForAuthor } from '../../../data/works.js';
import './TimelineModal.css';

function linkifyDescription(description, itemIndex, currentItemId) {
  if (!description || !itemIndex) return description;

  try {
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

          if (
            !bestMatch
            || index < bestMatch.index
            || (index === bestMatch.index && entry.name.length > bestMatch.entry.name.length)
          ) {
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
  } catch (error) {
    console.warn('Failed to linkify modal description:', error);
    return description;
  }
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
    document.body.classList.add('modal-open');

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
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

  const worksForPerson = useMemo(() => {
    if (itemType !== 'person') return [];
    return getWorksForAuthor(item?.name);
  }, [itemType, item?.name]);

  const searchQuery = useMemo(() => {
    if (itemType !== 'person') return '';
    const startYear = getYear(item?.startDate);
    const endYear = getYear(item?.endDate);
    const formatYear = (year) => {
      if (!year && year !== 0) return '?';
      return year <= 0 ? Math.abs(year - 1) + 1 : year;
    };
    return `${item?.name} (${formatYear(startYear)}-${formatYear(endYear)})`;
  }, [itemType, item?.name, item?.startDate, item?.endDate]);

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

  const handleModalWheel = useCallback((event) => {
    event.stopPropagation();
  }, []);

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
    <div
      className="timeline-modal"
      onClick={onClose}
      onMouseDown={handleModalWheel}
      onMouseUp={handleModalWheel}
      onWheel={handleModalWheel}
      onTouchStart={handleModalWheel}
      onTouchMove={handleModalWheel}
    >
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
          {searchQuery && (
            <a
              className="modal-search-link"
              href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Search for ${searchQuery}`}
            >
              🔎
            </a>
          )}
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

        {worksForPerson.length > 0 && (
          <div className="modal-links modal-works">
            <h3>Works</h3>
            <ul className="modal-reference-list">
              {worksForPerson.map((work) => (
                <li key={work.name}>
                  {work.textUrl || work.referenceUrl ? (
                    <a
                      href={work.textUrl || work.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {work.name}
                    </a>
                  ) : (
                    work.name
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {connections.length > 0 && (
          <div className="modal-links">
            <h3>Connections</h3>
            <ul className="modal-reference-list modal-pill-list">
              {connections.map(connection => (
                <li key={connection.id} className="modal-pill-item">
                  <button
                    type="button"
                    className="modal-pill"
                    data-item-id={connection.id}
                    data-item-type={connection.itemType}
                    onClick={handleReferenceClick}
                  >
                    <span
                      className="summary-color-dot"
                      style={{ backgroundColor: connection.item.color }}
                    />
                    <strong>{connection.item.name}</strong>
                    {connection.item.location && (
                      <span>{'\u00A0'}in <em>{connection.item.location}</em></span>
                    )}
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

        {itemType === 'person' && item.sources && item.sources.length > 0 && (
          <div className="modal-links">
            <h3>Sources</h3>
            <ul className="modal-reference-list">
              {item.sources.map((source) => {
                const metaParts = [source.source, source.year].filter(Boolean);
                const metaText = metaParts.length ? ` (${metaParts.join(', ')})` : '';
                return (
                  <li key={source.id}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.title}
                    </a>
                    {metaText && <span>{metaText}</span>}
                    {source.notes && <div>{source.notes}</div>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
