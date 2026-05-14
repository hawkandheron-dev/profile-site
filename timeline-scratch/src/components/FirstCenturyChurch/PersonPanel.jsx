import { ScriptureVerse } from '../BiblicalPlaces/ScriptureVerse.jsx';
import { churchColor } from '../../data/firstCenturyChurchSupabaseAdapter.js';

const ROLE_LABELS = {
  founder: 'Founder', apostle: 'Apostle', overseer: 'Overseer', elder: 'Elder',
  deacon: 'Deacon', prophet: 'Prophet', teacher: 'Teacher',
  'host-of-house-church': 'Host of a house church', 'letter-carrier': 'Letter carrier',
  'traveling-companion': 'Traveling companion', 'co-worker': 'Co-worker',
  member: 'Member', greeted: 'Greeted', mentioned: 'Mentioned', opponent: 'Opponent',
  patron: 'Patron', convert: 'Convert', relative: 'Relative of Paul',
};

/**
 * Side panel for a person: every church they connect to and their role at
 * each. Travelers carry a badge showing how many communities they bridge.
 */
export function PersonPanel({ data, personId, onSelectEntity, onClose, canGoBack, onBack }) {
  const person = data.personMap.get(personId);
  if (!person) return null;

  const memberships = data.personMembershipsMap.get(personId) || [];
  const isTraveler = data.travelerIds.has(personId);

  return (
    <div className="fcc-panel">
      <div className="fcc-panel-header fcc-panel-header--person">
        <div className="fcc-panel-title-row">
          {canGoBack && (
            <button className="fcc-panel-back" onClick={onBack} aria-label="Back">‹</button>
          )}
          <h2 className="fcc-panel-title">{person.name}</h2>
          <button className="fcc-panel-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="fcc-panel-subtitle">
          {person.also_known_as ? `Also known as ${person.also_known_as}` : 'New Testament believer'}
        </p>
      </div>

      <div className="fcc-panel-body">
        {isTraveler && (
          <div className="fcc-traveler-badge">
            Connects {memberships.length} {memberships.length === 1 ? 'community' : 'communities'} across the map
          </div>
        )}

        {person.description && <p className="fcc-panel-desc">{person.description}</p>}

        <section className="fcc-panel-section">
          <h3 className="fcc-panel-section-title">
            {memberships.length > 1 ? 'Churches & communities' : 'Church'}
          </h3>
          <ul className="fcc-people-list">
            {memberships.map(m => {
              const church = m.church;
              return (
                <li key={`${m.church_id}-${m.role}`} className="fcc-people-item">
                  <button
                    className="fcc-person-chip"
                    onClick={() => onSelectEntity('church', m.church_id)}
                  >
                    <span className="fcc-person-name" style={{ '--accent': churchColor(church) }}>
                      <span className="fcc-panel-dot fcc-panel-dot--inline" />
                      {church.name}
                    </span>
                    <span className="fcc-person-role">{ROLE_LABELS[m.role] || m.role}</span>
                  </button>
                  {m.context && <p className="fcc-person-context">{m.context}</p>}
                  {m.scripture_ref && (
                    <ScriptureVerse scriptureRef={m.scripture_ref} placeName={person.name} />
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {person.scripture_refs && (
          <p className="fcc-panel-note"><strong>Appears in:</strong> {person.scripture_refs}</p>
        )}
      </div>
    </div>
  );
}
