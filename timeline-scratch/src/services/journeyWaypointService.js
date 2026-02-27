/**
 * Service for admin CRUD operations on BP_JourneyWaypoints.
 * Used by the visual journey route editor.
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

function getClient(getToken) {
  if (!getToken) throw new Error('Auth token provider required');
  return makeSupabaseClient(getToken);
}

/**
 * Fetch all waypoints for a journey (with full row data including ids).
 */
export async function fetchJourneyWaypoints(journeyId, getToken) {
  const supabase = getClient(getToken);
  const { data, error } = await supabase
    .from('BP_JourneyWaypoints')
    .select('*')
    .eq('journey_id', journeyId)
    .order('after_stop')
    .order('waypoint_order');
  if (error) throw error;
  return data || [];
}

/**
 * Update a waypoint's lat/lng position.
 */
export async function updateWaypointPosition(id, lat, lng, getToken) {
  const supabase = getClient(getToken);
  const { error } = await supabase
    .from('BP_JourneyWaypoints')
    .update({ lat, lng })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Insert a new waypoint at a specific position in a segment.
 * Shifts existing waypoints at/after the insert position up by 1.
 */
export async function insertWaypointAt({ journey_id, after_stop, insert_position, lat, lng }, getToken) {
  const supabase = getClient(getToken);

  // Shift existing waypoints at or after insert_position up by 1
  // Process from highest to lowest to avoid unique constraint conflicts
  const { data: existing } = await supabase
    .from('BP_JourneyWaypoints')
    .select('id, waypoint_order')
    .eq('journey_id', journey_id)
    .eq('after_stop', after_stop)
    .gte('waypoint_order', insert_position)
    .order('waypoint_order', { ascending: false });

  if (existing) {
    for (const wp of existing) {
      await supabase
        .from('BP_JourneyWaypoints')
        .update({ waypoint_order: wp.waypoint_order + 1 })
        .eq('id', wp.id);
    }
  }

  // Insert the new waypoint
  const { data, error } = await supabase
    .from('BP_JourneyWaypoints')
    .insert({ journey_id, after_stop, waypoint_order: insert_position, lat, lng })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a waypoint and reindex the remaining waypoints in its segment.
 */
export async function deleteWaypointAndReindex(id, journeyId, afterStop, getToken) {
  const supabase = getClient(getToken);

  // Delete the waypoint
  const { error: delErr } = await supabase
    .from('BP_JourneyWaypoints')
    .delete()
    .eq('id', id);
  if (delErr) throw delErr;

  // Reindex remaining waypoints in this segment
  const { data: remaining, error: fetchErr } = await supabase
    .from('BP_JourneyWaypoints')
    .select('id, waypoint_order')
    .eq('journey_id', journeyId)
    .eq('after_stop', afterStop)
    .order('waypoint_order');
  if (fetchErr) throw fetchErr;

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].waypoint_order !== i + 1) {
        await supabase
          .from('BP_JourneyWaypoints')
          .update({ waypoint_order: i + 1 })
          .eq('id', remaining[i].id);
      }
    }
  }
}
