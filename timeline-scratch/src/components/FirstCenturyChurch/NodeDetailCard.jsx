import { ScriptureVerse } from '../BiblicalPlaces/ScriptureVerse.jsx';
import { churchColor } from '../../data/firstCenturyChurchSupabaseAdapter.js';
import './NodeDetailCard.css';

const ROLE_LABELS = {
  founder: 'Founder', apostle: 'Apostle', overseer: 'Overseer', elder: 'Elder',
  deacon: 'Deacon', prophet: 'Prophet', teacher: 'Teacher',
  'host-of-house-church': 'Host of a house church', 'letter-carrier': 'Letter carrier',
  'traveling-companion': 'Traveling companion', 'co-worker': 'Co-worker',
  member: 'Member', greeted: 'Greeted', mentioned: 'Mentioned', opponent: 'Opponent',
  patron: 'Patron', convert: 'Convert', relative: 'Relative of Paul',
};

const CHURCH_TYPE_LABELS = {
  jerusalem: 'The mother church', antioch: 'Missionary sending church',
  pauline: 'Pauline church', 'acts-church': 'Church in Acts',
  'revelation-seven': 'One of the seven churches of Revelation',
  'diaspora-region': 'Diaspora region', church: 'Church',
};

/**
 * Compact, dismissible floating card with the details of a church, person or
 * household node clicked in the on-map connection web. Replaces the old
 * full-height side panels.
 *
 * node: { type: 'church' | 'person' | 'household', id }
 * onNavigate(type, id): jump to another entity (church re-focuses the web).
 */
export function NodeDetailCard({ data, node, onNavigate, onClose }) {
  if (!node) return null;

  let accent = '#8b7355';
  let title = '';
  let subtitle = '';
  let body = null;

  if (node.type === 'church') {
    const church = data.churchMap.get(node.id);
    if (!church) return null;
    accent = churchColor(church);
    title = church.name;
    const region = church.region_id ? data.regionMap.get(church.region_id) : null;
    subtitle = `${CHURCH_TYPE_LABELS[church.church_type] || 'Church'}${region ? ` · ${region.name}` : ''}`;
    const peopleCount = data.churchPersonCount.get(node.id) || 0;
    const memberships = data.churchMembershipsMap.get(node.id) || [];
    const travelerCount = memberships.filter(m => data.travelerIds.has(m.person_id)).length;
    const scriptureRefs = data.churchScriptureRefsMap.get(node.id) || [];
    body = (
      <>
        {church.description && <p className="fcc-card-desc">{church.description}</p>}
        {church.founded_context && (
          <p className="fcc-card-note"><strong>Founding:</strong> {church.founded_context}</p>
        )}
        <div className="fcc-card-stats">
          <span><strong>{peopleCount}</strong> {peopleCount === 1 ? 'person' : 'people'} named here</span>
          {travelerCount > 0 && (
            <span><strong>{travelerCount}</strong> who also appear in other churches</span>
          )}
        </div>
        <p className="fcc-card-hint">
          Each dot on the map is a person here. Orange dots traveled between
          communities — click any node to follow the thread.
        </p>
        {scriptureRefs.length > 0 && (
          <section className="fcc-card-section">
            <h3 className="fcc-card-section-title">Key passages</h3>
            {scriptureRefs.map(sr => (
              <div key={sr.id} className="fcc-card-scripture">
                {sr.label && <p className="fcc-card-scripture-label">{sr.label}</p>}
                <ScriptureVerse scriptureRef={sr.reference} placeName={church.name} />
              </div>
            ))}
          </section>
        )}
      </>
    );
  } else if (node.type === 'person') {
    const person = data.personMap.get(node.id);
    if (!person) return null;
    const memberships = data.personMembershipsMap.get(node.id) || [];
    const isTraveler = data.travelerIds.has(node.id);
    accent = isTraveler ? '#d98c2b' : '#6b8caf';
    title = person.name;
    subtitle = person.also_known_as ? `Also known as ${person.also_known_as}` : 'New Testament believer';
    body = (
      <>
        {isTraveler && (
          <div className="fcc-card-badge">
            Connects {memberships.length} {memberships.length === 1 ? 'community' : 'communities'} across the map
          </div>
        )}
        {person.description && <p className="fcc-card-desc">{person.description}</p>}
        <section className="fcc-card-section">
          <h3 className="fcc-card-section-title">
            {memberships.length > 1 ? 'Churches & communities' : 'Church'}
          </h3>
          <ul className="fcc-card-list">
            {memberships.map(m => (
              <li key={`${m.church_id}-${m.role}`} className="fcc-card-list-item">
                <button
                  className="fcc-card-chip"
                  style={{ '--accent': churchColor(m.church) }}
                  onClick={() => onNavigate('church', m.church_id)}
                >
                  <span className="fcc-card-chip-name">
                    <span className="fcc-card-dot" />
                    {m.church.name}
                  </span>
                  <span className="fcc-card-chip-role">{ROLE_LABELS[m.role] || m.role}</span>
                </button>
                {m.context && <p className="fcc-card-context">{m.context}</p>}
                {m.scripture_ref && (
                  <ScriptureVerse scriptureRef={m.scripture_ref} placeName={person.name} />
                )}
              </li>
            ))}
          </ul>
        </section>
        {person.scripture_refs && (
          <p className="fcc-card-note"><strong>Appears in:</strong> {person.scripture_refs}</p>
        )}
      </>
    );
  } else if (node.type === 'household') {
    const household = data.householdMap.get(node.id);
    if (!household) return null;
    accent = '#8a7fae';
    title = household.name;
    subtitle = 'House church';
    const church = household.church_id ? data.churchMap.get(household.church_id) : null;
    const head = household.head_person_id ? data.personMap.get(household.head_person_id) : null;
    const members = [];
    for (const list of data.churchMembershipsMap.values()) {
      list.forEach(m => { if (m.household_id === node.id) members.push(m); });
    }
    body = (
      <>
        {church && (
          <p className="fcc-card-note">
            <strong>At:</strong>{' '}
            <button className="fcc-card-link" onClick={() => onNavigate('church', church.church_id)}>
              {church.name}
            </button>
          </p>
        )}
        {household.description && <p className="fcc-card-desc">{household.description}</p>}
        {head && (
          <p className="fcc-card-note">
            <strong>Headed by:</strong>{' '}
            <button className="fcc-card-link" onClick={() => onNavigate('person', head.person_id)}>
              {head.name}
            </button>
          </p>
        )}
        {members.length > 0 && (
          <section className="fcc-card-section">
            <h3 className="fcc-card-section-title">People of this household</h3>
            <ul className="fcc-card-plain-list">
              {members.map(m => (
                <li key={`${m.person_id}-${m.role}`}>
                  <button className="fcc-card-link" onClick={() => onNavigate('person', m.person_id)}>
                    {m.person.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {household.scripture_ref && (
          <section className="fcc-card-section">
            <h3 className="fcc-card-section-title">Key passage</h3>
            <ScriptureVerse scriptureRef={household.scripture_ref} placeName={household.name} />
          </section>
        )}
      </>
    );
  } else {
    return null;
  }

  return (
    <div className={`fcc-detail-card fcc-detail-card--${node.type}`} style={{ '--accent': accent }}>
      <div className="fcc-card-header">
        <span className="fcc-card-dot fcc-card-dot--lg" />
        <div className="fcc-card-titles">
          <h2 className="fcc-card-title">{title}</h2>
          {subtitle && <p className="fcc-card-subtitle">{subtitle}</p>}
        </div>
        <button className="fcc-card-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="fcc-card-body">{body}</div>
    </div>
  );
}
