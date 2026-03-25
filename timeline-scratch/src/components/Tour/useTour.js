/**
 * Hook for managing the Getting Started Tour.
 *
 * Handles scene progression, data filtering, viewport auto-framing,
 * and the final build-out animation.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { TOUR_SCENES, TOUR_PERSON_IDS } from './tourScenes.js';
import { getYear } from '../Timeline/utils/dateUtils.js';

const LS_KEY = 'windhover-timeline-tour-completed';

/**
 * @param {Object}  opts
 * @param {Object}  opts.fullData       – the complete timeline data { people, points, periods }
 * @param {Object}  opts.timelineRef    – React ref to Timeline (imperative handle)
 * @returns tour state and controls
 */
export function useTour({ fullData, timelineRef }) {
  const [tourActive, setTourActive] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  // Build-out animation state: list of IDs revealed so far during scene 15
  const [buildOutIds, setBuildOutIds] = useState(null);
  const buildOutTimerRef = useRef(null);

  // On mount, check localStorage to decide whether to show the welcome dialog
  useEffect(() => {
    try {
      if (!localStorage.getItem(LS_KEY)) {
        setShowWelcome(true);
      }
    } catch {
      // localStorage unavailable — show welcome anyway
      setShowWelcome(true);
    }
  }, []);

  const currentScene = TOUR_SCENES[sceneIndex];

  // ── Auto-frame viewport when scene changes ───────────────────────────
  const frameVisiblePeople = useCallback((personIds) => {
    if (!timelineRef?.current || !fullData?.people || !personIds || personIds.length === 0) return;

    const people = fullData.people.filter(p => personIds.includes(p.id));
    if (people.length === 0) return;

    let minYear = Infinity;
    let maxYear = -Infinity;
    for (const p of people) {
      const s = getYear(p.startDate);
      const e = getYear(p.endDate);
      if (s < minYear) minYear = s;
      if (e > maxYear) maxYear = e;
    }

    const range = maxYear - minYear;
    const padding = Math.max(range * 0.15, 20);
    const framedMin = minYear - padding;
    const framedMax = maxYear + padding;

    const ref = timelineRef.current;
    const info = ref.getViewportInfo?.();
    if (!info) return;

    const newYPP = (framedMax - framedMin) / info.width;
    ref.setYearsPerPixel?.(newYPP);

    // jumpToYear centers on the given year, so compute the center
    const center = (framedMin + framedMax) / 2;
    ref.jumpToYear?.(center);
  }, [fullData, timelineRef]);

  // Frame viewport whenever scene changes (but not during build-out)
  useEffect(() => {
    if (!tourActive || !currentScene) return;
    if (currentScene.isBuildOut) return;

    // Small delay so Timeline has re-rendered with new data
    const id = requestAnimationFrame(() => {
      frameVisiblePeople(currentScene.personIds);
    });
    return () => cancelAnimationFrame(id);
  }, [tourActive, sceneIndex, currentScene, frameVisiblePeople]);

  // ── Build-out animation (scene 15) ───────────────────────────────────
  useEffect(() => {
    if (!tourActive || !currentScene?.isBuildOut || !fullData) return;

    // Gather all IDs not yet shown, grouped by type
    const remainingPeople = (fullData.people || [])
      .filter(p => !TOUR_PERSON_IDS.has(p.id))
      .map(p => p.id);

    const allPointIds = (fullData.points || []).map(p => p.id);
    const allPeriodIds = (fullData.periods || []).map(p => p.id);

    // Combine into batches: people first, then periods, then points
    const batches = [];
    const BATCH_SIZE = 8;
    for (let i = 0; i < remainingPeople.length; i += BATCH_SIZE) {
      batches.push({ type: 'people', ids: remainingPeople.slice(i, i + BATCH_SIZE) });
    }
    batches.push({ type: 'periods', ids: allPeriodIds });
    for (let i = 0; i < allPointIds.length; i += BATCH_SIZE) {
      batches.push({ type: 'points', ids: allPointIds.slice(i, i + BATCH_SIZE) });
    }

    // Start with tour people already visible
    let revealedPeople = new Set(TOUR_PERSON_IDS);
    let revealedPeriods = new Set();
    let revealedPoints = new Set();
    let batchIdx = 0;

    setBuildOutIds({
      people: new Set(revealedPeople),
      periods: new Set(),
      points: new Set(),
    });

    const interval = setInterval(() => {
      if (batchIdx >= batches.length) {
        clearInterval(interval);
        // Final: show everything
        setBuildOutIds(null); // null = no filter, show all
        return;
      }

      const batch = batches[batchIdx];
      if (batch.type === 'people') {
        batch.ids.forEach(id => revealedPeople.add(id));
      } else if (batch.type === 'periods') {
        batch.ids.forEach(id => revealedPeriods.add(id));
      } else if (batch.type === 'points') {
        batch.ids.forEach(id => revealedPoints.add(id));
      }

      setBuildOutIds({
        people: new Set(revealedPeople),
        periods: new Set(revealedPeriods),
        points: new Set(revealedPoints),
      });

      batchIdx++;
    }, 120);

    buildOutTimerRef.current = interval;
    return () => clearInterval(interval);
  }, [tourActive, sceneIndex, currentScene, fullData]);

  // ── Compute filtered data for the timeline ───────────────────────────
  const tourData = useMemo(() => {
    if (!tourActive || !fullData) return fullData;

    // Build-out scene with animation in progress
    if (currentScene?.isBuildOut && buildOutIds) {
      return {
        people: (fullData.people || []).filter(p => buildOutIds.people.has(p.id)),
        periods: (fullData.periods || []).filter(p => buildOutIds.periods.has(p.id)),
        points: (fullData.points || []).filter(p => buildOutIds.points.has(p.id)),
      };
    }

    // Build-out complete (buildOutIds is null) — show everything
    if (currentScene?.isBuildOut && buildOutIds === null) {
      return fullData;
    }

    // Normal tour scene — filter to only the scene's people, hide periods/points
    const visibleIds = new Set(currentScene?.personIds || []);
    return {
      people: (fullData.people || []).filter(p => visibleIds.has(p.id)),
      periods: [],
      points: [],
    };
  }, [tourActive, fullData, currentScene, buildOutIds]);

  // ── Controls ─────────────────────────────────────────────────────────
  const startTour = useCallback(() => {
    setShowWelcome(false);
    setSceneIndex(0);
    setBuildOutIds(null);
    setTourActive(true);
  }, []);

  const nextScene = useCallback(() => {
    if (sceneIndex < TOUR_SCENES.length - 1) {
      setSceneIndex(i => i + 1);
    }
  }, [sceneIndex]);

  const prevScene = useCallback(() => {
    if (sceneIndex > 0) {
      // If going back from build-out, cancel animation
      if (currentScene?.isBuildOut && buildOutTimerRef.current) {
        clearInterval(buildOutTimerRef.current);
        setBuildOutIds(null);
      }
      setSceneIndex(i => i - 1);
    }
  }, [sceneIndex, currentScene]);

  const completeTour = useCallback(() => {
    if (buildOutTimerRef.current) {
      clearInterval(buildOutTimerRef.current);
    }
    setBuildOutIds(null);
    setTourActive(false);
    try {
      localStorage.setItem(LS_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const skipTour = useCallback(() => {
    if (buildOutTimerRef.current) {
      clearInterval(buildOutTimerRef.current);
    }
    setBuildOutIds(null);
    setTourActive(false);
    setShowWelcome(false);
    try {
      localStorage.setItem(LS_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    try {
      localStorage.setItem(LS_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  return {
    // State
    tourActive,
    showWelcome,
    currentScene,
    sceneIndex,
    totalScenes: TOUR_SCENES.length,
    tourData,

    // Controls
    startTour,
    nextScene,
    prevScene,
    completeTour,
    skipTour,
    dismissWelcome,
  };
}
