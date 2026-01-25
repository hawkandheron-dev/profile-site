import { useState } from 'react';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { IconStickerSheet } from './components/IconStickerSheet/IconStickerSheet.jsx';
import { sampleData, sampleConfig } from './data/sampleData.js';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('timeline');

  const handleViewportChange = (viewport) => {
    // Optional: track viewport changes
    console.log('Viewport changed:', viewport);
  };

  const handleItemClick = (type, item) => {
    // Optional: handle item clicks
    console.log('Item clicked:', type, item);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Profile Site Components</h1>
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
        </div>
      </header>
      <div className="tab-content">
        {activeTab === 'timeline' && (
          <div className="timeline-wrapper">
            <Timeline
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
