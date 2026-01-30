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
      const title = document.createElement("div");
      title.classList.add("modal-work-title");
      title.textContent = work.name;
      listItem.appendChild(title);

      if (work.textUrl || work.referenceUrl) {
        const links = document.createElement("div");
        links.classList.add("modal-work-links");

        if (work.textUrl) {
          const textLink = document.createElement("a");
          textLink.href = work.textUrl;
          textLink.target = "_blank";
          textLink.rel = "noopener";
          textLink.textContent = "Text:";
          links.appendChild(textLink);

          if (work.referenceUrl) {
            const divider = document.createElement("span");
            divider.textContent = " / ";
            divider.setAttribute("aria-hidden", "true");
            links.appendChild(divider);
          }
        }

        if (work.referenceUrl) {
          const refLink = document.createElement("a");
          refLink.href = work.referenceUrl;
          refLink.target = "_blank";
          refLink.rel = "noopener";
          refLink.textContent = "Wikipedia entry:";
          links.appendChild(refLink);
        }

        listItem.appendChild(links);
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
      "name": "Gospel of John",
      "authors": [
        "John the Evangelist"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=John+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/Gospel_of_John"
    },
    {
      "name": "First Epistle of John (1 John)",
      "authors": [
        "John the Evangelist"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=1+John+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/First_Epistle_of_John_(1_John)"
    },
    {
      "name": "Second Epistle of John (2 John)",
      "authors": [
        "John the Evangelist"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=2+John+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/Second_Epistle_of_John_(2_John)"
    },
    {
      "name": "Third Epistle of John (3 John)",
      "authors": [
        "John the Evangelist"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=3+John+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/Third_Epistle_of_John_(3_John)"
    },
    {
      "name": "Revelation",
      "authors": [
        "John the Evangelist"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=Revelation+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/Revelation"
    },
    {
      "name": "Epistle to the Romans",
      "authors": [
        "Paul"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=Romans+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/Epistle_to_the_Romans"
    },
    {
      "name": "First Epistle to the Corinthians (1 Corinthians)",
      "authors": [
        "Paul"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=1+Corinthians+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/First_Epistle_to_the_Corinthians_(1_Corinthians)"
    },
    {
      "name": "Second Epistle to the Corinthians (2 Corinthians)",
      "authors": [
        "Paul"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=2+Corinthians+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/Second_Epistle_to_the_Corinthians_(2_Corinthians)"
    },
    {
      "name": "Epistle to the Galatians",
      "authors": [
        "Paul"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=Galatians+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/Epistle_to_the_Galatians"
    },
    {
      "name": "Epistle to the Ephesians",
      "authors": [
        "Paul"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=Ephesians+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/Epistle_to_the_Ephesians"
    },
    {
      "name": "First Epistle of Peter (1 Peter)",
      "authors": [
        "Peter"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=1+Peter+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/First_Epistle_of_Peter_(1_Peter)"
    },
    {
      "name": "Second Epistle of Peter (2 Peter)",
      "authors": [
        "Peter"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=2+Peter+1&version=ESV",
      "referenceUrl": "https://en.wikipedia.org/wiki/Second_Epistle_of_Peter_(2_Peter)"
    },
    {
      "name": "First Epistle of Clement to the Corinthians (1 Clement)",
      "authors": [
        "Clement of Rome"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/First_Epistle_of_Clement_to_the_Corinthians_(1_Clement)"
    },
    {
      "name": "Letter to the Ephesians",
      "authors": [
        "Ignatius of Antioch"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letter_to_the_Ephesians"
    },
    {
      "name": "Letter to the Magnesians",
      "authors": [
        "Ignatius of Antioch"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letter_to_the_Magnesians"
    },
    {
      "name": "Letter to the Trallians",
      "authors": [
        "Ignatius of Antioch"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letter_to_the_Trallians"
    },
    {
      "name": "Letter to the Romans",
      "authors": [
        "Ignatius of Antioch"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letter_to_the_Romans"
    },
    {
      "name": "Letter to Polycarp",
      "authors": [
        "Ignatius of Antioch"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letter_to_Polycarp"
    },
    {
      "name": "Letter to the Philippians",
      "authors": [
        "Polycarp"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letter_to_the_Philippians"
    },
    {
      "name": "First Apology",
      "authors": [
        "Justin Martyr"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/First_Apology_of_Justin_Martyr"
    },
    {
      "name": "Second Apology",
      "authors": [
        "Justin Martyr"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Second_Apology"
    },
    {
      "name": "Dialogue with Trypho",
      "authors": [
        "Justin Martyr"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Dialogue_with_Trypho"
    },
    {
      "name": "Protrepticus (Exhortation to the Greeks)",
      "authors": [
        "Clement of Alexandria"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Protrepticus_(Exhortation_to_the_Greeks)"
    },
    {
      "name": "Paedagogus (The Instructor)",
      "authors": [
        "Clement of Alexandria"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Paedagogus_(The_Instructor)"
    },
    {
      "name": "Stromata (Miscellanies)",
      "authors": [
        "Clement of Alexandria"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Stromata_(Miscellanies)"
    },
    {
      "name": "Who Is the Rich Man That Shall Be Saved? (Quis Dives Salvetur)",
      "authors": [
        "Clement of Alexandria"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Who_Is_the_Rich_Man_That_Shall_Be_Saved%3F_(Quis_Dives_Salvetur)"
    },
    {
      "name": "Diatessaron",
      "authors": [
        "Tatian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Diatessaron"
    },
    {
      "name": "Address to the Greeks",
      "authors": [
        "Tatian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Address_to_the_Greeks"
    },
    {
      "name": "Against Heresies",
      "authors": [
        "Irenaeus of Lyons"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Against_Heresies_(Irenaeus)"
    },
    {
      "name": "Demonstration of the Apostolic Preaching (Proof of the Apostolic Preaching)",
      "authors": [
        "Irenaeus of Lyons"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Demonstration_of_the_Apostolic_Preaching_(Proof_of_the_Apostolic_Preaching)"
    },
    {
      "name": "Apology",
      "authors": [
        "Tertullian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Apologeticus"
    },
    {
      "name": "Prescription Against Heretics",
      "authors": [
        "Tertullian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Prescription_against_heretics"
    },
    {
      "name": "Against Marcion",
      "authors": [
        "Tertullian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Against_Marcion"
    },
    {
      "name": "On Baptism",
      "authors": [
        "Tertullian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Baptism"
    },
    {
      "name": "On the Flesh of Christ",
      "authors": [
        "Tertullian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Flesh_of_Christ"
    },
    {
      "name": "Apostolic Tradition (attributed)",
      "authors": [
        "Hippolytus of Rome"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Apostolic_Tradition"
    },
    {
      "name": "Refutation of All Heresies",
      "authors": [
        "Hippolytus of Rome"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Refutation_of_All_Heresies"
    },
    {
      "name": "Commentary on Daniel",
      "authors": [
        "Hippolytus of Rome"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Commentary_on_Daniel"
    },
    {
      "name": "On Christ and Antichrist",
      "authors": [
        "Hippolytus of Rome"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Christ_and_Antichrist"
    },
    {
      "name": "The Passion of Perpetua and Felicity (Perpetua’s diary portion)",
      "authors": [
        "Perpetua"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Passion_of_Perpetua_and_Felicity_(Perpetua%E2%80%99s_diary_portion)"
    },
    {
      "name": "On First Principles (De Principiis)",
      "authors": [
        "Origen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_First_Principles"
    },
    {
      "name": "Against Celsus",
      "authors": [
        "Origen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Contra_Celsum"
    },
    {
      "name": "On Prayer",
      "authors": [
        "Origen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Prayer"
    },
    {
      "name": "Commentary on the Gospel of John",
      "authors": [
        "Origen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Commentary_on_the_Gospel_of_John"
    },
    {
      "name": "Homilies on Genesis",
      "authors": [
        "Origen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Homilies_on_Genesis"
    },
    {
      "name": "Address of Thanksgiving to Origen (Panegyric)",
      "authors": [
        "Gregory Thaumaturgus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Address_of_Thanksgiving_to_Origen_(Panegyric)"
    },
    {
      "name": "Declaration of Faith (Creed) (traditional attribution)",
      "authors": [
        "Gregory Thaumaturgus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Declaration_of_Faith_(Creed)_(traditional_attribution)"
    },
    {
      "name": "On the Unity of the Catholic Church",
      "authors": [
        "Cyprian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Unity_of_the_Catholic_Church"
    },
    {
      "name": "On the Lapsed",
      "authors": [
        "Cyprian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Lapsed"
    },
    {
      "name": "On Mortality",
      "authors": [
        "Cyprian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Mortality"
    },
    {
      "name": "On the Lord’s Prayer",
      "authors": [
        "Cyprian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Lord%E2%80%99s_Prayer"
    },
    {
      "name": "Letters (Epistles)",
      "authors": [
        "Cyprian"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letters_(Epistles)"
    },
    {
      "name": "On the Incarnation",
      "authors": [
        "Athanasius"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Incarnation_(Athanasius)"
    },
    {
      "name": "Life of Antony",
      "authors": [
        "Athanasius"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Life_of_Antony"
    },
    {
      "name": "Orations Against the Arians",
      "authors": [
        "Athanasius"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Orations_Against_the_Arians"
    },
    {
      "name": "Letters to Serapion on the Holy Spirit",
      "authors": [
        "Athanasius"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letters_to_Serapion_on_the_Holy_Spirit"
    },
    {
      "name": "On the Holy Spirit",
      "authors": [
        "Basil the Great"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Holy_Spirit"
    },
    {
      "name": "Hexaemeron",
      "authors": [
        "Basil the Great"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Hexaemeron"
    },
    {
      "name": "Longer Rules (Regulae Fusius Tractatae)",
      "authors": [
        "Basil the Great"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Longer_Rules_(Regulae_Fusius_Tractatae)"
    },
    {
      "name": "Shorter Rules (Regulae Brevius Tractatae)",
      "authors": [
        "Basil the Great"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Shorter_Rules_(Regulae_Brevius_Tractatae)"
    },
    {
      "name": "Address to Young Men on How They Might Derive Benefit from Greek Literature",
      "authors": [
        "Basil the Great"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Address_to_Young_Men_on_How_They_Might_Derive_Benefit_from_Greek_Literature"
    },
    {
      "name": "Theological Orations (Orations 27–31)",
      "authors": [
        "Gregory of Nazianzus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Theological_Orations_(Orations_27%E2%80%9331)"
    },
    {
      "name": "Oration 43: Funeral Oration on Basil",
      "authors": [
        "Gregory of Nazianzus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Oration_43%3A_Funeral_Oration_on_Basil"
    },
    {
      "name": "Life of Moses",
      "authors": [
        "Gregory of Nyssa"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Life_of_Moses"
    },
    {
      "name": "Great Catechism",
      "authors": [
        "Gregory of Nyssa"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Great_Catechism"
    },
    {
      "name": "On the Making of Man",
      "authors": [
        "Gregory of Nyssa"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Making_of_Man"
    },
    {
      "name": "On the Soul and the Resurrection",
      "authors": [
        "Gregory of Nyssa"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Soul_and_the_Resurrection"
    },
    {
      "name": "Against Eunomius",
      "authors": [
        "Gregory of Nyssa"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Against_Eunomius"
    },
    {
      "name": "On the Duties of the Clergy (De Officiis Ministrorum)",
      "authors": [
        "Ambrose of Milan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Duties_of_the_Clergy_(De_Officiis_Ministrorum)"
    },
    {
      "name": "On the Mysteries (De Mysteriis)",
      "authors": [
        "Ambrose of Milan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Mysteries_(De_Mysteriis)"
    },
    {
      "name": "On the Sacraments (De Sacramentis)",
      "authors": [
        "Ambrose of Milan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Sacraments_(De_Sacramentis)"
    },
    {
      "name": "On the Holy Spirit (De Spiritu Sancto)",
      "authors": [
        "Ambrose of Milan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Holy_Spirit_(De_Spiritu_Sancto)"
    },
    {
      "name": "On Repentance (De Paenitentia)",
      "authors": [
        "Ambrose of Milan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Repentance_(De_Paenitentia)"
    },
    {
      "name": "On Illustrious Men (De Viris Illustribus)",
      "authors": [
        "Jerome"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Illustrious_Men_(De_Viris_Illustribus)"
    },
    {
      "name": "Against Jovinian (Adversus Jovinianum)",
      "authors": [
        "Jerome"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Against_Jovinian_(Adversus_Jovinianum)"
    },
    {
      "name": "Letter 22 to Eustochium",
      "authors": [
        "Jerome"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letter_22_to_Eustochium"
    },
    {
      "name": "Commentary on Galatians",
      "authors": [
        "Jerome"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Commentary_on_Galatians"
    },
    {
      "name": "On the Priesthood",
      "authors": [
        "John Chrysostom"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Priesthood"
    },
    {
      "name": "Homilies on Matthew",
      "authors": [
        "John Chrysostom"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Homilies_on_Matthew"
    },
    {
      "name": "Homilies on John",
      "authors": [
        "John Chrysostom"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Homilies_on_John"
    },
    {
      "name": "Homilies on Romans",
      "authors": [
        "John Chrysostom"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Homilies_on_Romans"
    },
    {
      "name": "Letters to Olympias",
      "authors": [
        "John Chrysostom"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letters_to_Olympias"
    },
    {
      "name": "Confessions",
      "authors": [
        "Augustine of Hippo"
      ],
      "textUrl": "https://www.ccel.org/ccel/augustine/confessions.html",
      "referenceUrl": "https://en.wikipedia.org/wiki/Confessions_(Augustine)"
    },
    {
      "name": "The City of God",
      "authors": [
        "Augustine of Hippo"
      ],
      "textUrl": "https://www.ccel.org/ccel/augustine/cityofgod.html",
      "referenceUrl": "https://en.wikipedia.org/wiki/City_of_God_(book)"
    },
    {
      "name": "On the Trinity (De Trinitate)",
      "authors": [
        "Augustine of Hippo"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Trinity_(De_Trinitate)"
    },
    {
      "name": "On Christian Doctrine (De Doctrina Christiana)",
      "authors": [
        "Augustine of Hippo"
      ],
      "textUrl": "https://www.ccel.org/ccel/augustine/doctrine.html",
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Christian_Doctrine"
    },
    {
      "name": "Enchiridion (Handbook on Faith, Hope, and Love)",
      "authors": [
        "Augustine of Hippo"
      ],
      "textUrl": "https://www.ccel.org/ccel/augustine/enchiridion.html",
      "referenceUrl": "https://en.wikipedia.org/wiki/Enchiridion_(Augustine)"
    },
    {
      "name": "On the Holy Spirit (De Spiritu Sancto)",
      "authors": [
        "Didymus the Blind"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Holy_Spirit_(De_Spiritu_Sancto)"
    },
    {
      "name": "Commentary on the Apostles’ Creed",
      "authors": [
        "Rufinus of Aquileia"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Commentary_on_the_Apostles%E2%80%99_Creed"
    },
    {
      "name": "Apology for Origen",
      "authors": [
        "Rufinus of Aquileia"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Apology_for_Origen"
    },
    {
      "name": "Commentary on the Gospel of John",
      "authors": [
        "Cyril of Alexandria"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Commentary_on_the_Gospel_of_John"
    },
    {
      "name": "On the Unity of Christ",
      "authors": [
        "Cyril of Alexandria"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Unity_of_Christ"
    },
    {
      "name": "Five Tomes Against Nestorius",
      "authors": [
        "Cyril of Alexandria"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Five_Tomes_Against_Nestorius"
    },
    {
      "name": "The Bazaar of Heracleides",
      "authors": [
        "Nestorius of Constantinople"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Bazaar_of_Heracleides"
    },
    {
      "name": "Confessio",
      "authors": [
        "Patrick"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Confessio"
    },
    {
      "name": "Letter to the Soldiers of Coroticus",
      "authors": [
        "Patrick"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letter_to_the_Soldiers_of_Coroticus"
    },
    {
      "name": "Chronicle (Epitoma Chronicon)",
      "authors": [
        "Prosper of Aquitaine"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Chronicle_(Epitoma_Chronicon)"
    },
    {
      "name": "Against the Ingrates (Carmen de Ingratis)",
      "authors": [
        "Prosper of Aquitaine"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Against_the_Ingrates_(Carmen_de_Ingratis)"
    },
    {
      "name": "Liber contra Collatorem",
      "authors": [
        "Prosper of Aquitaine"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Liber_contra_Collatorem"
    },
    {
      "name": "Tome of Leo",
      "authors": [
        "Pope Leo I"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Tome_of_Leo"
    },
    {
      "name": "On Grace (De Gratia) (traditional attribution)",
      "authors": [
        "Faustus of Riez"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Grace_(De_Gratia)_(traditional_attribution)"
    },
    {
      "name": "On the State of the Soul (De Statu Animae)",
      "authors": [
        "Claudianus Mamertus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_State_of_the_Soul_(De_Statu_Animae)"
    },
    {
      "name": "Rule of St Benedict",
      "authors": [
        "Benedict of Nursia"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Rule_of_St_Benedict"
    },
    {
      "name": "Rule for Nuns",
      "authors": [
        "Caesarius of Arles"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Rule_for_Nuns"
    },
    {
      "name": "Pastoral Rule (Regula Pastoralis)",
      "authors": [
        "Pope Gregory the Great"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Pastoral_Rule"
    },
    {
      "name": "Moralia on Job",
      "authors": [
        "Pope Gregory the Great"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Moralia_in_Job"
    },
    {
      "name": "Dialogues",
      "authors": [
        "Pope Gregory the Great"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Dialogues"
    },
    {
      "name": "Homilies on Ezekiel",
      "authors": [
        "Pope Gregory the Great"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Homilies_on_Ezekiel"
    },
    {
      "name": "Homilies on the Gospels",
      "authors": [
        "Pope Gregory the Great"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Homilies_on_the_Gospels"
    },
    {
      "name": "Etymologies (Etymologiae)",
      "authors": [
        "Isidore of Seville"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Etymologiae"
    },
    {
      "name": "On the Nature of Things (De Natura Rerum)",
      "authors": [
        "Isidore of Seville"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/De_natura_rerum"
    },
    {
      "name": "Sentences (Sententiae)",
      "authors": [
        "Isidore of Seville"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Sentences_(Sententiae)"
    },
    {
      "name": "On Ecclesiastical Offices (De Ecclesiasticis Officiis)",
      "authors": [
        "Isidore of Seville"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Ecclesiastical_Offices_(De_Ecclesiasticis_Officiis)"
    },
    {
      "name": "Ambigua",
      "authors": [
        "Maximus the Confessor"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Ambigua_(Maximus_the_Confessor)"
    },
    {
      "name": "Mystagogia",
      "authors": [
        "Maximus the Confessor"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Mystagogy"
    },
    {
      "name": "Questions to Thalassius",
      "authors": [
        "Maximus the Confessor"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Questions_to_Thalassius"
    },
    {
      "name": "Disputation with Pyrrhus",
      "authors": [
        "Maximus the Confessor"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Disputation_with_Pyrrhus"
    },
    {
      "name": "Four Hundred Chapters on Love",
      "authors": [
        "Maximus the Confessor"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Four_Hundred_Chapters_on_Love"
    },
    {
      "name": "Life of Saint Eligius (Vita Sancti Eligii)",
      "authors": [
        "Audoin"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Life_of_Saint_Eligius_(Vita_Sancti_Eligii)"
    },
    {
      "name": "Ecclesiastical History of the English People",
      "authors": [
        "The Venerable Bede"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Ecclesiastical_History_of_the_English_People"
    },
    {
      "name": "On the Reckoning of Time (De Temporum Ratione)",
      "authors": [
        "The Venerable Bede"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Reckoning_of_Time_(De_Temporum_Ratione)"
    },
    {
      "name": "Lives of the Abbots of Wearmouth and Jarrow",
      "authors": [
        "The Venerable Bede"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Lives_of_the_Abbots_of_Wearmouth_and_Jarrow"
    },
    {
      "name": "Commentary on Mark",
      "authors": [
        "The Venerable Bede"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Commentary_on_Mark"
    },
    {
      "name": "On the Temple (De Templo)",
      "authors": [
        "The Venerable Bede"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Temple_(De_Templo)"
    },
    {
      "name": "Commentary on the Apocalypse",
      "authors": [
        "Beatus of Liebana"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Commentary_on_the_Apocalypse"
    },
    {
      "name": "Libellus Sacrosyllabus (against Adoptionism)",
      "authors": [
        "Paulinus II of Aquileia"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Libellus_Sacrosyllabus_(against_Adoptionism)"
    },
    {
      "name": "On the Trinity and Incarnation (De Fide Sanctae Trinitatis)",
      "authors": [
        "Alcuin of York"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Trinity_and_Incarnation_(De_Fide_Sanctae_Trinitatis)"
    },
    {
      "name": "De Virtutibus et Vitiis",
      "authors": [
        "Alcuin of York"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/De_Virtutibus_et_Vitiis"
    },
    {
      "name": "Disputation with Pepin",
      "authors": [
        "Alcuin of York"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Disputation_with_Pepin"
    },
    {
      "name": "Life of Willibrord (Vita Willibrordi)",
      "authors": [
        "Alcuin of York"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Life_of_Willibrord_(Vita_Willibrordi)"
    },
    {
      "name": "On the Education of Clergy (De Institutione Clericorum)",
      "authors": [
        "Rabanus Maurus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Education_of_Clergy_(De_Institutione_Clericorum)"
    },
    {
      "name": "On the Nature of Things (De Rerum Naturis)",
      "authors": [
        "Rabanus Maurus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Nature_of_Things_(De_Rerum_Naturis)"
    },
    {
      "name": "On the Praises of the Holy Cross (De Laudibus Sanctae Crucis)",
      "authors": [
        "Rabanus Maurus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Praises_of_the_Holy_Cross_(De_Laudibus_Sanctae_Crucis)"
    },
    {
      "name": "Hymn: The Fallen Woman (Kassia’s Troparion)",
      "authors": [
        "Kassia of Byzantium"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Hymn%3A_The_Fallen_Woman_(Kassia%E2%80%99s_Troparion)"
    },
    {
      "name": "Periphyseon (De Divisione Naturae)",
      "authors": [
        "John Scotus Eriugena"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Periphyseon_(De_Divisione_Naturae)"
    },
    {
      "name": "On Divine Predestination (De Praedestinatione)",
      "authors": [
        "John Scotus Eriugena"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Divine_Predestination_(De_Praedestinatione)"
    },
    {
      "name": "Homily on the Prologue of John",
      "authors": [
        "John Scotus Eriugena"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Homily_on_the_Prologue_of_John"
    },
    {
      "name": "Bibliotheca (Myriobiblon)",
      "authors": [
        "Photios I of Constantinople"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Bibliotheca_(Myriobiblon)"
    },
    {
      "name": "Mystagogy of the Holy Spirit",
      "authors": [
        "Photios I of Constantinople"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Mystagogy_of_the_Holy_Spirit"
    },
    {
      "name": "Liber Manualis (Handbook)",
      "authors": [
        "Dhuoda of Uzes"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Liber_Manualis_(Handbook)"
    },
    {
      "name": "Old Church Slavonic Translation of the Gospels (traditional attribution)",
      "authors": [
        "Cyril and Methodius"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Old_Church_Slavonic_Translation_of_the_Gospels_(traditional_attribution)"
    },
    {
      "name": "Vita Sancti Geraldi (Life of St Gerald of Aurillac)",
      "authors": [
        "Odo of Cluny"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Vita_Sancti_Geraldi_(Life_of_St_Gerald_of_Aurillac)"
    },
    {
      "name": "De Mensura Fistularum (On the Measure of Organ Pipes)",
      "authors": [
        "Sylvester II / Gerbert of Aurillac"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/De_Mensura_Fistularum_(On_the_Measure_of_Organ_Pipes)"
    },
    {
      "name": "On the Body and Blood of the Lord (De Corpore et Sanguine Domini)",
      "authors": [
        "Lanfranc"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Body_and_Blood_of_the_Lord_(De_Corpore_et_Sanguine_Domini)"
    },
    {
      "name": "Proslogion",
      "authors": [
        "Anselm"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Proslogion"
    },
    {
      "name": "Monologion",
      "authors": [
        "Anselm"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Monologion"
    },
    {
      "name": "Why God Became Man (Cur Deus Homo)",
      "authors": [
        "Anselm"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Why_God_Became_Man_(Cur_Deus_Homo)"
    },
    {
      "name": "On Truth (De Veritate)",
      "authors": [
        "Anselm"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Truth_(De_Veritate)"
    },
    {
      "name": "On the Freedom of the Will (De Libertate Arbitrii)",
      "authors": [
        "Anselm"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Freedom_of_the_Will_(De_Libertate_Arbitrii)"
    },
    {
      "name": "Scivias",
      "authors": [
        "Hildegard of Bingen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Scivias"
    },
    {
      "name": "Book of Life’s Merits (Liber Vitae Meritorum)",
      "authors": [
        "Hildegard of Bingen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Book_of_Life%E2%80%99s_Merits_(Liber_Vitae_Meritorum)"
    },
    {
      "name": "Book of Divine Works (Liber Divinorum Operum)",
      "authors": [
        "Hildegard of Bingen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Book_of_Divine_Works_(Liber_Divinorum_Operum)"
    },
    {
      "name": "Physica",
      "authors": [
        "Hildegard of Bingen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Physica"
    },
    {
      "name": "Causae et Curae",
      "authors": [
        "Hildegard of Bingen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Causae_et_Curae"
    },
    {
      "name": "On Loving God (De Diligendo Deo)",
      "authors": [
        "Bernard of Clairvaux"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Loving_God_(De_Diligendo_Deo)"
    },
    {
      "name": "On Consideration (De Consideratione)",
      "authors": [
        "Bernard of Clairvaux"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Consideration_(De_Consideratione)"
    },
    {
      "name": "On Grace and Free Choice (De Gratia et Libero Arbitrio)",
      "authors": [
        "Bernard of Clairvaux"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Grace_and_Free_Choice_(De_Gratia_et_Libero_Arbitrio)"
    },
    {
      "name": "Life of St Malachy (Vita Sancti Malachiae)",
      "authors": [
        "Bernard of Clairvaux"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Life_of_St_Malachy_(Vita_Sancti_Malachiae)"
    },
    {
      "name": "Summa Aurea",
      "authors": [
        "William of Auxerre"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Summa_Aurea"
    },
    {
      "name": "Canticle of the Creatures",
      "authors": [
        "Francis of Assisi"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Canticle_of_the_Creatures"
    },
    {
      "name": "Earlier Rule (Regula non bullata)",
      "authors": [
        "Francis of Assisi"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Earlier_Rule_(Regula_non_bullata)"
    },
    {
      "name": "Later Rule (Regula bullata)",
      "authors": [
        "Francis of Assisi"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Later_Rule_(Regula_bullata)"
    },
    {
      "name": "Testament",
      "authors": [
        "Francis of Assisi"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Testament"
    },
    {
      "name": "Admonitions",
      "authors": [
        "Francis of Assisi"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Admonitions"
    },
    {
      "name": "On Light (De Luce)",
      "authors": [
        "Robert Grosseteste"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Light_(De_Luce)"
    },
    {
      "name": "Hexaemeron (Commentary on Six Days of Creation)",
      "authors": [
        "Robert Grosseteste"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Hexaemeron_(Commentary_on_Six_Days_of_Creation)"
    },
    {
      "name": "Epitome of Logic",
      "authors": [
        "Nicephorus Blemmydes"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Epitome_of_Logic"
    },
    {
      "name": "Epitome of Physics",
      "authors": [
        "Nicephorus Blemmydes"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Epitome_of_Physics"
    },
    {
      "name": "Latin Translation of Proclus’ Elements of Theology",
      "authors": [
        "William of Moerbeke"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Latin_Translation_of_Proclus%E2%80%99_Elements_of_Theology"
    },
    {
      "name": "Summa Theologiae",
      "authors": [
        "Thomas Aquinas"
      ],
      "textUrl": "https://www.newadvent.org/summa/",
      "referenceUrl": "https://en.wikipedia.org/wiki/Summa_Theologica"
    },
    {
      "name": "Summa Contra Gentiles",
      "authors": [
        "Thomas Aquinas"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Summa_Contra_Gentiles"
    },
    {
      "name": "Catena Aurea",
      "authors": [
        "Thomas Aquinas"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Catena_Aurea"
    },
    {
      "name": "On Being and Essence (De Ente et Essentia)",
      "authors": [
        "Thomas Aquinas"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Being_and_Essence_(De_Ente_et_Essentia)"
    },
    {
      "name": "Compendium of Theology",
      "authors": [
        "Thomas Aquinas"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Compendium_of_Theology"
    },
    {
      "name": "Ordinatio (Opus Oxoniense)",
      "authors": [
        "Duns Scotus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Ordinatio_(Opus_Oxoniense)"
    },
    {
      "name": "On the First Principle (De Primo Principio)",
      "authors": [
        "Duns Scotus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_First_Principle_(De_Primo_Principio)"
    },
    {
      "name": "Questions on the Metaphysics (Quaestiones super Metaphysicam)",
      "authors": [
        "Duns Scotus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Questions_on_the_Metaphysics_(Quaestiones_super_Metaphysicam)"
    },
    {
      "name": "The Divine Comedy",
      "authors": [
        "Dante Alighieri"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Divine_Comedy"
    },
    {
      "name": "Vita Nuova",
      "authors": [
        "Dante Alighieri"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Vita_Nuova"
    },
    {
      "name": "Convivio",
      "authors": [
        "Dante Alighieri"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Convivio"
    },
    {
      "name": "De Vulgari Eloquentia",
      "authors": [
        "Dante Alighieri"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/De_Vulgari_Eloquentia"
    },
    {
      "name": "De Monarchia",
      "authors": [
        "Dante Alighieri"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/De_Monarchia"
    },
    {
      "name": "On the Cause of God (De Causa Dei)",
      "authors": [
        "Thomas Bradwardine"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Cause_of_God_(De_Causa_Dei)"
    },
    {
      "name": "Tractatus de Proportionibus",
      "authors": [
        "Thomas Bradwardine"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Tractatus_de_Proportionibus"
    },
    {
      "name": "On the Truth of Holy Scripture (De Veritate Sacrae Scripturae)",
      "authors": [
        "John Wycliffe"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Truth_of_Holy_Scripture_(De_Veritate_Sacrae_Scripturae)"
    },
    {
      "name": "On the Church (De Ecclesia)",
      "authors": [
        "John Wycliffe"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Church_(De_Ecclesia)"
    },
    {
      "name": "On Civil Dominion (De Civili Dominio)",
      "authors": [
        "John Wycliffe"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Civil_Dominion_(De_Civili_Dominio)"
    },
    {
      "name": "Revelations of Divine Love",
      "authors": [
        "Julian of Norwich"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Revelations_of_Divine_Love"
    },
    {
      "name": "The Book of the City of Ladies",
      "authors": [
        "Christine de Pisan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Book_of_the_City_of_Ladies"
    },
    {
      "name": "The Treasure of the City of Ladies",
      "authors": [
        "Christine de Pisan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Treasure_of_the_City_of_Ladies"
    },
    {
      "name": "The Book of the Deeds and Good Morals of King Charles V",
      "authors": [
        "Christine de Pisan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Book_of_the_Deeds_and_Good_Morals_of_King_Charles_V"
    },
    {
      "name": "Letter of the God of Love (Epistre au Dieu d’Amours)",
      "authors": [
        "Christine de Pisan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Letter_of_the_God_of_Love_(Epistre_au_Dieu_d%E2%80%99Amours)"
    },
    {
      "name": "On the Church (De Ecclesia)",
      "authors": [
        "Jan Hus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Church_(De_Ecclesia)"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Jan Hus"
      ],
      "referenceUrl": "https://en.wikisource.org/wiki/The_letters_of_John_Hus"
    },
    {
      "name": "On Simony",
      "authors": [
        "Jan Hus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Simony"
    },
    {
      "name": "The Imitation of Christ",
      "authors": [
        "Thomas a Kempis"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Imitation_of_Christ"
    },
    {
      "name": "Prayers and Meditations (selected)",
      "authors": [
        "Thomas a Kempis"
      ],
      "referenceUrl": "https://en.wikisource.org/wiki/Prayers_and_Meditations_on_the_Life_of_Christ"
    },
    {
      "name": "Sermons (selected)",
      "authors": [
        "Thomas a Kempis"
      ],
      "referenceUrl": "https://en.wikisource.org/wiki/Sermons_to_the_Novices_Regular"
    },
    {
      "name": "On Learned Ignorance (De Docta Ignorantia)",
      "authors": [
        "Nicholas of Cusa"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Learned_Ignorance_(De_Docta_Ignorantia)"
    },
    {
      "name": "On the Peace of Faith (De Pace Fidei)",
      "authors": [
        "Nicholas of Cusa"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Peace_of_Faith_(De_Pace_Fidei)"
    },
    {
      "name": "On the Vision of God (De Visione Dei)",
      "authors": [
        "Nicholas of Cusa"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Vision_of_God_(De_Visione_Dei)"
    },
    {
      "name": "On Conjectures (De Coniecturis)",
      "authors": [
        "Nicholas of Cusa"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Conjectures_(De_Coniecturis)"
    },
    {
      "name": "Idiota de Mente (The Layman on Mind)",
      "authors": [
        "Nicholas of Cusa"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Idiota_de_Mente_(The_Layman_on_Mind)"
    },
    {
      "name": "Triumph of the Cross",
      "authors": [
        "Savonarola"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Triumph_of_the_Cross"
    },
    {
      "name": "In Praise of Folly",
      "authors": [
        "Desiderius Erasmus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/In_Praise_of_Folly"
    },
    {
      "name": "Handbook of the Christian Soldier (Enchiridion Militis Christiani)",
      "authors": [
        "Desiderius Erasmus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Enchiridion_(Erasmus)"
    },
    {
      "name": "Colloquies",
      "authors": [
        "Desiderius Erasmus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Colloquies"
    },
    {
      "name": "On Free Will (De Libero Arbitrio)",
      "authors": [
        "Desiderius Erasmus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_Free_Will_(De_Libero_Arbitrio)"
    },
    {
      "name": "On the Revolutions of the Heavenly Spheres (De Revolutionibus Orbium Coelestium)",
      "authors": [
        "Nicholas Copernicus"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/De_revolutionibus_orbium_coelestium"
    },
    {
      "name": "A Short Account of the Destruction of the Indies",
      "authors": [
        "Bartolome de las Casas"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/A_Short_Account_of_the_Destruction_of_the_Indies"
    },
    {
      "name": "History of the Indies (Historia de las Indias)",
      "authors": [
        "Bartolome de las Casas"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/History_of_the_Indies_(Historia_de_las_Indias)"
    },
    {
      "name": "In Defense of the Indians (Apologia)",
      "authors": [
        "Bartolome de las Casas"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/In_Defense_of_the_Indians_(Apologia)"
    },
    {
      "name": "Apologetic History Summary (Apologética Historia Sumaria)",
      "authors": [
        "Bartolome de las Casas"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Apologetic_History_Summary_(Apolog%C3%A9tica_Historia_Sumaria)"
    },
    {
      "name": "Utopia",
      "authors": [
        "Thomas More"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Utopia_(book)"
    },
    {
      "name": "Dialogue of Comfort against Tribulation",
      "authors": [
        "Thomas More"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Dialogue_of_Comfort_against_Tribulation"
    },
    {
      "name": "The Sadness of Christ (De Tristitia Christi)",
      "authors": [
        "Thomas More"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Sadness_of_Christ_(De_Tristitia_Christi)"
    },
    {
      "name": "A Dialogue Concerning Heresies",
      "authors": [
        "Thomas More"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/A_Dialogue_Concerning_Heresies"
    },
    {
      "name": "History of King Richard III",
      "authors": [
        "Thomas More"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/History_of_King_Richard_III"
    },
    {
      "name": "Ninety-Five Theses",
      "authors": [
        "Martin Luther"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Ninety-five_Theses"
    },
    {
      "name": "Small Catechism",
      "authors": [
        "Martin Luther"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Small_Catechism"
    },
    {
      "name": "Large Catechism",
      "authors": [
        "Martin Luther"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Large_Catechism"
    },
    {
      "name": "The Bondage of the Will",
      "authors": [
        "Martin Luther"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Bondage_of_the_Will"
    },
    {
      "name": "The Freedom of a Christian",
      "authors": [
        "Martin Luther"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Freedom_of_a_Christian"
    },
    {
      "name": "Sixty-Seven Articles",
      "authors": [
        "Huldrych Zwingli"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Sixty-Seven_Articles"
    },
    {
      "name": "Commentary on True and False Religion",
      "authors": [
        "Huldrych Zwingli"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Commentary_on_True_and_False_Religion"
    },
    {
      "name": "On the Lord’s Supper",
      "authors": [
        "Huldrych Zwingli"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Lord%E2%80%99s_Supper"
    },
    {
      "name": "On the Providence of God (De Providentia Dei)",
      "authors": [
        "Huldrych Zwingli"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Providence_of_God_(De_Providentia_Dei)"
    },
    {
      "name": "Spiritual Exercises",
      "authors": [
        "Ignatius of Loyola"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Spiritual_Exercises_of_Ignatius_of_Loyola"
    },
    {
      "name": "Constitutions of the Society of Jesus",
      "authors": [
        "Ignatius of Loyola"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Constitutions_of_the_Society_of_Jesus"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Ignatius of Loyola"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Ignatius_of_Loyola"
    },
    {
      "name": "Memoriale (Spiritual Diary)",
      "authors": [
        "Peter Faber"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Memoriale_(Spiritual_Diary)"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Peter Faber"
      ],
      "referenceUrl": "https://www.newadvent.org/cathen/06070a.htm"
    },
    {
      "name": "Institutes of the Christian Religion",
      "authors": [
        "John Calvin"
      ],
      "textUrl": "https://www.ccel.org/ccel/calvin/institutes.html",
      "referenceUrl": "https://en.wikipedia.org/wiki/Institutes_of_the_Christian_Religion"
    },
    {
      "name": "Commentary on Romans",
      "authors": [
        "John Calvin"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Commentary_on_Romans"
    },
    {
      "name": "Commentary on the Gospel of John",
      "authors": [
        "John Calvin"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Commentary_on_the_Gospel_of_John"
    },
    {
      "name": "Reply to Sadoleto",
      "authors": [
        "John Calvin"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Reply_to_Sadoleto"
    },
    {
      "name": "On the Necessity of Reforming the Church",
      "authors": [
        "John Calvin"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Necessity_of_Reforming_the_Church"
    },
    {
      "name": "The Life of Teresa of Jesus (Autobiography)",
      "authors": [
        "Teresa of Avila"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Life_of_Teresa_of_Jesus_(Autobiography)"
    },
    {
      "name": "The Way of Perfection",
      "authors": [
        "Teresa of Avila"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Way_of_Perfection"
    },
    {
      "name": "The Interior Castle",
      "authors": [
        "Teresa of Avila"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Interior_Castle"
    },
    {
      "name": "The Book of the Foundations",
      "authors": [
        "Teresa of Avila"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Book_of_the_Foundations"
    },
    {
      "name": "Concepts of the Love of God",
      "authors": [
        "Teresa of Avila"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Concepts_of_the_Love_of_God"
    },
    {
      "name": "Ascent of Mount Carmel",
      "authors": [
        "John of the Cross"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Ascent_of_Mount_Carmel"
    },
    {
      "name": "Dark Night of the Soul",
      "authors": [
        "John of the Cross"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Dark_Night_of_the_Soul"
    },
    {
      "name": "Spiritual Canticle",
      "authors": [
        "John of the Cross"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Spiritual_Canticle"
    },
    {
      "name": "Living Flame of Love",
      "authors": [
        "John of the Cross"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Living_Flame_of_Love"
    },
    {
      "name": "Sayings of Light and Love (Dichos)",
      "authors": [
        "John of the Cross"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Sayings_of_Light_and_Love_(Dichos)"
    },
    {
      "name": "Of Plymouth Plantation",
      "authors": [
        "William Bradford"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Of_Plymouth_Plantation"
    },
    {
      "name": "On the Mortification of Sin in Believers",
      "authors": [
        "John Owen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/On_the_Mortification_of_Sin_in_Believers"
    },
    {
      "name": "The Death of Death in the Death of Christ",
      "authors": [
        "John Owen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Death_of_Death_in_the_Death_of_Christ"
    },
    {
      "name": "Communion with God",
      "authors": [
        "John Owen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Communion_with_God"
    },
    {
      "name": "The Glory of Christ",
      "authors": [
        "John Owen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Glory_of_Christ"
    },
    {
      "name": "A Discourse Concerning the Holy Spirit",
      "authors": [
        "John Owen"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/A_Discourse_Concerning_the_Holy_Spirit"
    },
    {
      "name": "The Pilgrim’s Progress",
      "authors": [
        "John Bunyan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Pilgrim%27s_Progress"
    },
    {
      "name": "Grace Abounding to the Chief of Sinners",
      "authors": [
        "John Bunyan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Grace_Abounding_to_the_Chief_of_Sinners"
    },
    {
      "name": "The Holy War",
      "authors": [
        "John Bunyan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Holy_War"
    },
    {
      "name": "The Life and Death of Mr. Badman",
      "authors": [
        "John Bunyan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Life_and_Death_of_Mr._Badman"
    },
    {
      "name": "The Jerusalem Sinner Saved",
      "authors": [
        "John Bunyan"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/The_Jerusalem_Sinner_Saved"
    },
    {
      "name": "Centuries of Meditations",
      "authors": [
        "Thomas Traherne"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Centuries_of_Meditations"
    },
    {
      "name": "Philosophiæ Naturalis Principia Mathematica",
      "authors": [
        "Sir Isaac Newton"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Philosophi%C3%A6_Naturalis_Principia_Mathematica"
    },
    {
      "name": "Opticks",
      "authors": [
        "Sir Isaac Newton"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Opticks"
    },
    {
      "name": "Observations upon the Prophecies of Daniel and the Apocalypse of St. John",
      "authors": [
        "Sir Isaac Newton"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Observations_upon_the_Prophecies_of_Daniel_and_the_Apocalypse_of_St._John"
    },
    {
      "name": "Explanatory Notes upon the New Testament",
      "authors": [
        "John Wesley"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Explanatory_Notes_upon_the_New_Testament"
    },
    {
      "name": "Life of Saint Augustine (Vita Augustini)",
      "authors": [
        "Possidius"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Life_of_Saint_Augustine_(Vita_Augustini)"
    },
    {
      "name": "Letters (selected, as preserved)",
      "authors": [
        "Pope Cornelius"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Pope_Cornelius"
    },
    {
      "name": "Letters (selected, as preserved)",
      "authors": [
        "Pope Stephen I"
      ],
      "referenceUrl": "https://la.wikisource.org/wiki/Epistolae_decretales_(Stephanus_I)"
    },
    {
      "name": "De Institutione Virginum (On the Instruction of Virgins)",
      "authors": [
        "Leander of Seville"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/De_Institutione_Virginum_(On_the_Instruction_of_Virgins)"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Pope Martin I"
      ],
      "referenceUrl": "https://la.wikisource.org/wiki/Epistolae_(Martinus_I)"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Pope Gregory II"
      ],
      "referenceUrl": "https://la.wikisource.org/wiki/Epistolae_et_canones_(Gregorius_II)"
    }
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

  modal.addEventListener(
    "wheel",
    (event) => {
      if (modal.classList.contains("is-open")) {
        event.stopPropagation();
      }
    },
    { passive: true }
  );

  modal.addEventListener(
    "touchmove",
    (event) => {
      if (modal.classList.contains("is-open")) {
        event.stopPropagation();
      }
    },
    { passive: true }
  );

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
