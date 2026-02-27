/**
 * Custom hook for the visual journey route editor.
 * Renders draggable waypoint markers, ghost add-points, and stop reference
 * markers on the map when edit mode is active. Handles all drag/add/delete
 * interactions and persists changes to Supabase.
 */
import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { smoothRoute } from '../../utils/smoothRoute.js';
import {
  fetchJourneyWaypoints,
  updateWaypointPosition,
  insertWaypointAt,
  deleteWaypointAndReindex,
} from '../../services/journeyWaypointService.js';

/**
 * Build the ordered node sequence from stops and waypoints.
 * Returns: [{ type, lng, lat, stopIndex?, waypointData? }, ...]
 */
function buildNodeSequence(stops, waypointRows) {
  const wpBySegment = new Map();
  waypointRows.forEach(wp => {
    if (!wpBySegment.has(wp.after_stop)) wpBySegment.set(wp.after_stop, []);
    wpBySegment.get(wp.after_stop).push(wp);
  });
  for (const [, wps] of wpBySegment) {
    wps.sort((a, b) => a.waypoint_order - b.waypoint_order);
  }

  const nodes = [];
  const stopsWithPlaces = stops.filter(s => s.place);
  stopsWithPlaces.forEach((stop, i) => {
    nodes.push({ type: 'stop', lng: stop.place.lng, lat: stop.place.lat, stopIndex: i, stop });
    const segWps = wpBySegment.get(i) || [];
    segWps.forEach(wp => {
      nodes.push({ type: 'waypoint', lng: wp.lng, lat: wp.lat, waypointData: wp });
    });
  });
  return nodes;
}

/**
 * Compute the smoothed route from a node sequence and update the map source.
 */
function updateRouteOnMap(map, nodes, color) {
  const routeSource = map.getSource('journey-route');
  if (!routeSource) return;

  const coords = nodes.map(n => [n.lng, n.lat]);
  if (coords.length < 2) {
    routeSource.setData({ type: 'FeatureCollection', features: [] });
    return;
  }

  const smoothed = smoothRoute(coords, { tension: 0.5, pointsPerSegment: 12 });
  routeSource.setData({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: smoothed },
      properties: { color },
    }],
  });
}

/**
 * Determine the after_stop and insert_position for a new waypoint
 * between nodeA and nodeB in the node sequence.
 */
function getInsertParams(nodeA, nodeB) {
  if (nodeA.type === 'stop') {
    const afterStop = nodeA.stopIndex;
    if (nodeB.type === 'waypoint' && nodeB.waypointData.after_stop === afterStop) {
      return { afterStop, insertPosition: nodeB.waypointData.waypoint_order };
    }
    return { afterStop, insertPosition: 1 };
  }
  // nodeA is a waypoint
  return {
    afterStop: nodeA.waypointData.after_stop,
    insertPosition: nodeA.waypointData.waypoint_order + 1,
  };
}

export function useJourneyRouteEditor(mapRef, {
  isEditing,
  activeJourney,
  journeyStops,
  journeyColor,
  getToken,
  onWaypointsChanged,
}) {
  const markersRef = useRef([]);
  const waypointDataRef = useRef([]);
  const nodesRef = useRef([]);
  const buildIdRef = useRef(0); // track rebuilds to avoid stale closures

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!isEditing || !map || !activeJourney || !journeyStops?.length || !getToken) {
      clearMarkers();
      return;
    }

    let cancelled = false;
    const buildId = ++buildIdRef.current;
    const color = journeyColor || '#8b7355';

    async function setup() {
      try {
        const waypoints = await fetchJourneyWaypoints(activeJourney, getToken);
        if (cancelled || buildId !== buildIdRef.current) return;
        waypointDataRef.current = waypoints;
        buildAllMarkers(waypoints);
      } catch (err) {
        console.error('Failed to load waypoints for editing:', err);
      }
    }

    function buildAllMarkers(waypoints) {
      clearMarkers();

      const nodes = buildNodeSequence(journeyStops, waypoints);
      nodesRef.current = nodes;
      updateRouteOnMap(map, nodes, color);

      // ── Stop markers (non-draggable reference points) ──────────────
      nodes.forEach((node) => {
        if (node.type !== 'stop') return;

        const el = document.createElement('div');
        el.className = 'bp-edit-stop-node';
        el.style.setProperty('--route-color', color);
        el.textContent = String(node.stopIndex + 1);

        const marker = new maplibregl.Marker({ element: el, draggable: false })
          .setLngLat([node.lng, node.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });

      // ── Waypoint markers (draggable) ───────────────────────────────
      nodes.forEach((node) => {
        if (node.type !== 'waypoint') return;
        const wpData = node.waypointData;

        const el = document.createElement('div');
        el.className = 'bp-edit-wp-node';
        el.style.setProperty('--route-color', color);

        // Delete button
        const del = document.createElement('button');
        del.className = 'bp-edit-wp-delete';
        del.textContent = '\u00d7';
        del.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            await deleteWaypointAndReindex(wpData.id, activeJourney, wpData.after_stop, getToken);
            const updated = await fetchJourneyWaypoints(activeJourney, getToken);
            if (cancelled || buildId !== buildIdRef.current) return;
            waypointDataRef.current = updated;
            buildAllMarkers(updated);
            onWaypointsChanged?.();
          } catch (err) {
            console.error('Failed to delete waypoint:', err);
          }
        });
        el.appendChild(del);

        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([node.lng, node.lat])
          .addTo(map);

        // Live route update during drag
        marker.on('drag', () => {
          const pos = marker.getLngLat();
          const wpNode = nodesRef.current.find(
            n => n.type === 'waypoint' && n.waypointData.id === wpData.id
          );
          if (wpNode) {
            wpNode.lng = pos.lng;
            wpNode.lat = pos.lat;
          }
          updateRouteOnMap(map, nodesRef.current, color);
        });

        // Persist on drag end
        marker.on('dragend', async () => {
          const pos = marker.getLngLat();
          try {
            await updateWaypointPosition(wpData.id, pos.lat, pos.lng, getToken);
            const wp = waypointDataRef.current.find(w => w.id === wpData.id);
            if (wp) { wp.lat = pos.lat; wp.lng = pos.lng; }
            onWaypointsChanged?.();
          } catch (err) {
            console.error('Failed to save waypoint position:', err);
          }
        });

        markersRef.current.push(marker);
      });

      // ── Ghost add-point markers (click to insert waypoint) ─────────
      for (let i = 0; i < nodes.length - 1; i++) {
        const nodeA = nodes[i];
        const nodeB = nodes[i + 1];
        const midLng = (nodeA.lng + nodeB.lng) / 2;
        const midLat = (nodeA.lat + nodeB.lat) / 2;

        const { afterStop, insertPosition } = getInsertParams(nodeA, nodeB);

        const el = document.createElement('div');
        el.className = 'bp-edit-add-node';
        el.style.setProperty('--route-color', color);
        el.textContent = '+';

        el.addEventListener('click', async () => {
          try {
            await insertWaypointAt({
              journey_id: activeJourney,
              after_stop: afterStop,
              insert_position: insertPosition,
              lat: midLat,
              lng: midLng,
            }, getToken);
            const updated = await fetchJourneyWaypoints(activeJourney, getToken);
            if (cancelled || buildId !== buildIdRef.current) return;
            waypointDataRef.current = updated;
            buildAllMarkers(updated);
            onWaypointsChanged?.();
          } catch (err) {
            console.error('Failed to add waypoint:', err);
          }
        });

        const marker = new maplibregl.Marker({ element: el, draggable: false })
          .setLngLat([midLng, midLat])
          .addTo(map);
        markersRef.current.push(marker);
      }
    }

    setup();

    return () => {
      cancelled = true;
      clearMarkers();
    };
  }, [isEditing, activeJourney, journeyStops, journeyColor, getToken, onWaypointsChanged, clearMarkers, mapRef]);
}
