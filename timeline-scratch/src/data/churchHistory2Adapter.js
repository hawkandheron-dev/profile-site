/**
 * Supabase data adapter for CH Timeline 2.0.
 *
 * This is the union of the two 1.0 adapters — it reads the same CH_ tables as
 * churchHistorySupabaseAdapter.js plus the CH_Movements set that
 * heresiesSupabaseAdapter.js reads — and unlike the heresies page it scopes
 * *nothing* out. Every person, event and movement is returned.
 *
 * What manages the density instead is the layer split:
 *
 *   front — the ~158 church figures whose lifespans are the point of the page
 *   back  — emperors, heresiarchs, contested figures, movements and every
 *           event, drawn behind the front layer as a blurred wash until the
 *           reader focuses a person or lifts the whole layer
 *
 * Eras are derived from dates (churchHistory2Eras.js), not read from
 * CH_People.era_id, so the scheme changed without a migration. CH_Eras is not
 * fetched at all.
 */
import {
  getSupabase,
  formatReignYears,
  yearToIsoDate,
  buildConnectionMap,
  buildSourceMap,
  buildWorksMap,
  buildEventConnectionMap,
} from './churchHistoryShared.js';
import { eraForYear } from './churchHistory2Eras.js';
import { BACK_STYLES } from './churchHistory2Data.js';
import { NICENE_GOLD } from './heresiesData.js';

// Tour scenes, linked media and the media-crop mutation are identical to 1.0;
// re-export rather than duplicate so there is one implementation to maintain.
export { fetchTourScenes, fetchLinkedMedia, updateLinkedMediaCrop } from './churchHistorySupabaseAdapter.js';

// ── Layer assignment ──────────────────────────────────────────────────────

/** Doctrinal roles that put a non-monarch on the background layer. */
const BACKGROUND_ROLES = new Set(['heresiarch', 'contested']);

/** Whether a CH_People row belongs behind the main figures. */
export function isBackgroundPerson(person) {
  return Boolean(person.is_monarch) || BACKGROUND_ROLES.has(person.doctrinal_role);
}

// ── Presentation ──────────────────────────────────────────────────────────

/** Emperors keep the per-empire colouring from the 1.0 timeline. */
const monarchColorMap = {
  'roman-unified': '#7b4a8e',
  'roman-western': '#a1443a',
  'roman-eastern': '#3a6ea1',
  'frankish':      '#b07a2a',
  'hre':           '#a35a2a',
  'english':       '#2f7a6a',
  'spanish':       '#9c3a63',
  'french':        '#43509b',
  'russian':       '#6b4a3a',
};

const EVENT_STYLES = {
  council:  { color: BACK_STYLES.councils.color,  shape: 'cross',     filterKey: 'councils',  itemType: 'councils' },
  document: { color: BACK_STYLES.documents.color, shape: 'book',      filterKey: 'documents', itemType: 'documents' },
  event:    { color: BACK_STYLES.events.color,    shape: 'reference', filterKey: 'events',    itemType: 'events' },
};

const MOVEMENT_KIND_LABELS = {
  heresy: 'Heresy',
  schism: 'Schism',
  controversy: 'Controversy',
  school: 'School of thought',
};

const MOVEMENT_ROLE_LABELS = {
  founder: 'originated by',
  proponent: 'advanced by',
  opponent: 'opposed by',
  associated: 'associated with',
};

const DOCTRINAL_ROLE_LABELS = {
  defender: 'Defender of orthodoxy',
  heresiarch: 'Heresiarch',
  contested: 'Contested figure',
  'emperor-pagan': 'Pagan emperor',
  'emperor-arianizing': 'Emperor backing the Arian party',
  'emperor-christian': 'Nicene Christian emperor',
};

// ── Data fetching ─────────────────────────────────────────────────────────

export async function fetchChurchHistory2Data() {
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
    { data: eventConnections, error: ecErr },
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
    supabase.from('CH_EventConnections').select('*'),
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
    eventConnections: eventConnections || [],
  });
}

// ── Transform ─────────────────────────────────────────────────────────────

export function transformToTimelineFormat(db) {
  const connectionMap = buildConnectionMap(db.connections);
  const sourceMap = buildSourceMap(db.sources, db.sourceFigures);
  const worksMap = buildWorksMap(db.works);
  const eventConnectionMap = buildEventConnectionMap(db.eventConnections);

  const movementById = new Map(db.movements.map(m => [m.movement_id, m]));

  /** person_id → [{ movement, role }] */
  const movementsByPerson = new Map();
  for (const mf of db.movementFigures) {
    const movement = movementById.get(mf.movement_id);
    if (!movement) continue;
    if (!movementsByPerson.has(mf.person_id)) movementsByPerson.set(mf.person_id, []);
    movementsByPerson.get(mf.person_id).push({ movement, role: mf.role });
  }

  /** event_id → [{ movement, relation }] */
  const movementsByEvent = new Map();
  for (const me of db.movementEvents) {
    const movement = movementById.get(me.movement_id);
    if (!movement) continue;
    if (!movementsByEvent.has(me.event_id)) movementsByEvent.set(me.event_id, []);
    movementsByEvent.get(me.event_id).push({ movement, relation: me.relation });
  }

  const affiliationsFor = (personId) =>
    (movementsByPerson.get(personId) || []).map(a => ({
      id: a.movement.movement_id,
      name: a.movement.name,
      role: a.role,
      roleLabel: MOVEMENT_ROLE_LABELS[a.role] || a.role,
    }));

  // ── People, split by layer ──────────────────────────────────────────────
  const frontPeople = [];
  const backPeople = [];
  /** Emperor reigns, for "who was on the throne during this lifespan". */
  const reigns = [];

  for (const p of db.people) {
    const shared = {
      id: p.person_id,
      name: p.name,
      startDate: p.birth_date,
      endDate: p.death_date,
      dateCertainty: 'year only',
      birthYear: p.birth_year ?? null,
      deathYear: p.death_year ?? null,
      location: p.location,
      description: p.description || null,
      referenceUrl: p.reference_url || null,
      doctrinalRole: p.doctrinal_role || null,
      doctrinalRoleLabel: DOCTRINAL_ROLE_LABELS[p.doctrinal_role] || null,
      movements: affiliationsFor(p.person_id),
      connections: connectionMap.get(p.person_id) || [],
      sources: sourceMap.get(p.person_id) || [],
      works: worksMap.get(p.person_id) || [],
    };

    if (p.is_monarch) {
      const reignStart = p.reign_start_year ?? p.birth_year;
      const reignEnd = p.reign_end_year ?? p.death_year;
      if (reignStart !== null && reignStart !== undefined && reignEnd !== null && reignEnd !== undefined) {
        reigns.push({ id: p.person_id, start: reignStart, end: reignEnd });
      }
      backPeople.push({
        ...shared,
        layer: 'back',
        periodId: 'roman-emperors',
        periodName: BACK_STYLES.emperors.label,
        preview: formatReignYears(reignStart, reignEnd),
        color: monarchColorMap[p.monarch_type] || BACK_STYLES.emperors.color,
        aboveTimeline: false,
        isMonarch: true,
        filterKey: 'emperors',
        monarchType: p.monarch_type || null,
        reignStart: p.reign_start || null,
        reignEnd: p.reign_end || null,
        reignStartYear: reignStart ?? null,
        reignEndYear: reignEnd ?? null,
      });
      continue;
    }

    if (BACKGROUND_ROLES.has(p.doctrinal_role)) {
      const style = BACK_STYLES[p.doctrinal_role === 'heresiarch' ? 'heresiarchs' : 'contested'];
      backPeople.push({
        ...shared,
        layer: 'back',
        periodId: p.doctrinal_role,
        periodName: style.label,
        preview: shared.doctrinalRoleLabel || style.label,
        color: style.color,
        aboveTimeline: true,
        filterKey: p.doctrinal_role === 'heresiarch' ? 'heresiarchs' : 'contested',
      });
      continue;
    }

    // Front layer: coloured by the era their life falls in, nothing else.
    const era = eraForYear(p.birth_year);
    const isDefender = p.doctrinal_role === 'defender';
    frontPeople.push({
      ...shared,
      layer: 'front',
      periodId: era.id,
      periodName: era.name,
      preview: p.name,
      color: era.color,
      aboveTimeline: true,
      filterKey: era.id,
      // The defenders keep the gold emphasis ring they carry on the heresies
      // page — it is the one doctrinal distinction that stays in the front.
      emphasis: isDefender,
      emphasisColor: isDefender ? NICENE_GOLD : undefined,
    });
  }

  // ── Events → back-layer points ─────────────────────────────────────────
  const backPoints = db.events.map(ev => {
    const style = EVENT_STYLES[ev.event_type] || EVENT_STYLES.event;
    return {
      id: ev.event_id,
      name: ev.name,
      date: ev.event_date,
      endDate: ev.end_date || null,
      dateCertainty: 'year only',
      layer: 'back',
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
      movements: (movementsByEvent.get(ev.event_id) || []).map(l => ({
        id: l.movement.movement_id,
        name: l.movement.name,
        relation: l.relation,
      })),
    };
  });

  // ── Movements → back-layer bands ───────────────────────────────────────
  // Above the axis, behind the figures — a movement is a current the people
  // were caught in, so it belongs among them rather than down with the
  // emperors. Keeping it below would also strand an empty band between the
  // axis and the reigns everywhere outside the fourth century, since all
  // twenty movements fall between 48 and 451.
  const backPeriods = db.movements.map(m => ({
    id: m.movement_id,
    name: m.name,
    startDate: yearToIsoDate(m.start_year),
    endDate: yearToIsoDate(m.end_year),
    dateCertainty: 'year only',
    layer: 'back',
    color: m.color || BACK_STYLES.movements.color,
    preview: MOVEMENT_KIND_LABELS[m.kind] || m.kind,
    aboveTimeline: true,
    filterKey: 'movements',
    kind: m.kind,
    description: m.description || null,
    referenceUrl: m.reference_url || null,
  }));

  const backItemById = new Map();
  for (const item of backPeople) backItemById.set(item.id, item);
  for (const item of backPoints) backItemById.set(item.id, item);
  for (const item of backPeriods) backItemById.set(item.id, item);

  return {
    // The front layer has no periods — that is the whole point of 2.0.
    data: { people: frontPeople, points: [], periods: [] },
    backData: { people: backPeople, points: backPoints, periods: backPeriods },
    index: {
      connectionMap,
      eventConnectionMap,
      movementsByPerson,
      movementsByEvent,
      reigns: reigns.sort((a, b) => a.start - b.start),
      personById: new Map(db.people.map(p => [p.person_id, p])),
      backItemById,
    },
    raw: {
      people: db.people,
      events: db.events,
      movements: db.movements,
      movementFigures: db.movementFigures,
      movementEvents: db.movementEvents,
      connections: db.connections,
      sources: db.sources,
      sourceFigures: db.sourceFigures,
      works: db.works,
      eventConnections: db.eventConnections,
    },
  };
}
