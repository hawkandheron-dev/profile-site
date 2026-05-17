// ArthurianHeraldry.jsx — Heraldic shield rendering engine.
import { useMemo } from 'react';

export const TINCTURES = {
  or:      { fill: '#d4a843', stroke: '#7a5a1a', label: 'Or'      },
  argent:  { fill: '#ece2c8', stroke: '#8a7c5c', label: 'Argent'  },
  gules:   { fill: '#a82c2a', stroke: '#5a1414', label: 'Gules'   },
  azure:   { fill: '#2a4b7c', stroke: '#142a4a', label: 'Azure'   },
  sable:   { fill: '#2a1f17', stroke: '#0a0604', label: 'Sable'   },
  vert:    { fill: '#355e3b', stroke: '#1a2f1d', label: 'Vert'    },
  purpure: { fill: '#6b3a6b', stroke: '#3a1f3a', label: 'Purpure' },
  murrey:  { fill: '#6b2c4a', stroke: '#3a1424', label: 'Murrey'  },
  sanguine:{ fill: '#6b1a1a', stroke: '#3a0a0a', label: 'Sanguine'},
  tenne:   { fill: '#a85a1f', stroke: '#5a2a0a', label: 'Tenné'   },
};

const tFill   = (t) => (TINCTURES[t] || TINCTURES.argent).fill;
const tStroke = (t) => (TINCTURES[t] || TINCTURES.argent).stroke;

const SHIELD_PATH = 'M 8 6 L 92 6 L 92 56 C 92 88 70 108 50 116 C 30 108 8 88 8 56 Z';

function Field({ field, id }) {
  if (typeof field === 'string') {
    return <rect x="0" y="0" width="100" height="120" fill={tFill(field)} />;
  }
  const { division, pattern, tinctures = ['argent', 'azure'] } = field;
  const [a, b] = tinctures;

  if (division) {
    if (division === 'per pale') return (<><rect x="0" y="0" width="50" height="120" fill={tFill(a)} /><rect x="50" y="0" width="50" height="120" fill={tFill(b)} /></>);
    if (division === 'per fess') return (<><rect x="0" y="0" width="100" height="55" fill={tFill(a)} /><rect x="0" y="55" width="100" height="65" fill={tFill(b)} /></>);
    if (division === 'per bend') return (<><rect x="0" y="0" width="100" height="120" fill={tFill(a)} /><path d="M 0 120 L 0 0 L 100 120 Z" fill={tFill(b)} /></>);
    if (division === 'per bend sinister') return (<><rect x="0" y="0" width="100" height="120" fill={tFill(a)} /><path d="M 100 120 L 100 0 L 0 120 Z" fill={tFill(b)} /></>);
    if (division === 'per chevron') return (<><rect x="0" y="0" width="100" height="120" fill={tFill(a)} /><path d="M 0 120 L 50 60 L 100 120 Z" fill={tFill(b)} /></>);
    if (division === 'per saltire') return (<><rect x="0" y="0" width="100" height="120" fill={tFill(a)} /><path d="M 50 55 L 100 0 L 100 120 Z" fill={tFill(b)} /><path d="M 50 55 L 0 0 L 0 120 Z" fill={tFill(b)} /></>);
    if (division === 'quarterly') return (<><rect x="0" y="0" width="50" height="55" fill={tFill(a)} /><rect x="50" y="0" width="50" height="55" fill={tFill(b)} /><rect x="0" y="55" width="50" height="65" fill={tFill(b)} /><rect x="50" y="55" width="50" height="65" fill={tFill(a)} /></>);
  }

  if (pattern) return <PatternField pattern={pattern} a={a} b={b} id={id} />;
  return <rect x="0" y="0" width="100" height="120" fill={tFill(a)} />;
}

function PatternField({ pattern, a, b, id }) {
  const pid = `pat-${id}-${pattern}`;
  let def;
  if (pattern === 'chequy') {
    def = (<pattern id={pid} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="10" height="10" fill={tFill(a)} />
      <rect x="10" y="10" width="10" height="10" fill={tFill(a)} />
      <rect x="10" y="0" width="10" height="10" fill={tFill(b)} />
      <rect x="0" y="10" width="10" height="10" fill={tFill(b)} />
    </pattern>);
  } else if (pattern === 'lozengy') {
    def = (<pattern id={pid} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill={tFill(a)} />
      <path d="M 10 0 L 20 10 L 10 20 L 0 10 Z" fill={tFill(b)} />
    </pattern>);
  } else if (pattern === 'bendy') {
    def = (<pattern id={pid} x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="14" height="28" fill={tFill(a)} />
      <rect x="14" width="14" height="28" fill={tFill(b)} />
    </pattern>);
  } else if (pattern === 'paly') {
    def = (<pattern id={pid} x="0" y="0" width="20" height="120" patternUnits="userSpaceOnUse">
      <rect width="10" height="120" fill={tFill(a)} />
      <rect x="10" width="10" height="120" fill={tFill(b)} />
    </pattern>);
  } else if (pattern === 'barry') {
    def = (<pattern id={pid} x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
      <rect width="100" height="10" fill={tFill(a)} />
      <rect y="10" width="100" height="10" fill={tFill(b)} />
    </pattern>);
  } else if (pattern === 'ermine') {
    def = (<pattern id={pid} x="0" y="0" width="24" height="30" patternUnits="userSpaceOnUse">
      <rect width="24" height="30" fill={tFill(a)} />
      <g fill={tFill(b)}>
        <path d="M 12 8 q -2 -4 -4 -1 q 4 0 4 4 q 0 -4 4 -4 q -2 -3 -4 1 Z" />
        <circle cx="9" cy="13" r="0.8" /><circle cx="12" cy="13" r="0.8" /><circle cx="15" cy="13" r="0.8" />
      </g>
    </pattern>);
  } else if (pattern === 'vair') {
    def = (<pattern id={pid} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <rect width="24" height="24" fill={tFill(a)} />
      <path d="M 0 12 q 6 -10 12 0 q 6 10 12 0 L 24 0 L 0 0 Z" fill={tFill(b)} />
    </pattern>);
  } else {
    return <rect x="0" y="0" width="100" height="120" fill={tFill(a)} />;
  }
  return (<><defs>{def}</defs><rect x="0" y="0" width="100" height="120" fill={`url(#${pid})`} /></>);
}

function Ordinary({ ord }) {
  if (!ord) return null;
  const f = tFill(ord.tincture), s = tStroke(ord.tincture), sw = 0.6;
  switch (ord.type) {
    case 'chief':   return <rect x="0" y="0" width="100" height="28" fill={f} stroke={s} strokeWidth={sw} />;
    case 'pale':    return <rect x="36" y="0" width="28" height="120" fill={f} stroke={s} strokeWidth={sw} />;
    case 'fess':    return <rect x="0" y="46" width="100" height="22" fill={f} stroke={s} strokeWidth={sw} />;
    case 'bend':    return <path d="M -10 30 L 70 -10 L 90 10 L 10 50 Z" fill={f} stroke={s} strokeWidth={sw} />;
    case 'bend sinister': return <path d="M 110 30 L 30 -10 L 10 10 L 90 50 Z" fill={f} stroke={s} strokeWidth={sw} />;
    case 'cross':   return (<><rect x="36" y="0" width="28" height="120" fill={f} stroke={s} strokeWidth={sw} /><rect x="0" y="46" width="100" height="22" fill={f} stroke={s} strokeWidth={sw} /></>);
    case 'saltire': return (<><path d="M -10 -10 L 10 -10 L 110 110 L 90 110 Z" fill={f} stroke={s} strokeWidth={sw} /><path d="M 110 -10 L 90 -10 L -10 110 L 10 110 Z" fill={f} stroke={s} strokeWidth={sw} /></>);
    case 'chevron': return <path d="M 50 30 L 96 80 L 88 90 L 50 50 L 12 90 L 4 80 Z" fill={f} stroke={s} strokeWidth={sw} />;
    case 'bordure': return <path d={SHIELD_PATH} fill="none" stroke={f} strokeWidth="10" />;
    case 'pile':    return <path d="M 20 6 L 80 6 L 50 80 Z" fill={f} stroke={s} strokeWidth={sw} />;
    default:        return null;
  }
}

export const CHARGES = {
  lion: (t, attitude = 'rampant') => {
    const f = tFill(t), s = tStroke(t);
    if (attitude === 'passant') {
      return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
        <path d="M -18 4 C -18 0 -16 -2 -13 -3 L -10 -8 C -8 -10 -5 -10 -4 -8 L -2 -6 C 0 -8 4 -8 6 -6 L 9 -8 C 12 -10 14 -7 13 -4 L 16 -2 C 18 0 18 4 16 6 L 14 8 L 12 6 L 10 10 L 8 8 L 4 10 L 2 8 L -4 10 L -6 8 L -10 10 L -12 8 L -14 10 L -16 8 Z" />
        <circle cx="13" cy="-4" r="1.2" fill={s} stroke="none" />
        <path d="M -18 4 q -3 -2 -5 1 q 3 1 5 1" />
      </g>);
    }
    return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
      <path d="M -2 16 L -10 16 L -10 10 C -10 4 -8 0 -5 -2 L -6 -8 C -7 -12 -3 -14 -1 -10 L 1 -12 C 4 -16 8 -14 8 -10 L 7 -4 L 11 -8 C 14 -10 16 -7 14 -4 L 10 0 L 14 2 L 18 6 L 16 8 L 12 6 L 10 10 L 12 14 L 10 16 L 6 14 L 4 16 Z" />
      <circle cx="3" cy="-9" r="0.9" fill={s} stroke="none" />
      <path d="M -10 16 q -5 0 -7 4 q 5 -1 8 -2" />
    </g>);
  },
  dragon: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
      <path d="M -16 12 C -18 8 -14 4 -10 6 L -8 2 C -6 -2 -2 -4 2 -2 L 4 -6 C 6 -10 12 -10 12 -6 L 14 -10 L 16 -6 L 14 -4 L 12 -2 L 14 2 L 12 6 L 8 8 L 4 6 L 2 10 L 6 14 L 4 16 L -2 12 L -6 14 L -8 10 L -12 12 Z" />
      <path d="M -8 2 q -2 -4 -6 -2 q 1 2 3 4" fill={f}/>
      <path d="M 4 -6 q 2 -4 6 -2" fill="none"/>
      <circle cx="12" cy="-6" r="0.8" fill={s} stroke="none"/>
      <path d="M 14 -6 q 4 -1 5 -4" fill="none" stroke={s}/>
    </g>);
  },
  eagle: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
      <path d="M 0 -12 C -2 -14 -6 -14 -6 -10 L -10 -8 L -16 -2 L -14 2 L -10 0 L -8 4 L -12 8 L -10 12 L -4 10 L 0 14 L 4 10 L 10 12 L 12 8 L 8 4 L 10 0 L 14 2 L 16 -2 L 10 -8 L 6 -10 C 6 -14 2 -14 0 -12 Z" />
      <path d="M -2 -10 L 2 -10" stroke={s}/><path d="M 0 -8 L 0 12" stroke={s} fill="none" strokeWidth="0.3"/>
    </g>);
  },
  griffin: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
      <path d="M -2 16 L -10 16 L -10 8 C -10 4 -8 0 -4 -2 L -8 -4 L -10 -10 L -6 -10 L -4 -12 L 0 -10 L 4 -14 L 6 -10 L 4 -6 L 10 -8 C 14 -10 16 -6 14 -3 L 10 0 L 14 2 L 18 6 L 16 9 L 12 7 L 10 10 L 12 14 L 10 16 L 6 14 L 4 16 Z" />
      <circle cx="0" cy="-10" r="0.8" fill={s} stroke="none"/>
      <path d="M -4 -12 q -2 -4 -6 -3" fill="none" stroke={s}/>
    </g>);
  },
  unicorn: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
      <path d="M -2 16 L -10 16 L -10 10 C -10 4 -8 0 -4 -2 L -6 -6 C -7 -10 -2 -12 0 -10 L 4 -16 L 6 -10 C 10 -10 12 -6 10 -3 L 14 0 L 16 4 L 12 4 L 10 8 L 12 14 L 10 16 L 6 14 L 4 16 Z" />
      <path d="M 4 -16 L 7 -22" stroke={s} strokeWidth="0.8" fill="none"/>
      <circle cx="4" cy="-9" r="0.7" fill={s} stroke="none"/>
    </g>);
  },
  boar: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -16 6 L -18 2 L -14 -2 L -10 -4 L -4 -6 L 4 -6 L 10 -4 L 14 0 L 16 4 L 14 8 L 12 6 L 8 8 L 4 6 L -4 8 L -8 6 L -12 8 Z"/>
      <path d="M 14 0 L 18 -2 L 18 2 Z" fill={tFill('argent')}/>
      <circle cx="12" cy="2" r="0.7" fill={s} stroke="none"/>
    </g>);
  },
  stag: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -10 14 L -10 4 C -10 0 -6 -2 -2 -2 L 0 -6 L 4 -8 L 6 -4 L 10 -4 L 12 0 L 10 4 L 10 14 L 8 14 L 8 6 L -8 6 L -8 14 Z"/>
      <path d="M 4 -8 L 2 -14 M 4 -8 L 7 -14 M 2 -14 L -1 -13 M 7 -14 L 9 -12" stroke={s} fill="none"/>
    </g>);
  },
  bear: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <circle cx="0" cy="0" r="10"/>
      <circle cx="-7" cy="-8" r="3"/><circle cx="7" cy="-8" r="3"/>
      <circle cx="-3" cy="-2" r="0.7" fill={s} stroke="none"/>
      <circle cx="3" cy="-2" r="0.7" fill={s} stroke="none"/>
    </g>);
  },
  serpent: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill="none" stroke={s} strokeWidth="3" strokeLinecap="round">
      <path d="M -14 10 q 6 -10 0 -14 q -6 -4 0 -10" stroke={f}/>
      <circle cx="-14" cy="-14" r="2" fill={f} stroke={s} strokeWidth="0.5"/>
    </g>);
  },
  fish: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -14 0 C -14 -6 -2 -8 6 -4 L 14 -8 L 14 8 L 6 4 C -2 8 -14 6 -14 0 Z"/>
      <circle cx="2" cy="-2" r="0.7" fill={s} stroke="none"/>
    </g>);
  },
  toad: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <ellipse cx="0" cy="2" rx="14" ry="9"/>
      <circle cx="-6" cy="-5" r="3"/><circle cx="6" cy="-5" r="3"/>
      <circle cx="-6" cy="-5" r="1" fill={s} stroke="none"/>
      <circle cx="6" cy="-5" r="1" fill={s} stroke="none"/>
    </g>);
  },
  rose: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      {[0,72,144,216,288].map(a => <ellipse key={a} cx="0" cy="-7" rx="4" ry="6" transform={`rotate(${a})`}/>)}
      <circle r="3" fill={tFill('or')} stroke={s} strokeWidth="0.4"/>
    </g>);
  },
  'fleur-de-lis': (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
      <path d="M 0 -12 C 4 -8 6 -2 4 2 L 8 -2 C 12 2 10 8 4 6 L 6 12 L -6 12 L -4 6 C -10 8 -12 2 -8 -2 L -4 2 C -6 -2 -4 -8 0 -12 Z"/>
      <path d="M -8 4 L 8 4" stroke={s} strokeWidth="1.2"/>
    </g>);
  },
  cross: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -3 -12 L 3 -12 L 3 -3 L 12 -3 L 12 3 L 3 3 L 3 12 L -3 12 L -3 3 L -12 3 L -12 -3 L -3 -3 Z"/>
    </g>);
  },
  'cross-patty': (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -4 -12 L 4 -12 L 6 -6 L 12 -4 L 12 4 L 6 6 L 4 12 L -4 12 L -6 6 L -12 4 L -12 -4 L -6 -6 Z"/>
    </g>);
  },
  mullet: (t) => {
    const f = tFill(t), s = tStroke(t);
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 4 : 10;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      pts.push(`${Math.cos(a) * r},${Math.sin(a) * r}`);
    }
    return <polygon points={pts.join(' ')} fill={f} stroke={s} strokeWidth="0.5"/>;
  },
  crescent: (t) => {
    const f = tFill(t), s = tStroke(t);
    return <path d="M 0 -10 A 10 10 0 1 0 0 10 A 7 10 0 1 1 0 -10 Z" fill={f} stroke={s} strokeWidth="0.5"/>;
  },
  sun: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <circle r="6"/>
      {[0,45,90,135,180,225,270,315].map(a => <path key={a} d="M 0 -8 L -1.5 -12 L 1.5 -12 Z" transform={`rotate(${a})`}/>)}
    </g>);
  },
  moon: (t) => {
    const f = tFill(t), s = tStroke(t);
    return <circle r="9" fill={f} stroke={s} strokeWidth="0.5"/>;
  },
  crown: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
      <path d="M -12 6 L -10 -8 L -4 -2 L 0 -10 L 4 -2 L 10 -8 L 12 6 Z"/>
      <circle cx="-10" cy="-8" r="1.5" fill={tFill('gules')} stroke={s} strokeWidth="0.3"/>
      <circle cx="0" cy="-10" r="1.5" fill={tFill('gules')} stroke={s} strokeWidth="0.3"/>
      <circle cx="10" cy="-8" r="1.5" fill={tFill('gules')} stroke={s} strokeWidth="0.3"/>
    </g>);
  },
  sword: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
      <path d="M -1.5 -14 L 1.5 -14 L 1.5 8 L -1.5 8 Z"/>
      <rect x="-6" y="8" width="12" height="2"/>
      <rect x="-1" y="10" width="2" height="4"/>
      <circle cx="0" cy="15" r="1.5"/>
    </g>);
  },
  arrow: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
      <path d="M 0 -14 L 4 -8 L 1 -8 L 1 12 L -1 12 L -1 -8 L -4 -8 Z"/>
      <path d="M -3 12 L 3 12 L 4 16 L -4 16 Z" fill={s}/>
    </g>);
  },
  tower: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -10 -8 L -10 -12 L -6 -12 L -6 -10 L -2 -10 L -2 -12 L 2 -12 L 2 -10 L 6 -10 L 6 -12 L 10 -12 L 10 -8 L 10 12 L -10 12 Z"/>
      <rect x="-2" y="0" width="4" height="10" fill={s}/>
      <rect x="-2" y="-6" width="4" height="3" fill={s}/>
    </g>);
  },
  castle: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -14 -4 L -14 -8 L -10 -8 L -10 -6 L -6 -6 L -6 -8 L -2 -8 L -2 -6 L 2 -6 L 2 -8 L 6 -8 L 6 -6 L 10 -6 L 10 -8 L 14 -8 L 14 -4 L 14 12 L -14 12 Z"/>
      <path d="M -4 4 L -4 12 L 4 12 L 4 4 Z" fill={s}/>
    </g>);
  },
  key: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <circle cx="0" cy="-8" r="5" fill="none" stroke={s} strokeWidth="2"/>
      <rect x="-1" y="-3" width="2" height="14"/>
      <rect x="-1" y="6" width="5" height="2"/>
      <rect x="-1" y="10" width="4" height="2"/>
    </g>);
  },
  harp: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill="none" stroke={s} strokeWidth="0.5">
      <path d="M -8 -10 Q 8 -12 10 12 L -8 12 Z" fill={f}/>
      <path d="M -6 -8 L -6 10 M -3 -8 L -3 10 M 0 -8 L 0 10 M 3 -7 L 3 10 M 6 -4 L 6 10" stroke={tStroke(t)} strokeWidth="0.4"/>
    </g>);
  },
  hand: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5" strokeLinejoin="round">
      <path d="M -6 14 L -6 4 L -8 0 L -8 -8 L -6 -8 L -6 -2 L -4 -2 L -4 -12 L -2 -12 L -2 -2 L 0 -2 L 0 -14 L 2 -14 L 2 -2 L 4 -2 L 4 -10 L 6 -10 L 6 0 L 8 -2 L 8 4 L 6 14 Z"/>
    </g>);
  },
  arm: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -14 -10 L -8 -10 L 2 -2 L 8 -2 L 10 0 L 8 2 L 0 2 L -14 -6 Z"/>
      <path d="M -14 -10 L -14 -6 L -16 -2 L -14 0 L -10 -2 L -8 -10 Z" fill={tFill('argent')}/>
    </g>);
  },
  raven: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -10 -2 C -12 -8 -4 -10 0 -8 L 4 -10 L 6 -6 L 12 -4 L 8 0 L 10 6 L 4 4 L 0 8 L -4 6 L -8 8 L -6 2 Z"/>
      <path d="M 12 -4 L 16 -6 L 12 -2 Z" fill={s}/>
    </g>);
  },
  chalice: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -8 -10 L 8 -10 L 6 -4 C 6 2 -6 2 -6 -4 Z"/>
      <rect x="-1" y="-4" width="2" height="10"/>
      <rect x="-8" y="6" width="16" height="3"/>
    </g>);
  },
  horseshoe: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill="none" stroke={f} strokeWidth="3.5" strokeLinecap="round">
      <path d="M -8 10 Q -10 -10 0 -10 Q 10 -10 8 10"/>
    </g>);
  },
  pentangle: (t) => {
    const f = tFill(t), s = tStroke(t);
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      pts.push(`${Math.cos(a) * 13},${Math.sin(a) * 13}`);
    }
    return <polygon points={pts.join(' ')} fill="none" stroke={f} strokeWidth="2" strokeLinejoin="miter"/>;
  },
  trefoil: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <circle cx="0" cy="-7" r="5"/>
      <circle cx="-6" cy="3" r="5"/>
      <circle cx="6" cy="3" r="5"/>
      <rect x="-0.5" y="2" width="1" height="12"/>
    </g>);
  },
  oak: (t) => {
    const f = tFill(t), s = tStroke(t);
    return (<g fill={f} stroke={s} strokeWidth="0.5">
      <path d="M -8 -6 Q -10 0 -8 6 Q -4 8 0 6 Q 4 8 8 6 Q 10 0 8 -6 Q 4 -10 0 -6 Q -4 -10 -8 -6 Z"/>
      <rect x="-0.5" y="6" width="1" height="6"/>
    </g>);
  },
  pall: (t) => {
    const f = tFill(t), s = tStroke(t);
    return <path d="M -12 -12 L -2 -2 L -2 12 L 2 12 L 2 -2 L 12 -12 L 8 -16 L 0 -8 L -8 -16 Z" fill={f} stroke={s} strokeWidth="0.5"/>;
  },
  fess: (t) => {
    const f = tFill(t), s = tStroke(t);
    return <rect x="-14" y="-4" width="28" height="8" fill={f} stroke={s} strokeWidth="0.5"/>;
  },
};

export const CHARGE_LIST = Object.keys(CHARGES);

function chargePositions(count, arrangement) {
  if (count === 1 || !count) return [{ x: 50, y: 55, scale: 2.0 }];
  if (arrangement === 'in chief') {
    if (count === 3) return [{ x: 30, y: 18, scale: 0.9 }, { x: 50, y: 18, scale: 0.9 }, { x: 70, y: 18, scale: 0.9 }];
    if (count === 2) return [{ x: 35, y: 18, scale: 0.9 }, { x: 65, y: 18, scale: 0.9 }];
  }
  if (arrangement === 'in bend') {
    if (count === 3) return [{ x: 25, y: 25, scale: 1.0 }, { x: 50, y: 50, scale: 1.0 }, { x: 75, y: 75, scale: 1.0 }];
  }
  if (arrangement === 'in pale') {
    if (count === 3) return [{ x: 50, y: 22, scale: 1.0 }, { x: 50, y: 55, scale: 1.0 }, { x: 50, y: 88, scale: 1.0 }];
    if (count === 2) return [{ x: 50, y: 30, scale: 1.1 }, { x: 50, y: 75, scale: 1.1 }];
  }
  if (arrangement === 'in fess') {
    if (count === 3) return [{ x: 24, y: 55, scale: 1.0 }, { x: 50, y: 55, scale: 1.0 }, { x: 76, y: 55, scale: 1.0 }];
  }
  if (arrangement === 'in saltire' && count === 2) {
    return [{ x: 50, y: 55, scale: 1.5, rotate: -45 }, { x: 50, y: 55, scale: 1.5, rotate: 45 }];
  }
  if (count === 3) return [{ x: 30, y: 30, scale: 1.0 }, { x: 70, y: 30, scale: 1.0 }, { x: 50, y: 78, scale: 1.0 }];
  if (count === 2) return [{ x: 35, y: 45, scale: 1.3 }, { x: 65, y: 45, scale: 1.3 }];
  if (count === 4) return [{ x: 30, y: 28, scale: 0.85 }, { x: 70, y: 28, scale: 0.85 }, { x: 30, y: 75, scale: 0.85 }, { x: 70, y: 75, scale: 0.85 }];
  return Array.from({ length: count }, (_, i) => ({ x: 22 + (i % 3) * 28, y: 25 + Math.floor(i / 3) * 25, scale: 0.7 }));
}

function ChargesLayer({ charges }) {
  if (!charges || charges.length === 0) return null;
  return (<>
    {charges.flatMap((ch, i) => {
      const fn = CHARGES[ch.device];
      if (!fn) return [];
      const positions = chargePositions(ch.count || 1, ch.arrangement);
      return positions.map((p, j) => (
        <g key={`${i}-${j}`} transform={`translate(${p.x} ${p.y}) scale(${p.scale}) ${p.rotate ? `rotate(${p.rotate})` : ''} ${ch.flip ? 'scale(-1 1)' : ''}`}>
          {fn(ch.tincture, ch.attitude)}
        </g>
      ));
    })}
  </>);
}

let __shieldUid = 0;

export function Shield({ blazon, size = 96, label, banner = true, dim = false, highlighted = false, frame = true }) {
  const uid = useMemo(() => ++__shieldUid, []);
  const clipId = `shield-clip-${uid}`;
  const grainId = `shield-grain-${uid}`;
  const inkId = `shield-ink-${uid}`;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', filter: dim ? 'grayscale(0.7) opacity(0.35)' : 'none', transition: 'filter 240ms ease' }}>
      <svg viewBox="0 0 100 120" width={size} height={size * 1.2} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id={clipId}><path d={SHIELD_PATH} /></clipPath>
          <filter id={grainId}>
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed={uid % 17} />
            <feColorMatrix values="0 0 0 0 0.10  0 0 0 0 0.06  0 0 0 0 0.02  0 0 0 0.14 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <filter id={inkId} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed={uid % 11} />
            <feDisplacementMap in="SourceGraphic" scale="0.9" />
          </filter>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <Field field={blazon.field} id={uid} />
          <Ordinary ord={blazon.ordinary} />
          <ChargesLayer charges={blazon.charges} />
          <rect x="0" y="0" width="100" height="120" filter={`url(#${grainId})`} opacity="0.55" />
        </g>
        {frame && <path d={SHIELD_PATH} fill="none" stroke="#2a1810" strokeWidth="2" strokeLinejoin="round" filter={`url(#${inkId})`} />}
        {highlighted && <path d={SHIELD_PATH} fill="none" stroke="#a82c2a" strokeWidth="2.6" strokeOpacity="0.95" />}
      </svg>
      {banner && label && (
        <div className="shield-banner" style={{ marginTop: 2 }}><span>{label}</span></div>
      )}
    </div>
  );
}
