import { useRef, useCallback } from 'react';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { TimelineSearch } from './components/Timeline/components/TimelineSearch.jsx';
import { churchHistoryData, churchHistoryConfig } from './data/churchHistoryData.js';
import './App.css';

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
            <h1 className="site-title"><strong>History of the Christian Church</strong> <span>Lifespans</span></h1>
            <TimelineSearch
              data={churchHistoryData}
              onSelectItem={handleSearchSelect}
              onHighlight={handleSearchHighlight}
              onClearHighlight={handleSearchClearHighlight}
            />
          </div>
          <nav className="tab-nav">
            <a href="../../index.html" className="tab-button">Home</a>
            <a href="./church-history-supabase.html" className="tab-button">Supabase Version</a>
            <a href="../../church-history-supabase.html" className="tab-button">Data Browser</a>
          </nav>
          <div className="header-right">
            <div className="auth-actions">
              <span className="auth-hint">Sign in to save notes</span>
              <button>Sign Up</button>
              <button>Sign In</button>
            </div>
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
