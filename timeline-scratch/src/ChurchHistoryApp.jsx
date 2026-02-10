import { useState, useRef, useCallback, useEffect } from 'react';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { TimelineSearch } from './components/Timeline/components/TimelineSearch.jsx';
import { Icon } from './components/Timeline/components/Icon.jsx';
import { churchHistoryData, churchHistoryConfig } from './data/churchHistoryData.js';
import './App.css';

function NavDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button className="nav-dropdown-toggle" onClick={() => setOpen(!open)} title="Navigation">
        <Icon name="menu" size={18} />
      </button>
      {open && (
        <div className="nav-dropdown-menu">
          <a href="../../index.html" className="nav-dropdown-item" onClick={() => setOpen(false)}>Home</a>
          <a href="./church-history-supabase.html" className="nav-dropdown-item" onClick={() => setOpen(false)}>Supabase Version</a>
          <a href="../../church-history-supabase.html" className="nav-dropdown-item" onClick={() => setOpen(false)}>Data Browser</a>
        </div>
      )}
    </div>
  );
}

function ChurchHistoryApp() {
  const timelineRef = useRef(null);

  const handleViewportChange = (viewport) => {
    console.log('Viewport changed:', viewport);
  };

  const handleItemClick = (type, item) => {
    console.log('Item clicked:', type, item);
  };

  // Search handlers that delegate to Timeline ref
  const handleSearchSelect = useCallback((type, item) => {
    timelineRef.current?.selectItem(type, item);
  }, []);

  const handleSearchHighlight = useCallback((matches, currentIdx, query) => {
    timelineRef.current?.highlight(matches, currentIdx, query);
  }, []);

  const handleSearchClearHighlight = useCallback(() => {
    timelineRef.current?.clearHighlight();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <TimelineSearch
              data={churchHistoryData}
              onSelectItem={handleSearchSelect}
              onHighlight={handleSearchHighlight}
              onClearHighlight={handleSearchClearHighlight}
            />
          </div>
          <div className="header-right">
            <div className="auth-actions">
              <button title="Sign in to save notes, add entries, or make suggestions">Sign Up</button>
              <button title="Sign in to save notes, add entries, or make suggestions">Sign In</button>
            </div>
            <NavDropdown />
          </div>
        </div>
      </header>
      <div className="tab-content">
        <div className="timeline-wrapper">
          <Timeline
            ref={timelineRef}
            data={churchHistoryData}
            config={churchHistoryConfig}
            onViewportChange={handleViewportChange}
            onItemClick={handleItemClick}
          />
        </div>
      </div>
    </div>
  );
}

export default ChurchHistoryApp;
