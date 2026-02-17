/**
 * Supabase data adapter for the Biblical Places Map.
 * Fetches data from BP_ tables and transforms it into
 * the format consumed by BiblicalPlacesApp components.
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
    throw new Error('Supabase configuration not found. Check /api/supabase-config or supabase-config.js');
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
}

// ── Data fetching ─────────────────────────────────────────────────────────

export async function fetchBiblicalPlacesData() {
  const supabase = await getSupabase();

  const [
    { data: ages, error: agesErr },
    { data: places, error: placesErr },
    { data: people, error: peopleErr },
    { data: personAges, error: paErr },
    { data: events, error: eventsErr },
    { data: personPlaces, error: ppErr },
    { data: eventPeople, error: epErr },
    { data: sources, error: srcErr },
    { data: sourceFigures, error: sfErr },
    { data: resources, error: resErr },
    { data: resourceLinks, error: rlErr },
    { data: placePeriodNames, error: ppnErr },
    { data: placeAgeSummaries, error: pasErr },
  ] = await Promise.all([
    supabase.from('BP_NarrativeAges').select('*').order('sort_order'),
    supabase.from('BP_Places').select('*'),
    supabase.from('BP_People').select('*'),
    supabase.from('BP_PersonAges').select('*').limit(2000),
    supabase.from('BP_Events').select('*').limit(2000),
    supabase.from('BP_PersonPlaces').select('*').limit(2000),
    supabase.from('BP_EventPeople').select('*').limit(2000),
    supabase.from('BP_Sources').select('*'),
    supabase.from('BP_SourceFigures').select('*'),
    supabase.from('BP_Resources').select('*'),
    supabase.from('BP_ResourceLinks').select('*'),
    supabase.from('BP_PlacePeriodNames').select('*'),
    supabase.from('BP_PlaceAgeSummaries').select('*'),
  ]);

  const errors = [agesErr, placesErr, peopleErr, paErr, eventsErr, ppErr, epErr, srcErr, sfErr, resErr, rlErr, ppnErr, pasErr].filter(Boolean);
  if (errors.length) {
    throw new Error(`Supabase fetch errors: ${errors.map(e => e.message).join('; ')}`);
  }

  return transformToBiblicalPlacesFormat(
    ages || [],
    places || [],
    people || [],
    personAges || [],
    events || [],
    personPlaces || [],
    eventPeople || [],
    sources || [],
    sourceFigures || [],
    resources || [],
    resourceLinks || [],
    placePeriodNames || [],
    placeAgeSummaries || [],
  );
}

// ── Transform ─────────────────────────────────────────────────────────────

function transformToBiblicalPlacesFormat(
  dbAges, dbPlaces, dbPeople, dbPersonAges, dbEvents,
  dbPersonPlaces, dbEventPeople, dbSources, dbSourceFigures,
  dbResources, dbResourceLinks, dbPlacePeriodNames, dbPlaceAgeSummaries
) {
  // ── Lookup maps ─────────────────────────────────────────────────────────

  // Age map: age_id -> age object
  const ageMap = new Map();
  dbAges.forEach(a => ageMap.set(a.age_id, a));

  // Place map: place_id -> place object
  const placeMap = new Map();
  dbPlaces.forEach(p => placeMap.set(p.place_id, p));

  // Person map: person_id -> person object
  const personMap = new Map();
  dbPeople.forEach(p => personMap.set(p.person_id, p));

  // Event map: event_id -> event object
  const eventMap = new Map();
  dbEvents.forEach(e => eventMap.set(e.event_id, e));

  // ── Person-Ages map: person_id -> [{ age, is_primary }] ──────────────

  const personAgesMap = new Map();
  dbPersonAges.forEach(pa => {
    if (!personAgesMap.has(pa.person_id)) personAgesMap.set(pa.person_id, []);
    const age = ageMap.get(pa.age_id);
    if (age) {
      personAgesMap.get(pa.person_id).push({ ...age, is_primary: pa.is_primary });
    }
  });
  // Sort each person's ages by sort_order
  for (const [, ages] of personAgesMap) {
    ages.sort((a, b) => a.sort_order - b.sort_order);
  }

  // ── Place-Events map: place_id -> events[] sorted by age sort_order ──

  const placeEventsMap = new Map();
  dbEvents.forEach(ev => {
    if (!ev.place_id) return;
    if (!placeEventsMap.has(ev.place_id)) placeEventsMap.set(ev.place_id, []);
    placeEventsMap.get(ev.place_id).push(ev);
  });
  // Sort events within each place by age sort_order, then sort_within_age
  for (const [, events] of placeEventsMap) {
    events.sort((a, b) => {
      const ageA = ageMap.get(a.narrative_age_id);
      const ageB = ageMap.get(b.narrative_age_id);
      const orderDiff = (ageA?.sort_order ?? 99) - (ageB?.sort_order ?? 99);
      if (orderDiff !== 0) return orderDiff;
      return (a.sort_within_age ?? 0) - (b.sort_within_age ?? 0);
    });
  }

  // ── Place-People map: place_id -> [{ person, context, age }] ─────────

  const placePeopleMap = new Map();
  dbPersonPlaces.forEach(pp => {
    if (!placePeopleMap.has(pp.place_id)) placePeopleMap.set(pp.place_id, []);
    const person = personMap.get(pp.person_id);
    const age = pp.narrative_age_id ? ageMap.get(pp.narrative_age_id) : null;
    if (person) {
      placePeopleMap.get(pp.place_id).push({
        ...person,
        context: pp.context,
        age,
        notes: pp.notes,
        scripture_verse: pp.scripture_verse,
      });
    }
  });
  // Sort by age sort_order
  for (const [, people] of placePeopleMap) {
    people.sort((a, b) => (a.age?.sort_order ?? 99) - (b.age?.sort_order ?? 99));
  }

  // ── Event-People map: event_id -> person[] ───────────────────────────

  const eventPeopleMap = new Map();
  dbEventPeople.forEach(ep => {
    if (!eventPeopleMap.has(ep.event_id)) eventPeopleMap.set(ep.event_id, []);
    const person = personMap.get(ep.person_id);
    if (person) {
      eventPeopleMap.get(ep.event_id).push(person);
    }
  });

  // ── Person-Events map: person_id -> event[] ──────────────────────────

  const personEventsMap = new Map();
  dbEventPeople.forEach(ep => {
    if (!personEventsMap.has(ep.person_id)) personEventsMap.set(ep.person_id, []);
    const event = eventMap.get(ep.event_id);
    if (event) {
      personEventsMap.get(ep.person_id).push(event);
    }
  });
  // Sort by age sort_order then sort_within_age
  for (const [, events] of personEventsMap) {
    events.sort((a, b) => {
      const ageA = ageMap.get(a.narrative_age_id);
      const ageB = ageMap.get(b.narrative_age_id);
      const orderDiff = (ageA?.sort_order ?? 99) - (ageB?.sort_order ?? 99);
      if (orderDiff !== 0) return orderDiff;
      return (a.sort_within_age ?? 0) - (b.sort_within_age ?? 0);
    });
  }

  // ── Person-Places map: person_id -> [{ place, context, age }] ────────

  const personPlacesMap = new Map();
  dbPersonPlaces.forEach(pp => {
    if (!personPlacesMap.has(pp.person_id)) personPlacesMap.set(pp.person_id, []);
    const place = placeMap.get(pp.place_id);
    const age = pp.narrative_age_id ? ageMap.get(pp.narrative_age_id) : null;
    if (place) {
      personPlacesMap.get(pp.person_id).push({
        ...place,
        context: pp.context,
        age,
        notes: pp.notes,
        scripture_verse: pp.scripture_verse,
      });
    }
  });
  // Sort by age sort_order
  for (const [, places] of personPlacesMap) {
    places.sort((a, b) => (a.age?.sort_order ?? 99) - (b.age?.sort_order ?? 99));
  }

  // ── Source map: entity_id -> sources[] ────────────────────────────────

  const sourceById = new Map();
  dbSources.forEach(s => sourceById.set(s.source_id, s));

  const sourceMap = new Map();
  dbSourceFigures.forEach(sf => {
    const src = sourceById.get(sf.source_id);
    if (!src) return;
    const key = sf.person_id || sf.event_id || sf.place_id;
    if (!key) return;
    if (!sourceMap.has(key)) sourceMap.set(key, []);
    const entries = sourceMap.get(key);
    if (!entries.some(e => e.source_id === src.source_id)) {
      entries.push(src);
    }
  });

  // ── Resource maps: entity_id -> resources[] ─────────────────────────

  const resourceById = new Map();
  (dbResources || []).forEach(r => resourceById.set(r.resource_id, r));

  const resourceMap = new Map(); // generic: any entity_id -> resources[]
  (dbResourceLinks || []).forEach(rl => {
    const res = resourceById.get(rl.resource_id);
    if (!res) return;
    const key = rl.place_id || rl.person_id || rl.event_id || rl.age_id;
    if (!key) return;
    if (!resourceMap.has(key)) resourceMap.set(key, []);
    const entries = resourceMap.get(key);
    if (!entries.some(e => e.resource_id === res.resource_id)) {
      entries.push(res);
    }
  });

  // ── Place period names: place_id -> Map<age_id, name> ───────────────

  const placeNamesMap = new Map();
  (dbPlacePeriodNames || []).forEach(pn => {
    if (!placeNamesMap.has(pn.place_id)) placeNamesMap.set(pn.place_id, new Map());
    placeNamesMap.get(pn.place_id).set(pn.age_id, pn.name);
  });

  // ── Place age summaries: place_id -> Map<age_id, summary> ──────────

  const placeAgeSummariesMap = new Map();
  (dbPlaceAgeSummaries || []).forEach(pas => {
    if (!placeAgeSummariesMap.has(pas.place_id)) placeAgeSummariesMap.set(pas.place_id, new Map());
    placeAgeSummariesMap.get(pas.place_id).set(pas.age_id, pas.summary);
  });

  // ── Entity index for search and cross-reference ──────────────────────

  const entityIndex = new Map();
  dbPlaces.forEach(p => entityIndex.set(p.place_id, { item: p, type: 'place' }));
  dbPeople.forEach(p => entityIndex.set(p.person_id, { item: p, type: 'person' }));
  dbEvents.forEach(e => entityIndex.set(e.event_id, { item: e, type: 'event' }));

  return {
    ages: dbAges,
    places: dbPlaces,
    people: dbPeople,
    events: dbEvents,
    ageMap,
    placeMap,
    personMap,
    eventMap,
    placeEventsMap,
    placePeopleMap,
    eventPeopleMap,
    personEventsMap,
    personPlacesMap,
    personAgesMap,
    sourceMap,
    resourceMap,
    placeNamesMap,
    placeAgeSummariesMap,
    entityIndex,
  };
}
