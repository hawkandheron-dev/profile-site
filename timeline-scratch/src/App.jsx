import { Timeline } from './components/Timeline/Timeline.jsx';
import { sampleData, sampleConfig } from './data/sampleData.js';
import './App.css';

function App() {
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
        <h1>Custom Timeline Component</h1>
        <p className="subtitle">
          A from-scratch timeline with zoom, pan, and interactive features
        </p>
      </header>
      <div className="timeline-wrapper">
        <Timeline
          data={sampleData}
          config={sampleConfig}
          onViewportChange={handleViewportChange}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
}

export default App;
