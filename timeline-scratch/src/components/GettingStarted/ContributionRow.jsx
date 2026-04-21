import { useState } from 'react';
import { StatusPill } from './StatusPill.jsx';
import { CommentThread } from './CommentThread.jsx';
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

export function ContributionRow({ issue, clerkUserId, getToken, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showContext, setShowContext] = useState(false);

  return (
    <li className={`gs-row${expanded ? ' gs-row-expanded' : ''}`}>
      <button
        type="button"
        className="gs-row-header"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="gs-row-header-main">
          <span className="gs-row-title">{issue.title}</span>
          <span className="gs-row-meta">
            <span className="gs-row-type">{ISSUE_TYPE_LABELS[issue.issue_type] || issue.issue_type}</span>
            <span className="gs-row-dot">·</span>
            <span className="gs-row-date">{formatDate(issue.created_at)}</span>
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
