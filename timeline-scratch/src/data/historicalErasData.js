/**
 * Historical Eras Timeline Data
 *
 * Designed for a "vision board" experience — click an era to see
 * a Pinterest-style board of curated images from public museum APIs.
 * Target audience: elementary and middle school students.
 */

export const historicalEras = [
  {
    id: 'ancient-egypt',
    name: 'Ancient Egypt',
    startDate: '-3099-01-01',
    endDate: '-0029-01-01',
    color: '#C4A74B',
    aboveTimeline: true,
    preview: 'Pharaohs, pyramids, and the Nile — one of the oldest civilizations in the world.',
    description: '<p>Ancient Egypt flourished along the Nile River for over 3,000 years. From the Great Pyramids of Giza to the golden mask of Tutankhamun, Egypt\'s monuments and art continue to captivate imaginations around the world.</p>',
    keywords: [
      'Egyptian pyramid Giza',
      'pharaoh sculpture ancient',
      'Egyptian hieroglyphics wall',
      'sphinx Egypt',
      'Egyptian temple Luxor',
      'mummy sarcophagus Egypt',
      'Tutankhamun gold mask',
      'Nile River ancient Egypt',
      'Egyptian jewelry ancient',
      'Rosetta Stone',
      'papyrus scroll Egypt',
      'Egyptian cat statue'
    ]
  },
  {
    id: 'ancient-mesopotamia',
    name: 'Ancient Mesopotamia',
    startDate: '-3499-01-01',
    endDate: '-0538-01-01',
    color: '#8B6914',
    aboveTimeline: true,
    preview: 'The cradle of civilization — home to Sumer, Babylon, and Assyria.',
    description: '<p>Mesopotamia, the land between the Tigris and Euphrates rivers, saw the rise of the world\'s first cities, writing systems, and empires. From the ziggurats of Sumer to the Hanging Gardens of Babylon, this region shaped the foundations of human civilization.</p>',
    keywords: [
      'Babylonian art ancient',
      'ziggurat Mesopotamia',
      'cuneiform tablet clay',
      'Assyrian sculpture relief',
      'Ishtar Gate Babylon',
      'Sumerian artifact',
      'Hammurabi code stele',
      'Mesopotamia jewelry',
      'Babylonian lion',
      'Lamassu winged bull'
    ]
  },
  {
    id: 'classical-greece',
    name: 'Classical Greece',
    startDate: '-0799-01-01',
    endDate: '-0145-01-01',
    color: '#1565C0',
    aboveTimeline: false,
    preview: 'Democracy, philosophy, the Olympics, and some of the most famous buildings ever made.',
    description: '<p>Ancient Greece gave the world democracy, philosophy, theater, and the Olympic Games. The Parthenon in Athens, the sculptures of gods and athletes, and the painted pottery that told stories of myths and daily life still inspire artists and thinkers today.</p>',
    keywords: [
      'Parthenon Athens Greece',
      'Greek pottery painted vase',
      'Greek sculpture marble',
      'ancient Olympic games',
      'Greek theater ancient amphitheater',
      'Greek column architecture temple',
      'Greek mythology art',
      'Athena statue ancient',
      'Greek coin ancient',
      'Greek helmet bronze'
    ]
  },
  {
    id: 'roman-empire',
    name: 'Roman Empire',
    startDate: '-0508-01-01',
    endDate: '0476-01-01',
    color: '#8B0000',
    aboveTimeline: true,
    preview: 'Legions, aqueducts, and an empire that stretched across the known world.',
    description: '<p>From a small city on the Tiber River, Rome grew into one of the largest empires in history. Roman roads, aqueducts, and the Colosseum showcase the engineering genius of this civilization. Roman law, language, and culture still shape our world.</p>',
    keywords: [
      'Roman Colosseum ancient',
      'Roman aqueduct',
      'Roman mosaic floor',
      'Roman sculpture bust emperor',
      'Pompeii ruins fresco',
      'Roman road ancient',
      'Roman armor legion',
      'Roman coin ancient',
      'Roman arch triumph',
      'Roman bath ancient',
      'gladiator Roman art'
    ]
  },
  {
    id: 'byzantine-empire',
    name: 'Byzantine Empire',
    startDate: '0330-01-01',
    endDate: '1453-01-01',
    color: '#6A0DAD',
    aboveTimeline: false,
    preview: 'The Eastern Roman Empire — golden mosaics, grand churches, and a thousand years of history.',
    description: '<p>When the Western Roman Empire fell, the Eastern half carried on for another thousand years as the Byzantine Empire. Its capital, Constantinople, was one of the greatest cities in the world, filled with golden mosaics, towering churches like the Hagia Sophia, and priceless works of art.</p>',
    keywords: [
      'Byzantine mosaic gold',
      'Hagia Sophia interior',
      'Byzantine icon painting',
      'Constantinople ancient art',
      'Byzantine art gold',
      'Byzantine emperor mosaic',
      'Byzantine church architecture',
      'Byzantine manuscript illuminated',
      'Byzantine cross jeweled',
      'Byzantine silk textile'
    ]
  },
  {
    id: 'early-middle-ages',
    name: 'Early Middle Ages',
    startDate: '0476-01-01',
    endDate: '1000-01-01',
    color: '#2E7D32',
    aboveTimeline: true,
    preview: 'Vikings, monks, and the dawn of medieval Europe.',
    description: '<p>After Rome fell, Europe entered a time of great change. Viking longships sailed the seas, monks preserved knowledge in beautiful illuminated manuscripts, and new kingdoms rose across the continent. Celtic art, Anglo-Saxon treasures, and Carolingian culture defined this era.</p>',
    keywords: [
      'Viking longship',
      'illuminated manuscript medieval Book of Kells',
      'Anglo-Saxon treasure artifact',
      'Charlemagne medieval',
      'medieval monastery',
      'Celtic cross stone carved',
      'Viking helmet artifact',
      'medieval sword early',
      'Viking rune stone',
      'Carolingian art manuscript'
    ]
  },
  {
    id: 'high-middle-ages',
    name: 'High Middle Ages',
    startDate: '1000-01-01',
    endDate: '1300-01-01',
    color: '#4E342E',
    aboveTimeline: true,
    preview: 'Castles, knights, cathedrals, and the Crusades.',
    description: '<p>The High Middle Ages was a time of castles and knights, soaring Gothic cathedrals, and the Crusades. Heraldry with colorful coats of arms decorated shields and banners. Troubadours sang songs of chivalry, and great stone fortresses rose across Europe.</p>',
    keywords: [
      'medieval castle fortress',
      'knight armor medieval',
      'crusades medieval art',
      'Gothic cathedral interior',
      'medieval sword knight',
      'medieval tapestry Bayeux',
      'coat of arms heraldry medieval',
      'medieval shield heraldic',
      'stained glass window medieval',
      'medieval jousting tournament'
    ]
  },
  {
    id: 'late-middle-ages',
    name: 'Late Middle Ages',
    startDate: '1300-01-01',
    endDate: '1500-01-01',
    color: '#5D4037',
    aboveTimeline: false,
    preview: 'Walled towns, epic battles, and the twilight of the medieval world.',
    description: '<p>The Late Middle Ages saw walled towns bustle with trade, the Hundred Years\' War between England and France, and the devastating Black Plague. But it was also a time of innovation — the printing press, new styles of armor, and the first stirrings of the Renaissance.</p>',
    keywords: [
      'medieval town market',
      'Hundred Years War medieval',
      'medieval manuscript painting',
      'medieval armor plate',
      'medieval printing press Gutenberg',
      'medieval market town',
      'medieval siege castle',
      'Joan of Arc medieval',
      'medieval church painting',
      'medieval book of hours'
    ]
  },
  {
    id: 'renaissance',
    name: 'European Renaissance',
    startDate: '1400-01-01',
    endDate: '1600-01-01',
    color: '#AD1457',
    aboveTimeline: true,
    preview: 'A rebirth of art, science, and discovery that changed the world forever.',
    description: '<p>The Renaissance was a "rebirth" of art, learning, and culture that began in Italy and spread across Europe. Leonardo da Vinci, Michelangelo, and Raphael created masterpieces. Scientists began to unlock the secrets of the natural world, and explorers set sail for new lands.</p>',
    keywords: [
      'Renaissance painting Italian',
      'Michelangelo sculpture David',
      'Leonardo da Vinci art',
      'Renaissance architecture Florence dome',
      'Sistine Chapel ceiling',
      'Raphael painting Renaissance',
      'Renaissance map exploration',
      'Botticelli Primavera painting',
      'Renaissance portrait painting',
      'Medici Florence art'
    ]
  },
  {
    id: 'age-of-exploration',
    name: 'Age of Exploration',
    startDate: '1400-01-01',
    endDate: '1600-01-01',
    color: '#00695C',
    aboveTimeline: false,
    preview: 'Brave voyages across uncharted seas to discover new worlds.',
    description: '<p>Driven by curiosity and the desire for trade, European explorers sailed across vast oceans to reach new lands. Ships like Columbus\'s caravels and Magellan\'s fleet opened up connections between continents. New maps were drawn, and the world became a much bigger — and more connected — place.</p>',
    keywords: [
      'Age of Exploration sailing ship',
      'ancient map exploration cartography',
      'compass navigation antique',
      'galleon ship historical',
      'exploration globe antique',
      'caravel ship Columbus',
      'nautical chart old map',
      'astrolabe navigation instrument',
      'explorer portrait historical',
      'Age of Discovery ship'
    ]
  }
];

/**
 * Transform eras into Timeline component format
 */
export const historicalErasTimelineData = {
  people: [],
  points: [],
  periods: historicalEras.map(era => ({
    id: era.id,
    name: era.name,
    startDate: era.startDate,
    endDate: era.endDate,
    color: era.color,
    preview: era.preview,
    description: era.description,
    aboveTimeline: era.aboveTimeline
  }))
};

export const historicalErasConfig = {
  initialViewport: {
    startDate: '-3600-01-01',
    endDate: '1700-01-01'
  },
  eraLabels: 'BC/AD',
  maxTimeSpan: 6000,
  laneOrder: ['periods'],
  legend: historicalEras.map(era => ({
    type: 'period',
    id: era.id,
    name: era.name,
    color: era.color
  }))
};

/**
 * Get keywords for a given era ID
 */
export function getEraKeywords(eraId) {
  const era = historicalEras.find(e => e.id === eraId);
  return era ? era.keywords : [];
}

/**
 * Get era by ID
 */
export function getEraById(eraId) {
  return historicalEras.find(e => e.id === eraId) || null;
}
