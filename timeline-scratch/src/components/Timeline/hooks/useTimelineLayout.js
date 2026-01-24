/**
 * Custom hook for calculating timeline layout with above/below axis support
 */

import { useMemo } from 'react';
import { stackTimelineItems } from '../utils/stacking.js';

/**
 * Hook for timeline layout calculations
 * Layout structure: Periods closest to axis, then people/points further out
 * Items can be above or below the timeline axis
 *
 * @param {Object} data - Timeline data
 * @param {Array} data.people - Person items
 * @param {Array} data.points - Point items
 * @param {Array} data.periods - Period items
 * @param {Array} laneOrder - Deprecated, kept for compatibility
 * @param {number} yearsPerPixel - Current zoom scale
 * @param {Object} sizes - Size configuration
 * @returns {Object} Layout information
 */
export function useTimelineLayout(data, laneOrder, yearsPerPixel, sizes = {}) {
  const {
    personRowHeight = 40,
    pointRowHeight = 40,
    periodRowHeight = 50,
    periodBracketHeight = 30,
    lanePadding = 10,
    axisHeight = 40
  } = sizes;

  // Stack all items with above/below separation
  const stacked = useMemo(() => {
    return stackTimelineItems(data, 150, yearsPerPixel);
  }, [data, yearsPerPixel]);

  // Calculate layout with positions
  const layout = useMemo(() => {
    const above = stacked.above;
    const below = stacked.below;

    // Calculate heights for each section
    const abovePeriodRows = above.periods.length > 0 ? Math.max(...above.periods.map(p => p.row)) + 1 : 0;
    const abovePeoplePointRows = Math.max(
      above.people.length > 0 ? Math.max(...above.people.map(p => p.row)) + 1 : 0,
      above.points.length > 0 ? Math.max(...above.points.map(p => p.row)) + 1 : 0
    );

    const belowPeriodRows = below.periods.length > 0 ? Math.max(...below.periods.map(p => p.row)) + 1 : 0;
    const belowPeoplePointRows = Math.max(
      below.people.length > 0 ? Math.max(...below.people.map(p => p.row)) + 1 : 0,
      below.points.length > 0 ? Math.max(...below.points.map(p => p.row)) + 1 : 0
    );

    // Calculate section heights
    const abovePeriodHeight = abovePeriodRows * periodBracketHeight + (abovePeriodRows > 0 ? lanePadding : 0);
    const abovePeoplePointHeight = abovePeoplePointRows * personRowHeight + (abovePeoplePointRows > 0 ? lanePadding : 0);
    const aboveHeight = abovePeriodHeight + abovePeoplePointHeight;

    const belowPeriodHeight = belowPeriodRows * periodBracketHeight + (belowPeriodRows > 0 ? lanePadding : 0);
    const belowPeoplePointHeight = belowPeoplePointRows * personRowHeight + (belowPeoplePointRows > 0 ? lanePadding : 0);
    const belowHeight = belowPeriodHeight + belowPeoplePointHeight;

    // Axis position (centered, but weighted toward content)
    const axisY = aboveHeight + lanePadding;
    const totalHeight = aboveHeight + axisHeight + belowHeight + lanePadding * 2;

    // Calculate Y positions for each item
    // Above axis: grow upward (decreasing Y)
    const abovePeoplePointY = axisY - abovePeriodHeight - abovePeoplePointHeight;
    const abovePeriodY = axisY - abovePeriodHeight;

    // Below axis: grow downward (increasing Y)
    const belowPeriodY = axisY + axisHeight;
    const belowPeoplePointY = belowPeriodY + belowPeriodHeight;

    // Add y positions to items
    const peopleWithY = [
      ...above.people.map(p => ({
        ...p,
        y: abovePeoplePointY + p.row * personRowHeight,
        height: personRowHeight,
        aboveTimeline: true
      })),
      ...below.people.map(p => ({
        ...p,
        y: belowPeoplePointY + p.row * personRowHeight,
        height: personRowHeight,
        aboveTimeline: false
      }))
    ];

    const pointsWithY = [
      ...above.points.map(p => ({
        ...p,
        y: abovePeoplePointY + p.row * pointRowHeight,
        height: pointRowHeight,
        aboveTimeline: true
      })),
      ...below.points.map(p => ({
        ...p,
        y: belowPeoplePointY + p.row * pointRowHeight,
        height: pointRowHeight,
        aboveTimeline: false
      }))
    ];

    const periodsWithY = [
      ...above.periods.map(p => ({
        ...p,
        y: abovePeriodY + p.row * periodBracketHeight,
        height: periodBracketHeight,
        aboveTimeline: true
      })),
      ...below.periods.map(p => ({
        ...p,
        y: belowPeriodY + p.row * periodBracketHeight,
        height: periodBracketHeight,
        aboveTimeline: false
      }))
    ];

    return {
      stackedPeople: peopleWithY,
      stackedPoints: pointsWithY,
      stackedPeriods: periodsWithY,
      axisY,
      totalHeight,
      sizes: {
        personRowHeight,
        pointRowHeight,
        periodRowHeight,
        periodBracketHeight,
        lanePadding,
        axisHeight
      }
    };
  }, [stacked, personRowHeight, pointRowHeight, periodRowHeight, periodBracketHeight, lanePadding, axisHeight]);

  return layout;
}
