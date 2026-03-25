import { useEffect, useCallback } from 'react';
import { Icon } from '../Timeline/components/Icon.jsx';
import './TourPanel.css';

export function TourPanel({
  scene,
  sceneIndex,
  totalScenes,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}) {
  const isFirst = sceneIndex === 0;
  const isLast = sceneIndex === totalScenes - 1;

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();
      if (isLast) onComplete();
      else onNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (!isFirst) onPrev();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onSkip();
    }
  }, [isFirst, isLast, onNext, onPrev, onSkip, onComplete]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <aside className="tour-panel">
      <div className="tour-panel-header">
        <span className="tour-scene-counter">
          {sceneIndex + 1} of {totalScenes}
        </span>
        <button
          className="tour-skip-btn"
          onClick={onSkip}
          title="Exit tour"
        >
          <Icon name="close" size={14} />
        </button>
      </div>

      <div className="tour-panel-body" key={scene.id}>
        <h3 className="tour-scene-title">{scene.title}</h3>
        <p className="tour-scene-narrative">{scene.narrative}</p>
        {scene.additionalNarrative && (
          <p className="tour-scene-narrative tour-scene-additional">
            {scene.additionalNarrative}
          </p>
        )}
      </div>

      <div className="tour-panel-footer">
        <button
          className="tour-nav-btn"
          onClick={onPrev}
          disabled={isFirst}
          title="Previous (←)"
        >
          <Icon name="arrow-left" size={14} />
          <span>Back</span>
        </button>

        {isLast ? (
          <button
            className="tour-nav-btn tour-nav-primary"
            onClick={onComplete}
            title="Finish tour (Enter)"
          >
            <span>Finish</span>
          </button>
        ) : (
          <button
            className="tour-nav-btn tour-nav-primary"
            onClick={onNext}
            title="Next (→)"
          >
            <span>Next</span>
            <Icon name="arrow-right" size={14} />
          </button>
        )}
      </div>
    </aside>
  );
}
