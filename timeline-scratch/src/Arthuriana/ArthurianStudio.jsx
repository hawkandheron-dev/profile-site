import { useState } from 'react';
import { Shield, TINCTURES, CHARGES } from './ArthurianHeraldry.jsx';
import { describeBlazon } from './ArthurianPanel.jsx';
import './ArthurianStudio.css';

const TINCTURE_KEYS = ['or','argent','gules','azure','sable','vert','purpure','murrey','sanguine','tenne'];

const FIELD_MODES = [
  { value: 'plain',    label: 'Plain' },
  { value: 'division', label: 'Divided' },
  { value: 'pattern',  label: 'Patterned' },
];
const DIVISIONS = ['per pale','per fess','per bend','per bend sinister','per chevron','per saltire','quarterly'];
const PATTERNS  = ['chequy','lozengy','bendy','paly','barry','ermine','vair'];

const ORDINARIES = ['(none)','chief','pale','fess','bend','bend sinister','cross','saltire','chevron','pile','bordure'];

const ARRANGEMENTS = [
  { value: '',           label: 'Centered (or 2-1 if many)' },
  { value: 'in pale',    label: 'In pale (column)' },
  { value: 'in fess',    label: 'In fess (row)' },
  { value: 'in chief',   label: 'In chief (along the top)' },
  { value: 'in bend',    label: 'In bend (diagonal)' },
  { value: 'in saltire', label: 'In saltire (crossed)' },
];

const ATTITUDES = ['(none)','rampant','passant'];

const PRESETS = {
  blank:    { field: 'argent', charges: [] },
  arthur:   { field: 'azure', charges: [{ device: 'crown', tincture: 'or', count: 3, arrangement: 'in pale' }] },
  lancelot: { field: 'argent', ordinary: { type: 'bend', tincture: 'gules' } },
  gawain:   { field: 'purpure', charges: [{ device: 'pentangle', tincture: 'or' }] },
  galahad:  { field: 'argent', ordinary: { type: 'cross', tincture: 'gules' } },
  saracen:  { field: { pattern: 'chequy', tinctures: ['or', 'sable'] }, charges: [] },
};

const CHARGE_CATS = {
  Beasts:  ['lion','dragon','eagle','griffin','unicorn','boar','stag','bear','serpent','fish','toad','raven'],
  Plants:  ['rose','fleur-de-lis','trefoil','oak'],
  Symbols: ['cross','cross-patty','mullet','crescent','sun','moon','pentangle','crown'],
  Arms:    ['sword','arrow','tower','castle','key','harp','chalice','horseshoe','hand','arm'],
};

function TinctureSwatch({ value, onChange, size = 28 }) {
  return (
    <div className="tinct-row">
      {TINCTURE_KEYS.map((t) => (
        <button
          key={t}
          className={`tinct${value === t ? ' on' : ''}`}
          style={{ background: TINCTURES[t].fill, borderColor: TINCTURES[t].stroke, width: size, height: size }}
          onClick={() => onChange(t)}
          title={TINCTURES[t].label}
        />
      ))}
    </div>
  );
}

export function ArthurianStudio() {
  const [blazon, setBlazon] = useState({ field: 'azure', charges: [{ device: 'crown', tincture: 'or', count: 3, arrangement: 'in pale' }] });

  const fieldMode = typeof blazon.field === 'string' ? 'plain'
    : blazon.field?.division ? 'division'
    : blazon.field?.pattern ? 'pattern'
    : 'plain';
  const fieldT1 = typeof blazon.field === 'string' ? blazon.field : (blazon.field?.tinctures?.[0] || 'azure');
  const fieldT2 = typeof blazon.field === 'object' ? (blazon.field?.tinctures?.[1] || 'or') : 'or';
  const fieldDivision = blazon.field?.division || 'per pale';
  const fieldPattern  = blazon.field?.pattern  || 'chequy';

  const setField    = (next) => setBlazon((b) => ({ ...b, field: next }));
  const setOrdinary = (next) => setBlazon((b) => ({ ...b, ordinary: next }));
  const setCharges  = (next) => setBlazon((b) => ({ ...b, charges: next }));

  const switchFieldMode = (mode) => {
    if (mode === 'plain')    setField(fieldT1);
    if (mode === 'division') setField({ division: fieldDivision, tinctures: [fieldT1, fieldT2] });
    if (mode === 'pattern')  setField({ pattern: fieldPattern,   tinctures: [fieldT1, fieldT2] });
  };

  const charges = blazon.charges || [];
  const addCharge    = () => setCharges([...charges, { device: 'lion', tincture: 'or', count: 1 }]);
  const updateCharge = (i, patch) => setCharges(charges.map((c, j) => j === i ? { ...c, ...patch } : c));
  const removeCharge = (i) => setCharges(charges.filter((_, j) => j !== i));

  return (
    <div className="studio">
      <div className="stains" aria-hidden="true" />

      <header className="topbar">
        <a className="back-link" href="arthuriana.html">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 6 L9 12 L15 18"/>
          </svg>
          The Armorial
        </a>
        <div className="brand-row">
          <div className="brand-title">Heraldic Studio</div>
          <div className="brand-sub">Compose a coat of arms by the rules of blazon</div>
        </div>
      </header>

      <main className="studio-main">
        <section className="studio-preview">
          <div className="preview-wrap">
            <Shield blazon={blazon} size={360} banner={false} />
          </div>
          <div className="blazon-display">
            <div className="blazon-label">Blazon</div>
            <div className="blazon-text">{describeBlazon(blazon) || 'A field, undescribed.'}.</div>
          </div>
          <div className="preset-row">
            {Object.entries(PRESETS).map(([k, b]) => (
              <button key={k} className="preset" onClick={() => setBlazon(JSON.parse(JSON.stringify(b)))}>
                <Shield blazon={b} size={48} banner={false} />
                <span>{k}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="studio-controls">
          <div className="ctrl-section">
            <div className="ctrl-h">The Field</div>
            <div className="ctrl-row">
              <label>Treatment</label>
              <div className="seg">
                {FIELD_MODES.map((m) => (
                  <button key={m.value} className={fieldMode === m.value ? 'on' : ''}
                          onClick={() => switchFieldMode(m.value)}>{m.label}</button>
                ))}
              </div>
            </div>

            <div className="ctrl-row">
              <label>{fieldMode === 'plain' ? 'Tincture' : 'First tincture'}</label>
              <TinctureSwatch
                value={fieldT1}
                onChange={(t) => {
                  if (fieldMode === 'plain') setField(t);
                  else setField({ ...blazon.field, tinctures: [t, fieldT2] });
                }}
              />
            </div>

            {fieldMode !== 'plain' && (
              <div className="ctrl-row">
                <label>Second tincture</label>
                <TinctureSwatch
                  value={fieldT2}
                  onChange={(t) => setField({ ...blazon.field, tinctures: [fieldT1, t] })}
                />
              </div>
            )}

            {fieldMode === 'division' && (
              <div className="ctrl-row">
                <label>Line of division</label>
                <select value={fieldDivision} onChange={(e) => setField({ ...blazon.field, division: e.target.value })}>
                  {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            {fieldMode === 'pattern' && (
              <div className="ctrl-row">
                <label>Pattern</label>
                <select value={fieldPattern} onChange={(e) => setField({ ...blazon.field, pattern: e.target.value })}>
                  {PATTERNS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="ctrl-section">
            <div className="ctrl-h">Ordinary</div>
            <div className="ctrl-row">
              <label>Type</label>
              <select
                value={blazon.ordinary?.type || '(none)'}
                onChange={(e) => {
                  if (e.target.value === '(none)') setOrdinary(undefined);
                  else setOrdinary({ type: e.target.value, tincture: blazon.ordinary?.tincture || 'or' });
                }}
              >
                {ORDINARIES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {blazon.ordinary && (
              <div className="ctrl-row">
                <label>Tincture</label>
                <TinctureSwatch
                  value={blazon.ordinary.tincture}
                  onChange={(t) => setOrdinary({ ...blazon.ordinary, tincture: t })}
                />
              </div>
            )}
          </div>

          <div className="ctrl-section">
            <div className="ctrl-h-row">
              <div className="ctrl-h">Charges</div>
              <button className="add-btn" onClick={addCharge}>+ Add charge</button>
            </div>

            {charges.length === 0 && <div className="empty">No charges yet — the field stands alone.</div>}

            {charges.map((ch, i) => (
              <div key={i} className="charge-card">
                <div className="charge-card-head">
                  <div className="charge-preview">
                    <svg viewBox="-20 -20 40 40" width="44" height="44">
                      <rect x="-20" y="-20" width="40" height="40" fill={TINCTURES['argent'].fill}/>
                      {CHARGES[ch.device]?.(ch.tincture, ch.attitude)}
                    </svg>
                  </div>
                  <div className="charge-name">{ch.device}{ch.attitude && ch.attitude !== '(none)' ? ` ${ch.attitude}` : ''} {ch.tincture}</div>
                  <button className="rm-btn" onClick={() => removeCharge(i)} title="Remove charge">×</button>
                </div>

                <div className="ctrl-row">
                  <label>Device</label>
                  <div className="device-grid">
                    {Object.entries(CHARGE_CATS).map(([cat, devs]) => (
                      <details key={cat} open={devs.includes(ch.device)}>
                        <summary>{cat}</summary>
                        <div className="device-buttons">
                          {devs.map((d) => (
                            <button key={d} className={`device-btn${ch.device === d ? ' on' : ''}`}
                                    onClick={() => updateCharge(i, { device: d })}>
                              <svg viewBox="-20 -20 40 40" width="36" height="36">
                                {CHARGES[d]?.('sable')}
                              </svg>
                              <span>{d}</span>
                            </button>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>

                <div className="ctrl-row">
                  <label>Tincture</label>
                  <TinctureSwatch value={ch.tincture} onChange={(t) => updateCharge(i, { tincture: t })} size={24}/>
                </div>

                {(ch.device === 'lion' || ch.device === 'dragon' || ch.device === 'griffin') && (
                  <div className="ctrl-row">
                    <label>Attitude</label>
                    <div className="seg">
                      {ATTITUDES.map((a) => (
                        <button key={a} className={(ch.attitude || '(none)') === a ? 'on' : ''}
                                onClick={() => updateCharge(i, { attitude: a === '(none)' ? undefined : a })}>{a}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="ctrl-row">
                  <label>Count</label>
                  <div className="seg">
                    {[1, 2, 3, 4].map((n) => (
                      <button key={n} className={(ch.count || 1) === n ? 'on' : ''}
                              onClick={() => updateCharge(i, { count: n })}>{n}</button>
                    ))}
                  </div>
                </div>

                {(ch.count || 1) > 1 && (
                  <div className="ctrl-row">
                    <label>Arrangement</label>
                    <select value={ch.arrangement || ''} onChange={(e) => updateCharge(i, { arrangement: e.target.value || undefined })}>
                      {ARRANGEMENTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ctrl-section">
            <div className="ctrl-h">Glossary of Heraldry</div>
            <dl className="glossary">
              <div><dt>Tincture</dt><dd>The colour or metal of a heraldic surface. <em>Or</em> = gold; <em>argent</em> = silver; <em>gules</em> = red; <em>azure</em> = blue; <em>sable</em> = black; <em>vert</em> = green; <em>purpure</em> = purple; <em>murrey, sanguine, tenné</em> are the rarer "stains."</dd></div>
              <div><dt>Field</dt><dd>The surface of the shield, before any charges are added.</dd></div>
              <div><dt>Ordinary</dt><dd>A simple geometric figure painted directly on the field: a <em>bend</em> (diagonal stripe), <em>fess</em> (horizontal), <em>pale</em> (vertical), <em>chevron</em>, <em>cross</em>, <em>saltire</em>, <em>chief</em> (top band), <em>bordure</em> (border).</dd></div>
              <div><dt>Charge</dt><dd>Any figure placed on the field: beast, bird, plant, weapon, or geometric token.</dd></div>
              <div><dt>Attitude</dt><dd>The posture of a beast. A <em>lion rampant</em> rears on its hind legs; <em>passant</em> walks with one paw raised; <em>statant</em> stands; <em>couchant</em> lies; <em>sejant</em> sits.</dd></div>
              <div><dt>Arrangement</dt><dd>How multiple charges are placed: <em>in pale</em> stacked, <em>in fess</em> in a row, <em>in chief</em> along the top, <em>in saltire</em> crossed.</dd></div>
            </dl>
          </div>
        </section>
      </main>
    </div>
  );
}
