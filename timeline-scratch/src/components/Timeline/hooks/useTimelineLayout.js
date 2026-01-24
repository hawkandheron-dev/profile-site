/**
 * Custom hook for calculating timeline layout
 */

import { useMemo } from 'react';
import { stackPeople, stackPoints, stackPeriods, calculateLaneHeight } from '../utils/stacking.js';

/**
 * Hook for timeline layout calculations
 * @param {Object} data - Timeline data
 * @param {Array} data.people - Person items
 * @param {Array} data.points - Point items
 * @param {Array} data.periods - Period items
 * @param {Array} laneOrder - Order of lanes (e.g., ["people", "periods", "points"])
 * @param {number} yearsPerPixel - Current zoom scale
 * @param {Object} sizes - Size configuration
 * @returns {Object} Layout information
 */
export function useTimelineLayout(data, laneOrder, yearsPerPixel, sizes = {}) {
  const {
    personRowHeight = 40,
    pointRowHeight = 50,
    periodRowHeight = 60,
    lanePadding = 20,
    axisHeight = 40
  } = sizes;

  // Stack items
  const stackedPeople = useMemo(() => {
    return stackPeople(data.people || []);
  }, [data.people]);

  const stackedPoints = useMemo(() => {
    return stackPoints(data.points || [], 150, yearsPerPixel);
  }, [data.points, yearsPerPixel]);

  const stackedPeriods = useMemo(() => {
    return stackPeriods(data.periods || []);
  }, [data.periods]);

  // Calculate lane heights
  const laneHeights = useMemo(() => {
    return {
      people: calculateLaneHeight(stackedPeople, personRowHeight, lanePadding),
      points: calculateLaneHeight(stackedPoints, pointRowHeight, lanePadding),
      periods: calculateLaneHeight(stackedPeriods, periodRowHeight, lanePadding)
    };
  }, [stackedPeople, stackedPoints, stackedPeriods, personRowHeight, pointRowHeight, periodRowHeight, lanePadding]);

  // Calculate lane Y positions based on order
  const lanePositions = useMemo(() => {
    const positions = {};
    let currentY = axisHeight;

    laneOrder.forEach(laneType => {
      positions[laneType] = currentY;
      currentY += laneHeights[laneType] || 0;
    });

    return positions;
  }, [laneOrder, laneHeights, axisHeight]);

  // Calculate total canvas height
  const totalHeight = useMemo(() => {
    return axisHeight + laneOrder.reduce((sum, laneType) => {
      return sum + (laneHeights[laneType] || 0);
    }, 0);
  }, [axisHeight, laneOrder, laneHeights]);

  // Calculate max rows in each lane (for debugging/info)
  const maxRows = useMemo(() => {
    return {
      people: stackedPeople.length > 0 ? Math.max(...stackedPeople.map(p => p.row)) + 1 : 0,
      points: stackedPoints.length > 0 ? Math.max(...stackedPoints.map(p => p.row)) + 1 : 0,
      periods: stackedPeriods.length > 0 ? Math.max(...stackedPeriods.map(p => p.row)) + 1 : 0
    };
  }, [stackedPeople, stackedPoints, stackedPeriods]);

  return {
    stackedPeople,
    stackedPoints,
    stackedPeriods,
    laneHeights,
    lanePositions,
    totalHeight,
    maxRows,
    sizes: {
      personRowHeight,
      pointRowHeight,
      periodRowHeight,
      lanePadding,
      axisHeight
    }
  };
}
