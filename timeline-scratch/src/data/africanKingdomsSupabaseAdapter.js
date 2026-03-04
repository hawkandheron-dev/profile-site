/**
 * Supabase data adapter for the African Kingdoms app.
 * Fetches AK_ tables and transforms into both Timeline format
 * (people/points/periods) and Map format (places/territories).
 */
import { createClient } from '@supabase/supabase-js';

// ── Supabase client ───────────────────────────────────────────────────────

let supabaseClient = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;

  let url = '';
  let key = '';

  try {
    const res = await fetch('/api/supabase-config');
    if (res.ok) {
      const script = await res.text();
      const fn = new Function(script);
      fn();
    }
  } catch {
    try {
      const res = await fetch('/supabase-config.js');
      if (res.ok) {
        const script = await res.text();
        const fn = new Function(script);
        fn();
      }
    } catch {
      // ignore
    }
  }

  url = window.SUPABASE_URL || '';
  key = window.SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    throw new Error('Supabase configuration not found.');
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
}

// ── Date helpers ──────────────────────────────────────────────────────────

function yearToISODate(year) {
  if (year == null) return null;
  if (year < 0) return `-${String(Math.abs(year)).padStart(4, '0')}-01-01`;
  return `${String(year).padStart(4, '0')}-01-01`;
}

// ── Data fetching ─────────────────────────────────────────────────────────

export async function fetchAfricanKingdomsData() {
  const supabase = await getSupabase();

  const [
    { data: eras, error: erasErr },
    { data: kingdoms, error: kingdomsErr },
    { data: places, error: placesErr },
    { data: people, error: peopleErr },
    { data: events, error: eventsErr },
    { data: kingdomPlaces, error: kpErr },
    { data: kingdomPeople, error: kpplErr },
    { data: eventPeople, error: epErr },
    { data: tradeRoutes, error: trErr },
    { data: sources, error: srcErr },
    { data: sourceLinks, error: slErr },
  ] = await Promise.all([
    supabase.from('AK_Eras').select('*').order('sort_order'),
    supabase.from('AK_Kingdoms').select('*').order('start_year'),
    supabase.from('AK_Places').select('*'),
    supabase.from('AK_People').select('*').order('reign_start_year'),
    supabase.from('AK_Events').select('*').order('event_year'),
    supabase.from('AK_KingdomPlaces').select('*'),
    supabase.from('AK_KingdomPeople').select('*'),
    supabase.from('AK_EventPeople').select('*'),
    supabase.from('AK_TradeRoutes').select('*'),
    supabase.from('AK_Sources').select('*'),
    supabase.from('AK_SourceLinks').select('*'),
  ]);

  const errors = [erasErr, kingdomsErr, placesErr, peopleErr, eventsErr, kpErr, kpplErr, epErr, trErr, srcErr, slErr].filter(Boolean);
  if (errors.length) {
    throw new Error(`Supabase fetch errors: ${errors.map(e => e.message).join('; ')}`);
  }

  return transformData(
    eras || [], kingdoms || [], places || [], people || [],
    events || [], kingdomPlaces || [], kingdomPeople || [],
    eventPeople || [], tradeRoutes || [], sources || [], sourceLinks || []
  );
}

// ── Transform ─────────────────────────────────────────────────────────────

function transformData(
  dbEras, dbKingdoms, dbPlaces, dbPeople, dbEvents,
  dbKingdomPlaces, dbKingdomPeople, dbEventPeople,
  dbTradeRoutes, dbSources, dbSourceLinks
) {
  // ── Lookup maps ──────────────────────────────────────────────────────

  const eraMap = new Map();
  dbEras.forEach(e => eraMap.set(e.era_id, e));

  const kingdomMap = new Map();
  dbKingdoms.forEach(k => kingdomMap.set(k.kingdom_id, k));

  const placeMap = new Map();
  dbPlaces.forEach(p => placeMap.set(p.place_id, p));

  const personMap = new Map();
  dbPeople.forEach(p => personMap.set(p.person_id, p));

  const eventMap = new Map();
  dbEvents.forEach(e => eventMap.set(e.event_id, e));

  // ── Junction maps ───────────────────────────────────────────────────

  // Kingdom → places
  const kingdomPlacesMap = new Map();
  dbKingdomPlaces.forEach(kp => {
    if (!kingdomPlacesMap.has(kp.kingdom_id)) kingdomPlacesMap.set(kp.kingdom_id, []);
    const place = placeMap.get(kp.place_id);
    if (place) kingdomPlacesMap.get(kp.kingdom_id).push({ ...place, relationship: kp.relationship });
  });

  // Kingdom → people
  const kingdomPeopleMap = new Map();
  dbKingdomPeople.forEach(kp => {
    if (!kingdomPeopleMap.has(kp.kingdom_id)) kingdomPeopleMap.set(kp.kingdom_id, []);
    const person = personMap.get(kp.person_id);
    if (person) kingdomPeopleMap.get(kp.kingdom_id).push({ ...person, role_context: kp.role_context });
  });

  // Event → people
  const eventPeopleMap = new Map();
  dbEventPeople.forEach(ep => {
    if (!eventPeopleMap.has(ep.event_id)) eventPeopleMap.set(ep.event_id, []);
    const person = personMap.get(ep.person_id);
    if (person) eventPeopleMap.get(ep.event_id).push(person);
  });

  // Person → kingdom (direct FK)
  // Person → events
  const personEventsMap = new Map();
  dbEventPeople.forEach(ep => {
    if (!personEventsMap.has(ep.person_id)) personEventsMap.set(ep.person_id, []);
    const event = eventMap.get(ep.event_id);
    if (event) personEventsMap.get(ep.person_id).push(event);
  });

  // Kingdom → events (direct FK)
  const kingdomEventsMap = new Map();
  dbEvents.forEach(ev => {
    if (!ev.kingdom_id) return;
    if (!kingdomEventsMap.has(ev.kingdom_id)) kingdomEventsMap.set(ev.kingdom_id, []);
    kingdomEventsMap.get(ev.kingdom_id).push(ev);
  });

  // Place → events
  const placeEventsMap = new Map();
  dbEvents.forEach(ev => {
    if (!ev.place_id) return;
    if (!placeEventsMap.has(ev.place_id)) placeEventsMap.set(ev.place_id, []);
    placeEventsMap.get(ev.place_id).push(ev);
  });

  // Place → kingdoms (via junction + capital FK)
  const placeKingdomsMap = new Map();
  dbKingdomPlaces.forEach(kp => {
    if (!placeKingdomsMap.has(kp.place_id)) placeKingdomsMap.set(kp.place_id, []);
    const kingdom = kingdomMap.get(kp.kingdom_id);
    if (kingdom) placeKingdomsMap.get(kp.place_id).push(kingdom);
  });
  dbKingdoms.forEach(k => {
    if (!k.capital_place_id) return;
    if (!placeKingdomsMap.has(k.capital_place_id)) placeKingdomsMap.set(k.capital_place_id, []);
    const existing = placeKingdomsMap.get(k.capital_place_id);
    if (!existing.some(x => x.kingdom_id === k.kingdom_id)) {
      existing.push(k);
    }
  });

  // Source map
  const sourceById = new Map();
  dbSources.forEach(s => sourceById.set(s.source_id, s));

  const sourceMap = new Map();
  dbSourceLinks.forEach(sl => {
    const src = sourceById.get(sl.source_id);
    if (!src) return;
    const key = sl.kingdom_id || sl.person_id || sl.event_id || sl.place_id;
    if (!key) return;
    if (!sourceMap.has(key)) sourceMap.set(key, []);
    const entries = sourceMap.get(key);
    if (!entries.some(e => e.source_id === src.source_id)) {
      entries.push(src);
    }
  });

  // ── Timeline data ────────────────────────────────────────────────────

  // Kingdoms → timeline "people" (lifespan bars)
  const timelinePeople = dbKingdoms.map(k => {
    const era = eraMap.get(k.era_id);
    return {
      id: k.kingdom_id,
      name: k.name,
      startDate: yearToISODate(k.start_year),
      endDate: yearToISODate(k.end_year),
      dateCertainty: 'year only',
      periodId: k.era_id || 'unknown',
      periodName: era?.name || '',
      preview: k.name,
      color: k.color || era?.color || '#8b7355',
      aboveTimeline: true,
      location: k.region,
      description: k.description,
      referenceUrl: k.reference_url,
      isKingdom: true,
    };
  });

  // Events → timeline "points"
  const eventShapeMap = {
    founding: 'circle',
    battle: 'cross',
    treaty: 'book',
    trade: 'reference',
    cultural: 'circle',
    religious: 'cross',
    decline: 'circle',
    conquest: 'cross',
  };

  const eventColorMap = {
    founding: '#4caf50',
    battle: '#d32f2f',
    treaty: '#1976d2',
    trade: '#f9a825',
    cultural: '#9c27b0',
    religious: '#00897b',
    decline: '#e65100',
    conquest: '#c62828',
  };

  const timelinePoints = dbEvents.map(ev => ({
    id: ev.event_id,
    name: ev.name,
    date: ev.event_date || yearToISODate(ev.event_year),
    endDate: ev.end_date || null,
    dateCertainty: 'year only',
    shape: eventShapeMap[ev.event_type] || 'circle',
    color: eventColorMap[ev.event_type] || '#888888',
    preview: ev.name,
    aboveTimeline: true,
    itemType: 'events',
    description: ev.description,
    referenceUrl: ev.reference_url,
    kingdomId: ev.kingdom_id,
    placeId: ev.place_id,
  }));

  // Eras → timeline "periods"
  const timelinePeriods = dbEras.map(era => ({
    id: era.era_id,
    name: era.name,
    startDate: yearToISODate(era.start_year),
    endDate: yearToISODate(era.end_year),
    dateCertainty: 'year only',
    color: era.color || '#00acc1',
    preview: era.name,
    aboveTimeline: true,
    description: era.description,
  }));

  // ── Entity index for cross-reference ──────────────────────────────

  const entityIndex = new Map();
  dbKingdoms.forEach(k => entityIndex.set(k.kingdom_id, { item: k, type: 'kingdom' }));
  dbPlaces.forEach(p => entityIndex.set(p.place_id, { item: p, type: 'place' }));
  dbPeople.forEach(p => entityIndex.set(p.person_id, { item: p, type: 'person' }));
  dbEvents.forEach(e => entityIndex.set(e.event_id, { item: e, type: 'event' }));

  return {
    // Timeline component format
    timelineData: {
      people: timelinePeople,
      points: timelinePoints,
      periods: timelinePeriods,
    },
    // Map/atlas data
    eras: dbEras,
    kingdoms: dbKingdoms,
    places: dbPlaces,
    people: dbPeople,
    events: dbEvents,
    tradeRoutes: dbTradeRoutes || [],
    // Lookup maps
    eraMap,
    kingdomMap,
    placeMap,
    personMap,
    eventMap,
    // Relationship maps
    kingdomPlacesMap,
    kingdomPeopleMap,
    kingdomEventsMap,
    eventPeopleMap,
    personEventsMap,
    placeEventsMap,
    placeKingdomsMap,
    sourceMap,
    entityIndex,
  };
}
