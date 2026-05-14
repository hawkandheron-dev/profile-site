import { ScriptureVerse } from '../BiblicalPlaces/ScriptureVerse.jsx';

/**
 * Side panel for a household / house church.
 */
export function HouseholdPanel({ data, householdId, onSelectEntity, onClose, canGoBack, onBack }) {
  const household = data.householdMap.get(householdId);
  if (!household) return null;

  const church = household.church_id ? data.churchMap.get(household.church_id) : null;
  const head = household.head_person_id ? data.personMap.get(household.head_person_id) : null;

  // Members: people whose membership rows point at this household
  const members = [];
  for (const list of data.churchMembershipsMap.values()) {
    list.forEach(m => {
      if (m.household_id === householdId) members.push(m);
    });
  }

  return (
    <div className="fcc-panel">
      <div className="fcc-panel-header fcc-panel-header--household">
        <div className="fcc-panel-title-row">
          {canGoBack && (
            <button className="fcc-panel-back" onClick={onBack} aria-label="Back">‹</button>
          )}
          <h2 className="fcc-panel-title">{household.name}</h2>
          <button className="fcc-panel-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        {church && (
          <p className="fcc-panel-subtitle">
            <button className="fcc-link-btn" onClick={() => onSelectEntity('church', church.church_id)}>
              {church.name}
            </button>
          </p>
        )}
      </div>

      <div className="fcc-panel-body">
        {household.description && <p className="fcc-panel-desc">{household.description}</p>}

        {head && (
          <p className="fcc-panel-note">
            <strong>Headed by:</strong>{' '}
            <button className="fcc-link-btn" onClick={() => onSelectEntity('person', head.person_id)}>
              {head.name}
            </button>
          </p>
        )}

        {members.length > 0 && (
          <section className="fcc-panel-section">
            <h3 className="fcc-panel-section-title">People of this household</h3>
            <ul className="fcc-panel-list">
              {members.map(m => (
                <li key={`${m.person_id}-${m.role}`}>
                  <button className="fcc-link-btn" onClick={() => onSelectEntity('person', m.person_id)}>
                    {m.person.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {household.scripture_ref && (
          <section className="fcc-panel-section">
            <h3 className="fcc-panel-section-title">Key passage</h3>
            <ScriptureVerse scriptureRef={household.scripture_ref} placeName={household.name} />
          </section>
        )}
      </div>
    </div>
  );
}
