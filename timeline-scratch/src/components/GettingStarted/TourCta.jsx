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

export function TourCta({ onStart, completedAt }) {
  return (
    <section className="gs-tour-cta">
      <div className="gs-tour-cta-copy">
        <h2>Take the contribution tour</h2>
        <p>
          A short walkthrough of how to submit feedback, flag data corrections,
          and request features. Seven steps; skip anytime.
        </p>
        {completedAt && (
          <span className="gs-tour-cta-done">
            You completed the tour on {formatDate(completedAt)}.
          </span>
        )}
      </div>
      <button type="button" className="btn btn-accent gs-tour-cta-btn" onClick={onStart}>
        {completedAt ? 'Retake the tour' : 'Take the tour'}
      </button>
    </section>
  );
}
