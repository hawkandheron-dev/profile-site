import { ContributionRow } from './ContributionRow.jsx';
import { STATUS_LABELS } from './StatusPill.jsx';
import { APP_SECTIONS, APP_SECTION_LABELS } from '../../data/appSections.js';
import './GettingStarted.css';

export function ContributionList({
  issues,
  loading,
  error,
  onSubmitNew,
  clerkUserId,
  getToken,
  isAdmin = false,
  submitterNameById,
  onIssueUpdated,
  groupBySection = false,
}) {
  const hasIssues = !loading && !error && issues && issues.length > 0;
  const buckets = groupBySection && hasIssues ? bucketBySection(issues) : null;

  return (
    <section className="gs-contributions" data-tour="contributions-list">
      <div className="gs-contributions-header">
        <h2>All contributions</h2>
        <button type="button" className="btn btn-accent" onClick={onSubmitNew}>
          + New feedback
        </button>
      </div>

      <StatusLegend />

      {loading && <div className="gs-contributions-loading">Loading contributions…</div>}
      {error && <div className="gs-contributions-error">{error}</div>}

      {!loading && !error && (!issues || issues.length === 0) && (
        <div className="gs-contributions-empty">
          <p>No contributions yet.</p>
          <button type="button" className="btn btn-accent" onClick={onSubmitNew}>
            Submit the first piece of feedback
          </button>
        </div>
      )}

      {hasIssues && !groupBySection && (
        <ul className="gs-row-list">
          {issues.map(issue => (
            <ContributionRow
              key={issue.issue_id}
              issue={issue}
              clerkUserId={clerkUserId}
              getToken={getToken}
              isAdmin={isAdmin}
              submitterName={submitterNameById?.[issue.submitted_by]}
              onIssueUpdated={onIssueUpdated}
            />
          ))}
        </ul>
      )}

      {hasIssues && groupBySection && buckets.map(({ id, label, rows }) => (
        <div key={id} className="gs-section-group">
          <h3 className="gs-section-heading">{label}</h3>
          {rows.length === 0 ? (
            <div className="gs-section-empty">No contributions in this section yet.</div>
          ) : (
            <ul className="gs-row-list">
              {rows.map(issue => (
                <ContributionRow
                  key={issue.issue_id}
                  issue={issue}
                  clerkUserId={clerkUserId}
                  getToken={getToken}
                  isAdmin={isAdmin}
                  submitterName={submitterNameById?.[issue.submitted_by]}
                  onIssueUpdated={onIssueUpdated}
                  showAppBadge
                />
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

function bucketBySection(issues) {
  const knownIds = new Set(APP_SECTIONS.map(s => s.id));
  const byId = new Map(APP_SECTIONS.map(s => [s.id, []]));

  const otherRows = [];
  for (const issue of issues) {
    const id = issue.app_id;
    if (knownIds.has(id)) {
      byId.get(id).push(issue);
    } else {
      otherRows.push(issue);
    }
  }

  const buckets = APP_SECTIONS
    // Keep "General" visible even when empty so it reads as the default
    // landing bucket; hide other empty buckets to reduce noise.
    .filter(s => s.id === 'general' || byId.get(s.id).length > 0)
    .map(s => ({ id: s.id, label: s.label, rows: byId.get(s.id) }));

  if (otherRows.length > 0) {
    buckets.push({ id: '__other', label: 'Other', rows: otherRows });
  }
  return buckets;
}

function StatusLegend() {
  return (
    <div className="gs-status-legend" data-tour="status-pill-legend">
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <span key={key} className={`gs-status-pill gs-status-${key}`}>{label}</span>
      ))}
    </div>
  );
}

// Re-export so callers don't need a separate import path.
export { APP_SECTION_LABELS };
