import { Timeline } from './components/Timeline/Timeline.jsx';
import { churchHistoryData, churchHistoryConfig } from './data/churchHistoryData.js';
import './App.css';

function ChurchHistoryApp() {
  const handleViewportChange = (viewport) => {
    console.log('Viewport changed:', viewport);
  };

  const handleItemClick = (type, item) => {
    console.log('Item clicked:', type, item);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Church History Timeline (JSON)</h1>
          <nav className="tab-nav">
            <a href="../../index.html" className="tab-button">Home</a>
            <a href="./church-history-supabase.html" className="tab-button">Supabase Version</a>
            <a href="../../church-history-supabase.html" className="tab-button">Data Browser</a>
          </nav>
        </div>
      </header>
      <div className="tab-content">
        <div className="timeline-wrapper">
          <Timeline
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
