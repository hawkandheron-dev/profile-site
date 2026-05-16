import './GettingStarted.css';

export function WelcomeHeader({
  displayName,
  email,
  role,
  isSignedIn = false,
  isContributor = false,
  isAdmin = false,
  siteWide = false,
}) {
  const greeting = displayName || (email ? email.split('@')[0] : null);
  const canWrite = isContributor || isAdmin;
  const scopeLabel = siteWide ? 'the Windhover site' : 'the Windhover Church History Timeline';

  let roleParagraph;
  if (canWrite) {
    roleParagraph = (
      <p className="gs-welcome-lede">
        Thank you for contributing to {scopeLabel}.
        This page is where you can submit feedback, see the status of
        contributions from across the team, and discuss them.
      </p>
    );
  } else if (isSignedIn) {
    roleParagraph = (
      <p className="gs-welcome-lede">
        Submitting feedback and joining the discussion is reserved for
        contributors invited by the Windhover team. Admins manage status
        changes as work moves from submitted to in review, on the roadmap,
        or implemented.
      </p>
    );
  } else {
    roleParagraph = (
      <p className="gs-welcome-lede">
        Submitting feedback and joining the discussion is reserved for
        contributors invited by the Windhover team. Sign in if you've been
        invited.
      </p>
    );
  }

  const ledeScope = siteWide
    ? 'across the whole Windhover site'
    : 'for the Church History Timeline';

  return (
    <section className="gs-welcome">
      <h1 className="gs-welcome-title">Contributor Portal</h1>
      {greeting && <p className="gs-welcome-greeting">Welcome, {greeting}.</p>}
      <p className="gs-welcome-lede">
        The Contributor Portal is where the Windhover team reviews feedback
        and suggestions {ledeScope}. Anyone can visit this page to see how
        contributions move from submission to discussion to roadmap.
      </p>
      {roleParagraph}
      {role && (
        <span className={`gs-role-pill gs-role-${role}`}>
          {role === 'admin' ? 'Admin' : role === 'contributor' ? 'Contributor' : role}
        </span>
      )}
    </section>
  );
}
