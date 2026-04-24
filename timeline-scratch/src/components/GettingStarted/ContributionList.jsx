import { ContributionRow } from './ContributionRow.jsx';
import { STATUS_LABELS } from './StatusPill.jsx';
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
}) {
  return (
    <section className="gs-contributions" data-tour="my-contributions-list">
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

      {!loading && issues && issues.length > 0 && (
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
    </section>
  );
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
