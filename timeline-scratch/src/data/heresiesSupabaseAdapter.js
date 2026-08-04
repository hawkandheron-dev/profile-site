/**
 * Supabase data adapter for the Heresies & Christological Controversies
 * timeline.
 *
 * Reads the same CH_ tables as the main church-history timeline, plus the
 * CH_Movements set, and narrows them to the doctrinal story running from the
 * Judaizing controversy to Chalcedon.
 *
 * Scoping is data-driven — there is no hand-maintained list of ids here. A
 * figure appears because the data says they belong to a movement or carries a
 * doctrinal_role; an event appears because it is tied to a movement or is one
 * of the four ecumenical councils. Adding a row in Supabase is enough to put
 * something on this page.
 */
import {
  getSupabase,
  formatReignYears,
  yearToIsoDate,
  buildConnectionMap,
  buildSourceMap,
  buildWorksMap,
  buildEventConnectionMap
} from './churchHistoryShared.js';

// ── Scope ─────────────────────────────────────────────────────────────────

/** The four ecumenical councils are always shown, movement links or not. */
const ALWAYS_SHOWN_EVENTS = new Set([
  'council-nicaea',
  'council-constantinople-1',
  'council-ephesus',
  'council-chalcedon'
]);

/** Monarchs are shown when their reign overlaps this window. */
const MONARCH_WINDOW = { start: 30, end: 470 };

// ── Presentation ──────────────────────────────────────────────────────────

/**
 * People are coloured by doctrinal role here, not by era as on the main
 * timeline. The defenders are additionally emphasised — the point of the page
 * is the line of orthodoxy, with everyone else distinguishable around it
 * rather than lumped into a single opposing bucket.
 */
const ROLE_STYLES = {
  'defender':           { color: '#c9a227', filterKey: 'defenders',     emphasis: true, label: 'Defender of orthodoxy' },
  'heresiarch':         { color: '#b3261e', filterKey: 'heresiarchs',   label: 'Heresiarch' },
  'contested':          { color: '#e08a1e', filterKey: 'contested',     label: 'Contested figure' },
  'figure':             { color: '#5b7ee8', filterKey: 'churchFigures', label: 'Church figure' },
  'emperor-pagan':      { color: '#6d4c41', filterKey: 'emperors',      label: 'Pagan emperor' },
  'emperor-arianizing': { color: '#7b1fa2', filterKey: 'emperors',      label: 'Emperor backing the Arian party' },
  'emperor-christian':  { color: '#1565c0', filterKey: 'emperors',      label: 'Nicene Christian emperor' }
};

const DEFAULT_PERSON_STYLE = ROLE_STYLES['figure'];

function styleForPerson(person) {
  if (person.doctrinal_role && ROLE_STYLES[person.doctrinal_role]) {
    return ROLE_STYLES[person.doctrinal_role];
  }
  if (person.is_monarch) return ROLE_STYLES['emperor-pagan'];
  return DEFAULT_PERSON_STYLE;
}

const EVENT_STYLES = {
  council:  { color: '#4caf50', shape: 'cross',     filterKey: 'councils',  itemType: 'councils' },
  document: { color: '#f9a825', shape: 'book',      filterKey: 'documents', itemType: 'documents' },
  event:    { color: '#ff6f00', shape: 'reference', filterKey: 'events',    itemType: 'events' }
};

const MOVEMENT_FILTER_KEYS = {
  heresy:      'heresies',
  schism:      'heresies',
  controversy: 'controversies',
  school:      'controversies'
};

const MOVEMENT_KIND_LABELS = {
  heresy: 'Heresy',
  schism: 'Schism',
  controversy: 'Controversy',
  school: 'School of thought'
};

const MOVEMENT_ROLE_LABELS = {
  founder: 'originated by',
  proponent: 'advanced by',
  opponent: 'opposed by',
  associated: 'associated with'
};

// ── Data fetching ─────────────────────────────────────────────────────────

export async function fetchHeresiesData() {
  const supabase = await getSupabase();

  const [
    { data: people, error: peopleErr },
    { data: events, error: eventsErr },
    { data: connections, error: connErr },
    { data: sources, error: srcErr },
    { data: sourceFigures, error: sfErr },
    { data: works, error: worksErr },
    { data: movements, error: movErr },
    { data: movementFigures, error: mfErr },
    { data: movementEvents, error: meErr },
    { data: eventConnections, error: ecErr }
  ] = await Promise.all([
    supabase.from('CH_People').select('*').order('birth_year'),
    supabase.from('CH_Events').select('*').order('event_date'),
    supabase.from('CH_Connections').select('*'),
    supabase.from('CH_Sources').select('*'),
    supabase.from('CH_Source_Figures').select('*'),
    supabase.from('CH_Works').select('*').order('person_id'),
    supabase.from('CH_Movements').select('*').order('start_year'),
    supabase.from('CH_Movement_Figures').select('*'),
    supabase.from('CH_Movement_Events').select('*'),
    supabase.from('CH_EventConnections').select('*')
  ]);

  const errors = [peopleErr, eventsErr, connErr, srcErr, sfErr, worksErr, movErr, mfErr, meErr, ecErr]
    .filter(Boolean);
  if (errors.length) {
    throw new Error(`Supabase fetch errors: ${errors.map(e => e.message).join('; ')}`);
  }

  return transformToTimelineFormat({
    people: people || [],
    events: events || [],
    connections: connections || [],
    sources: sources || [],
    sourceFigures: sourceFigures || [],
    works: works || [],
    movements: movements || [],
    movementFigures: movementFigures || [],
    movementEvents: movementEvents || [],
    eventConnections: eventConnections || []
  });
}

// ── Transform ─────────────────────────────────────────────────────────────

function transformToTimelineFormat(db) {
  const connectionMap = buildConnectionMap(db.connections);
  const sourceMap = buildSourceMap(db.sources, db.sourceFigures);
  const worksMap = buildWorksMap(db.works);
  const eventConnectionMap = buildEventConnectionMap(db.eventConnections);

  const movementById = new Map(db.movements.map(m => [m.movement_id, m]));

  // person_id → [{ movement, role }]
  const movementsByPerson = new Map();
  for (const mf of db.movementFigures) {
    const movement = movementById.get(mf.movement_id);
    if (!movement) continue;
    if (!movementsByPerson.has(mf.person_id)) movementsByPerson.set(mf.person_id, []);
    movementsByPerson.get(mf.person_id).push({ movement, role: mf.role });
  }

  // event_id → [{ movement, relation }]
  const movementsByEvent = new Map();
  for (const me of db.movementEvents) {
    const movement = movementById.get(me.movement_id);
    if (!movement) continue;
    if (!movementsByEvent.has(me.event_id)) movementsByEvent.set(me.event_id, []);
    movementsByEvent.get(me.event_id).push({ movement, relation: me.relation });
  }

  // ── People ──────────────────────────────────────────────────────────────
  const timelinePeople = [];

  for (const p of db.people) {
    const inMovement = movementsByPerson.has(p.person_id);
    const classified = Boolean(p.doctrinal_role);

    if (p.is_monarch) {
      const reignStart = p.reign_start_year ?? p.birth_year;
      const reignEnd = p.reign_end_year ?? p.death_year;
      const overlapsWindow =
        reignStart != null && reignEnd != null &&
        reignStart <= MONARCH_WINDOW.end && reignEnd >= MONARCH_WINDOW.start;
      if (!overlapsWindow) continue;

      const style = styleForPerson(p);
      timelinePeople.push({
        id: p.person_id,
        name: p.name,
        startDate: p.birth_date,
        endDate: p.death_date,
        dateCertainty: 'year only',
        periodId: 'roman-emperors',
        preview: formatReignYears(reignStart, reignEnd),
        color: style.color,
        aboveTimeline: false,
        isMonarch: true,
        filterKey: style.filterKey,
        doctrinalRole: p.doctrinal_role || null,
        doctrinalRoleLabel: style.label,
        location: p.location,
        description: p.description || null,
        monarchType: p.monarch_type || null,
        referenceUrl: p.reference_url || null,
        reignStart: p.reign_start || null,
        reignEnd: p.reign_end || null,
        reignStartYear: p.reign_start_year ?? null,
        reignEndYear: p.reign_end_year ?? null,
        connections: connectionMap.get(p.person_id) || [],
        sources: sourceMap.get(p.person_id) || [],
        works: worksMap.get(p.person_id) || []
      });
      continue;
    }

    // Non-monarchs earn their place by being tied to a movement or classified.
    if (!inMovement && !classified) continue;

    const style = styleForPerson(p);
    const affiliations = movementsByPerson.get(p.person_id) || [];

    timelinePeople.push({
      id: p.person_id,
      name: p.name,
      startDate: p.birth_date,
      endDate: p.death_date,
      dateCertainty: 'year only',
      periodId: p.doctrinal_role || 'figure',
      periodName: style.label,
      preview: style.label,
      color: style.color,
      aboveTimeline: true,
      filterKey: style.filterKey,
      emphasis: Boolean(style.emphasis),
      emphasisColor: style.color,
      doctrinalRole: p.doctrinal_role || null,
      doctrinalRoleLabel: style.label,
      movements: affiliations.map(a => ({
        id: a.movement.movement_id,
        name: a.movement.name,
        role: a.role,
        roleLabel: MOVEMENT_ROLE_LABELS[a.role] || a.role
      })),
      location: p.location,
      description: p.description || null,
      connections: connectionMap.get(p.person_id) || [],
      sources: sourceMap.get(p.person_id) || [],
      works: worksMap.get(p.person_id) || [],
      referenceUrl: p.reference_url || null
    });
  }

  // ── Events → points ─────────────────────────────────────────────────────
  const timelinePoints = [];

  for (const ev of db.events) {
    const linked = movementsByEvent.get(ev.event_id);
    if (!linked && !ALWAYS_SHOWN_EVENTS.has(ev.event_id)) continue;

    const style = EVENT_STYLES[ev.event_type] || EVENT_STYLES.event;
    timelinePoints.push({
      id: ev.event_id,
      name: ev.name,
      date: ev.event_date,
      endDate: ev.end_date || null,
      dateCertainty: 'year only',
      shape: style.shape,
      color: style.color,
      preview: ev.name,
      aboveTimeline: ev.event_type !== 'document',
      itemType: style.itemType,
      filterKey: style.filterKey,
      location: ev.location,
      description: ev.description || null,
      referenceUrl: ev.reference_url || null,
      connectedPeople: eventConnectionMap.get(ev.event_id) || [],
      sources: sourceMap.get(ev.event_id) || [],
      movements: (linked || []).map(l => ({
        id: l.movement.movement_id,
        name: l.movement.name,
        relation: l.relation
      }))
    });
  }

  // ── Movements → periods ─────────────────────────────────────────────────
  // Rendered as brackets below the axis, so the figures above stay legible.
  const timelinePeriods = db.movements.map(m => ({
    id: m.movement_id,
    name: m.name,
    startDate: yearToIsoDate(m.start_year),
    endDate: yearToIsoDate(m.end_year),
    dateCertainty: 'year only',
    color: m.color || '#607d8b',
    preview: MOVEMENT_KIND_LABELS[m.kind] || m.kind,
    aboveTimeline: false,
    filterKey: MOVEMENT_FILTER_KEYS[m.kind] || 'controversies',
    kind: m.kind,
    description: m.description || null,
    referenceUrl: m.reference_url || null
  }));

  return {
    data: {
      people: timelinePeople,
      points: timelinePoints,
      periods: timelinePeriods
    },
    raw: {
      people: db.people,
      events: db.events,
      movements: db.movements,
      movementFigures: db.movementFigures,
      movementEvents: db.movementEvents,
      connections: db.connections,
      sources: db.sources,
      works: db.works
    }
  };
}
