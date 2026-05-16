import { useState } from 'react';
import { StatusPill, STATUS_LABELS } from './StatusPill.jsx';
import { CommentThread } from './CommentThread.jsx';
import { setIssueStatus, ISSUE_STATUSES } from '../../services/issueService.js';
import { appSectionLabel } from '../../data/appSections.js';
import './GettingStarted.css';

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

const ISSUE_TYPE_LABELS = {
  general:         'General',
  data_correction: 'Data Correction',
  feature_request: 'Feature Request',
  bug:             'Bug',
};

export function ContributionRow({
  issue,
  clerkUserId,
  getToken,
  defaultExpanded = false,
  submitterName,
  isAdmin = false,
  onIssueUpdated,
  showAppBadge = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showContext, setShowContext] = useState(false);

  const isOwn = issue.submitted_by && clerkUserId && issue.submitted_by === clerkUserId;
  const byLabel = isOwn ? 'you' : (submitterName || null);

  return (
    <li className={`gs-row${expanded ? ' gs-row-expanded' : ''}`}>
      <button
        type="button"
        className="gs-row-header"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <span className="gs-row-caret" aria-hidden="true">▸</span>
        <div className="gs-row-header-main">
          <span className="gs-row-title">{issue.title}</span>
          <span className="gs-row-meta">
            {showAppBadge && (
              <>
                <span className="gs-row-app">{appSectionLabel(issue.app_id)}</span>
                <span className="gs-row-dot">·</span>
              </>
            )}
            <span className="gs-row-type">{ISSUE_TYPE_LABELS[issue.issue_type] || issue.issue_type}</span>
            <span className="gs-row-dot">·</span>
            <span className="gs-row-date">{formatDate(issue.created_at)}</span>
            {byLabel && (
              <>
                <span className="gs-row-dot">·</span>
                <span className="gs-row-submitter">by {byLabel}</span>
              </>
            )}
          </span>
        </div>
        <StatusPill status={issue.status} />
      </button>

      {expanded && (
        <div className="gs-row-body">
          <div className="gs-row-description">{issue.description}</div>

          {issue.resolver_notes && (
            <div className="gs-row-admin-notes">
              <div className="gs-row-admin-notes-header">Admin notes</div>
              <div>{issue.resolver_notes}</div>
            </div>
          )}

          {issue.page_context && (
            <div className="gs-row-context">
              <button
                type="button"
                className="gs-row-context-toggle"
                onClick={() => setShowContext(v => !v)}
              >
                {showContext ? 'Hide' : 'Show'} captured page context
              </button>
              {showContext && (
                <pre className="gs-row-context-pre">
                  {JSON.stringify(issue.page_context, null, 2)}
                </pre>
              )}
            </div>
          )}

          {isAdmin && (
            <AdminStatusControl
              issue={issue}
              currentUserId={clerkUserId}
              getToken={getToken}
              onIssueUpdated={onIssueUpdated}
            />
          )}

          <CommentThread
            issueId={issue.issue_id}
            clerkUserId={clerkUserId}
            getToken={getToken}
          />
        </div>
      )}
    </li>
  );
}

function AdminStatusControl({ issue, currentUserId, getToken, onIssueUpdated }) {
  const [status, setStatus] = useState(issue.status || 'submitted');
  const [notes, setNotes] = useState(issue.resolver_notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const dirty = status !== (issue.status || 'submitted') || notes !== (issue.resolver_notes || '');

  const handleSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      await setIssueStatus(issue.issue_id, status, currentUserId, notes, getToken);
      const terminal = status === 'implemented' || status === 'not_going_to_do';
      onIssueUpdated?.(issue.issue_id, {
        status,
        resolver_notes: notes || null,
        resolved_at: terminal ? new Date().toISOString() : null,
        resolved_by: terminal ? currentUserId : null,
      });
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gs-row-admin-control">
      <div className="gs-row-admin-control-header">Update status</div>
      <div className="gs-row-admin-control-fields">
        <label className="gs-row-admin-control-label">
          Status
          <select
            className="gs-row-admin-control-select"
            value={status}
            onChange={e => setStatus(e.target.value)}
            disabled={saving}
          >
            {ISSUE_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
            ))}
          </select>
        </label>
        <label className="gs-row-admin-control-label">
          Admin notes (optional)
          <textarea
            className="gs-row-admin-control-textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Explain the decision or link to context…"
            disabled={saving}
          />
        </label>
      </div>
      {error && <div className="gs-row-admin-control-error">{error}</div>}
      <div className="gs-row-admin-control-actions">
        <button
          type="button"
          className="btn btn-accent"
          onClick={handleSave}
          disabled={!dirty || saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
