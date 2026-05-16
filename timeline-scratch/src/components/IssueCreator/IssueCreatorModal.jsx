/**
 * Modal form for submitting issues / corrections / feature requests.
 * Auto-captures rich page context from the host app.
 */
import { useState, useEffect, useCallback } from 'react';
import { submitIssue } from '../../services/issueService.js';
import { APP_SECTIONS, APP_SECTION_LABELS } from '../../data/appSections.js';
import './IssueCreatorModal.css';

const ISSUE_TYPES = [
  { value: 'general',         label: 'General' },
  { value: 'data_correction', label: 'Data Correction' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'bug',             label: 'Bug' },
];

function defaultSectionFor(appId) {
  return APP_SECTION_LABELS[appId] ? appId : 'general';
}

export function IssueCreatorModal({ isOpen, onClose, getToken, clerkUserId, appId, getPageContext, onSubmitted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('general');
  const [appSection, setAppSection] = useState(() => defaultSectionFor(appId));
  const [pageContext, setPageContext] = useState(null);
  const [contextExpanded, setContextExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Capture context on mount
  useEffect(() => {
    if (isOpen && getPageContext) {
      try {
        setPageContext(getPageContext());
      } catch {
        setPageContext(null);
      }
    }
  }, [isOpen, getPageContext]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setIssueType('general');
      setAppSection(defaultSectionFor(appId));
      setError(null);
      setSuccess(false);
      setContextExpanded(false);
    }
  }, [isOpen, appId]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError('Please provide a title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const submitted = await submitIssue(
        {
          app_id: appSection,
          title: title.trim(),
          description: description.trim(),
          issue_type: issueType,
          page_context: pageContext,
        },
        clerkUserId,
        getToken,
      );
      setSuccess(true);
      onSubmitted?.(submitted);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit issue.');
      setSaving(false);
    }
  }, [title, description, issueType, appSection, pageContext, clerkUserId, getToken, onClose, onSubmitted]);

  if (!isOpen) return null;

  return (
    <div className="issue-modal-overlay" onClick={onClose}>
      <div className="issue-modal" onClick={e => e.stopPropagation()}>
        <button className="issue-modal-close" onClick={onClose}>&times;</button>

        {success ? (
          <div className="issue-modal-success">
            <h2>Issue Submitted</h2>
            <p>Thank you! An admin will review this shortly.</p>
          </div>
        ) : (
          <>
            <h2 className="issue-modal-title">Report an Issue</h2>
            <p className="issue-modal-desc">
              Describe the problem or suggestion. Context from the current page is captured automatically.
            </p>

            {/* Section picker */}
            <label className="issue-field-label">
              Section of the site this is about
              <select
                className="issue-field-input"
                value={appSection}
                onChange={e => setAppSection(e.target.value)}
              >
                {APP_SECTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>

            {/* Issue type pills */}
            <div className="issue-type-pills" data-tour="issue-type-pills">
              {ISSUE_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`issue-type-pill${issueType === t.value ? ' active' : ''}`}
                  onClick={() => setIssueType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Title */}
            <label className="issue-field-label">
              Title
              <input
                type="text"
                className="issue-field-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Short summary of the issue"
                maxLength={200}
                data-tour="issue-title-input"
              />
            </label>

            {/* Description */}
            <label className="issue-field-label">
              Description
              <textarea
                className="issue-field-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what you noticed, what you expected, or what you'd like changed..."
                rows={5}
                data-tour="issue-description-textarea"
              />
            </label>

            {/* Page context preview */}
            {pageContext && (
              <div className="issue-context-section">
                <button
                  type="button"
                  className="issue-context-toggle"
                  onClick={() => setContextExpanded(!contextExpanded)}
                >
                  {contextExpanded ? 'Hide' : 'Show'} captured context
                </button>
                {contextExpanded && (
                  <pre className="issue-context-preview">
                    {JSON.stringify(pageContext, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Screenshot placeholder */}
            <div className="issue-screenshot-placeholder">
              <span className="issue-screenshot-label">Screenshots</span>
              <span className="issue-screenshot-coming-soon">Coming soon</span>
            </div>

            {error && <div className="issue-modal-error">{error}</div>}

            <div className="issue-modal-actions">
              <button type="button" className="btn btn-rect" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-rect btn-accent"
                onClick={handleSubmit}
                disabled={saving}
                data-tour="issue-submit-btn"
              >
                {saving ? 'Submitting...' : 'Submit Issue'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
