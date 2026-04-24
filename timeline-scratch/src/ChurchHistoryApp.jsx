import { useState, useRef, useCallback } from 'react';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { TimelineSearch } from './components/Timeline/components/TimelineSearch.jsx';
import { Icon } from './components/Timeline/components/Icon.jsx';
import { SiteNavPanel } from './components/SiteNavPanel.jsx';
import { churchHistoryData, churchHistoryConfig } from './data/churchHistoryData.js';
import './App.css';

function ChurchHistoryApp() {
  const timelineRef = useRef(null);
  const [navOpen, setNavOpen] = useState(false);

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
          <button
            className="btn btn-icon site-nav-toggle"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            title="Navigation"
          >
            <Icon name="menu" size={18} />
          </button>
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
              <button className="btn" title="Sign in to save notes, add entries, or make suggestions">Sign In</button>
              <button className="btn" title="Sign in to save notes, add entries, or make suggestions">Sign Up</button>
            </div>
          </div>
        </div>
      </header>
      <SiteNavPanel
        open={navOpen}
        onClose={() => setNavOpen(false)}
        activeKey="church-history"
      />
      <div className="tab-content">
        <div className="timeline-wrapper">
          <Timeline
            ref={timelineRef}
            data={churchHistoryData}
            config={churchHistoryConfig}
            onViewportChange={handleViewportChange}
            onItemClick={handleItemClick}
            showBackgroundImage
          />
        </div>
      </div>
    </div>
  );
}

export default ChurchHistoryApp;
