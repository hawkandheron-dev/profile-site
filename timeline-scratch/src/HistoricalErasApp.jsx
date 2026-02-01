/**
 * HistoricalErasApp
 *
 * Timeline of major historical eras + Pinterest-style vision board.
 * Click an era on the timeline to see a feed of curated images
 * from museum and archive APIs.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { VisionBoard } from './components/VisionBoard/VisionBoard.jsx';
import {
  historicalErasTimelineData,
  historicalErasConfig,
  getEraKeywords,
  getEraById
} from './data/historicalErasData.js';
import { fetchImagesForKeywords } from './services/imageApiService.js';
import './App.css';
import './HistoricalErasApp.css';

function HistoricalErasApp() {
  const [selectedEra, setSelectedEra] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchIdRef = useRef(0); // guard against stale fetches

  // Load images for a given era
  const loadImages = useCallback(async (eraId) => {
    const keywords = getEraKeywords(eraId);
    if (keywords.length === 0) return;

    const id = ++fetchIdRef.current;
    setLoading(true);
    setImages([]);

    try {
      const results = await fetchImagesForKeywords(keywords);
      // Only apply if this is still the active fetch
      if (id === fetchIdRef.current) {
        setImages(results);
      }
    } catch (e) {
      console.error('Failed to load images for era:', eraId, e);
    } finally {
      if (id === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Handle period click on the timeline
  const handleItemClick = useCallback((type, item) => {
    if (type === 'period') {
      setSelectedEra(item);
      loadImages(item.id);
    }
  }, [loadImages]);

  // Close the vision board
  const handleClose = useCallback(() => {
    setSelectedEra(null);
    setImages([]);
    fetchIdRef.current++; // cancel in-flight fetches
  }, []);

  // Refresh images (re-randomize keywords)
  const handleRefresh = useCallback(() => {
    if (selectedEra) {
      loadImages(selectedEra.id);
    }
  }, [selectedEra, loadImages]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selectedEra) {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEra, handleClose]);

  return (
    <div className="app historical-eras-app">
      <header className="app-header">
        <div className="header-content">
          <h1>Historical Eras — Vision Board</h1>
          <nav className="tab-nav">
            <a href="../../index.html" className="tab-button">Home</a>
            <a href="./index.html" className="tab-button">Timeline-Scratch</a>
          </nav>
        </div>
      </header>

      {/* Instruction banner (hidden once an era is selected) */}
      {!selectedEra && (
        <div className="eras-instruction">
          Click on any era in the timeline to explore a vision board of historical images
        </div>
      )}

      {/* Timeline panel — compact when vision board is open */}
      <div className={`eras-timeline-panel ${selectedEra ? 'eras-timeline-panel--compact' : ''}`}>
        <Timeline
          data={historicalErasTimelineData}
          config={historicalErasConfig}
          onItemClick={handleItemClick}
        />
      </div>

      {/* Vision board panel */}
      {selectedEra && (
        <div className="eras-visionboard-panel">
          <VisionBoard
            eraId={selectedEra.id}
            eraName={selectedEra.name}
            eraColor={selectedEra.color || '#888'}
            images={images}
            loading={loading}
            onClose={handleClose}
            onRefresh={handleRefresh}
          />
        </div>
      )}
    </div>
  );
}

export default HistoricalErasApp;
