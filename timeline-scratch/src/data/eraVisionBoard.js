/**
 * Era descriptions, keywords, and content-filtering utilities
 * for the Vision Board image feed.
 */

// ── Era summaries shown at the top of the vision-board panel ──────────────

export const eraSummaries = {
  'era-apostolic': {
    title: 'The Apostolic Age',
    summary:
      'The era of the first Christians, when the apostles carried the teachings of Jesus across the Roman world. Early house-churches gathered in secret, letters circulated among young communities, and martyrdom became a mark of faithful witness.',
    keywords: [
      'early christian',
      'roman empire 1st century',
      'apostle',
      'ancient Jerusalem',
      'house church',
      'catacomb',
      'roman road',
      'ancient scroll',
      'roman temple',
    ],
  },
  'era-ante-nicene': {
    title: 'The Ante-Nicene Age',
    summary:
      'Before the Council of Nicaea, the church grew through persecution and apologetics. Theologians like Origen and Tertullian shaped early doctrine, while believers worshipped in catacombs and faced the Roman arena.',
    keywords: [
      'roman persecution christian',
      'catacomb painting',
      'early church father',
      'ancient manuscript',
      'roman amphitheater',
      'ancient Alexandria',
      'early christian symbol',
      'chi rho',
    ],
  },
  'era-first-four-councils': {
    title: 'The First Four Councils',
    summary:
      'The great ecumenical councils at Nicaea, Constantinople, Ephesus, and Chalcedon defined core Christian beliefs. Constantine embraced the faith, basilicas rose across the empire, and monasticism took root in the deserts of Egypt.',
    keywords: [
      'ecumenical council',
      'byzantine basilica',
      'Constantine',
      'ancient Nicaea',
      'desert monastery Egypt',
      'early Byzantine mosaic',
      'Christian basilica',
      'ancient church',
    ],
  },
  'era-monks-missionaries': {
    title: 'Monks & Missionaries',
    summary:
      'From the fall of Rome through the early medieval period, monks preserved learning and missionaries carried the gospel to new lands. Monasteries like Monte Cassino and Lindisfarne became centres of faith, art, and scholarship.',
    keywords: [
      'medieval monastery',
      'illuminated manuscript',
      'celtic cross',
      'Lindisfarne',
      'Monte Cassino',
      'medieval monk',
      'scriptorium',
      'Carolingian',
      'Viking age church',
      'Book of Kells',
    ],
  },
  'era-cluniac-reforms': {
    title: 'The Cluniac Reforms',
    summary:
      'Beginning at the Abbey of Cluny, a wave of monastic reform swept across Europe, renewing devotion, strengthening papal authority, and producing some of the finest Romanesque architecture ever built.',
    keywords: [
      'Cluny Abbey',
      'Romanesque church',
      'monastic reform',
      'medieval cloister',
      'Romanesque architecture',
      'medieval abbey',
      'stone carving Romanesque',
    ],
  },
  'era-scholastics': {
    title: 'Scholastics & Monastics',
    summary:
      'A time of castles and knights, soaring Gothic cathedrals, and the Crusades. Heraldry with colorful coats of arms decorated shields and banners. Troubadours sang songs of chivalry, and great stone fortresses rose across Europe.',
    keywords: [
      'Gothic cathedral',
      'medieval castle',
      'medieval knight',
      'heraldry coat of arms',
      'Crusade',
      'medieval university',
      'stained glass window',
      'medieval fortress',
      'stone castle',
      'medieval banner',
    ],
  },
  'era-proto-reformers': {
    title: 'Proto-Reformers & Mystics',
    summary:
      'Voices like John Wycliffe and Jan Hus challenged church corruption long before the Reformation. Meanwhile, mystics such as Julian of Norwich and Meister Eckhart explored the interior life of faith, and the Black Death reshaped European society.',
    keywords: [
      'late medieval church',
      'medieval mystic',
      'Black Death medieval',
      'Wycliffe Bible',
      'Jan Hus',
      'medieval cathedral interior',
      'medieval town',
      'Gothic art',
      'medieval fresco',
    ],
  },
  'era-reformers': {
    title: 'Reformers & Humanists',
    summary:
      'Martin Luther nailed his theses to the church door, the printing press spread new ideas at lightning speed, and Renaissance humanism reshaped how people thought about faith, art, and the world.',
    keywords: [
      'Protestant Reformation',
      'Martin Luther',
      'printing press Gutenberg',
      'Renaissance church',
      'Renaissance art',
      'Reformation era',
      'Renaissance architecture',
      '16th century Europe',
      'Renaissance painting',
    ],
  },
  'era-dissent-discovery': {
    title: 'Dissent & Discovery',
    summary:
      'An age of exploration, scientific revolution, and religious freedom. Pilgrims crossed oceans seeking liberty of conscience, Baroque churches dazzled with gold and light, and Enlightenment thinkers debated the nature of truth.',
    keywords: [
      'Baroque church',
      'Age of Exploration',
      'Pilgrim colonial',
      'scientific revolution',
      'Baroque architecture',
      '17th century church',
      '18th century church',
      'colonial America church',
      'Enlightenment era',
    ],
  },
};

// ── Standard keywords appended to EVERY era search ──────────────────────

export const STANDARD_KEYWORDS = [
  'reconstruction',
  'illustration',
  'art',
  'architecture',
  'painting',
  'sculpture',
  'artifact',
  'historical',
  'museum',
];

// ── Content-safety filter ───────────────────────────────────────────────
// Words / sub-strings that flag an image result as inappropriate for
// elementary and middle-school students.

const BLOCKED_TERMS = [
  'sex',
  'sexual',
  'nude',
  'nudity',
  'naked',
  'erotic',
  'erotica',
  'pornograph',
  'genitalia',
  'genital',
  'topless',
  'explicit',
  'nsfw',
  'fetish',
  'hentai',
  'provocative',
  'seductive',
  'lingerie',
  'burlesque',
  'bdsm',
  'orgy',
  'prostitut',
  'brothel',
  'concubine',
  'phallus',
  'phallic',
  'obscene',
  'indecent',
  'lascivious',
  'lewd',
  'voluptuous',
  'sensual',
  'risqué',
  'risque',
  'courtesan',
];

/**
 * Returns true if the text appears safe for young students.
 * Checks title, description, and any extra metadata strings.
 */
export function isSafeContent(...texts) {
  const combined = texts.filter(Boolean).join(' ').toLowerCase();
  return !BLOCKED_TERMS.some((term) => combined.includes(term));
}

/**
 * Build a set of search queries for a given era.
 * Combines era-specific keywords with the standard set,
 * returning an array of query strings ready for the image API.
 */
export function buildSearchQueries(eraId) {
  const era = eraSummaries[eraId];
  if (!era) return [];

  const eraKeywords = era.keywords || [];
  // Combine each era keyword with a randomly chosen standard keyword
  // to keep queries fresh across loads.
  const queries = eraKeywords.map((kw) => {
    const std =
      STANDARD_KEYWORDS[Math.floor(Math.random() * STANDARD_KEYWORDS.length)];
    return `${kw} ${std}`;
  });

  return queries;
}
