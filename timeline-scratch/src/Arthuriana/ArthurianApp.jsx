import { useState, useMemo } from 'react';
import { CHARACTERS } from './characters.js';
import { Shield } from './ArthurianHeraldry.jsx';
import { Graph, REL_TYPES } from './ArthurianGraph.jsx';
import { Panel } from './ArthurianPanel.jsx';
import { ArthurianControls } from './ArthurianControls.jsx';
import './ArthurianApp.css';

export function ArthurianApp() {
  const [layout, setLayout]       = useState('round-table');
  const [relFilter, setRelFilter] = useState({
    family:     true,
    marriage:   true,
    mentor:     true,
    fellowship: true,
    rival:      true,
    quest:      true,
  });
  const [focusId, setFocusId]   = useState(null);
  const [hoverId, setHoverId]   = useState(null);
  const [query, setQuery]       = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const handleRelFilter = (key, value) =>
    setRelFilter(f => ({ ...f, [key]: value }));

  const focused = focusId ? CHARACTERS.find((c) => c.id === focusId) : null;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CHARACTERS.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  return (
    <div className="app">
      <div className="stains" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <svg width="34" height="40" viewBox="0 0 100 120">
            <path d="M 8 6 L 92 6 L 92 56 C 92 88 70 108 50 116 C 30 108 8 88 8 56 Z" fill="#a82c2a" stroke="#2a1810" strokeWidth="3"/>
            <path d="M 30 30 L 40 56 L 30 82 M 70 30 L 60 56 L 70 82 M 50 25 L 50 90" stroke="#d4a843" strokeWidth="3" fill="none"/>
          </svg>
          <div>
            <div className="brand-title">Arthuriana</div>
            <div className="brand-sub">An Armorial of the Matter of Britain</div>
          </div>
        </div>

        <div className="search-wrap">
          <input
            type="text"
            className="search"
            placeholder="Seek a knight, lady, or foe…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
          />
          {searchOpen && matches.length > 0 && (
            <div className="search-results">
              {matches.map((c) => (
                <button key={c.id} className="search-result" onMouseDown={(e) => {
                  e.preventDefault();
                  setFocusId(c.id); setQuery(''); setSearchOpen(false);
                }}>
                  <Shield blazon={c.blazon} size={28} banner={false} />
                  <div>
                    <div className="sr-name">{c.name}</div>
                    <div className="sr-title">{c.title}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <a className="studio-link" href="arthuriana-studio.html">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3 L21 3 L21 12 C21 18 17 22 12 23 C7 22 3 18 3 12 Z"/>
            <path d="M9 10 L15 10 M9 14 L15 14"/>
          </svg>
          Heraldic Studio
        </a>
      </header>

      <main className={`stage${focused ? ' has-panel' : ''}`}>
        <Graph
          characters={CHARACTERS}
          layout={layout}
          focusId={focusId}
          hoverId={hoverId}
          onFocus={(id) => setFocusId(id === focusId ? null : id)}
          onHover={(id) => setHoverId(id)}
          relFilter={relFilter}
        />

        <div className="legend">
          <div className="legend-title">Relations</div>
          {Object.entries(REL_TYPES).map(([k, v]) => (
            <div key={k} className={`legend-item${relFilter[k] ? '' : ' off'}`}>
              <svg width="28" height="6">
                <line x1="0" y1="3" x2="28" y2="3"
                  stroke={v.color}
                  strokeWidth={v.width}
                  strokeDasharray={v.dash}
                  strokeLinecap="round" />
              </svg>
              <span>{v.label}</span>
            </div>
          ))}
          <div className="legend-hint">Hover or click any shield</div>
        </div>

        <ArthurianControls
          layout={layout}
          onLayout={setLayout}
          relFilter={relFilter}
          onRelFilter={handleRelFilter}
        />

        {focused && (
          <Panel
            character={focused}
            allCharacters={CHARACTERS}
            onClose={() => setFocusId(null)}
            onNavigate={(id) => setFocusId(id)}
            focusedRelTypes={relFilter}
          />
        )}
      </main>
    </div>
  );
}
