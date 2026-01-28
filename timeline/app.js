async function main() {
  const container = document.getElementById("timeline");
  const loadingIndicator = document.getElementById("timeline-loading");
  const modal = document.getElementById("event-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDate = document.getElementById("modal-date");
  const modalDescription = document.getElementById("modal-description");
  const modalSearchLink = document.getElementById("modal-search-link");
  const modalWorks = document.getElementById("modal-works");
  const modalWorksList = document.getElementById("modal-works-list");
  const modalClose = modal.querySelector(".modal-close");

  const res = await fetch("./events.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load events.json: ${res.status}`);
  const data = await res.json();

  const now = new Date();
  const currentYear = now.getFullYear();
  const minDate = new Date(-49, 0, 1);
  const maxDate = new Date(currentYear, 11, 31);
  const fixedWindowStart = new Date(100, 0, 1);
  const fixedWindowEnd = new Date(375, 0, 1);
  const fixedWindowSpan = fixedWindowEnd - fixedWindowStart;

  // Fixed group heights based on max concurrent events analysis
  // people: 18, councils: 1, roman-emperors: 9, documents: 3, events: 1, eras: 4
  const itemHeight = 32; // Base height per item
  const groupHeights = {
    people: 18 * itemHeight + 20,
    councils: 1 * itemHeight + 20,
    "roman-emperors": 9 * itemHeight + 20,
    documents: 3 * itemHeight + 20,
    events: 1 * itemHeight + 20,
    eras: 4 * itemHeight + 20
  };

  const options = {
    stack: true,
    horizontalScroll: true,
    zoomable: false,
    zoomMin: fixedWindowSpan,
    zoomMax: fixedWindowSpan,
    maxHeight: "100%",
    tooltip: { followMouse: true },
    // Set an initial window (roughly)
    start: fixedWindowStart,
    end: fixedWindowEnd,
    min: minDate,
    max: maxDate,
    groupHeightMode: 'fixed'
  };

  let lastFocusedElement = null;

  function formatYearAxis(year) {
    if (year <= 0) {
      return `${1 - year} BC`;
    }
    return `${year} AD`;
  }

  function toDisplayYear(year) {
    return year <= 0 ? 1 - year : year;
  }

  function precisionFromParts(parts) {
    if (!parts) return "year";
    if (parts.month && parts.day) return "day";
    if (parts.month) return "month";
    return "year";
  }

  function formatDateLabel(dateString, precisionOverride) {
    const parts = parseDateParts(dateString);
    if (!parts) return "";
    const precision = precisionOverride || precisionFromParts(parts);
    const yearLabel = `${toDisplayYear(parts.year)}`;
    if (precision === "year") return yearLabel;
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const monthName = monthNames[parts.month - 1] || "";
    if (precision === "month") {
      return `${monthName} ${yearLabel}`;
    }
    return `${monthName} ${parts.day}, ${yearLabel}`;
  }

  function parseDateParts(dateString) {
    if (!dateString) return null;
    const match = dateString.match(/^(-?\d{1,4})(?:-(\d{2}))?(?:-(\d{2}))?/);
    if (!match) return null;
    return {
      year: Number.parseInt(match[1], 10),
      month: match[2] ? Number.parseInt(match[2], 10) : null,
      day: match[3] ? Number.parseInt(match[3], 10) : null
    };
  }

  function buildItemLabel(item) {
    const startParts = parseDateParts(item.start);
    const endParts = parseDateParts(item.end);
    const startYear = startParts ? toDisplayYear(startParts.year) : null;
    const endYear = endParts ? toDisplayYear(endParts.year) : null;
    let yearLabel = "";
    if (endYear && startYear && endYear !== startYear) {
      yearLabel = `${startYear}-${endYear}`;
    } else if (startYear) {
      yearLabel = `${startYear}`;
    }
    return yearLabel ? `${item.name} (${yearLabel})` : item.name;
  }

  function buildPeopleSearchQuery(item) {
    const startParts = parseDateParts(item.start);
    const endParts = parseDateParts(item.end);
    const startYear = startParts ? toDisplayYear(startParts.year) : "?";
    const endYear = endParts ? toDisplayYear(endParts.year) : "?";
    return `${item.name} (${startYear}-${endYear})`;
  }

  function renderWorksForPerson(personName) {
    if (!modalWorks || !modalWorksList) return;
    modalWorksList.textContent = "";
    const worksForPerson = worksByAuthor.get(personName.toLowerCase()) || [];
    if (!worksForPerson.length) {
      modalWorks.hidden = true;
      return;
    }
    worksForPerson.forEach((work) => {
      const listItem = document.createElement("li");
      if (work.url) {
        const link = document.createElement("a");
        link.href = work.url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = work.name;
        listItem.appendChild(link);
      } else {
        listItem.textContent = work.name;
      }
      modalWorksList.appendChild(listItem);
    });
    modalWorks.hidden = false;
  }

  const categoryMeta = {
    people: { icon: "👤", className: "cat-people" },
    councils: { icon: "🏛️", className: "cat-councils" },
    "roman-emperors": { icon: "⚔️", className: "cat-roman-emperors" },
    documents: { icon: "📜", className: "cat-documents" },
    events: { icon: "📌", className: "cat-events" },
    eras: { icon: "⏳", className: "cat-eras" }
  };

  const works = [
    {
      name: "Gospel of John",
      authors: ["John the Evangelist"],
      url: "https://www.biblegateway.com/passage/?search=John+1&version=ESV"
    },
    {
      name: "First Epistle of John (1 John)",
      authors: ["John the Evangelist"],
      url: "https://www.biblegateway.com/passage/?search=1+John+1&version=ESV"
    },
    {
      name: "Second Epistle of John (2 John)",
      authors: ["John the Evangelist"],
      url: "https://www.biblegateway.com/passage/?search=2+John+1&version=ESV"
    },
    {
      name: "Third Epistle of John (3 John)",
      authors: ["John the Evangelist"],
      url: "https://www.biblegateway.com/passage/?search=3+John+1&version=ESV"
    },
    {
      name: "Revelation",
      authors: ["John the Evangelist"],
      url: "https://www.biblegateway.com/passage/?search=Revelation+1&version=ESV"
    },
    {
      name: "Epistle to the Romans",
      authors: ["Paul"],
      url: "https://www.biblegateway.com/passage/?search=Romans+1&version=ESV"
    },
    {
      name: "First Epistle to the Corinthians (1 Corinthians)",
      authors: ["Paul"],
      url: "https://www.biblegateway.com/passage/?search=1+Corinthians+1&version=ESV"
    },
    {
      name: "Second Epistle to the Corinthians (2 Corinthians)",
      authors: ["Paul"],
      url: "https://www.biblegateway.com/passage/?search=2+Corinthians+1&version=ESV"
    },
    {
      name: "Epistle to the Galatians",
      authors: ["Paul"],
      url: "https://www.biblegateway.com/passage/?search=Galatians+1&version=ESV"
    },
    {
      name: "Epistle to the Ephesians",
      authors: ["Paul"],
      url: "https://www.biblegateway.com/passage/?search=Ephesians+1&version=ESV"
    },
    {
      name: "First Epistle of Peter (1 Peter)",
      authors: ["Peter"],
      url: "https://www.biblegateway.com/passage/?search=1+Peter+1&version=ESV"
    },
    {
      name: "Second Epistle of Peter (2 Peter)",
      authors: ["Peter"],
      url: "https://www.biblegateway.com/passage/?search=2+Peter+1&version=ESV"
    },
    {
      name: "Exposition of the Sayings of the Lord (fragments)",
      authors: ["Papias of Hieropolis"]
    },
    {
      name: "First Epistle of Clement to the Corinthians (1 Clement)",
      authors: ["Clement of Rome"]
    },
    { name: "Letter to the Ephesians", authors: ["Ignatius of Antioch"] },
    { name: "Letter to the Magnesians", authors: ["Ignatius of Antioch"] },
    { name: "Letter to the Trallians", authors: ["Ignatius of Antioch"] },
    { name: "Letter to the Romans", authors: ["Ignatius of Antioch"] },
    { name: "Letter to Polycarp", authors: ["Ignatius of Antioch"] },
    { name: "Letter to the Philippians", authors: ["Polycarp"] },
    { name: "First Apology", authors: ["Justin Martyr"] },
    { name: "Second Apology", authors: ["Justin Martyr"] },
    { name: "Dialogue with Trypho", authors: ["Justin Martyr"] },
    {
      name: "Protrepticus (Exhortation to the Greeks)",
      authors: ["Clement of Alexandria"]
    },
    { name: "Paedagogus (The Instructor)", authors: ["Clement of Alexandria"] },
    { name: "Stromata (Miscellanies)", authors: ["Clement of Alexandria"] },
    {
      name: "Who Is the Rich Man That Shall Be Saved? (Quis Dives Salvetur)",
      authors: ["Clement of Alexandria"]
    },
    { name: "Diatessaron", authors: ["Tatian"] },
    { name: "Address to the Greeks", authors: ["Tatian"] },
    { name: "Against Heresies", authors: ["Irenaeus of Lyons"] },
    {
      name: "Demonstration of the Apostolic Preaching (Proof of the Apostolic Preaching)",
      authors: ["Irenaeus of Lyons"]
    },
    { name: "Apology", authors: ["Tertullian"] },
    { name: "Prescription Against Heretics", authors: ["Tertullian"] },
    { name: "Against Marcion", authors: ["Tertullian"] },
    { name: "On Baptism", authors: ["Tertullian"] },
    { name: "On the Flesh of Christ", authors: ["Tertullian"] },
    { name: "Apostolic Tradition (attributed)", authors: ["Hippolytus of Rome"] },
    { name: "Refutation of All Heresies", authors: ["Hippolytus of Rome"] },
    { name: "Commentary on Daniel", authors: ["Hippolytus of Rome"] },
    { name: "On Christ and Antichrist", authors: ["Hippolytus of Rome"] },
    {
      name: "The Passion of Perpetua and Felicity (Perpetua’s diary portion)",
      authors: ["Perpetua"]
    },
    { name: "On First Principles (De Principiis)", authors: ["Origen"] },
    { name: "Against Celsus", authors: ["Origen"] },
    { name: "On Prayer", authors: ["Origen"] },
    { name: "Commentary on the Gospel of John", authors: ["Origen"] },
    { name: "Homilies on Genesis", authors: ["Origen"] },
    {
      name: "Address of Thanksgiving to Origen (Panegyric)",
      authors: ["Gregory Thaumaturgus"]
    },
    {
      name: "Declaration of Faith (Creed) (traditional attribution)",
      authors: ["Gregory Thaumaturgus"]
    },
    {
      name: "On the Promises (as preserved in fragments/quotations)",
      authors: ["Dionysius of Alexandria"]
    },
    {
      name: "Letters (selected, as preserved in Eusebius)",
      authors: ["Dionysius of Alexandria"]
    },
    { name: "On the Unity of the Catholic Church", authors: ["Cyprian"] },
    { name: "On the Lapsed", authors: ["Cyprian"] },
    { name: "On Mortality", authors: ["Cyprian"] },
    { name: "On the Lord’s Prayer", authors: ["Cyprian"] },
    { name: "Letters (Epistles)", authors: ["Cyprian"] },
    {
      name: "Letter(s) against Arianism (selected)",
      authors: ["Alexander of Alexandria"]
    },
    { name: "On the Incarnation", authors: ["Athanasius"] },
    { name: "Life of Antony", authors: ["Athanasius"] },
    { name: "Orations Against the Arians", authors: ["Athanasius"] },
    { name: "Letters to Serapion on the Holy Spirit", authors: ["Athanasius"] },
    { name: "Festal Letters (selected)", authors: ["Athanasius"] },
    { name: "On the Holy Spirit", authors: ["Basil the Great"] },
    { name: "Hexaemeron", authors: ["Basil the Great"] },
    {
      name: "Longer Rules (Regulae Fusius Tractatae)",
      authors: ["Basil the Great"]
    },
    {
      name: "Shorter Rules (Regulae Brevius Tractatae)",
      authors: ["Basil the Great"]
    },
    {
      name: "Address to Young Men on How They Might Derive Benefit from Greek Literature",
      authors: ["Basil the Great"]
    },
    {
      name: "Theological Orations (Orations 27–31)",
      authors: ["Gregory of Nazianzus"]
    },
    { name: "Orations (selected)", authors: ["Gregory of Nazianzus"] },
    { name: "Letters (selected)", authors: ["Gregory of Nazianzus"] },
    { name: "Poems (selected)", authors: ["Gregory of Nazianzus"] },
    {
      name: "Oration 43: Funeral Oration on Basil",
      authors: ["Gregory of Nazianzus"]
    },
    { name: "Life of Moses", authors: ["Gregory of Nyssa"] },
    { name: "Great Catechism", authors: ["Gregory of Nyssa"] },
    { name: "On the Making of Man", authors: ["Gregory of Nyssa"] },
    { name: "On the Soul and the Resurrection", authors: ["Gregory of Nyssa"] },
    { name: "Against Eunomius", authors: ["Gregory of Nyssa"] },
    {
      name: "On the Duties of the Clergy (De Officiis Ministrorum)",
      authors: ["Ambrose of Milan"]
    },
    { name: "On the Mysteries (De Mysteriis)", authors: ["Ambrose of Milan"] },
    { name: "On the Sacraments (De Sacramentis)", authors: ["Ambrose of Milan"] },
    { name: "On the Holy Spirit (De Spiritu Sancto)", authors: ["Ambrose of Milan"] },
    { name: "On Repentance (De Paenitentia)", authors: ["Ambrose of Milan"] },
    { name: "On Illustrious Men (De Viris Illustribus)", authors: ["Jerome"] },
    { name: "Against Jovinian (Adversus Jovinianum)", authors: ["Jerome"] },
    { name: "Letter 22 to Eustochium", authors: ["Jerome"] },
    {
      name: "Lives of the Hermits (Paul, Hilarion, Malchus)",
      authors: ["Jerome"]
    },
    { name: "Commentary on Galatians", authors: ["Jerome"] },
    { name: "On the Priesthood", authors: ["John Chrysostom"] },
    { name: "Homilies on Matthew", authors: ["John Chrysostom"] },
    { name: "Homilies on John", authors: ["John Chrysostom"] },
    { name: "Homilies on Romans", authors: ["John Chrysostom"] },
    { name: "Letters to Olympias", authors: ["John Chrysostom"] },
    {
      name: "Confessions",
      authors: ["Augustine of Hippo"],
      url: "https://www.ccel.org/ccel/augustine/confessions.html"
    },
    {
      name: "The City of God",
      authors: ["Augustine of Hippo"],
      url: "https://www.ccel.org/ccel/augustine/cityofgod.html"
    },
    { name: "On the Trinity (De Trinitate)", authors: ["Augustine of Hippo"] },
    {
      name: "On Christian Doctrine (De Doctrina Christiana)",
      authors: ["Augustine of Hippo"],
      url: "https://www.ccel.org/ccel/augustine/doctrine.html"
    },
    {
      name: "Enchiridion (Handbook on Faith, Hope, and Love)",
      authors: ["Augustine of Hippo"],
      url: "https://www.ccel.org/ccel/augustine/enchiridion.html"
    },
    { name: "On the Holy Spirit (De Spiritu Sancto)", authors: ["Didymus the Blind"] },
    {
      name: "On the Trinity (De Trinitate) (attributed)",
      authors: ["Didymus the Blind"]
    },
    { name: "Commentary on the Apostles’ Creed", authors: ["Rufinus of Aquileia"] },
    {
      name: "Church History (Latin continuation/translation of Eusebius) (traditional association)",
      authors: ["Rufinus of Aquileia"]
    },
    { name: "Apology for Origen", authors: ["Rufinus of Aquileia"] },
    { name: "Paschal Letters (selected)", authors: ["Theophilus of Alexandria"] },
    { name: "Festal Letters (selected)", authors: ["Theophilus of Alexandria"] },
    { name: "Commentary on the Gospel of John", authors: ["Cyril of Alexandria"] },
    { name: "On the Unity of Christ", authors: ["Cyril of Alexandria"] },
    { name: "Five Tomes Against Nestorius", authors: ["Cyril of Alexandria"] },
    { name: "Festal Letters (selected)", authors: ["Cyril of Alexandria"] },
    {
      name: "Commentary on Luke (fragments/selected)",
      authors: ["Cyril of Alexandria"]
    },
    { name: "The Bazaar of Heracleides", authors: ["Nestorius of Constantinople"] },
    { name: "Letters (selected)", authors: ["Nestorius of Constantinople"] },
    { name: "Confessio", authors: ["Patrick"] },
    { name: "Letter to the Soldiers of Coroticus", authors: ["Patrick"] },
    { name: "Chronicle (Epitoma Chronicon)", authors: ["Prosper of Aquitaine"] },
    { name: "Against the Ingrates (Carmen de Ingratis)", authors: ["Prosper of Aquitaine"] },
    { name: "Liber contra Collatorem", authors: ["Prosper of Aquitaine"] },
    { name: "Tome of Leo", authors: ["Pope Leo I"] },
    { name: "Sermons (selected)", authors: ["Pope Leo I"] },
    { name: "Letters (selected)", authors: ["Pope Leo I"] },
    { name: "On Grace (De Gratia) (traditional attribution)", authors: ["Faustus of Riez"] },
    { name: "Letters (selected)", authors: ["Faustus of Riez"] },
    { name: "On the State of the Soul (De Statu Animae)", authors: ["Claudianus Mamertus"] },
    { name: "Letters (selected)", authors: ["Pope Simplicius"] },
    { name: "Rule of St Benedict", authors: ["Benedict of Nursia"] },
    { name: "Sermons (selected)", authors: ["Caesarius of Arles"] },
    { name: "Rule for Nuns", authors: ["Caesarius of Arles"] },
    { name: "Letters (selected)", authors: ["Caesarius of Arles"] },
    { name: "Pastoral Rule (Regula Pastoralis)", authors: ["Pope Gregory the Great"] },
    { name: "Moralia on Job", authors: ["Pope Gregory the Great"] },
    { name: "Dialogues", authors: ["Pope Gregory the Great"] },
    { name: "Homilies on Ezekiel", authors: ["Pope Gregory the Great"] },
    { name: "Homilies on the Gospels", authors: ["Pope Gregory the Great"] },
    { name: "Etymologies (Etymologiae)", authors: ["Isidore of Seville"] },
    { name: "On the Nature of Things (De Natura Rerum)", authors: ["Isidore of Seville"] },
    { name: "Sentences (Sententiae)", authors: ["Isidore of Seville"] },
    {
      name: "On Ecclesiastical Offices (De Ecclesiasticis Officiis)",
      authors: ["Isidore of Seville"]
    },
    {
      name: "History of the Goths, Vandals, and Suevi",
      authors: ["Isidore of Seville"]
    },
    { name: "Ambigua", authors: ["Maximus the Confessor"] },
    { name: "Mystagogia", authors: ["Maximus the Confessor"] },
    { name: "Questions to Thalassius", authors: ["Maximus the Confessor"] },
    { name: "Disputation with Pyrrhus", authors: ["Maximus the Confessor"] },
    { name: "Four Hundred Chapters on Love", authors: ["Maximus the Confessor"] },
    { name: "Life of Saint Eligius (Vita Sancti Eligii)", authors: ["Audoin"] },
    { name: "Letters (Correspondence) (selected)", authors: ["Boniface"] },
    {
      name: "Ecclesiastical History of the English People",
      authors: ["The Venerable Bede"]
    },
    {
      name: "On the Reckoning of Time (De Temporum Ratione)",
      authors: ["The Venerable Bede"]
    },
    {
      name: "Lives of the Abbots of Wearmouth and Jarrow",
      authors: ["The Venerable Bede"]
    },
    { name: "Commentary on Mark", authors: ["The Venerable Bede"] },
    { name: "On the Temple (De Templo)", authors: ["The Venerable Bede"] },
    { name: "Commentary on the Apocalypse", authors: ["Beatus of Liebana"] },
    {
      name: "Treatise against Adoptionism (with Eterius) (commonly associated)",
      authors: ["Beatus of Liebana", "Cyril and Methodius"]
    },
    { name: "Libellus Sacrosyllabus (against Adoptionism)", authors: ["Paulinus II of Aquileia"] },
    { name: "Letters (selected)", authors: ["Paulinus II of Aquileia"] },
    {
      name: "On the Trinity and Incarnation (De Fide Sanctae Trinitatis)",
      authors: ["Alcuin of York"]
    },
    { name: "De Virtutibus et Vitiis", authors: ["Alcuin of York"] },
    { name: "Letters (selected)", authors: ["Alcuin of York"] },
    { name: "Disputation with Pepin", authors: ["Alcuin of York"] },
    { name: "Life of Willibrord (Vita Willibrordi)", authors: ["Alcuin of York"] },
    { name: "On the Education of Clergy (De Institutione Clericorum)", authors: ["Rabanus Maurus"] },
    { name: "On the Nature of Things (De Rerum Naturis)", authors: ["Rabanus Maurus"] },
    {
      name: "On the Praises of the Holy Cross (De Laudibus Sanctae Crucis)",
      authors: ["Rabanus Maurus"]
    },
    { name: "Commentary on Matthew (selected)", authors: ["Rabanus Maurus"] },
    { name: "Hymn: The Fallen Woman (Kassia’s Troparion)", authors: ["Kassia of Byzantium"] },
    { name: "Hymns (selected)", authors: ["Kassia of Byzantium"] },
    { name: "Epigrams (selected)", authors: ["Kassia of Byzantium"] },
    { name: "Periphyseon (De Divisione Naturae)", authors: ["John Scotus Eriugena"] },
    { name: "On Divine Predestination (De Praedestinatione)", authors: ["John Scotus Eriugena"] },
    { name: "Homily on the Prologue of John", authors: ["John Scotus Eriugena"] },
    {
      name: "Commentary on Pseudo-Dionysius (selected)",
      authors: ["John Scotus Eriugena"]
    },
    { name: "Bibliotheca (Myriobiblon)", authors: ["Photios I of Constantinople"] },
    { name: "Mystagogy of the Holy Spirit", authors: ["Photios I of Constantinople"] },
    { name: "Amphilochia (selected)", authors: ["Photios I of Constantinople"] },
    { name: "Letters (selected)", authors: ["Photios I of Constantinople"] },
    { name: "Liber Manualis (Handbook)", authors: ["Dhuoda of Uzes"] },
    {
      name: "Old Church Slavonic Translation of the Gospels (traditional attribution)",
      authors: ["Cyril and Methodius"]
    },
    {
      name: "Old Church Slavonic Liturgical Translations (selected, traditional attribution)",
      authors: ["Cyril and Methodius"]
    },
    {
      name: "Alphabet/Orthographic works (Glagolitic tradition) (traditional attribution)",
      authors: ["Cyril and Methodius"]
    },
    { name: "Commentary on Martianus Capella (attributed)", authors: ["Remigius of Auxerre"] },
    { name: "Commentary on Boethius (attributed)", authors: ["Remigius of Auxerre"] },
    { name: "Glosses/Commentaries on Priscian (attributed)", authors: ["Remigius of Auxerre"] },
    { name: "Vita Sancti Geraldi (Life of St Gerald of Aurillac)", authors: ["Odo of Cluny"] },
    { name: "Collationes (Conferences) (attributed)", authors: ["Odo of Cluny"] },
    { name: "De Musica (attributed)", authors: ["Odo of Cluny"] },
    { name: "Letters (selected)", authors: ["Sylvester II / Gerbert of Aurillac"] },
    { name: "De Mensura Fistularum (On the Measure of Organ Pipes)", authors: ["Sylvester II / Gerbert of Aurillac"] },
    { name: "On the Body and Blood of the Lord (De Corpore et Sanguine Domini)", authors: ["Lanfranc"] },
    { name: "Letters (selected)", authors: ["Lanfranc"] },
    { name: "Proslogion", authors: ["Anselm"] },
    { name: "Monologion", authors: ["Anselm"] },
    { name: "Why God Became Man (Cur Deus Homo)", authors: ["Anselm"] },
    { name: "On Truth (De Veritate)", authors: ["Anselm"] },
    { name: "On the Freedom of the Will (De Libertate Arbitrii)", authors: ["Anselm"] },
    { name: "Glossa Ordinaria on the Bible (traditionally associated)", authors: ["Anselm of Laon"] },
    { name: "Scivias", authors: ["Hildegard of Bingen"] },
    { name: "Book of Life’s Merits (Liber Vitae Meritorum)", authors: ["Hildegard of Bingen"] },
    { name: "Book of Divine Works (Liber Divinorum Operum)", authors: ["Hildegard of Bingen"] },
    { name: "Physica", authors: ["Hildegard of Bingen"] },
    { name: "Causae et Curae", authors: ["Hildegard of Bingen"] },
    { name: "On Loving God (De Diligendo Deo)", authors: ["Bernard of Clairvaux"] },
    { name: "Sermons on the Song of Songs (selected)", authors: ["Bernard of Clairvaux"] },
    { name: "On Consideration (De Consideratione)", authors: ["Bernard of Clairvaux"] },
    { name: "On Grace and Free Choice (De Gratia et Libero Arbitrio)", authors: ["Bernard of Clairvaux"] },
    { name: "Life of St Malachy (Vita Sancti Malachiae)", authors: ["Bernard of Clairvaux"] },
    { name: "Summa Aurea", authors: ["William of Auxerre"] },
    { name: "Canticle of the Creatures", authors: ["Francis of Assisi"] },
    { name: "Earlier Rule (Regula non bullata)", authors: ["Francis of Assisi"] },
    { name: "Later Rule (Regula bullata)", authors: ["Francis of Assisi"] },
    { name: "Testament", authors: ["Francis of Assisi"] },
    { name: "Admonitions", authors: ["Francis of Assisi"] },
    { name: "On Light (De Luce)", authors: ["Robert Grosseteste"] },
    { name: "Hexaemeron (Commentary on Six Days of Creation)", authors: ["Robert Grosseteste"] },
    { name: "On Truth (De Veritate) (attributed/associated)", authors: ["Robert Grosseteste"] },
    { name: "Letters (selected)", authors: ["Robert Grosseteste"] },
    { name: "Autobiography (attributed)", authors: ["Nicephorus Blemmydes"] },
    { name: "Epitome of Logic", authors: ["Nicephorus Blemmydes"] },
    { name: "Epitome of Physics", authors: ["Nicephorus Blemmydes"] },
    {
      name: "Latin Translation of Aristotle’s Metaphysics (attributed)",
      authors: ["William of Moerbeke"]
    },
    {
      name: "Latin Translation of Proclus’ Elements of Theology",
      authors: ["William of Moerbeke"]
    },
    {
      name: "Latin Translation of Archimedes (selected) (attributed)",
      authors: ["William of Moerbeke"]
    },
    {
      name: "Summa Theologiae",
      authors: ["Thomas Aquinas"],
      url: "https://www.newadvent.org/summa/"
    },
    { name: "Summa Contra Gentiles", authors: ["Thomas Aquinas"] },
    { name: "Catena Aurea", authors: ["Thomas Aquinas"] },
    { name: "On Being and Essence (De Ente et Essentia)", authors: ["Thomas Aquinas"] },
    { name: "Compendium of Theology", authors: ["Thomas Aquinas"] },
    { name: "Ordinatio (Opus Oxoniense)", authors: ["Duns Scotus"] },
    { name: "Reportatio (Lectura/Reportationes)", authors: ["Duns Scotus"] },
    { name: "On the First Principle (De Primo Principio)", authors: ["Duns Scotus"] },
    { name: "Questions on the Metaphysics (Quaestiones super Metaphysicam)", authors: ["Duns Scotus"] },
    { name: "Theoremata (attributed)", authors: ["Duns Scotus"] },
    { name: "The Divine Comedy", authors: ["Dante Alighieri"] },
    { name: "Vita Nuova", authors: ["Dante Alighieri"] },
    { name: "Convivio", authors: ["Dante Alighieri"] },
    { name: "De Vulgari Eloquentia", authors: ["Dante Alighieri"] },
    { name: "De Monarchia", authors: ["Dante Alighieri"] },
    { name: "On the Cause of God (De Causa Dei)", authors: ["Thomas Bradwardine"] },
    { name: "Tractatus de Proportionibus", authors: ["Thomas Bradwardine"] },
    { name: "De Continuo (attributed/associated)", authors: ["Thomas Bradwardine"] },
    { name: "On the Truth of Holy Scripture (De Veritate Sacrae Scripturae)", authors: ["John Wycliffe"] },
    { name: "On the Church (De Ecclesia)", authors: ["John Wycliffe"] },
    { name: "On Civil Dominion (De Civili Dominio)", authors: ["John Wycliffe"] },
    { name: "On the Eucharist (De Eucharistia) (attributed)", authors: ["John Wycliffe"] },
    { name: "Trialogus (attributed)", authors: ["John Wycliffe"] },
    { name: "Revelations of Divine Love", authors: ["Julian of Norwich"] },
    { name: "The Book of the City of Ladies", authors: ["Christine de Pisan"] },
    { name: "The Treasure of the City of Ladies", authors: ["Christine de Pisan"] },
    { name: "The Book of the Deeds and Good Morals of King Charles V", authors: ["Christine de Pisan"] },
    { name: "Letter of the God of Love (Epistre au Dieu d’Amours)", authors: ["Christine de Pisan"] },
    { name: "On the Church (De Ecclesia)", authors: ["Jan Hus"] },
    { name: "Letters (selected)", authors: ["Jan Hus"] },
    { name: "On Simony", authors: ["Jan Hus"] },
    { name: "Exposition of the Faith (selected) (attributed)", authors: ["Jan Hus"] },
    { name: "The Imitation of Christ", authors: ["Thomas a Kempis"] },
    { name: "Prayers and Meditations (selected)", authors: ["Thomas a Kempis"] },
    { name: "Sermons (selected)", authors: ["Thomas a Kempis"] },
    { name: "On Learned Ignorance (De Docta Ignorantia)", authors: ["Nicholas of Cusa"] },
    { name: "On the Peace of Faith (De Pace Fidei)", authors: ["Nicholas of Cusa"] },
    { name: "On the Vision of God (De Visione Dei)", authors: ["Nicholas of Cusa"] },
    { name: "On Conjectures (De Coniecturis)", authors: ["Nicholas of Cusa"] },
    { name: "Idiota de Mente (The Layman on Mind)", authors: ["Nicholas of Cusa"] },
    { name: "Triumph of the Cross", authors: ["Savonarola"] },
    {
      name: "Compendium of Revelations (Compendio di Rivelazioni) (attributed)",
      authors: ["Savonarola"]
    },
    { name: "Sermons (selected)", authors: ["Savonarola"] },
    { name: "In Praise of Folly", authors: ["Desiderius Erasmus"] },
    {
      name: "Handbook of the Christian Soldier (Enchiridion Militis Christiani)",
      authors: ["Desiderius Erasmus"]
    },
    { name: "Colloquies", authors: ["Desiderius Erasmus"] },
    { name: "On Free Will (De Libero Arbitrio)", authors: ["Desiderius Erasmus"] },
    {
      name: "Novum Instrumentum Omne (Greek New Testament, 1516) / New Testament Paraphrases (selected)",
      authors: ["Desiderius Erasmus"]
    },
    {
      name: "On the Revolutions of the Heavenly Spheres (De Revolutionibus Orbium Coelestium)",
      authors: ["Nicholas Copernicus"]
    },
    {
      name: "A Short Account of the Destruction of the Indies",
      authors: ["Bartolome de las Casas"]
    },
    {
      name: "History of the Indies (Historia de las Indias)",
      authors: ["Bartolome de las Casas"]
    },
    { name: "In Defense of the Indians (Apologia)", authors: ["Bartolome de las Casas"] },
    {
      name: "Apologetic History Summary (Apologética Historia Sumaria)",
      authors: ["Bartolome de las Casas"]
    },
    {
      name: "Memorial de Remedios (Remedies for the Indies) (attributed/associated)",
      authors: ["Bartolome de las Casas"]
    },
    { name: "Utopia", authors: ["Thomas More"] },
    { name: "Dialogue of Comfort against Tribulation", authors: ["Thomas More"] },
    { name: "The Sadness of Christ (De Tristitia Christi)", authors: ["Thomas More"] },
    { name: "A Dialogue Concerning Heresies", authors: ["Thomas More"] },
    { name: "History of King Richard III", authors: ["Thomas More"] },
    { name: "Ninety-Five Theses", authors: ["Martin Luther"] },
    { name: "Small Catechism", authors: ["Martin Luther"] },
    { name: "Large Catechism", authors: ["Martin Luther"] },
    { name: "The Bondage of the Will", authors: ["Martin Luther"] },
    { name: "The Freedom of a Christian", authors: ["Martin Luther"] },
    { name: "Sixty-Seven Articles", authors: ["Huldrych Zwingli"] },
    { name: "Commentary on True and False Religion", authors: ["Huldrych Zwingli"] },
    { name: "On the Lord’s Supper", authors: ["Huldrych Zwingli"] },
    {
      name: "On the Providence of God (De Providentia Dei)",
      authors: ["Huldrych Zwingli"]
    },
    { name: "Spiritual Exercises", authors: ["Ignatius of Loyola"] },
    { name: "Constitutions of the Society of Jesus", authors: ["Ignatius of Loyola"] },
    { name: "Letters (selected)", authors: ["Ignatius of Loyola"] },
    { name: "Memoriale (Spiritual Diary)", authors: ["Peter Faber"] },
    { name: "Letters (selected)", authors: ["Peter Faber"] },
    { name: "Letters (selected)", authors: ["Francis Xavier"] },
    {
      name: "Institutes of the Christian Religion",
      authors: ["John Calvin"],
      url: "https://www.ccel.org/ccel/calvin/institutes.html"
    },
    { name: "Commentary on Romans", authors: ["John Calvin"] },
    { name: "Commentary on the Gospel of John", authors: ["John Calvin"] },
    { name: "Reply to Sadoleto", authors: ["John Calvin"] },
    { name: "On the Necessity of Reforming the Church", authors: ["John Calvin"] },
    { name: "The Life of Teresa of Jesus (Autobiography)", authors: ["Teresa of Avila"] },
    { name: "The Way of Perfection", authors: ["Teresa of Avila"] },
    { name: "The Interior Castle", authors: ["Teresa of Avila"] },
    { name: "The Book of the Foundations", authors: ["Teresa of Avila"] },
    { name: "Concepts of the Love of God", authors: ["Teresa of Avila"] },
    { name: "Ascent of Mount Carmel", authors: ["John of the Cross"] },
    { name: "Dark Night of the Soul", authors: ["John of the Cross"] },
    { name: "Spiritual Canticle", authors: ["John of the Cross"] },
    { name: "Living Flame of Love", authors: ["John of the Cross"] },
    { name: "Sayings of Light and Love (Dichos)", authors: ["John of the Cross"] },
    { name: "Of Plymouth Plantation", authors: ["William Bradford"] },
    { name: "On the Mortification of Sin in Believers", authors: ["John Owen"] },
    {
      name: "The Death of Death in the Death of Christ",
      authors: ["John Owen"]
    },
    { name: "Communion with God", authors: ["John Owen"] },
    { name: "The Glory of Christ", authors: ["John Owen"] },
    { name: "A Discourse Concerning the Holy Spirit", authors: ["John Owen"] },
    { name: "The Pilgrim’s Progress", authors: ["John Bunyan"] },
    { name: "Grace Abounding to the Chief of Sinners", authors: ["John Bunyan"] },
    { name: "The Holy War", authors: ["John Bunyan"] },
    { name: "The Life and Death of Mr. Badman", authors: ["John Bunyan"] },
    { name: "The Jerusalem Sinner Saved", authors: ["John Bunyan"] },
    { name: "Centuries of Meditations", authors: ["Thomas Traherne"] },
    { name: "Thanksgivings (poems/prayers) (collected)", authors: ["Thomas Traherne"] },
    { name: "Christian Ethicks (attributed)", authors: ["Thomas Traherne"] },
    {
      name: "Philosophiæ Naturalis Principia Mathematica",
      authors: ["Sir Isaac Newton"]
    },
    { name: "Opticks", authors: ["Sir Isaac Newton"] },
    {
      name: "Observations upon the Prophecies of Daniel and the Apocalypse of St. John",
      authors: ["Sir Isaac Newton"]
    },
    {
      name: "Hymns and Sacred Poems (selected collections)",
      authors: ["Charles Wesley", "John Wesley"]
    },
    { name: "Charles Wesley’s Hymns (selected)", authors: ["Charles Wesley"] },
    { name: "Poems (selected)", authors: ["Charles Wesley"] },
    { name: "Journal (selected)", authors: ["John Wesley"] },
    { name: "Sermons (selected)", authors: ["John Wesley"] },
    { name: "Explanatory Notes upon the New Testament", authors: ["John Wesley"] },
    { name: "Journals (selected)", authors: ["George Whitefield"] },
    { name: "Sermons (selected)", authors: ["George Whitefield"] },
    { name: "Damasian Epigrams (selected inscriptions/poems)", authors: ["Pope Damasus I"] },
    { name: "Life of Saint Augustine (Vita Augustini)", authors: ["Possidius"] },
    { name: "Letters (selected, as preserved)", authors: ["Pope Cornelius"] },
    { name: "Letters (selected, as preserved)", authors: ["Pope Stephen I"] },
    { name: "De Institutione Virginum (On the Instruction of Virgins)", authors: ["Leander of Seville"] },
    { name: "Letters (selected)", authors: ["Pope Martin I"] },
    { name: "Letters (selected)", authors: ["Pope Gregory II"] }
  ];

  const worksByAuthor = new Map();
  works.forEach((work) => {
    work.authors.forEach((author) => {
      const key = author.toLowerCase();
      if (!worksByAuthor.has(key)) {
        worksByAuthor.set(key, []);
      }
      worksByAuthor.get(key).push(work);
    });
  });

  // vis-timeline expects DataSet instances with fixed heights
  const groups = new vis.DataSet(
    data.groups.map((group) => ({
      ...group,
      height: groupHeights[group.id] || itemHeight + 20
    }))
  );

  const items = new vis.DataSet(
    data.items.map((item) => {
      const category = item.group || "events";
      const meta = categoryMeta[category] || categoryMeta.events;
      const decorated = {
        ...item,
        name: item.name || item.content,
        className: meta.className
      };
      decorated.content = `${meta.icon} ${buildItemLabel(decorated)}`;

      // Add duration indicator for short events
      // Calculate duration in years
      const startParts = parseDateParts(item.start);
      const endParts = parseDateParts(item.end || item.start);
      if (startParts && endParts) {
        const durationYears = Math.abs(endParts.year - startParts.year);
        // If event is shorter than ~10 years, it will need min-width expansion
        // Add indicator class to show actual duration
        if (durationYears < 10) {
          decorated.className += " has-duration-indicator";
          // Store actual width for the indicator line
          const actualWidthPercent = (durationYears / 10) * 100;
          decorated.style = `--duration-width: ${actualWidthPercent}%`;
        }
      }

      return decorated;
    })
  );

  const timeline = new vis.Timeline(container, items, groups, options);

  function updateAxisLabels() {
    const range = timeline.getWindow();
    const spanYears = (range.end - range.start) / (1000 * 60 * 60 * 24 * 365.25);
    if (spanYears < 2) return;
    const labels = container.querySelectorAll(".vis-time-axis .vis-text");
    labels.forEach((label) => {
      const raw = label.textContent.trim();
      if (!/^-?\d+$/.test(raw)) return;
      const year = Number.parseInt(raw, 10);
      if (Number.isNaN(year)) return;
      label.textContent = formatYearAxis(year);
    });
  }

  function openModal(item) {
    if (!item) return;
    modalTitle.textContent = item.name || item.content;
    if (modalSearchLink) {
      if (item.group === "people") {
        const query = buildPeopleSearchQuery(item);
        modalSearchLink.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        modalSearchLink.hidden = false;
        modalSearchLink.setAttribute("aria-label", `Search for ${query}`);
      } else {
        modalSearchLink.hidden = true;
        modalSearchLink.removeAttribute("aria-label");
        modalSearchLink.removeAttribute("href");
      }
    }
    if (item.group === "people") {
      renderWorksForPerson(item.name || item.content);
    } else if (modalWorks) {
      modalWorks.hidden = true;
      if (modalWorksList) {
        modalWorksList.textContent = "";
      }
    }
    const startPrecision =
      item?.startPrecision || precisionFromParts(parseDateParts(item?.start));
    const endPrecision =
      item?.endPrecision || precisionFromParts(parseDateParts(item?.end));
    if (item.end) {
      modalDate.textContent = `${formatDateLabel(item.start, startPrecision)} – ${formatDateLabel(
        item.end,
        endPrecision
      )}`;
    } else {
      modalDate.textContent = formatDateLabel(item.start, startPrecision);
    }
    modalDescription.textContent = item.description || "";
    lastFocusedElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    timeline.setSelection([]);
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || !modal.classList.contains("is-open")) return;
    const focusable = modal.querySelectorAll(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }

  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.hasAttribute("data-modal-close")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
    trapFocus(event);
  });

  timeline.on("select", (props) => {
    const id = props.items?.[0];
    if (!id) return;
    const item = items.get(id);
    openModal(item);
  });

  timeline.on("rangechanged", updateAxisLabels);
  timeline.on("changed", updateAxisLabels);
  updateAxisLabels();

  // Hide loading indicator and show timeline
  loadingIndicator.style.display = "none";
  container.style.display = "block";
}

main().catch((err) => {
  console.error(err);
  const loadingIndicator = document.getElementById("timeline-loading");
  if (loadingIndicator) {
    loadingIndicator.innerHTML = `
      <div style="text-align: center; padding: 20px; max-width: 500px;">
        <div style="font-size: 18px; color: #d32f2f; margin-bottom: 12px;">Failed to load timeline</div>
        <div style="color: #666; margin-bottom: 16px;">${err.message || 'An error occurred while loading the timeline data.'}</div>
        <button onclick="location.reload()" style="padding: 10px 20px; border: 1px solid #ccc; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px;">Retry</button>
      </div>
    `;
  }
});
