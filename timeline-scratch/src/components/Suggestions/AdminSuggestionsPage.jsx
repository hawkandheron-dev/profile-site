/**
 * Admin page for reviewing contributor suggestions.
 * Shows pending suggestions with a diff view, and Approve / Reject actions.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchAllSuggestions,
  fetchCurrentEntity,
  approveSuggestion,
  rejectSuggestion,
} from '../../services/suggestionService.js';
import { getFieldDefs } from '../EditEntityForm/EditEntityForm.jsx';
import './AdminSuggestionsPage.css';

/** Map entity_type back to the itemType used by getFieldDefs */
function toItemType(entityType) {
  if (entityType === 'event') return 'point';
  if (entityType === 'era') return 'period';
  return entityType;
}

function SuggestionCard({ suggestion, getToken, clerkUserId, onActionComplete }) {
  const [currentData, setCurrentData] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const isNew = !suggestion.entity_id;
  const itemType = toItemType(suggestion.entity_type);
  const fieldDefs = getFieldDefs(itemType);
  const suggested = suggestion.suggested_data || {};

  // Fetch current entity data when expanded (for diff)
  useEffect(() => {
    if (!expanded || isNew || currentData) return;

    let cancelled = false;
    setLoadingCurrent(true);

    fetchCurrentEntity(suggestion.entity_type, suggestion.entity_id, getToken)
      .then(data => {
        if (!cancelled) {
          setCurrentData(data);
          setLoadingCurrent(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingCurrent(false);
      });

    return () => { cancelled = true; };
  }, [expanded, suggestion.entity_id, suggestion.entity_type, isNew]);

  const handleApprove = useCallback(async () => {
    setActing(true);
    setError(null);
    try {
      await approveSuggestion(suggestion, clerkUserId, getToken);
      onActionComplete?.();
    } catch (err) {
      setError(err.message || 'Approve failed');
      setActing(false);
    }
  }, [suggestion, clerkUserId, getToken, onActionComplete]);

  const handleReject = useCallback(async () => {
    setActing(true);
    setError(null);
    try {
      await rejectSuggestion(suggestion.suggestion_id, clerkUserId, rejectNotes, getToken);
      onActionComplete?.();
    } catch (err) {
      setError(err.message || 'Reject failed');
      setActing(false);
    }
  }, [suggestion, clerkUserId, rejectNotes, getToken, onActionComplete]);

  const entityLabel = suggestion.entity_type === 'person' ? 'Person'
    : suggestion.entity_type === 'event' ? 'Event' : 'Era';

  const statusClass = `suggestion-status suggestion-status--${suggestion.status}`;

  return (
    <div className={`suggestion-card suggestion-card--${suggestion.status}`}>
      <div className="suggestion-card-header" onClick={() => setExpanded(prev => !prev)}>
        <div className="suggestion-card-meta">
          <span className={statusClass}>{suggestion.status}</span>
          <span className="suggestion-card-type">
            {isNew ? `New ${entityLabel}` : `Edit ${entityLabel}`}
          </span>
          <strong className="suggestion-card-name">
            {suggested.name || suggestion.entity_id || 'Untitled'}
          </strong>
        </div>
        <div className="suggestion-card-info">
          <span className="suggestion-card-date">
            {new Date(suggestion.created_at).toLocaleDateString()}
          </span>
          <span className="suggestion-card-chevron">{expanded ? '\u25B2' : '\u25BC'}</span>
        </div>
      </div>

      {expanded && (
        <div className="suggestion-card-body">
          {loadingCurrent && <p className="suggestion-loading">Loading current data...</p>}

          <div className="suggestion-diff">
            <table className="suggestion-diff-table">
              <thead>
                <tr>
                  <th>Field</th>
                  {!isNew && <th>Current</th>}
                  <th>{isNew ? 'Suggested Value' : 'Suggested'}</th>
                </tr>
              </thead>
              <tbody>
                {fieldDefs.map(field => {
                  const suggestedVal = formatValue(suggested[field.key]);
                  const currentVal = currentData ? formatValue(currentData[field.key]) : '';
                  const changed = isNew || suggestedVal !== currentVal;

                  return (
                    <tr key={field.key} className={changed ? 'suggestion-diff-changed' : ''}>
                      <td className="suggestion-diff-label">{field.label}</td>
                      {!isNew && <td className="suggestion-diff-current">{currentVal}</td>}
                      <td className={`suggestion-diff-suggested${changed ? ' suggestion-diff-highlight' : ''}`}>
                        {suggestedVal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {suggestion.reviewer_notes && (
            <div className="suggestion-reviewer-notes">
              <strong>Reviewer notes:</strong> {suggestion.reviewer_notes}
            </div>
          )}

          {error && <p className="suggestion-error">{error}</p>}

          {suggestion.status === 'pending' && (
            <div className="suggestion-actions">
              <button
                type="button"
                className="suggestion-btn suggestion-btn-approve"
                onClick={handleApprove}
                disabled={acting}
              >
                {acting ? 'Approving...' : 'Approve'}
              </button>

              {!showRejectForm ? (
                <button
                  type="button"
                  className="suggestion-btn suggestion-btn-reject"
                  onClick={() => setShowRejectForm(true)}
                  disabled={acting}
                >
                  Reject
                </button>
              ) : (
                <div className="suggestion-reject-form">
                  <input
                    type="text"
                    className="suggestion-reject-input"
                    placeholder="Reason for rejection (optional)"
                    value={rejectNotes}
                    onChange={e => setRejectNotes(e.target.value)}
                  />
                  <button
                    type="button"
                    className="suggestion-btn suggestion-btn-reject"
                    onClick={handleReject}
                    disabled={acting}
                  >
                    {acting ? 'Rejecting...' : 'Confirm Reject'}
                  </button>
                  <button
                    type="button"
                    className="suggestion-btn suggestion-btn-cancel"
                    onClick={() => setShowRejectForm(false)}
                    disabled={acting}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val);
}

export function AdminSuggestionsPage({ getToken, clerkUserId, onBack }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllSuggestions(getToken, filter === 'all' ? null : filter);
      setSuggestions(data);
    } catch (err) {
      setError(err.message || 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  }, [getToken, filter]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return (
    <div className="suggestions-page">
      <div className="suggestions-page-header">
        <button type="button" className="suggestions-back-btn" onClick={onBack}>
          &larr; Back to Timeline
        </button>
        <h2>Suggested Changes</h2>
      </div>

      <div className="suggestions-filters">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            type="button"
            className={`suggestions-filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p className="suggestions-loading">Loading suggestions...</p>}
      {error && <p className="suggestions-error">{error}</p>}

      {!loading && suggestions.length === 0 && (
        <p className="suggestions-empty">No {filter !== 'all' ? filter : ''} suggestions found.</p>
      )}

      <div className="suggestions-list">
        {suggestions.map(s => (
          <SuggestionCard
            key={s.suggestion_id}
            suggestion={s}
            getToken={getToken}
            clerkUserId={clerkUserId}
            onActionComplete={loadSuggestions}
          />
        ))}
      </div>
    </div>
  );
}
