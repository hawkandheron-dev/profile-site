// ArthurianGraph.jsx — Graph layout & rendering for the Arthurian character map.
import { useMemo, useState, useRef, useEffect } from 'react';
import { Shield } from './ArthurianHeraldry.jsx';
import {
  REALMS as STATIC_REALMS,
  REALM_BY_ID as STATIC_REALM_BY_ID,
  KNIGHT_ORDER_BY_REALM as STATIC_KNIGHT_ORDER_BY_REALM,
} from './characters.js';

export const REL_TYPES = {
  family:     { label: 'Family',          color: '#7a1e1e', dash: 'none',    width: 2.2 },
  marriage:   { label: 'Marriage / love', color: '#a82c2a', dash: 'none',    width: 2.6 },
  mentor:     { label: 'Mentor / squire', color: '#5a3a1e', dash: '6 4',     width: 1.8 },
  fellowship: { label: 'Fellowship',      color: '#2a4b7c', dash: 'none',    width: 1.6 },
  rival:      { label: 'Rival / enemy',   color: '#2a1a1a', dash: '2 4',     width: 1.8 },
  quest:      { label: 'Quest companion', color: '#355e3b', dash: '8 3 2 3', width: 1.8 },
};

// ─── LAYOUTS ─────────────────────────────────────────────────────────────────

function roundTableLayout(characters, w, h, realmData) {
  const REALMS = realmData?.realms ?? STATIC_REALMS;
  const REALM_BY_ID = realmData?.realmById ?? STATIC_REALM_BY_ID;
  const KNIGHT_ORDER_BY_REALM = realmData?.knightOrderByRealm ?? STATIC_KNIGHT_ORDER_BY_REALM;

  const cx = w / 2, cy = h / 2;
  const knightR = Math.min(w, h) * 0.34;
  const ringOuter = knightR - 28;
  const ringInner = knightR * 0.56;
  const innerCircleR = ringInner * 0.55;
  const outerR = knightR + 230;
  const labelR = knightR + 110;

  const positions = new Map();
  positions.set('arthur',    { x: cx,                        y: cy - innerCircleR });
  positions.set('merlin',    { x: cx - innerCircleR * 0.866, y: cy + innerCircleR * 0.5 });
  positions.set('guinevere', { x: cx + innerCircleR * 0.866, y: cy + innerCircleR * 0.5 });
  const innerIds = new Set(['arthur', 'merlin', 'guinevere']);

  let cursor = -Math.PI / 2 - (REALMS[0].width / 2) * Math.PI / 180;
  const slots = REALMS.map((r) => {
    const widthRad = r.width * Math.PI / 180;
    const start = cursor;
    const end = cursor + widthRad;
    const mid = (start + end) / 2;
    cursor = end;
    return { ...r, start, end, mid, halfWidth: widthRad / 2 };
  });

  slots.forEach((realm) => {
    const realmChars = characters.filter((c) => REALM_BY_ID[c.id] === realm.id && !innerIds.has(c.id));
    const order = KNIGHT_ORDER_BY_REALM[realm.id] || [];
    const knights = order
      .map((id) => realmChars.find((c) => c.id === id && c.group === 'round-table'))
      .filter(Boolean);
    for (const c of realmChars) {
      if (c.group === 'round-table' && !knights.includes(c)) knights.push(c);
    }
    const others = realmChars.filter((c) => c.group !== 'round-table');

    knights.forEach((c, i) => {
      const t = knights.length === 1 ? 0.5 : (i + 0.5) / knights.length;
      const angle = realm.start + (realm.end - realm.start) * t;
      positions.set(c.id, { x: cx + Math.cos(angle) * knightR, y: cy + Math.sin(angle) * knightR });
    });

    const arcLen = (realm.end - realm.start) * outerR;
    const needPerChar = 92;
    const useTwoRows = others.length > 0 && (others.length * needPerChar) > arcLen;
    const innerCount = useTwoRows ? Math.ceil(others.length / 2) : others.length;
    const outerCount = useTwoRows ? Math.floor(others.length / 2) : 0;
    others.forEach((c, i) => {
      let row, idx, n;
      if (useTwoRows) { row = i % 2; idx = Math.floor(i / 2); n = row === 0 ? innerCount : outerCount; }
      else { row = 0; idx = i; n = others.length; }
      const t = n <= 1 ? 0.5 : (idx + 0.5) / n;
      const angle = realm.start + (realm.end - realm.start) * t;
      const r = outerR + row * 120;
      positions.set(c.id, { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    });
  });

  characters.forEach((c, i) => {
    if (!positions.has(c.id)) positions.set(c.id, { x: 100 + (i % 8) * 120, y: h - 100 });
  });

  return {
    positions,
    table: { cx, cy, outerR: ringOuter, innerR: ringInner },
    sectorLabels: slots.map((s) => ({ label: s.label, mid: s.mid, half: s.halfWidth, r: labelR })),
  };
}

function hubSpokeLayout(characters, w, h) {
  const cx = w / 2, cy = h / 2;
  const positions = new Map();
  positions.set('arthur', { x: cx, y: cy });
  const rest = characters.filter((c) => c.id !== 'arthur');
  const innerGroups = ['round-table', 'pendragon', 'enchanter'];
  const inner = rest.filter((c) => innerGroups.includes(c.group));
  const outer = rest.filter((c) => !innerGroups.includes(c.group));
  const r1 = Math.min(w, h) * 0.32, r2 = Math.min(w, h) * 0.46;
  inner.forEach((c, i) => {
    const a = -Math.PI / 2 + (i / inner.length) * Math.PI * 2;
    positions.set(c.id, { x: cx + Math.cos(a) * r1, y: cy + Math.sin(a) * r1 });
  });
  outer.forEach((c, i) => {
    const a = -Math.PI / 2 + (i / outer.length) * Math.PI * 2 + Math.PI / outer.length;
    positions.set(c.id, { x: cx + Math.cos(a) * r2, y: cy + Math.sin(a) * r2 });
  });
  return { positions };
}

function familyTreeLayout(characters, w, h) {
  const positions = new Map();
  const rows = [
    ['vortigern', 'bran'],
    ['uther', 'igraine', 'gorlois', 'merlin', 'lady-lake', 'taliesin'],
    ['ector', 'arthur', 'guinevere', 'morgause', 'lot', 'morgan', 'urien', 'mark', 'pellinore', 'lot-king', 'pelles', 'pellam'],
    ['kay', 'bedivere', 'lucan', 'lancelot', 'tristan', 'gawain', 'cador',
     'lamorak', 'palamedes', 'safir', 'segwarides', 'yvain', 'geraint',
     'caradoc', 'pelleas', 'nimue', 'bagdemagus', 'accolon', 'meleagant',
     'morholt', 'green-knight', 'balin', 'balan', 'ironside',
     'isolde-ireland', 'isolde-hands', 'enide', 'laudine', 'blanchefleur',
     'lyonesse', 'ettarde', 'elaine-corbenic', 'elaine-astolat', 'elaine-garlot'],
    ['mordred', 'gareth', 'gaheris', 'agravain', 'galahad', 'percival', 'dindrane',
     'bors', 'lionel', 'ector-marais'],
  ];
  const topMargin = 100, bottomMargin = 100;
  const usableH = h - topMargin - bottomMargin;
  rows.forEach((row, ri) => {
    const y = topMargin + (ri / (rows.length - 1)) * usableH;
    const sideMargin = 120;
    const usableW = w - sideMargin * 2;
    row.forEach((id, ci) => {
      const x = sideMargin + (row.length === 1 ? usableW / 2 : (ci / (row.length - 1)) * usableW);
      positions.set(id, { x, y });
    });
  });
  let stashX = 100;
  characters.forEach((c) => {
    if (!positions.has(c.id)) { positions.set(c.id, { x: stashX, y: h - 60 }); stashX += 110; }
  });
  return { positions };
}

function forceWebLayout(characters, w, h) {
  const positions = new Map();
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.42;
  characters.forEach((c, i) => {
    const a = (i * 2.39996323) % (Math.PI * 2);
    const r = R * (0.35 + (i % 7) / 10);
    positions.set(c.id, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  });
  const edges = [];
  characters.forEach((c) => {
    (c.relations || []).forEach((rel) => { if (positions.has(rel.to)) edges.push([c.id, rel.to]); });
  });
  const idealLen = 180, repK = 9000, attK = 0.04, damp = 0.85;
  for (let iter = 0; iter < 220; iter++) {
    const forces = new Map();
    positions.forEach((_, id) => forces.set(id, { x: 0, y: 0 }));
    const ids = [...positions.keys()];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = positions.get(ids[i]), b = positions.get(ids[j]);
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy + 0.01;
        const f = repK / d2, d = Math.sqrt(d2);
        const fx = (dx / d) * f, fy = (dy / d) * f;
        forces.get(ids[i]).x += fx; forces.get(ids[i]).y += fy;
        forces.get(ids[j]).x -= fx; forces.get(ids[j]).y -= fy;
      }
    }
    edges.forEach(([a, b]) => {
      const pa = positions.get(a), pb = positions.get(b);
      const dx = pb.x - pa.x, dy = pb.y - pa.y;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const f = attK * (d - idealLen);
      const fx = (dx / d) * f, fy = (dy / d) * f;
      forces.get(a).x += fx; forces.get(a).y += fy;
      forces.get(b).x -= fx; forces.get(b).y -= fy;
    });
    positions.forEach((p, id) => {
      const f = forces.get(id);
      const dx = cx - p.x, dy = cy - p.y;
      f.x += dx * 0.005; f.y += dy * 0.005;
    });
    positions.forEach((p, id) => {
      const f = forces.get(id);
      const stepCap = 30, fl = Math.sqrt(f.x * f.x + f.y * f.y);
      const s = fl > stepCap ? stepCap / fl : 1;
      p.x += f.x * s * damp; p.y += f.y * s * damp;
      p.x = Math.max(80, Math.min(w - 80, p.x));
      p.y = Math.max(80, Math.min(h - 80, p.y));
    });
  }
  return { positions };
}

function layoutFor(name, characters, w, h, realmData) {
  if (name === 'round-table') return roundTableLayout(characters, w, h, realmData);
  if (name === 'hub')         return hubSpokeLayout(characters, w, h);
  if (name === 'tree')        return familyTreeLayout(characters, w, h);
  if (name === 'web')         return forceWebLayout(characters, w, h);
  return roundTableLayout(characters, w, h, realmData);
}

export function edgesFor(characters, focusId, relFilter) {
  const seen = new Set(), out = [];
  const byId = new Map(characters.map((c) => [c.id, c]));
  characters.forEach((c) => {
    (c.relations || []).forEach((rel) => {
      if (!byId.has(rel.to)) return;
      if (!relFilter[rel.type]) return;
      const key = [c.id, rel.to].sort().join('|') + '|' + rel.type;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ from: c.id, to: rel.to, type: rel.type });
    });
  });
  if (focusId) return out.filter((e) => e.from === focusId || e.to === focusId);
  return out;
}

// ─── TABLE ART ───────────────────────────────────────────────────────────────

function SectorLabels({ cx, cy, sectors }) {
  if (!sectors || sectors.length === 0) return null;
  return (<g className="sector-labels">
    {sectors.map((s, i) => {
      const isLower = Math.sin(s.mid) > 0.05;
      let a0, a1, sweep;
      if (isLower) { a0 = s.mid + s.half; a1 = s.mid - s.half; sweep = 0; }
      else { a0 = s.mid - s.half; a1 = s.mid + s.half; sweep = 1; }
      const x0 = cx + Math.cos(a0) * s.r, y0 = cy + Math.sin(a0) * s.r;
      const x1 = cx + Math.cos(a1) * s.r, y1 = cy + Math.sin(a1) * s.r;
      const d = `M ${x0} ${y0} A ${s.r} ${s.r} 0 0 ${sweep} ${x1} ${y1}`;
      const pid = `sector-arc-${i}`;
      return (
        <g key={i}>
          <defs><path id={pid} d={d} /></defs>
          <path d={d} fill="none" stroke="#8a5a1a" strokeWidth="0.6" strokeDasharray="1 5" opacity="0.55" />
          <text>
            <textPath href={`#${pid}`} startOffset="50%" textAnchor="middle"
                      style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 17, letterSpacing: '0.35em', fill: '#7a4a14' }}>
              {s.label}
            </textPath>
          </text>
        </g>
      );
    })}
  </g>);
}

function TableArt({ table }) {
  if (!table) return null;
  const { cx, cy, outerR, innerR } = table;
  const ringPath =
    `M ${cx - outerR} ${cy} A ${outerR} ${outerR} 0 1 0 ${cx + outerR} ${cy} A ${outerR} ${outerR} 0 1 0 ${cx - outerR} ${cy} Z ` +
    `M ${cx - innerR} ${cy} A ${innerR} ${innerR} 0 1 1 ${cx + innerR} ${cy} A ${innerR} ${innerR} 0 1 1 ${cx - innerR} ${cy} Z`;
  return (<g>
    <defs>
      <filter id="table-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="3" />
        <feColorMatrix values="0 0 0 0 0.15  0 0 0 0 0.08  0 0 0 0 0.03  0 0 0 0.3 0" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
      <filter id="table-ink" x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="3" />
      </filter>
    </defs>
    <path d={ringPath} fill="#6b4520" fillRule="evenodd" />
    <g style={{ mixBlendMode: 'multiply' }}>
      <path d={ringPath} fill="#6b4520" fillRule="evenodd" filter="url(#table-grain)" opacity="0.55" />
    </g>
    <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#2a1810" strokeWidth="2.4" filter="url(#table-ink)" />
    <circle cx={cx} cy={cy} r={outerR - 6} fill="none" stroke="#a8842a" strokeWidth="1.2" opacity="0.85" />
    <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#2a1810" strokeWidth="2.4" filter="url(#table-ink)" />
    <circle cx={cx} cy={cy} r={innerR + 6} fill="none" stroke="#a8842a" strokeWidth="1.2" opacity="0.85" />
    {Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2;
      const x1 = cx + Math.cos(a) * (outerR - 14), y1 = cy + Math.sin(a) * (outerR - 14);
      const x2 = cx + Math.cos(a) * (outerR - 4), y2 = cy + Math.sin(a) * (outerR - 4);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a1810" strokeWidth="1" opacity="0.45" />;
    })}
  </g>);
}

// ─── GRAPH NODE ──────────────────────────────────────────────────────────────

function GraphNode({ character, x, y, onClick, onHover, onLeave, focused, dimmed, hovered, shieldSize }) {
  const w = shieldSize + 28, h = shieldSize * 1.2 + 36;
  return (
    <div
      className={`gn ${focused ? 'gn-focus' : ''} ${dimmed ? 'gn-dim' : ''} ${hovered ? 'gn-hover' : ''}`}
      style={{ position: 'absolute', left: x - w / 2, top: y - shieldSize * 0.6, width: w, height: h }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      data-char-id={character.id}
    >
      <Shield blazon={character.blazon} size={shieldSize} banner={false} highlighted={focused || hovered} dim={dimmed} />
      <div className="gn-banner">
        <span>{character.name.replace(/^(Sir|King|Queen|Lady) /, '')}</span>
      </div>
    </div>
  );
}

// ─── GRAPH ───────────────────────────────────────────────────────────────────

export function Graph({ characters, layout, focusId, hoverId, onFocus, onHover, relFilter, realmData }) {
  const W = 1700, H = 1300;
  const containerRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.55);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);

  const { positions, table, sectorLabels } = useMemo(
    () => layoutFor(layout, characters, W, H, realmData),
    [layout, characters, realmData]
  );

  const activeId = focusId || hoverId;
  const edges = useMemo(() => {
    if (!activeId) return [];
    return edgesFor(characters, activeId, relFilter);
  }, [characters, activeId, relFilter]);

  const connected = useMemo(() => {
    if (!activeId) return null;
    const s = new Set([activeId]);
    edges.forEach((e) => { s.add(e.from); s.add(e.to); });
    return s;
  }, [activeId, edges]);

  const onMouseDown = (e) => {
    if (e.target.closest('.gn')) return;
    setDragging(true);
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  const onMouseMove = (e) => {
    if (!dragging || !dragRef.current) return;
    setPan({ x: dragRef.current.panX + (e.clientX - dragRef.current.x), y: dragRef.current.panY + (e.clientY - dragRef.current.y) });
  };
  const onMouseUp = () => setDragging(false);
  const onWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.25, Math.min(1.8, z * (1 + (-e.deltaY * 0.0012)))));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => { setPan({ x: 0, y: 0 }); }, [layout]);

  const shieldSize = layout === 'tree' ? 48 : 60;

  return (
    <div
      ref={containerRef}
      className="graph-wrap"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
    >
      <div
        className="graph-inner"
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: W, height: H,
          transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <svg className="graph-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {layout === 'round-table' && <TableArt table={table} />}
          <g className="edges">
            {edges.map((e, i) => {
              const a = positions.get(e.from), b = positions.get(e.to);
              if (!a || !b) return null;
              const style = REL_TYPES[e.type];
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
              const dx = b.x - a.x, dy = b.y - a.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const nx = -dy / len, ny = dx / len;
              const bend = Math.min(40, len * 0.08);
              const qx = mx + nx * bend, qy = my + ny * bend;
              return (
                <path key={i}
                  d={`M ${a.x} ${a.y} Q ${qx} ${qy} ${b.x} ${b.y}`}
                  fill="none" stroke={style.color} strokeWidth={style.width}
                  strokeDasharray={style.dash} strokeLinecap="round" opacity="0.85"
                />
              );
            })}
          </g>
          {layout === 'round-table' && <SectorLabels cx={W/2} cy={H/2} sectors={sectorLabels} />}
        </svg>

        {characters.map((c) => {
          const p = positions.get(c.id);
          if (!p) return null;
          return (
            <GraphNode key={c.id} character={c} x={p.x} y={p.y} shieldSize={shieldSize}
              onClick={() => onFocus(c.id)}
              onHover={() => onHover(c.id)}
              onLeave={() => onHover(null)}
              focused={focusId === c.id}
              hovered={hoverId === c.id && focusId !== c.id}
              dimmed={connected && !connected.has(c.id)}
            />
          );
        })}
      </div>

      <div className="zoom-controls">
        <button onClick={() => setZoom((z) => Math.min(1.8, z * 1.15))} title="Zoom in">+</button>
        <button onClick={() => setZoom((z) => Math.max(0.25, z / 1.15))} title="Zoom out">−</button>
        <button onClick={() => { setZoom(0.55); setPan({ x: 0, y: 0 }); }} title="Reset">⊙</button>
      </div>
    </div>
  );
}
