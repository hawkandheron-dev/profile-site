import './GettingStarted.css';

export function WelcomeHeader({ displayName, email, role }) {
  const greeting = displayName || (email ? email.split('@')[0] : 'collaborator');
  return (
    <section className="gs-welcome">
      <h1 className="gs-welcome-title">Contributor Portal</h1>
      <p className="gs-welcome-greeting">Welcome, {greeting}.</p>
      <p className="gs-welcome-lede">
        Thank you for contributing to the Windhover Church History Timeline.
        This page is where you can learn how to submit feedback, see the
        status of your submissions, and discuss them with the team.
      </p>
      {role && (
        <span className={`gs-role-pill gs-role-${role}`}>
          {role === 'admin' ? 'Admin' : role === 'contributor' ? 'Contributor' : role}
        </span>
      )}
    </section>
  );
}
