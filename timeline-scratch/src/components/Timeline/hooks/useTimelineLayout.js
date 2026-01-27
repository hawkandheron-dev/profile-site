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
  // Layout: People (outer) → Period brackets → Points inside period area → Axis
  const layout = useMemo(() => {
    const above = stacked.above;
    const below = stacked.below;

    // Calculate row counts for each section
    const abovePeriodRows = above.periods.length > 0 ? Math.max(...above.periods.map(p => p.row)) + 1 : 0;
    const abovePeopleRows = above.people.length > 0 ? Math.max(...above.people.map(p => p.row)) + 1 : 0;
    const abovePointRows = above.points.length > 0 ? Math.max(...above.points.map(p => p.row)) + 1 : 0;

    const belowPeriodRows = below.periods.length > 0 ? Math.max(...below.periods.map(p => p.row)) + 1 : 0;
    const belowPeopleRows = below.people.length > 0 ? Math.max(...below.people.map(p => p.row)) + 1 : 0;
    const belowPointRows = below.points.length > 0 ? Math.max(...below.points.map(p => p.row)) + 1 : 0;

    // Points live inside the period area, so period height includes space for points
    // Period area = bracket height + points area
    const abovePointsAreaHeight = abovePointRows * pointRowHeight;
    const belowPointsAreaHeight = belowPointRows * pointRowHeight;

    // Total period area height (bracket + points inside)
    const abovePeriodTotalHeight = abovePeriodRows * periodBracketHeight + abovePointsAreaHeight + (abovePeriodRows > 0 ? lanePadding : 0);
    const belowPeriodTotalHeight = belowPeriodRows * periodBracketHeight + belowPointsAreaHeight + (belowPeriodRows > 0 ? lanePadding : 0);

    // People area height
    const abovePeopleHeight = abovePeopleRows * personRowHeight + (abovePeopleRows > 0 ? lanePadding : 0);
    const belowPeopleHeight = belowPeopleRows * personRowHeight + (belowPeopleRows > 0 ? lanePadding : 0);

    // Total heights
    const aboveHeight = abovePeriodTotalHeight + abovePeopleHeight;
    const belowHeight = belowPeriodTotalHeight + belowPeopleHeight;

    // Axis position
    const axisY = aboveHeight + lanePadding;
    const totalHeight = aboveHeight + axisHeight + belowHeight + lanePadding * 2;

    // Calculate Y positions for each section
    // Above timeline (from axis going up): points → period brackets → people
    const abovePointsY = axisY - abovePointsAreaHeight; // Points closest to axis
    const abovePeriodY = axisY - abovePointsAreaHeight - (abovePeriodRows * periodBracketHeight); // Brackets above points
    const abovePeopleY = abovePeriodY - abovePeopleHeight; // People above brackets

    // Below timeline (from axis going down): points → period brackets → people
    const belowPointsY = axisY + axisHeight; // Points closest to axis
    const belowPeriodY = belowPointsY + belowPointsAreaHeight; // Brackets below points
    const belowPeopleY = belowPeriodY + (belowPeriodRows * periodBracketHeight) + lanePadding; // People below brackets

    // Calculate max rows for reversing above-timeline items
    const maxAbovePeopleRow = above.people.length > 0 ? Math.max(...above.people.map(p => p.row)) : 0;
    const maxAbovePointsRow = above.points.length > 0 ? Math.max(...above.points.map(p => p.row)) : 0;
    const maxAbovePeriodsRow = above.periods.length > 0 ? Math.max(...above.periods.map(p => p.row)) : 0;

    // Add y positions to items
    // Above timeline: reverse stacking so row 0 is at bottom (closest to axis)
    // Below timeline: row 0 is at top (closest to axis), stacking downward
    const peopleWithY = [
      ...above.people.map(p => ({
        ...p,
        y: abovePeopleY + (maxAbovePeopleRow - p.row) * personRowHeight,
        height: personRowHeight,
        aboveTimeline: true
      })),
      ...below.people.map(p => ({
        ...p,
        y: belowPeopleY + p.row * personRowHeight,
        height: personRowHeight,
        aboveTimeline: false
      }))
    ];

    // Points are positioned within the period area (between bracket and axis)
    const pointsWithY = [
      ...above.points.map(p => ({
        ...p,
        y: abovePointsY + (maxAbovePointsRow - p.row) * pointRowHeight,
        height: pointRowHeight,
        aboveTimeline: true
      })),
      ...below.points.map(p => ({
        ...p,
        y: belowPointsY + p.row * pointRowHeight,
        height: pointRowHeight,
        aboveTimeline: false
      }))
    ];

    // Periods - the bracket is positioned at the outer edge
    // but the total height includes the points area
    const periodsWithY = [
      ...above.periods.map(p => ({
        ...p,
        y: abovePeriodY + (maxAbovePeriodsRow - p.row) * periodBracketHeight,
        height: periodBracketHeight + abovePointsAreaHeight, // Extended to include points area
        bracketHeight: periodBracketHeight, // Original bracket height for drawing
        aboveTimeline: true
      })),
      ...below.periods.map(p => ({
        ...p,
        y: belowPeriodY + p.row * periodBracketHeight,
        height: periodBracketHeight + belowPointsAreaHeight, // Extended to include points area
        bracketHeight: periodBracketHeight, // Original bracket height for drawing
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
