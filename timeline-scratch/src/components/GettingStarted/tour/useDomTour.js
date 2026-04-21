/**
 * Small hook that drives a DomTour: active flag, step index, completion flag
 * stored in localStorage.
 */
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'getting-started-tour-completed';

export function readTourCompleted() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function useDomTour(totalSteps) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedAt, setCompletedAt] = useState(() => readTourCompleted());

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
  }, []);

  const next = useCallback(() => {
    setStepIndex(i => Math.min(i + 1, totalSteps - 1));
  }, [totalSteps]);

  const prev = useCallback(() => {
    setStepIndex(i => Math.max(i - 1, 0));
  }, []);

  const complete = useCallback(() => {
    const ts = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, ts); } catch { /* ignore */ }
    setCompletedAt(ts);
    setActive(false);
  }, []);

  const skip = useCallback(() => {
    setActive(false);
  }, []);

  // Reset stepIndex whenever the tour is deactivated
  useEffect(() => {
    if (!active) setStepIndex(0);
  }, [active]);

  return { active, stepIndex, completedAt, start, stop, next, prev, complete, skip };
}
