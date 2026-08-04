/**
 * Legend-driven filtering for the timeline.
 *
 * Originally the six categories below were hardcoded in both the desktop and
 * mobile timelines. Datasets can now name their own categories by putting a
 * `filterKey` on each item and declaring matching legend entries — which is
 * how the heresies timeline gets defenders / heresiarchs / contested figures /
 * movements. Items without a `filterKey` fall back to the original rules, so
 * the church-history, historical-eras and sample datasets are unaffected.
 */

/**
 * The six original filter keys. Datasets that predate config-driven filtering
 * rely on these being on by default, so they stay the baseline; any filterKey
 * a config's legend declares is merged on top.
 */
const BASE_FILTERS = {
  people: true,
  emperors: true,
  periods: true,
  councils: true,
  documents: true,
  events: true
};

export function buildInitialFilters(config) {
  const filters = { ...BASE_FILTERS };
  for (const item of config?.legend || []) {
    if (item.filterKey) filters[item.filterKey] = true;
  }
  return filters;
}

export function personFilterKey(person) {
  return person.filterKey || (person.isMonarch ? 'emperors' : 'people');
}

export function pointFilterKey(point) {
  if (point.filterKey) return point.filterKey;
  if (point.itemType === 'councils') return 'councils';
  if (point.itemType === 'documents') return 'documents';
  if (point.itemType === 'events') return 'events';
  return null; // no key → always shown
}

export function periodFilterKey(period) {
  return period.filterKey || 'periods';
}

export function applyFilters(data, filters) {
  const { people = [], points = [], periods = [] } = data;
  const on = (key) => key === null || filters[key] !== false;

  return {
    people: people.filter(p => on(personFilterKey(p))),
    points: points.filter(p => on(pointFilterKey(p))),
    periods: periods.filter(p => on(periodFilterKey(p)))
  };
}
