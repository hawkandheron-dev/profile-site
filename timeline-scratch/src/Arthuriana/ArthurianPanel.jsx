import { useState, useEffect } from 'react';
import { Shield } from './ArthurianHeraldry.jsx';
import { REL_TYPES } from './ArthurianGraph.jsx';
import { REALM_BY_ID, REALM_LABEL } from './characters.js';

export const SOURCE_META = {
  'Geoffrey of Monmouth':    { date: 'c. 1136',    work: 'Historia Regum Britanniae' },
  'Wace':                    { date: '1155',        work: 'Roman de Brut' },
  'Chrétien de Troyes':      { date: 'c. 1170–90',  work: 'The five romances' },
  'Mabinogion':              { date: '11–14th c.',  work: 'Welsh prose tales' },
  'Other early sources':     { date: '12–13th c.',  work: 'Béroul, Thomas, the Pearl Poet et al.' },
  'Wolfram von Eschenbach':  { date: 'c. 1210',     work: 'Parzival' },
  'Sir Gawain and the Green Knight': { date: 'c. 1400', work: 'Pearl Poet, anon.' },
  'Vulgate Cycle':           { date: 'c. 1215–35',  work: 'Lancelot-Grail (Old French)' },
  'Malory':                  { date: '1485',        work: "Le Morte d'Arthur" },
  'Spenser':                 { date: '1590',        work: 'The Faerie Queene' },
  'Tennyson':                { date: '1859–85',     work: 'Idylls of the King' },
  'Mark Twain':              { date: '1889',        work: 'A Connecticut Yankee…' },
  'T.H. White':              { date: '1938–58',     work: 'The Once and Future King' },
  'Tolkien':                 { date: 'c. 1934',     work: 'The Fall of Arthur' },
};

export function describeBlazon(b) {
  if (!b) return '';
  const parts = [];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  if (typeof b.field === 'string') {
    parts.push(cap(b.field));
  } else if (b.field?.division) {
    parts.push(cap(b.field.division) + ' ' + b.field.tinctures.join(' and '));
  } else if (b.field?.pattern) {
    parts.push(cap(b.field.pattern) + ' ' + b.field.tinctures.join(' and '));
  }
  if (b.ordinary) {
    parts.push(`a ${b.ordinary.type} ${b.ordinary.tincture}`);
  }
  (b.charges || []).forEach((ch) => {
    let s = '';
    if (ch.count > 1) s += `${numWord(ch.count)} `;
    s += pluralize(ch.device, ch.count);
    if (ch.attitude) s += ` ${ch.attitude}`;
    s += ` ${ch.tincture}`;
    if (ch.arrangement) s += ` ${ch.arrangement}`;
    parts.push(s);
  });
  return parts.join(', ');
}

function numWord(n) {
  return ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'][n] || String(n);
}
function pluralize(d, n) {
  if (!n || n === 1) {
    if (d === 'fleur-de-lis') return 'fleur-de-lis';
    return 'a ' + d;
  }
  const map = { 'fleur-de-lis': 'fleurs-de-lis', mullet: 'mullets', cross: 'crosses', lion: 'lions', dragon: 'dragons', crown: 'crowns', rose: 'roses', sword: 'swords', arrow: 'arrows', tower: 'towers', key: 'keys', fish: 'fishes', crescent: 'crescents', mullets: 'mullets' };
  return map[d] || d + 's';
}

const REALM_COLORS = {
  logres:   '#7a1e1e',
  cornwall: '#2a1f17',
  wales:    '#355e3b',
  north:    '#3a3a5a',
  ireland:  '#1f5a4a',
  france:   '#2a4b7c',
  other:    '#3a1f3a',
};

const ROLE_LABEL = {
  'round-table': 'Knight of the Round Table',
  'pendragon':   'House Pendragon',
  'orkney':      'House Orkney',
  'cornwall':    'House Cornwall',
  'enchanter':   'Enchanter',
  'lady':        'Lady of Story',
  'foe':         'Foe of the Realm',
  'other':       'Of the Wider Isle',
};

function RealmBadge({ id }) {
  const label = REALM_LABEL[id] || id;
  const color = REALM_COLORS[id] || '#444';
  return <span className="realm-badge" style={{ background: color }}>{label}</span>;
}

export function Panel({ character, allCharacters, onClose, onNavigate, focusedRelTypes }) {
  const [tab, setTab] = useState(null);
  const sources = character?.sources || [];

  useEffect(() => {
    setTab(sources[0]?.source || null);
  }, [character?.id]);

  if (!character) return null;

  const byId = new Map(allCharacters.map((c) => [c.id, c]));
  const rels = (character.relations || []).filter(r => byId.has(r.to));

  const seen = new Set();
  const buckets = {};
  rels.forEach(r => {
    if (focusedRelTypes && focusedRelTypes[r.type] === false) return;
    const k = r.to + '|' + r.type;
    if (seen.has(k)) return;
    seen.add(k);
    (buckets[r.type] ||= []).push(r);
  });
  const relOrder = ['family', 'marriage', 'mentor', 'fellowship', 'quest', 'rival'];

  const activeSource = sources.find((s) => s.source === tab) || sources[0];

  return (
    <aside className="panel" onClick={(e) => e.stopPropagation()}>
      <button className="panel-close" onClick={onClose} aria-label="Close">×</button>

      <div className="panel-head">
        <div className="panel-shield-wrap">
          <Shield blazon={character.blazon} size={132} banner={false} />
        </div>
        <div className="panel-id">
          <div className="panel-title">{character.name}</div>
          <div className="panel-subtitle">{character.title}</div>
          <div className="panel-meta">
            <RealmBadge id={REALM_BY_ID[character.id]} />
            <span className="role-tag">{ROLE_LABEL[character.group] || character.group}</span>
          </div>
          <div className="blazon-line">
            <span className="blazon-label">Blazon</span>
            <span className="blazon-text">{describeBlazon(character.blazon)}.</span>
          </div>
        </div>
      </div>

      <div className="panel-section-title">In the Sources</div>
      <div className="source-tabs">
        {sources.map((s) => (
          <button
            key={s.source}
            className={`source-tab ${tab === s.source ? 'active' : ''}`}
            onClick={() => setTab(s.source)}
          >
            <span className="src-name">{s.source}</span>
            <span className="src-date">{SOURCE_META[s.source]?.date || ''}</span>
          </button>
        ))}
      </div>

      {activeSource && (
        <div className="source-body">
          <div className="source-work">{SOURCE_META[activeSource.source]?.work}</div>
          <p>{activeSource.text}</p>
        </div>
      )}

      {Object.keys(buckets).length > 0 && (
        <>
          <div className="panel-section-title">Relations</div>
          <div className="rel-list">
            {relOrder.map((t) => buckets[t] && (
              <div key={t} className="rel-bucket">
                <div className="rel-bucket-h">
                  <span className="rel-swatch" style={{ background: REL_TYPES[t].color, borderStyle: REL_TYPES[t].dash === 'none' ? 'solid' : 'dashed' }} />
                  {REL_TYPES[t].label}
                </div>
                <ul>
                  {buckets[t].map((r, i) => {
                    const target = byId.get(r.to);
                    return (
                      <li key={i}>
                        <button className="rel-link" onClick={() => onNavigate(r.to)}>
                          <Shield blazon={target.blazon} size={32} banner={false} frame={true} />
                          <span>{target.name.replace(/^(Sir|King|Queen|Lady) /, '')}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
