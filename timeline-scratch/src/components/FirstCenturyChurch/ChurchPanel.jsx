import { useMemo } from 'react';
import { ScriptureVerse } from '../BiblicalPlaces/ScriptureVerse.jsx';
import { ChurchGraph } from './ChurchGraph.jsx';
import { buildChurchGraph, churchColor } from '../../data/firstCenturyChurchSupabaseAdapter.js';

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
 * Side panel for a selected church: description, key passages, households,
 * the force-directed web of its people, and a grouped people list.
 */
export function ChurchPanel({ data, churchId, onSelectEntity, onClose }) {
  const church = data.churchMap.get(churchId);
  const graphData = useMemo(() => buildChurchGraph(data, churchId), [data, churchId]);

  if (!church) return null;

  const region = church.region_id ? data.regionMap.get(church.region_id) : null;
  const memberships = data.churchMembershipsMap.get(churchId) || [];
  const households = data.churchHouseholdsMap.get(churchId) || [];
  const scriptureRefs = data.churchScriptureRefsMap.get(churchId) || [];
  const peopleCount = data.churchPersonCount.get(churchId) || 0;
  const travelerCount = memberships.filter(m => data.travelerIds.has(m.person_id)).length;

  const handleGraphNode = (node) => {
    if (node.type === 'church') onSelectEntity('church', node.entityId);
    else if (node.type === 'person') onSelectEntity('person', node.entityId);
    else if (node.type === 'household') onSelectEntity('household', node.entityId);
  };

  return (
    <div className="fcc-panel">
      <div className="fcc-panel-header" style={{ '--accent': churchColor(church) }}>
        <div className="fcc-panel-title-row">
          <span className="fcc-panel-dot" />
          <h2 className="fcc-panel-title">{church.name}</h2>
          <button className="fcc-panel-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="fcc-panel-subtitle">
          {CHURCH_TYPE_LABELS[church.church_type] || 'Church'}
          {region ? ` · ${region.name}` : ''}
        </p>
      </div>

      <div className="fcc-panel-body">
        {church.description && <p className="fcc-panel-desc">{church.description}</p>}
        {church.founded_context && (
          <p className="fcc-panel-note"><strong>Founding:</strong> {church.founded_context}</p>
        )}

        <div className="fcc-panel-stats">
          <span><strong>{peopleCount}</strong> {peopleCount === 1 ? 'person' : 'people'} named here</span>
          {travelerCount > 0 && (
            <span><strong>{travelerCount}</strong> who also appear in other churches</span>
          )}
        </div>

        {/* The web of people connected to this church */}
        <section className="fcc-panel-section">
          <h3 className="fcc-panel-section-title">The web of people</h3>
          <p className="fcc-panel-hint">
            Each dot is a person. Orange dots traveled between churches — click one to follow the thread.
          </p>
          <div className="fcc-panel-graph">
            <ChurchGraph
              graphData={graphData}
              focusEntityId={churchId}
              onSelectNode={handleGraphNode}
              mode="focused"
            />
          </div>
        </section>

        {households.length > 0 && (
          <section className="fcc-panel-section">
            <h3 className="fcc-panel-section-title">Households & house churches</h3>
            <ul className="fcc-panel-list">
              {households.map(h => (
                <li key={h.household_id}>
                  <button className="fcc-link-btn" onClick={() => onSelectEntity('household', h.household_id)}>
                    {h.name}
                  </button>
                  {h.description && <span className="fcc-panel-list-note"> — {h.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="fcc-panel-section">
          <h3 className="fcc-panel-section-title">People mentioned here</h3>
          <ul className="fcc-people-list">
            {memberships.map(m => (
              <li key={`${m.person_id}-${m.role}`} className="fcc-people-item">
                <button
                  className={`fcc-person-chip${m.person && data.travelerIds.has(m.person_id) ? ' fcc-person-chip--traveler' : ''}`}
                  onClick={() => onSelectEntity('person', m.person_id)}
                >
                  <span className="fcc-person-name">{m.person.name}</span>
                  <span className="fcc-person-role">{ROLE_LABELS[m.role] || m.role}</span>
                </button>
                {m.context && <p className="fcc-person-context">{m.context}</p>}
                {m.scripture_ref && (
                  <ScriptureVerse scriptureRef={m.scripture_ref} placeName={church.name} />
                )}
              </li>
            ))}
          </ul>
        </section>

        {scriptureRefs.length > 0 && (
          <section className="fcc-panel-section">
            <h3 className="fcc-panel-section-title">Key passages</h3>
            {scriptureRefs.map(sr => (
              <div key={sr.id} className="fcc-scripture-block">
                {sr.label && <p className="fcc-scripture-label">{sr.label}</p>}
                <ScriptureVerse scriptureRef={sr.reference} placeName={church.name} />
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
