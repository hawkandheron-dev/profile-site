/**
 * Church History Timeline data
 * Transforms data from events.json format to Timeline component format
 */

// Raw data from events.json
const rawData = {
  groups: [
    { id: "people", content: "People" },
    { id: "councils", content: "Councils & Synods" },
    { id: "roman-emperors", content: "Roman Emperors (Reign)" },
    { id: "documents", content: "Documents" },
    { id: "events", content: "Events" },
    { id: "eras", content: "Eras & Movements" }
  ],
  items: [
    { id: "jesus", group: "people", content: "Jesus", start: "-0003-01-01", end: "0033-01-01" },
    { id: "john-evangelist", group: "people", content: "John the Evangelist", start: "0006-01-01", end: "0100-01-01" },
    { id: "paul", group: "people", content: "Paul", start: "0005-01-01", end: "0065-01-01" },
    { id: "peter", group: "people", content: "Peter", start: "0001-01-01", end: "0066-01-01" },
    { id: "papias", group: "people", content: "Papias of Hieropolis", start: "0060-01-01", end: "0130-01-01" },
    { id: "clement-rome", group: "people", content: "Clement of Rome", start: "0035-01-01", end: "0099-01-01" },
    { id: "ignatius-antioch", group: "people", content: "Ignatius of Antioch", start: "0035-01-01", end: "0107-01-01" },
    { id: "polycarp", group: "people", content: "Polycarp", start: "0069-01-01", end: "0155-01-01" },
    { id: "justin-martyr", group: "people", content: "Justin Martyr", start: "0100-01-01", end: "0165-01-01" },
    { id: "irenaeus", group: "people", content: "Irenaeus of Lyons", start: "0130-01-01", end: "0202-01-01" },
    { id: "tertullian", group: "people", content: "Tertullian", start: "0155-01-01", end: "0240-01-01" },
    { id: "hippolytus", group: "people", content: "Hippolytus of Rome", start: "0170-01-01", end: "0235-01-01" },
    { id: "perpetua", group: "people", content: "Perpetua", start: "0185-01-01", end: "0203-01-01" },
    { id: "origen", group: "people", content: "Origen", start: "0185-01-01", end: "0254-01-01" },
    { id: "dionysius-alexandria", group: "people", content: "Dionysius of Alexandria", start: "0210-01-01", end: "0264-01-01" },
    { id: "cyprian", group: "people", content: "Cyprian", start: "0210-01-01", end: "0258-01-01" },
    { id: "anthony-great", group: "people", content: "Anthony the Great", start: "0251-01-01", end: "0356-01-01" },
    { id: "lucian-antioch", group: "people", content: "Lucian of Antioch", start: "0250-01-01", end: "0312-01-01" },
    { id: "alexander-alexandria", group: "people", content: "Alexander of Alexandria", start: "0280-01-01", end: "0328-01-01" },
    { id: "athanasius", group: "people", content: "Athanasius", start: "0296-01-01", end: "0373-01-01" },
    { id: "basil-great", group: "people", content: "Basil the Great", start: "0330-01-01", end: "0379-01-01" },
    { id: "gregory-nyssa", group: "people", content: "Gregory of Nyssa", start: "0335-01-01", end: "0395-01-01" },
    { id: "ambrose-milan", group: "people", content: "Ambrose of Milan", start: "0339-01-01", end: "0397-01-01" },
    { id: "jerome", group: "people", content: "Jerome", start: "0347-01-01", end: "0420-01-01" },
    { id: "john-chrysostom", group: "people", content: "John Chrysostom", start: "0349-01-01", end: "0407-01-01" },
    { id: "arsenius-great", group: "people", content: "Arsenius the Great", start: "0350-01-01", end: "0445-01-01" },
    { id: "augustine", group: "people", content: "Augustine of Hippo", start: "0354-01-01", end: "0430-01-01" },
    { id: "cyril-alexandria", group: "people", content: "Cyril of Alexandria", start: "0376-01-01", end: "0444-01-01" },
    { id: "patrick", group: "people", content: "Patrick", start: "0385-01-01", end: "0461-01-01" },
    { id: "prosper-aquitaine", group: "people", content: "Prosper of Aquitaine", start: "0390-01-01", end: "0455-01-01" },
    { id: "pope-leo-1", group: "people", content: "Pope Leo I", start: "0400-01-01", end: "0461-01-01" },
    { id: "faustus-riez", group: "people", content: "Faustus of Riez", start: "0408-01-01", end: "0490-01-01" },
    { id: "claudianus-mamertus", group: "people", content: "Claudianus Mamertus", start: "0430-01-01", end: "0473-01-01" },
    { id: "mamertus", group: "people", content: "Mamertus", start: "0425-01-01", end: "0475-01-01" },
    { id: "lucidus", group: "people", content: "Lucidus", start: "0425-01-01", end: "0485-01-01" },
    { id: "pope-simplicius", group: "people", content: "Pope Simplicius", start: "0430-01-01", end: "0483-01-01" },
    { id: "benedict-nursia", group: "people", content: "Benedict of Nursia", start: "0480-01-01", end: "0547-01-01" },
    { id: "caesarius-arles", group: "people", content: "Caesarius of Arles", start: "0468-01-01", end: "0542-01-01" },
    { id: "columba", group: "people", content: "Columba", start: "0521-01-01", end: "0597-01-01" },
    { id: "pope-gregory-great", group: "people", content: "Pope Gregory the Great", start: "0540-01-01", end: "0604-01-01" },
    { id: "isidore-seville", group: "people", content: "Isidore of Seville", start: "0560-01-01", end: "0636-01-01" },
    { id: "maximus-confessor", group: "people", content: "Maximus the Confessor", start: "0580-01-01", end: "0662-01-01" },
    { id: "eligius", group: "people", content: "Eligius", start: "0588-01-01", end: "0660-01-01" },
    { id: "audoin", group: "people", content: "Audoin", start: "0610-01-01", end: "0684-01-01" },
    { id: "hilda-whitby", group: "people", content: "Hilda of Whitby", start: "0614-01-01", end: "0680-01-01" },
    { id: "gertrude-nivelles", group: "people", content: "Gertrude of Nivelles", start: "0628-01-01", end: "0659-01-01" },
    { id: "willibrord", group: "people", content: "Willibrord", start: "0658-01-01", end: "0739-01-01" },
    { id: "boniface", group: "people", content: "Boniface", start: "0675-01-01", end: "0754-01-01" },
    { id: "bede", group: "people", content: "The Venerable Bede", start: "0673-01-01", end: "0735-01-01" },
    { id: "beatus-liebana", group: "people", content: "Beatus of Liebana", start: "0730-01-01", end: "0786-01-01" },
    { id: "paulinus-aquileia", group: "people", content: "Paulinus II of Aquileia", start: "0726-01-01", end: "0802-01-01" },
    { id: "alcuin-york", group: "people", content: "Alcuin of York", start: "0735-01-01", end: "0804-01-01" },
    { id: "rabanus-maurus", group: "people", content: "Rabanus Maurus", start: "0780-01-01", end: "0856-01-01" },
    { id: "kassia-byzantium", group: "people", content: "Kassia of Byzantium", start: "0800-01-01", end: "0843-01-01" },
    { id: "john-scotus-eriugena", group: "people", content: "John Scotus Eriugena", start: "0800-01-01", end: "0877-01-01" },
    { id: "photios-constantinople", group: "people", content: "Photios I of Constantinople", start: "0810-01-01", end: "0893-01-01" },
    { id: "dhuoda-uzes", group: "people", content: "Dhuoda of Uzes", start: "0810-01-01", end: "0844-01-01" },
    { id: "cyril-methodius", group: "people", content: "Cyril and Methodius", start: "0815-01-01", end: "0885-01-01" },
    { id: "remigius-auxerre", group: "people", content: "Remigius of Auxerre", start: "0841-01-01", end: "0908-01-01" },
    { id: "odo-cluny", group: "people", content: "Odo of Cluny", start: "0878-01-01", end: "0942-01-01" },
    { id: "dunstan", group: "people", content: "Dunstan", start: "0909-01-01", end: "0988-01-01" },
    { id: "sylvester-ii", group: "people", content: "Sylvester II / Gerbert of Aurillac", start: "0946-01-01", end: "1003-01-01" },
    { id: "oswald-worcester", group: "people", content: "Oswald of Worcester", start: "0945-01-01", end: "0992-01-01" },
    { id: "adalbert-prague", group: "people", content: "Adalbert of Prague", start: "0956-01-01", end: "0997-01-01" },
    { id: "herluin-bec", group: "people", content: "Herluin of Bec", start: "0995-01-01", end: "1078-01-01" },
    { id: "lanfranc", group: "people", content: "Lanfranc", start: "1007-01-01", end: "1089-01-01" },
    { id: "anselm", group: "people", content: "Anselm", start: "1033-01-01", end: "1109-01-01" },
    { id: "anselm-laon", group: "people", content: "Anselm of Laon", start: "1045-01-01", end: "1117-01-01" },
    { id: "hildegard-bingen", group: "people", content: "Hildegard of Bingen", start: "1098-01-01", end: "1179-01-01" },
    { id: "bernard-clairvaux", group: "people", content: "Bernard of Clairvaux", start: "1090-01-01", end: "1153-01-01" },
    { id: "peter-waldo", group: "people", content: "Peter Waldo", start: "1140-01-01", end: "1205-01-01" },
    { id: "william-auxerre", group: "people", content: "William of Auxerre", start: "1150-01-01", end: "1231-01-01" },
    { id: "dominich", group: "people", content: "Dominic", start: "1172-01-01", end: "1221-01-01" },
    { id: "francis-assisi", group: "people", content: "Francis of Assisi", start: "1182-01-01", end: "1226-01-01" },
    { id: "robert-grosseteste", group: "people", content: "Robert Grosseteste", start: "1175-01-01", end: "1253-01-01" },
    { id: "nicephorus-blemmydes", group: "people", content: "Nicephorus Blemmydes", start: "1197-01-01", end: "1272-01-01" },
    { id: "william-moerbeke", group: "people", content: "William of Moerbeke", start: "1215-01-01", end: "1286-01-01" },
    { id: "thomas-aquinas", group: "people", content: "Thomas Aquinas", start: "1225-01-01", end: "1274-01-01" },
    { id: "duns-scotus", group: "people", content: "Duns Scotus", start: "1265-01-01", end: "1308-01-01" },
    { id: "dante-alighieri", group: "people", content: "Dante Alighieri", start: "1265-01-01", end: "1321-01-01" },
    { id: "thomas-bradwardine", group: "people", content: "Thomas Bradwardine", start: "1300-01-01", end: "1349-01-01" },
    { id: "john-wycliffe", group: "people", content: "John Wycliffe", start: "1330-01-01", end: "1384-01-01" },
    { id: "julian-norwich", group: "people", content: "Julian of Norwich", start: "1343-01-01", end: "1416-01-01" },
    { id: "christine-pisan", group: "people", content: "Christine de Pisan", start: "1364-01-01", end: "1430-01-01" },
    { id: "jan-hus", group: "people", content: "Jan Hus", start: "1369-01-01", end: "1415-01-01" },
    { id: "thomas-kempis", group: "people", content: "Thomas a Kempis", start: "1380-01-01", end: "1471-01-01" },
    { id: "nicholas-cusa", group: "people", content: "Nicholas of Cusa", start: "1401-01-01", end: "1464-01-01" },
    { id: "savonarola", group: "people", content: "Savonarola", start: "1452-01-01", end: "1498-01-01" },
    { id: "desiderius-erasmus", group: "people", content: "Desiderius Erasmus", start: "1466-01-01", end: "1536-01-01" },
    { id: "nicholas-copernicus", group: "people", content: "Nicholas Copernicus", start: "1473-01-01", end: "1543-01-01" },
    { id: "bartolome-las-casas", group: "people", content: "Bartolome de las Casas", start: "1474-01-01", end: "1566-01-01" },
    { id: "thomas-more", group: "people", content: "Thomas More", start: "1478-01-01", end: "1535-01-01" },
    { id: "martin-luther", group: "people", content: "Martin Luther", start: "1483-01-01", end: "1546-01-01" },
    { id: "john-calvin", group: "people", content: "John Calvin", start: "1509-01-01", end: "1564-01-01" },
    { id: "teresa-avila", group: "people", content: "Teresa of Avila", start: "1515-01-01", end: "1582-01-01" },
    { id: "john-cross", group: "people", content: "John of the Cross", start: "1542-01-01", end: "1591-01-01" },
    { id: "william-bradford", group: "people", content: "William Bradford", start: "1590-01-01", end: "1657-01-01" },
    { id: "john-owen", group: "people", content: "John Owen", start: "1616-01-01", end: "1683-01-01" },
    { id: "john-bunyan", group: "people", content: "John Bunyan", start: "1628-01-01", end: "1688-01-01" },
    { id: "thomas-traherne", group: "people", content: "Thomas Traherne", start: "1636-01-01", end: "1674-01-01" },
    { id: "isaac-newton", group: "people", content: "Sir Isaac Newton", start: "1642-01-01", end: "1727-01-01" },
    { id: "charles-wesley", group: "people", content: "Charles Wesley", start: "1707-01-01", end: "1788-01-01" },
    { id: "john-wesley", group: "people", content: "John Wesley", start: "1703-01-01", end: "1791-01-01" },
    // Councils
    { id: "council-nicaea", group: "councils", content: "Council of Nicaea", start: "0325-01-01", type: "point" },
    { id: "council-constantinople-1", group: "councils", content: "First Council of Constantinople", start: "0381-01-01", type: "point" },
    { id: "council-ephesus", group: "councils", content: "Council of Ephesus", start: "0431-01-01", type: "point" },
    { id: "council-chalcedon", group: "councils", content: "Council of Chalcedon", start: "0451-01-01", type: "point" },
    { id: "council-frankfurt", group: "councils", content: "Council (Synod) of Frankfurt", start: "0794-01-01", type: "point" },
    // Roman Emperors
    { id: "roman-augustus", group: "roman-emperors", content: "Augustus", start: "-0030-01-01", end: "0014-01-01" },
    { id: "roman-tiberius", group: "roman-emperors", content: "Tiberius", start: "0014-01-01", end: "0037-01-01" },
    { id: "roman-caligula", group: "roman-emperors", content: "Caligula", start: "0037-01-01", end: "0041-01-01" },
    { id: "roman-claudius", group: "roman-emperors", content: "Claudius", start: "0041-01-01", end: "0054-01-01" },
    { id: "roman-nero", group: "roman-emperors", content: "Nero", start: "0054-01-01", end: "0068-01-01" },
    { id: "roman-galba-otho-vitellius", group: "roman-emperors", content: "Galba, Otho & Aulus Vitellius", start: "0068-01-01", end: "0069-01-01" },
    { id: "roman-vespasian", group: "roman-emperors", content: "Vespasian", start: "0069-01-01", end: "0079-01-01" },
    { id: "roman-titus", group: "roman-emperors", content: "Titus", start: "0079-01-01", end: "0081-01-01" },
    { id: "roman-domitian", group: "roman-emperors", content: "Domitian", start: "0081-01-01", end: "0096-01-01" },
    { id: "roman-nerva", group: "roman-emperors", content: "Nerva", start: "0096-01-01", end: "0098-01-01" },
    { id: "roman-trajan", group: "roman-emperors", content: "Trajan", start: "0098-01-01", end: "0117-01-01" },
    { id: "roman-hadrian", group: "roman-emperors", content: "Hadrian", start: "0117-01-01", end: "0138-01-01" },
    { id: "roman-antoninus", group: "roman-emperors", content: "Antoninus Pius", start: "0138-01-01", end: "0161-01-01" },
    { id: "roman-marcus-aurelius", group: "roman-emperors", content: "Marcus Aurelius", start: "0161-01-01", end: "0180-01-01" },
    { id: "roman-commodus", group: "roman-emperors", content: "Commodus", start: "0180-01-01", end: "0192-01-01" },
    { id: "roman-decius", group: "roman-emperors", content: "Decius", start: "0249-01-01", end: "0251-01-01" },
    { id: "roman-diocletian-maximian", group: "roman-emperors", content: "Diocletian/Maximian", start: "0284-01-01", end: "0305-01-01" },
    { id: "roman-constantine", group: "roman-emperors", content: "Constantine", start: "0306-01-01", end: "0337-01-01" },
    // Documents
    { id: "doc-galatians", group: "documents", content: "Paul's letter to the Galatians", start: "0048-01-01", type: "point" },
    { id: "doc-philippians", group: "documents", content: "Paul's letter to the Philippians", start: "0062-01-01", type: "point" },
    { id: "doc-mark", group: "documents", content: "Gospel of Mark completed", start: "0055-01-01", end: "0075-01-01" },
    { id: "doc-clement-epistle", group: "documents", content: "First epistle of Clement", start: "0096-01-01", type: "point" },
    { id: "doc-didache", group: "documents", content: "The Didache composed", start: "0095-01-01", end: "0150-01-01" },
    { id: "doc-john-fragment", group: "documents", content: "Gospel of John fragment - P42", start: "0125-01-01", end: "0175-01-01" },
    { id: "doc-pauline-p46", group: "documents", content: "Pauline epistle fragment - P46", start: "0175-01-01", end: "0225-01-01" },
    { id: "doc-muratorian", group: "documents", content: "Muratorian Canon", start: "0170-01-01", type: "point" },
    { id: "doc-thomas-mentioned", group: "documents", content: "Gospel of Thomas mentioned", start: "0230-01-01", type: "point" },
    { id: "doc-athanasius-canon", group: "documents", content: "Athanasian canon", start: "0367-01-01", type: "point" },
    { id: "doc-book-kells", group: "documents", content: "Book of Kells composed", start: "0800-01-01", type: "point" },
    // Events
    { id: "event-rome-visigoths", group: "events", content: "Rome sacked by the Visigoths", start: "0410-01-01", type: "point" },
    { id: "event-west-empire-end", group: "events", content: "The end of the Western Roman Empire", start: "0476-01-01", type: "point" },
    { id: "event-east-west-schism", group: "events", content: "The Great East/West Schism", start: "1054-01-01", type: "point" },
    { id: "event-normans-england", group: "events", content: "Normans invade England", start: "1066-01-01", type: "point" },
    { id: "event-hussite-wars", group: "events", content: "The Hussite Wars", start: "1419-01-01", end: "1434-01-01" },
    { id: "event-ottomans-constantinople", group: "events", content: "Constantinople taken by the Ottomans", start: "1453-01-01", type: "point" },
    { id: "event-diet-worms", group: "events", content: "Luther tried at the Diet of Worms", start: "1521-01-01", type: "point" },
    // Eras
    { id: "era-apostolic", group: "eras", content: "The Apostolic Age", start: "0001-01-01", end: "0100-01-01" },
    { id: "era-ante-nicene", group: "eras", content: "The Ante-Nicene Age", start: "0100-01-01", end: "0325-01-01" },
    { id: "era-first-four-councils", group: "eras", content: "The First Four Councils", start: "0325-01-01", end: "0451-01-01" },
    { id: "era-monks-missionaries", group: "eras", content: "Monks & Missionaries", start: "0450-01-01", end: "1000-01-01" },
    { id: "era-cluniac-reforms", group: "eras", content: "The Cluniac Reforms", start: "0950-01-01", end: "1130-01-01", belowTimeline: true },
    { id: "era-scholastics", group: "eras", content: "Scholastics & Monastics", start: "1000-01-01", end: "1300-01-01" },
    { id: "era-proto-reformers", group: "eras", content: "Proto-Reformers & Mystics", start: "1300-01-01", end: "1500-01-01" },
    { id: "era-reformers", group: "eras", content: "Reformers & Humanists", start: "1500-01-01", end: "1650-01-01" },
    { id: "era-dissent-discovery", group: "eras", content: "Dissent & Discovery", start: "1650-01-01", end: "1800-01-01" }
  ]
};

// Color mappings for different categories
const colorMap = {
  people: '#5b7ee8',
  councils: '#4caf50',
  'roman-emperors': '#d32f2f',
  documents: '#f9a825',
  events: '#ff6f00'
};

// Distinct colors for each church age/era
const eraColorMap = {
  'era-apostolic': '#00acc1',        // Cyan
  'era-ante-nicene': '#7b1fa2',      // Purple
  'era-first-four-councils': '#1976d2', // Blue
  'era-monks-missionaries': '#388e3c',  // Green
  'era-cluniac-reforms': '#f57c00',     // Orange
  'era-scholastics': '#c2185b',         // Pink
  'era-proto-reformers': '#5d4037',     // Brown
  'era-reformers': '#0097a7',           // Teal
  'era-dissent-discovery': '#7c4dff'    // Deep Purple
};

// Shape/icon mappings for point events
const shapeMap = {
  councils: 'cross',
  documents: 'book',
  events: 'reference'
};

// Helper to parse year from date string (handles BC years with negative prefix)
function parseYearFromDate(dateStr) {
  if (!dateStr) return null;
  const year = parseInt(dateStr.substring(0, 5), 10);
  // Convert from astronomical year to historical year for BC dates
  // Astronomical: 0 = 1 BC, -1 = 2 BC, etc.
  if (year <= 0) {
    return year - 1; // -0030 becomes -31, which we'll display as 31 BC
  }
  return year;
}

// Helper to format reign years for display
function formatReignYears(startYear, endYear) {
  const formatYear = (year) => {
    if (year < 0) {
      return `${Math.abs(year)} BC`;
    }
    return `${year} AD`;
  };

  if (startYear === null || endYear === null) {
    return '';
  }

  return `Reigned ${formatYear(startYear)}-${formatYear(endYear)}`;
}

// Transform the data to Timeline component format
function transformData() {
  const people = [];
  const points = [];
  const periods = [];

  rawData.items.forEach(item => {
    const isPoint = item.type === 'point' || !item.end;

    if (item.group === 'people') {
      // People are rendered as spans above the timeline
      // Color is based on their era
      const eraId = getEraForDate(item.start);
      const eraInfo = getEraInfo(eraId);
      people.push({
        id: item.id,
        name: item.content,
        startDate: item.start,
        endDate: item.end,
        dateCertainty: 'year only',
        periodId: eraId,
        periodName: eraInfo.name,
        preview: `${item.content}`,
        color: eraColorMap[eraId] || '#5b7ee8',
        aboveTimeline: true
      });
    } else if (item.group === 'roman-emperors') {
      // Roman emperors are rendered below the timeline
      // Parse reign years for preview
      const reignStart = parseYearFromDate(item.start);
      const reignEnd = parseYearFromDate(item.end);
      const reignPreview = formatReignYears(reignStart, reignEnd);

      people.push({
        id: item.id,
        name: item.content,
        startDate: item.start,
        endDate: item.end,
        dateCertainty: 'year only',
        periodId: 'roman-emperors',
        preview: reignPreview,
        color: colorMap[item.group],
        aboveTimeline: false,
        isEmperor: true
      });
    } else if (item.group === 'eras') {
      // Eras are rendered as periods with distinct colors
      periods.push({
        id: item.id,
        name: item.content,
        startDate: item.start,
        endDate: item.end,
        dateCertainty: 'year only',
        color: eraColorMap[item.id] || '#00acc1',
        preview: item.content,
        aboveTimeline: item.belowTimeline !== true
      });
    } else if (item.group === 'documents') {
      // Documents are always points, positioned at early date
      // If they have a date range, store both for the label
      points.push({
        id: item.id,
        name: item.content,
        date: item.start,
        endDate: item.end || null, // Store end date for range display
        dateCertainty: 'year only',
        shape: shapeMap[item.group] || 'circle',
        color: colorMap[item.group] || '#888888',
        preview: item.content,
        aboveTimeline: false, // Documents below timeline
        itemType: 'documents'
      });
    } else if (isPoint) {
      // Point events (councils, events)
      points.push({
        id: item.id,
        name: item.content,
        date: item.start,
        endDate: item.end || null, // Store end date for range display if any
        dateCertainty: 'year only',
        shape: shapeMap[item.group] || 'circle',
        color: colorMap[item.group] || '#888888',
        preview: item.content,
        aboveTimeline: true,
        itemType: item.group // 'councils' or 'events'
      });
    } else {
      // Range items that aren't people, eras, or documents
      // Treat as periods
      periods.push({
        id: item.id,
        name: item.content,
        startDate: item.start,
        endDate: item.end,
        dateCertainty: 'year only',
        color: colorMap[item.group] || '#888888',
        preview: item.content,
        aboveTimeline: false
      });
    }
  });

  return { people, points, periods };
}

// Era information lookup
const eraInfoMap = {
  'era-apostolic': { name: 'The Apostolic Age', start: 1, end: 100 },
  'era-ante-nicene': { name: 'The Ante-Nicene Age', start: 100, end: 325 },
  'era-first-four-councils': { name: 'The First Four Councils', start: 325, end: 451 },
  'era-monks-missionaries': { name: 'Monks & Missionaries', start: 450, end: 1000 },
  'era-scholastics': { name: 'Scholastics & Monastics', start: 1000, end: 1300 },
  'era-proto-reformers': { name: 'Proto-Reformers & Mystics', start: 1300, end: 1500 },
  'era-reformers': { name: 'Reformers & Humanists', start: 1500, end: 1650 },
  'era-dissent-discovery': { name: 'Dissent & Discovery', start: 1650, end: 1800 }
};

// Helper to get era info
function getEraInfo(eraId) {
  return eraInfoMap[eraId] || { name: 'Unknown Era', start: 0, end: 0 };
}

// Helper to determine which era a date falls into
function getEraForDate(dateStr) {
  const year = parseInt(dateStr.substring(0, 4), 10);
  if (year < 100) return 'era-apostolic';
  if (year < 325) return 'era-ante-nicene';
  if (year < 451) return 'era-first-four-councils';
  if (year < 1000) return 'era-monks-missionaries';
  if (year < 1300) return 'era-scholastics';
  if (year < 1500) return 'era-proto-reformers';
  if (year < 1650) return 'era-reformers';
  return 'era-dissent-discovery';
}

export const churchHistoryData = transformData();

export const churchHistoryConfig = {
  initialViewport: {
    startDate: '0001-01-01',
    endDate: '0500-12-31'
  },
  eraLabels: 'BC/AD',
  maxTimeSpan: 2000,
  laneOrder: ['people', 'points', 'periods'],
  legend: [
    {
      type: 'people',
      id: 'people',
      name: 'People',
      color: '#5b7ee8',
      filterKey: 'people'
    },
    {
      type: 'people',
      id: 'roman-emperors',
      name: 'Emperors',
      color: '#d32f2f',
      filterKey: 'emperors',
      isEmperor: true
    },
    {
      type: 'bracket',
      id: 'periods',
      name: 'Period',
      color: '#00838f',
      filterKey: 'periods'
    },
    {
      type: 'point',
      id: 'councils',
      name: 'Councils',
      shape: 'cross',
      color: '#4caf50',
      filterKey: 'councils'
    },
    {
      type: 'point',
      id: 'documents',
      name: 'Documents',
      shape: 'book',
      color: '#f9a825',
      filterKey: 'documents'
    },
    {
      type: 'point',
      id: 'events',
      name: 'Events',
      shape: 'reference',
      color: '#ff6f00',
      filterKey: 'events'
    }
  ]
};
