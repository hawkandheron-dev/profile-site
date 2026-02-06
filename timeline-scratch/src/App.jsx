import { useState, useRef, useCallback } from 'react';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { TimelineSearch } from './components/Timeline/components/TimelineSearch.jsx';
import { IconStickerSheet } from './components/IconStickerSheet/IconStickerSheet.jsx';
import { sampleData, sampleConfig } from './data/sampleData.js';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('timeline');
  const timelineRef = useRef(null);

  const handleViewportChange = (viewport) => {
    // Optional: track viewport changes
    console.log('Viewport changed:', viewport);
  };

  const handleItemClick = (type, item) => {
    // Optional: handle item clicks
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
            {activeTab === 'timeline' && (
              <TimelineSearch
                data={sampleData}
                onSelectItem={handleSearchSelect}
                onHighlight={handleSearchHighlight}
                onClearHighlight={handleSearchClearHighlight}
              />
            )}
            {activeTab !== 'timeline' && <h1>Profile Site Components</h1>}
          </div>
          <nav className="tab-nav">
            <button
              className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              Timeline
            </button>
            <button
              className={`tab-button ${activeTab === 'icons' ? 'active' : ''}`}
              onClick={() => setActiveTab('icons')}
            >
              Icon Set
            </button>
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
        {activeTab === 'timeline' && (
          <div className="timeline-wrapper">
            <Timeline
              ref={timelineRef}
              data={sampleData}
              config={sampleConfig}
              onViewportChange={handleViewportChange}
              onItemClick={handleItemClick}
            />
          </div>
        )}
        {activeTab === 'icons' && (
          <IconStickerSheet />
        )}
      </div>
    </div>
  );
}

export default App;
