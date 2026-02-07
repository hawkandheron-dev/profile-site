/**
 * Entity edit service for Church History tables.
 * Provides update functions for CH_People, CH_Events, and CH_Eras.
 */
import { makeSupabaseClient } from '../lib/supabase.ts';

function getClient(getToken) {
  if (!getToken) throw new Error('Auth token provider required');
  return makeSupabaseClient(getToken);
}

/**
 * Update a person in CH_People.
 * @param {string} personId - Primary key
 * @param {Object} fields - Fields to update
 * @param {Function} getToken - Clerk token provider
 * @returns {Object} Updated row
 */
export async function updatePerson(personId, fields, getToken) {
  const supabase = getClient(getToken);
  const { data, error } = await supabase
    .from('CH_People')
    .update(fields)
    .eq('person_id', personId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an event in CH_Events.
 * @param {string} eventId - Primary key
 * @param {Object} fields - Fields to update
 * @param {Function} getToken - Clerk token provider
 * @returns {Object} Updated row
 */
export async function updateEvent(eventId, fields, getToken) {
  const supabase = getClient(getToken);
  const { data, error } = await supabase
    .from('CH_Events')
    .update(fields)
    .eq('event_id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an era in CH_Eras.
 * @param {string} eraId - Primary key
 * @param {Object} fields - Fields to update
 * @param {Function} getToken - Clerk token provider
 * @returns {Object} Updated row
 */
export async function updateEra(eraId, fields, getToken) {
  const supabase = getClient(getToken);
  const { data, error } = await supabase
    .from('CH_Eras')
    .update(fields)
    .eq('era_id', eraId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch the raw DB row for an entity so the edit form has original values.
 */
export async function fetchRawEntity(tableName, pkColumn, pkValue, getToken) {
  const supabase = getClient(getToken);
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq(pkColumn, pkValue)
    .single();

  if (error) throw error;
  return data;
}
