import { useState } from 'react';
import { REL_TYPES } from './ArthurianGraph.jsx';

const LAYOUTS = [
  { value: 'round-table', label: 'Round Table' },
  { value: 'hub',         label: 'Hub' },
  { value: 'tree',        label: 'Tree' },
  { value: 'web',         label: 'Web' },
];

export function ArthurianControls({ layout, onLayout, relFilter, onRelFilter }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="arthuriana-controls">
      <div className="ac-header">
        <span className="ac-title">Controls</span>
        <button
          className="ac-toggle"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand controls' : 'Collapse controls'}
        >
          {collapsed ? '▸' : '▾'}
        </button>
      </div>
      {!collapsed && (
        <div className="ac-body">
          <div className="ac-section-label">Layout</div>
          <div className="ac-layout-row">
            {LAYOUTS.map((l) => (
              <button
                key={l.value}
                className={`ac-layout-btn${layout === l.value ? ' on' : ''}`}
                onClick={() => onLayout(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="ac-section-label">Relations</div>
          <div className="ac-rel-list">
            {Object.entries(REL_TYPES).map(([key, def]) => (
              <button
                key={key}
                className={`ac-rel-btn${relFilter[key] ? '' : ' off'}`}
                onClick={() => onRelFilter(key, !relFilter[key])}
              >
                <span className="ac-rel-swatch" style={{ background: def.color }} />
                {def.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
