import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const url = window.SUPABASE_URL || '';
  const key = window.SUPABASE_ANON_KEY || '';
  if (!url || !key) throw new Error('Supabase configuration not found. Ensure the config script has loaded.');
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

function checkError(res, label) {
  if (res.error) throw new Error(`AR fetch error (${label}): ${res.error.message}`);
  return res.data;
}

export async function fetchArthurianData() {
  const sb = getSupabase();

  const [realmsRes, charsRes, relsRes, sourcesRes] = await Promise.all([
    sb.from('AR_Realms').select('*').order('sort_order'),
    sb.from('AR_Characters').select('*'),
    sb.from('AR_Relations').select('*'),
    sb.from('AR_Sources').select('*').order('character_id').order('sort_order'),
  ]);

  const rawRealms   = checkError(realmsRes,   'AR_Realms');
  const rawChars    = checkError(charsRes,     'AR_Characters');
  const rawRels     = checkError(relsRes,      'AR_Relations');
  const rawSources  = checkError(sourcesRes,   'AR_Sources');

  // Build lookup maps
  const relsByChar = {};
  rawRels.forEach(({ from_id, to_id, relation_type }) => {
    (relsByChar[from_id] ||= []).push({ to: to_id, type: relation_type });
  });

  const sourcesByChar = {};
  rawSources.forEach(({ character_id, source, source_text }) => {
    (sourcesByChar[character_id] ||= []).push({ source, text: source_text });
  });

  // Transform AR_Realms → REALMS array (arc_width → width)
  const realms = rawRealms.map(({ realm_id, label, arc_width }) => ({
    id: realm_id,
    label,
    width: arc_width,
  }));

  // realm lookup objects
  const realmLabel = {};
  rawRealms.forEach(({ realm_id, label }) => { realmLabel[realm_id] = label; });

  // Transform AR_Characters → characters array
  const realmById = {};
  const knightsByRealm = {}; // realmId → [{charId, round_table_order}]

  const characters = rawChars.map((row) => {
    const { character_id, name, title, group_id, realm_id, blazon, round_table_order } = row;

    realmById[character_id] = realm_id;

    if (round_table_order !== null && round_table_order !== undefined) {
      (knightsByRealm[realm_id] ||= []).push({ id: character_id, order: round_table_order });
    }

    return {
      id: character_id,
      name,
      title,
      group: group_id,
      blazon,
      relations: relsByChar[character_id] || [],
      sources: sourcesByChar[character_id] || [],
    };
  });

  // Build KNIGHT_ORDER_BY_REALM: realmId → [charId, ...] sorted by round_table_order
  const knightOrderByRealm = {};
  Object.entries(knightsByRealm).forEach(([realmId, entries]) => {
    knightOrderByRealm[realmId] = entries
      .sort((a, b) => a.order - b.order)
      .map((e) => e.id);
  });

  return {
    characters,
    realmData: { realms, realmById, realmLabel, knightOrderByRealm },
  };
}
