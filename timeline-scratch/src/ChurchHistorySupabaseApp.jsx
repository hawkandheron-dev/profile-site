import { useState, useEffect } from 'react';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { fetchChurchHistoryData } from './data/churchHistorySupabaseAdapter.js';
import { churchHistoryConfig } from './data/churchHistoryData.js';
import './App.css';

function ChurchHistorySupabaseApp() {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchChurchHistoryData();
        if (!cancelled) {
          setTimelineData(result.data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

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
          <h1>Church History Timeline (Supabase)</h1>
          <nav className="tab-nav">
            <a href="../" className="tab-button">Back to Home</a>
            <a href="./church-history.html" className="tab-button">JSON Version</a>
          </nav>
        </div>
      </header>
      <div className="tab-content">
        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
            Loading data from Supabase...
          </div>
        )}
        {error && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>
            Error: {error}
          </div>
        )}
        {!loading && !error && timelineData && (
          <div className="timeline-wrapper">
            <Timeline
              data={timelineData}
              config={churchHistoryConfig}
              onViewportChange={handleViewportChange}
              onItemClick={handleItemClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChurchHistorySupabaseApp;
