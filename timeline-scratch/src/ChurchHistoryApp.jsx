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
          <h1>Church History Timeline</h1>
          <nav className="tab-nav">
            <a href="../" className="tab-button">Back to Home</a>
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
