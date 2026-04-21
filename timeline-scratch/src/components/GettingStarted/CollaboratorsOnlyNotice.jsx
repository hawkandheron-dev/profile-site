import './GettingStarted.css';

export function CollaboratorsOnlyNotice({ onBack }) {
  return (
    <section className="gs-notice">
      <h1 className="gs-notice-title">Invited collaborators only</h1>
      <p>
        The Getting Started area is for people invited to contribute to the
        Windhover Church History Timeline. If you'd like to help build the
        timeline, please reach out to the Windhover team for an invitation.
      </p>
      {onBack && (
        <button type="button" className="btn" onClick={onBack}>
          Back to the timeline
        </button>
      )}
    </section>
  );
}
