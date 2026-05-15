/**
 * Supabase data adapter for the First Century Church Directory.
 * Fetches data from FCC_ tables and transforms it into the format
 * consumed by FirstCenturyChurchApp components, including the
 * force-directed graph data shapes.
 */
import { createClient } from '@supabase/supabase-js';

// ── Supabase client ───────────────────────────────────────────────────────

let supabaseClient = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;

  // Config is set on window by the <script src="/api/supabase-config"> tag
  // in the HTML entry point before React boots.
  const url = window.SUPABASE_URL || '';
  const key = window.SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    throw new Error('Supabase configuration not found. Ensure the config script has loaded.');
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
}

// ── Data fetching ─────────────────────────────────────────────────────────

export async function fetchFirstCenturyChurchData() {
  const supabase = await getSupabase();

  const [
    { data: regions, error: regErr },
    { data: churches, error: chErr },
    { data: people, error: pplErr },
    { data: households, error: hhErr },
    { data: memberships, error: memErr },
    { data: scriptureRefs, error: srErr },
    { data: journeys, error: jErr },
    { data: journeyStops, error: jsErr },
    { data: journeyPeople, error: jpErr },
  ] = await Promise.all([
    supabase.from('FCC_Regions').select('*').order('sort_order'),
    supabase.from('FCC_Churches').select('*').order('sort_order'),
    supabase.from('FCC_People').select('*').order('name'),
    supabase.from('FCC_Households').select('*'),
    supabase.from('FCC_Memberships').select('*').limit(5000),
    supabase.from('FCC_ScriptureRefs').select('*').limit(2000),
    supabase.from('FCC_Journeys').select('*').order('sort_order'),
    supabase.from('FCC_JourneyStops').select('*').order('stop_order'),
    supabase.from('FCC_JourneyPeople').select('*'),
  ]);

  const errors = [regErr, chErr, pplErr, hhErr, memErr, srErr, jErr, jsErr, jpErr].filter(Boolean);
  if (errors.length) {
    throw new Error(`Supabase fetch errors: ${errors.map(e => e.message).join('; ')}`);
  }

  return transformToFccFormat(
    regions || [],
    churches || [],
    people || [],
    households || [],
    memberships || [],
    scriptureRefs || [],
    journeys || [],
    journeyStops || [],
    journeyPeople || [],
  );
}

// ── Transform ─────────────────────────────────────────────────────────────

function transformToFccFormat(
  dbRegions, dbChurches, dbPeople, dbHouseholds, dbMemberships,
  dbScriptureRefs, dbJourneys, dbJourneyStops, dbJourneyPeople,
) {
  // ── Lookup maps ─────────────────────────────────────────────────────────

  const regionMap = new Map();
  dbRegions.forEach(r => regionMap.set(r.region_id, r));

  const churchMap = new Map();
  dbChurches.forEach(c => churchMap.set(c.church_id, c));

  const personMap = new Map();
  dbPeople.forEach(p => personMap.set(p.person_id, p));

  // Two Romans 16 entries ("the household of Aristobulus / Narcissus") exist
  // in the data both as a household *and* as a pseudo-person that heads it.
  // Track those pseudo-person ids so the graph can show one node, not two.
  const householdGroupIds = new Set();
  dbPeople.forEach(p => {
    if (/-household$/.test(p.person_id) || /^the household of/i.test(p.name || '')) {
      householdGroupIds.add(p.person_id);
    }
  });

  const householdMap = new Map();
  dbHouseholds.forEach(h => householdMap.set(h.household_id, h));

  const journeyMap = new Map();
  dbJourneys.forEach(j => journeyMap.set(j.journey_id, {
    ...j,
    person: j.person_id ? personMap.get(j.person_id) : null,
  }));

  // ── Church -> memberships (enriched with person) ────────────────────────

  const churchMembershipsMap = new Map();
  // ── Person -> memberships (enriched with church) ────────────────────────
  const personMembershipsMap = new Map();
  // person_id -> Set<church_id> (to detect travelers)
  const personChurchSets = new Map();

  dbMemberships.forEach(m => {
    const person = personMap.get(m.person_id);
    const church = churchMap.get(m.church_id);
    if (!person || !church) return;

    if (!churchMembershipsMap.has(m.church_id)) churchMembershipsMap.set(m.church_id, []);
    churchMembershipsMap.get(m.church_id).push({ ...m, person });

    if (!personMembershipsMap.has(m.person_id)) personMembershipsMap.set(m.person_id, []);
    personMembershipsMap.get(m.person_id).push({ ...m, church });

    if (!personChurchSets.has(m.person_id)) personChurchSets.set(m.person_id, new Set());
    personChurchSets.get(m.person_id).add(m.church_id);
  });

  // Travelers: people connected to 2+ distinct churches
  const travelerIds = new Set();
  for (const [personId, churchSet] of personChurchSets) {
    if (churchSet.size > 1) travelerIds.add(personId);
  }

  // Sort each church's people: founders/leaders first, then by name
  const ROLE_ORDER = {
    founder: 0, apostle: 1, overseer: 2, elder: 3, prophet: 4, teacher: 5,
    deacon: 6, 'host-of-house-church': 7, 'co-worker': 8, 'letter-carrier': 9,
    'traveling-companion': 10, patron: 11, convert: 12, member: 13,
    relative: 14, greeted: 15, mentioned: 16, opponent: 17,
  };
  for (const list of churchMembershipsMap.values()) {
    list.sort((a, b) => {
      const ra = ROLE_ORDER[a.role] ?? 99;
      const rb = ROLE_ORDER[b.role] ?? 99;
      if (ra !== rb) return ra - rb;
      return (a.person.name || '').localeCompare(b.person.name || '');
    });
  }
  for (const list of personMembershipsMap.values()) {
    list.sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return (a.church.name || '').localeCompare(b.church.name || '');
    });
  }

  // ── Church -> households ────────────────────────────────────────────────

  const churchHouseholdsMap = new Map();
  dbHouseholds.forEach(h => {
    if (!h.church_id) return;
    if (!churchHouseholdsMap.has(h.church_id)) churchHouseholdsMap.set(h.church_id, []);
    churchHouseholdsMap.get(h.church_id).push({
      ...h,
      head: h.head_person_id ? personMap.get(h.head_person_id) : null,
    });
  });

  // ── Church -> scripture references ──────────────────────────────────────

  const churchScriptureRefsMap = new Map();
  dbScriptureRefs.forEach(sr => {
    if (!sr.church_id) return;
    if (!churchScriptureRefsMap.has(sr.church_id)) churchScriptureRefsMap.set(sr.church_id, []);
    churchScriptureRefsMap.get(sr.church_id).push(sr);
  });

  // ── Journeys ────────────────────────────────────────────────────────────

  const journeyStopsMap = new Map();
  dbJourneyStops.forEach(s => {
    if (!journeyStopsMap.has(s.journey_id)) journeyStopsMap.set(s.journey_id, []);
    const church = s.church_id ? churchMap.get(s.church_id) : null;
    journeyStopsMap.get(s.journey_id).push({
      ...s,
      church,
      // resolved coordinates: explicit lat/lng on the stop, else the church's
      lat: s.lat != null ? s.lat : church?.lat ?? null,
      lng: s.lng != null ? s.lng : church?.lng ?? null,
      displayName: s.label || church?.name || `Stop ${s.stop_order}`,
    });
  });

  const journeyPeopleMap = new Map();
  dbJourneyPeople.forEach(jp => {
    if (!journeyPeopleMap.has(jp.journey_id)) journeyPeopleMap.set(jp.journey_id, []);
    const person = personMap.get(jp.person_id);
    if (person) journeyPeopleMap.get(jp.journey_id).push({ ...jp, person });
  });

  // ── Counts for map sizing ───────────────────────────────────────────────

  const churchPersonCount = new Map();
  for (const [churchId, list] of churchMembershipsMap) {
    churchPersonCount.set(churchId, new Set(list.map(m => m.person_id)).size);
  }

  return {
    // raw lists
    regions: dbRegions,
    churches: dbChurches,
    people: dbPeople,
    households: dbHouseholds,
    journeys: dbJourneys.map(j => journeyMap.get(j.journey_id)),
    // lookup maps
    regionMap,
    churchMap,
    personMap,
    householdMap,
    journeyMap,
    churchMembershipsMap,
    personMembershipsMap,
    churchHouseholdsMap,
    churchScriptureRefsMap,
    journeyStopsMap,
    journeyPeopleMap,
    // derived
    travelerIds,
    householdGroupIds,
    churchPersonCount,
  };
}

// ── Force-directed graph builders ─────────────────────────────────────────

const REGION_COLORS = {
  judea: '#c0563f',
  syria: '#c08a3f',
  cyprus: '#9bbf3f',
  galatia: '#3fb08a',
  pamphylia: '#3fa0b0',
  asia: '#3f7fc0',
  macedonia: '#7a5cc0',
  achaia: '#b04fa0',
  crete: '#c04f6f',
  italia: '#9c7a4f',
  egypt: '#c0a83f',
  cyrenaica: '#a08a5f',
  'pontus-bithynia': '#5f8aa0',
  cappadocia: '#7f9c5f',
};

export function churchColor(church) {
  if (!church) return '#8b7355';
  return REGION_COLORS[church.region_id] || '#8b7355';
}

/**
 * Build a focused force-graph for a single church: the church node, every
 * person connected to it, the households at it, and — for travelers — the
 * other churches they also belong to (one hop out) so the bridges are visible.
 */
export function buildChurchGraph(data, churchId) {
  const church = data.churchMap.get(churchId);
  if (!church) return { nodes: [], links: [] };

  const nodes = [];
  const links = [];
  const nodeIds = new Set();

  const addNode = (node) => {
    if (nodeIds.has(node.id)) return;
    nodeIds.add(node.id);
    nodes.push(node);
  };

  addNode({
    id: `church:${church.church_id}`,
    type: 'church',
    entityId: church.church_id,
    label: church.name,
    color: churchColor(church),
    val: 14,
    lat: church.lat,
    lng: church.lng,
  });

  const memberships = data.churchMembershipsMap.get(churchId) || [];
  const otherChurchIds = new Set();

  // Group households (Aristobulus, Narcissus) whose only "member" is their
  // pseudo-person head — shown as a single household node, not church + person.
  const groupHouseholdIds = new Set();

  memberships.forEach(m => {
    // Skip the "household of …" pseudo-person rows — the household node added
    // below is their single representation.
    if (data.householdGroupIds.has(m.person_id)) {
      if (m.household_id) groupHouseholdIds.add(m.household_id);
      return;
    }

    const isTraveler = data.travelerIds.has(m.person_id);
    const isVisitor = !m.is_primary; // home church is elsewhere — passing through
    const churchCount = (data.personMembershipsMap.get(m.person_id) || []).length;
    addNode({
      id: `person:${m.person_id}`,
      type: 'person',
      entityId: m.person_id,
      label: m.person.name,
      gender: m.person.gender,
      role: m.role,
      isTraveler,
      isVisitor,
      churchCount,
      color: isVisitor ? '#d98c2b' : '#6b8caf',
      val: isVisitor ? 7 : 4,
    });
    links.push({
      source: `person:${m.person_id}`,
      target: `church:${church.church_id}`,
      role: m.role,
      kind: isVisitor ? 'visitor' : 'member',
    });

    // For anyone connected to other churches, pull those in one hop out so the
    // bridge threads are visible — regardless of member/visitor status.
    if (isTraveler) {
      const personMemberships = data.personMembershipsMap.get(m.person_id) || [];
      personMemberships.forEach(pm => {
        if (pm.church_id === churchId) return;
        otherChurchIds.add(pm.church_id);
        addNode({
          id: `church:${pm.church_id}`,
          type: 'church',
          entityId: pm.church_id,
          label: pm.church.name,
          color: churchColor(pm.church),
          val: 9,
          isOtherChurch: true,
          lat: pm.church.lat,
          lng: pm.church.lng,
        });
        // Link to a church *other* than the focused one: drawn as a fading
        // thread, but it exerts no pull so the person still orbits this church.
        links.push({
          source: `person:${m.person_id}`,
          target: `church:${pm.church_id}`,
          role: pm.role,
          kind: 'bridge',
        });
      });
    }
  });

  // Households at this church become nodes too: church -> household -> members.
  // Group households carry no member nodes — they sit in the member orbit.
  const households = data.churchHouseholdsMap.get(churchId) || [];
  households.forEach(h => {
    addNode({
      id: `household:${h.household_id}`,
      type: 'household',
      entityId: h.household_id,
      label: h.name,
      color: '#8a7fae',
      val: 6,
    });
    links.push({
      source: `church:${church.church_id}`,
      target: `household:${h.household_id}`,
      kind: groupHouseholdIds.has(h.household_id) ? 'member' : 'household',
    });
  });
  memberships.forEach(m => {
    if (m.household_id
      && nodeIds.has(`household:${m.household_id}`)
      && nodeIds.has(`person:${m.person_id}`)) {
      links.push({
        source: `household:${m.household_id}`,
        target: `person:${m.person_id}`,
        kind: 'household-member',
      });
    }
  });

  return { nodes, links, otherChurchIds: [...otherChurchIds] };
}

/**
 * Build the global force-graph: every church and every person, with a link
 * for each membership. This is the "see the whole web" view.
 */
export function buildGlobalGraph(data) {
  const nodes = [];
  const links = [];

  data.churches.forEach(c => {
    nodes.push({
      id: `church:${c.church_id}`,
      type: 'church',
      entityId: c.church_id,
      label: c.name,
      color: churchColor(c),
      val: 6 + Math.min(12, (data.churchPersonCount.get(c.church_id) || 0)),
    });
  });

  data.people.forEach(p => {
    const isTraveler = data.travelerIds.has(p.person_id);
    const churchCount = (data.personMembershipsMap.get(p.person_id) || []).length;
    nodes.push({
      id: `person:${p.person_id}`,
      type: 'person',
      entityId: p.person_id,
      label: p.name,
      gender: p.gender,
      isTraveler,
      churchCount,
      color: isTraveler ? '#d98c2b' : '#6b8caf',
      val: isTraveler ? 3 + Math.min(8, churchCount) : 2,
    });
  });

  for (const list of data.churchMembershipsMap.values()) {
    list.forEach(m => {
      links.push({
        source: `person:${m.person_id}`,
        target: `church:${m.church_id}`,
        role: m.role,
      });
    });
  }

  return { nodes, links };
}
