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
      "textUrl": "https://www.biblegateway.com/passage/?search=John+1&version=ESV"
    },
    {
      "name": "First Epistle of John (1 John)",
      "authors": [
        "John the Evangelist"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=1+John+1&version=ESV"
    },
    {
      "name": "Second Epistle of John (2 John)",
      "authors": [
        "John the Evangelist"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=2+John+1&version=ESV"
    },
    {
      "name": "Third Epistle of John (3 John)",
      "authors": [
        "John the Evangelist"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=3+John+1&version=ESV"
    },
    {
      "name": "Revelation",
      "authors": [
        "John the Evangelist"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=Revelation+1&version=ESV"
    },
    {
      "name": "Epistle to the Romans",
      "authors": [
        "Paul"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=Romans+1&version=ESV"
    },
    {
      "name": "First Epistle to the Corinthians (1 Corinthians)",
      "authors": [
        "Paul"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=1+Corinthians+1&version=ESV"
    },
    {
      "name": "Second Epistle to the Corinthians (2 Corinthians)",
      "authors": [
        "Paul"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=2+Corinthians+1&version=ESV"
    },
    {
      "name": "Epistle to the Galatians",
      "authors": [
        "Paul"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=Galatians+1&version=ESV"
    },
    {
      "name": "Epistle to the Ephesians",
      "authors": [
        "Paul"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=Ephesians+1&version=ESV"
    },
    {
      "name": "First Epistle of Peter (1 Peter)",
      "authors": [
        "Peter"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=1+Peter+1&version=ESV"
    },
    {
      "name": "Second Epistle of Peter (2 Peter)",
      "authors": [
        "Peter"
      ],
      "textUrl": "https://www.biblegateway.com/passage/?search=2+Peter+1&version=ESV"
    },
    {
      "name": "Exposition of the Sayings of the Lord (fragments)",
      "authors": [
        "Papias of Hieropolis"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "First Epistle of Clement to the Corinthians (1 Clement)",
      "authors": [
        "Clement of Rome"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "Letter to the Ephesians",
      "authors": [
        "Ignatius of Antioch"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "Letter to the Magnesians",
      "authors": [
        "Ignatius of Antioch"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "Letter to the Trallians",
      "authors": [
        "Ignatius of Antioch"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "Letter to the Romans",
      "authors": [
        "Ignatius of Antioch"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "Letter to Polycarp",
      "authors": [
        "Ignatius of Antioch"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "Letter to the Philippians",
      "authors": [
        "Polycarp"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "First Apology",
      "authors": [
        "Justin Martyr"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "Second Apology",
      "authors": [
        "Justin Martyr"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "Dialogue with Trypho",
      "authors": [
        "Justin Martyr"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf-series/anf-series"
    },
    {
      "name": "Protrepticus (Exhortation to the Greeks)",
      "authors": [
        "Clement of Alexandria"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf02.html"
    },
    {
      "name": "Paedagogus (The Instructor)",
      "authors": [
        "Clement of Alexandria"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf02.html"
    },
    {
      "name": "Stromata (Miscellanies)",
      "authors": [
        "Clement of Alexandria"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf02.html"
    },
    {
      "name": "Who Is the Rich Man That Shall Be Saved? (Quis Dives Salvetur)",
      "authors": [
        "Clement of Alexandria"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf02.html"
    },
    {
      "name": "Diatessaron",
      "authors": [
        "Tatian"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf02.html"
    },
    {
      "name": "Address to the Greeks",
      "authors": [
        "Tatian"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf02.html"
    },
    {
      "name": "Against Heresies",
      "authors": [
        "Irenaeus of Lyons"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf01"
    },
    {
      "name": "Demonstration of the Apostolic Preaching (Proof of the Apostolic Preaching)",
      "authors": [
        "Irenaeus of Lyons"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf01"
    },
    {
      "name": "Apology",
      "authors": [
        "Tertullian"
      ],
      "textUrl": "https://ccel.org/ccel/tertullian"
    },
    {
      "name": "Prescription Against Heretics",
      "authors": [
        "Tertullian"
      ],
      "textUrl": "https://ccel.org/ccel/tertullian"
    },
    {
      "name": "Against Marcion",
      "authors": [
        "Tertullian"
      ],
      "textUrl": "https://ccel.org/ccel/tertullian"
    },
    {
      "name": "On Baptism",
      "authors": [
        "Tertullian"
      ],
      "textUrl": "https://ccel.org/ccel/tertullian"
    },
    {
      "name": "On the Flesh of Christ",
      "authors": [
        "Tertullian"
      ],
      "textUrl": "https://ccel.org/ccel/tertullian"
    },
    {
      "name": "Apostolic Tradition (attributed)",
      "authors": [
        "Hippolytus of Rome"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf05"
    },
    {
      "name": "Refutation of All Heresies",
      "authors": [
        "Hippolytus of Rome"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf05"
    },
    {
      "name": "Commentary on Daniel",
      "authors": [
        "Hippolytus of Rome"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf05"
    },
    {
      "name": "On Christ and Antichrist",
      "authors": [
        "Hippolytus of Rome"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf05"
    },
    {
      "name": "The Passion of Perpetua and Felicity (Perpetua’s diary portion)",
      "authors": [
        "Perpetua"
      ],
      "textUrl": "https://www.cambridge.org/core/journals/church-history/article/suicide-by-gladiator-the-acts-of-perpetua-and-felicitas-in-its-north-african-context/956AA0BD2ED4F9F14CF28071B1085CF9"
    },
    {
      "name": "On First Principles (De Principiis)",
      "authors": [
        "Origen"
      ],
      "textUrl": "https://www.ccel.org/ccel/origen"
    },
    {
      "name": "Against Celsus",
      "authors": [
        "Origen"
      ],
      "textUrl": "https://www.ccel.org/ccel/origen"
    },
    {
      "name": "On Prayer",
      "authors": [
        "Origen"
      ],
      "textUrl": "https://www.ccel.org/ccel/origen"
    },
    {
      "name": "Commentary on the Gospel of John",
      "authors": [
        "Origen"
      ],
      "textUrl": "https://www.ccel.org/ccel/origen"
    },
    {
      "name": "Homilies on Genesis",
      "authors": [
        "Origen"
      ],
      "textUrl": "https://www.ccel.org/ccel/origen"
    },
    {
      "name": "Address of Thanksgiving to Origen (Panegyric)",
      "authors": [
        "Gregory Thaumaturgus"
      ],
      "textUrl": "https://bkv.unifr.ch/works/cpg-1763/versions/the-oration-and-panegyric-addressed-to-origen/divisions"
    },
    {
      "name": "Declaration of Faith (Creed) (traditional attribution)",
      "authors": [
        "Gregory Thaumaturgus"
      ],
      "textUrl": "https://orthodoxchurchfathers.com/fathers/anf06/anf0606.html"
    },
    {
      "name": "On the Promises (as preserved in fragments/quotations)",
      "authors": [
        "Dionysius of Alexandria"
      ],
      "textUrl": "https://www.ccel.org/ccel/feltoe/dionysius.dionysius.t.t1.html"
    },
    {
      "name": "Letters (selected, as preserved in Eusebius)",
      "authors": [
        "Dionysius of Alexandria"
      ],
      "textUrl": "https://ccel.org/ccel/feltoe/dionysius/dionysius.toc.html"
    },
    {
      "name": "On the Unity of the Catholic Church",
      "authors": [
        "Cyprian"
      ],
      "textUrl": "https://ccel.org/ccel/cyprian"
    },
    {
      "name": "On the Lapsed",
      "authors": [
        "Cyprian"
      ],
      "textUrl": "https://ccel.org/ccel/cyprian"
    },
    {
      "name": "On Mortality",
      "authors": [
        "Cyprian"
      ],
      "textUrl": "https://ccel.org/ccel/cyprian"
    },
    {
      "name": "On the Lord’s Prayer",
      "authors": [
        "Cyprian"
      ],
      "textUrl": "https://ccel.org/ccel/cyprian"
    },
    {
      "name": "Letters (Epistles)",
      "authors": [
        "Cyprian"
      ],
      "textUrl": "https://ccel.org/ccel/cyprian"
    },
    {
      "name": "Letter(s) against Arianism (selected)",
      "authors": [
        "Alexander of Alexandria"
      ],
      "textUrl": "https://ccel.org/ccel/alexander_alexandria/heresy_and_deposition/anf06.x.iii.i.html"
    },
    {
      "name": "On the Incarnation",
      "authors": [
        "Athanasius"
      ],
      "textUrl": "https://www.ccel.org/ccel/athanasius/incarnation"
    },
    {
      "name": "Life of Antony",
      "authors": [
        "Athanasius"
      ],
      "textUrl": "https://ccel.org/ccel/athanasius"
    },
    {
      "name": "Orations Against the Arians",
      "authors": [
        "Athanasius"
      ],
      "textUrl": "https://ccel.org/ccel/athanasius"
    },
    {
      "name": "Letters to Serapion on the Holy Spirit",
      "authors": [
        "Athanasius"
      ],
      "textUrl": "https://ccel.org/ccel/athanasius"
    },
    {
      "name": "Festal Letters (selected)",
      "authors": [
        "Athanasius"
      ],
      "textUrl": "https://ccel.org/ccel/athanasius"
    },
    {
      "name": "On the Holy Spirit",
      "authors": [
        "Basil the Great"
      ],
      "textUrl": "https://www.ccel.org/ccel/basil"
    },
    {
      "name": "Hexaemeron",
      "authors": [
        "Basil the Great"
      ],
      "textUrl": "https://www.ccel.org/ccel/basil"
    },
    {
      "name": "Longer Rules (Regulae Fusius Tractatae)",
      "authors": [
        "Basil the Great"
      ],
      "textUrl": "https://www.ccel.org/ccel/basil"
    },
    {
      "name": "Shorter Rules (Regulae Brevius Tractatae)",
      "authors": [
        "Basil the Great"
      ],
      "textUrl": "https://www.ccel.org/ccel/basil"
    },
    {
      "name": "Address to Young Men on How They Might Derive Benefit from Greek Literature",
      "authors": [
        "Basil the Great"
      ],
      "textUrl": "https://www.ccel.org/ccel/basil"
    },
    {
      "name": "Theological Orations (Orations 27–31)",
      "authors": [
        "Gregory of Nazianzus"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/npnf207"
    },
    {
      "name": "Orations (selected)",
      "authors": [
        "Gregory of Nazianzus"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/npnf207"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Gregory of Nazianzus"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/npnf207"
    },
    {
      "name": "Poems (selected)",
      "authors": [
        "Gregory of Nazianzus"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/npnf207"
    },
    {
      "name": "Oration 43: Funeral Oration on Basil",
      "authors": [
        "Gregory of Nazianzus"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/npnf207"
    },
    {
      "name": "Life of Moses",
      "authors": [
        "Gregory of Nyssa"
      ],
      "textUrl": "https://www.ccel.org/g/gregorynyssa/index.html"
    },
    {
      "name": "Great Catechism",
      "authors": [
        "Gregory of Nyssa"
      ],
      "textUrl": "https://www.ccel.org/g/gregorynyssa/index.html"
    },
    {
      "name": "On the Making of Man",
      "authors": [
        "Gregory of Nyssa"
      ],
      "textUrl": "https://www.ccel.org/g/gregorynyssa/index.html"
    },
    {
      "name": "On the Soul and the Resurrection",
      "authors": [
        "Gregory of Nyssa"
      ],
      "textUrl": "https://www.ccel.org/g/gregorynyssa/index.html"
    },
    {
      "name": "Against Eunomius",
      "authors": [
        "Gregory of Nyssa"
      ],
      "textUrl": "https://www.ccel.org/g/gregorynyssa/index.html"
    },
    {
      "name": "On the Duties of the Clergy (De Officiis Ministrorum)",
      "authors": [
        "Ambrose of Milan"
      ],
      "textUrl": "https://www.ccel.org/ccel/ambrose"
    },
    {
      "name": "On the Mysteries (De Mysteriis)",
      "authors": [
        "Ambrose of Milan"
      ],
      "textUrl": "https://www.ccel.org/ccel/ambrose"
    },
    {
      "name": "On the Sacraments (De Sacramentis)",
      "authors": [
        "Ambrose of Milan"
      ],
      "textUrl": "https://www.ccel.org/ccel/ambrose"
    },
    {
      "name": "On the Holy Spirit (De Spiritu Sancto)",
      "authors": [
        "Ambrose of Milan"
      ],
      "textUrl": "https://www.ccel.org/ccel/ambrose"
    },
    {
      "name": "On Repentance (De Paenitentia)",
      "authors": [
        "Ambrose of Milan"
      ],
      "textUrl": "https://www.ccel.org/ccel/ambrose"
    },
    {
      "name": "On Illustrious Men (De Viris Illustribus)",
      "authors": [
        "Jerome"
      ],
      "textUrl": "https://ccel.org/ccel/jerome"
    },
    {
      "name": "Against Jovinian (Adversus Jovinianum)",
      "authors": [
        "Jerome"
      ],
      "textUrl": "https://ccel.org/ccel/jerome"
    },
    {
      "name": "Letter 22 to Eustochium",
      "authors": [
        "Jerome"
      ],
      "textUrl": "https://ccel.org/ccel/jerome"
    },
    {
      "name": "Lives of the Hermits (Paul, Hilarion, Malchus)",
      "authors": [
        "Jerome"
      ],
      "textUrl": "https://ccel.org/ccel/jerome"
    },
    {
      "name": "Commentary on Galatians",
      "authors": [
        "Jerome"
      ],
      "textUrl": "https://ccel.org/ccel/jerome"
    },
    {
      "name": "On the Priesthood",
      "authors": [
        "John Chrysostom"
      ],
      "textUrl": "https://www.ccel.org/ccel/chrysostom"
    },
    {
      "name": "Homilies on Matthew",
      "authors": [
        "John Chrysostom"
      ],
      "textUrl": "https://www.ccel.org/ccel/chrysostom"
    },
    {
      "name": "Homilies on John",
      "authors": [
        "John Chrysostom"
      ],
      "textUrl": "https://www.ccel.org/ccel/chrysostom"
    },
    {
      "name": "Homilies on Romans",
      "authors": [
        "John Chrysostom"
      ],
      "textUrl": "https://www.ccel.org/ccel/chrysostom"
    },
    {
      "name": "Letters to Olympias",
      "authors": [
        "John Chrysostom"
      ],
      "textUrl": "https://www.ccel.org/ccel/chrysostom"
    },
    {
      "name": "Confessions",
      "authors": [
        "Augustine of Hippo"
      ],
      "textUrl": "https://www.ccel.org/ccel/augustine/confessions.html"
    },
    {
      "name": "The City of God",
      "authors": [
        "Augustine of Hippo"
      ],
      "textUrl": "https://www.ccel.org/ccel/augustine/cityofgod.html"
    },
    {
      "name": "On the Trinity (De Trinitate)",
      "authors": [
        "Augustine of Hippo"
      ],
      "textUrl": "https://www.ccel.org/ccel/augustine"
    },
    {
      "name": "On Christian Doctrine (De Doctrina Christiana)",
      "authors": [
        "Augustine of Hippo"
      ],
      "textUrl": "https://www.ccel.org/ccel/augustine/doctrine.html"
    },
    {
      "name": "Enchiridion (Handbook on Faith, Hope, and Love)",
      "authors": [
        "Augustine of Hippo"
      ],
      "textUrl": "https://www.ccel.org/ccel/augustine/enchiridion.html"
    },
    {
      "name": "On the Holy Spirit (De Spiritu Sancto)",
      "authors": [
        "Didymus the Blind"
      ],
      "textUrl": "https://www.persee.fr/doc/rscir_0035-2217_1993_num_67_2_3230_t1_0122_0000_2"
    },
    {
      "name": "On the Trinity (De Trinitate) (attributed)",
      "authors": [
        "Didymus the Blind"
      ],
      "textUrl": "https://www.cambridge.org/core/books/making-of-orthodoxy/some-sources-used-in-the-de-trinitate-ascribed-to-didymus-the-blind/209888B8E20E469C12B7A288DC8317EB"
    },
    {
      "name": "Commentary on the Apostles’ Creed",
      "authors": [
        "Rufinus of Aquileia"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf08/anf08.vi.iii.ii.html"
    },
    {
      "name": "Church History (Latin continuation/translation of Eusebius) (traditional association)",
      "authors": [
        "Rufinus of Aquileia"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf08/anf08.vi.iii.ii.html"
    },
    {
      "name": "Apology for Origen",
      "authors": [
        "Rufinus of Aquileia"
      ],
      "textUrl": "https://ccel.org/ccel/schaff/anf08/anf08.vi.iii.ii.html"
    },
    {
      "name": "Paschal Letters (selected)",
      "authors": [
        "Theophilus of Alexandria"
      ],
      "textUrl": "https://www.newadvent.org/fathers/260196.htm"
    },
    {
      "name": "Festal Letters (selected)",
      "authors": [
        "Theophilus of Alexandria"
      ],
      "textUrl": "https://elmhurst.ecampus.com/theophilus-alexandria-1st-russell-norman/bk/9780415289146"
    },
    {
      "name": "Commentary on the Gospel of John",
      "authors": [
        "Cyril of Alexandria"
      ],
      "textUrl": "https://www.ccel.org/ccel/cyril"
    },
    {
      "name": "On the Unity of Christ",
      "authors": [
        "Cyril of Alexandria"
      ],
      "textUrl": "https://www.ccel.org/ccel/cyril"
    },
    {
      "name": "Five Tomes Against Nestorius",
      "authors": [
        "Cyril of Alexandria"
      ],
      "textUrl": "https://www.ccel.org/ccel/cyril"
    },
    {
      "name": "Festal Letters (selected)",
      "authors": [
        "Cyril of Alexandria"
      ],
      "textUrl": "https://www.ccel.org/ccel/cyril"
    },
    {
      "name": "Commentary on Luke (fragments/selected)",
      "authors": [
        "Cyril of Alexandria"
      ],
      "textUrl": "https://www.ccel.org/ccel/cyril"
    },
    {
      "name": "The Bazaar of Heracleides",
      "authors": [
        "Nestorius of Constantinople"
      ],
      "textUrl": "https://www.gorgiaspress.com/the-bazaar-of-heracleides-9781593331327.html"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Nestorius of Constantinople"
      ],
      "textUrl": "https://www.cambridge.org/core/books/cambridge-edition-of-early-christian-writings/nestorius-of-constantinople-three-letters-to-celestine-of-rome/AA616A2895C8734E0B87F239D6CD8A73"
    },
    {
      "name": "Confessio",
      "authors": [
        "Patrick"
      ],
      "textUrl": "https://www.confessio.ie/etexts/confessio_english#"
    },
    {
      "name": "Letter to the Soldiers of Coroticus",
      "authors": [
        "Patrick"
      ],
      "textUrl": "https://www.confessio.ie/etexts/epistola_english#"
    },
    {
      "name": "Chronicle (Epitoma Chronicon)",
      "authors": [
        "Prosper of Aquitaine"
      ],
      "textUrl": "https://openlibrary.org/works/OL4799175W/Prosperi_Tironis_Epitoma_chronicon"
    },
    {
      "name": "Against the Ingrates (Carmen de Ingratis)",
      "authors": [
        "Prosper of Aquitaine"
      ],
      "textUrl": "https://books.google.com/books?id=lN4PAAAAQAAJ"
    },
    {
      "name": "Liber contra Collatorem",
      "authors": [
        "Prosper of Aquitaine"
      ],
      "textUrl": "https://www.newadvent.org/cathen/12487a.htm"
    },
    {
      "name": "Tome of Leo",
      "authors": [
        "Pope Leo I"
      ],
      "textUrl": "https://ccel.org/ccel/leo"
    },
    {
      "name": "Sermons (selected)",
      "authors": [
        "Pope Leo I"
      ],
      "textUrl": "https://ccel.org/ccel/leo"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Pope Leo I"
      ],
      "textUrl": "https://ccel.org/ccel/leo"
    },
    {
      "name": "On Grace (De Gratia) (traditional attribution)",
      "authors": [
        "Faustus of Riez"
      ],
      "textUrl": "https://www.britannica.com/biography/Faustus-of-Riez"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Faustus of Riez"
      ],
      "textUrl": "https://scaife.perseus.org/library/urn:cts:latinLit:stoa0121g.stoa003/"
    },
    {
      "name": "On the State of the Soul (De Statu Animae)",
      "authors": [
        "Claudianus Mamertus"
      ],
      "textUrl": "https://la.wikisource.org/wiki/De_statu_animae"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Pope Simplicius"
      ],
      "textUrl": "https://www.newadvent.org/cathen/14002a.htm"
    },
    {
      "name": "Rule of St Benedict",
      "authors": [
        "Benedict of Nursia"
      ],
      "textUrl": "https://www.penguinrandomhouse.com/books/630016/the-rule-of-saint-benedict-by-translated-with-an-introduction-by-anthony-c-meisel-and-m-l-del-mastro/"
    },
    {
      "name": "Sermons (selected)",
      "authors": [
        "Caesarius of Arles"
      ],
      "textUrl": "https://www.cuapress.org/9780813214047/sermons/"
    },
    {
      "name": "Rule for Nuns",
      "authors": [
        "Caesarius of Arles"
      ],
      "textUrl": "https://www.earlymedievalmonasticism.org/texts/Caesarius-Regula-ad-virgines.html"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Caesarius of Arles"
      ],
      "textUrl": "https://epistolae.ctl.columbia.edu/people/26123.html"
    },
    {
      "name": "Pastoral Rule (Regula Pastoralis)",
      "authors": [
        "Pope Gregory the Great"
      ],
      "textUrl": "https://www.ccel.org/ccel/gregory"
    },
    {
      "name": "Moralia on Job",
      "authors": [
        "Pope Gregory the Great"
      ],
      "textUrl": "https://www.ccel.org/ccel/gregory"
    },
    {
      "name": "Dialogues",
      "authors": [
        "Pope Gregory the Great"
      ],
      "textUrl": "https://www.ccel.org/ccel/gregory"
    },
    {
      "name": "Homilies on Ezekiel",
      "authors": [
        "Pope Gregory the Great"
      ],
      "textUrl": "https://www.ccel.org/ccel/gregory"
    },
    {
      "name": "Homilies on the Gospels",
      "authors": [
        "Pope Gregory the Great"
      ],
      "textUrl": "https://www.ccel.org/ccel/gregory"
    },
    {
      "name": "Etymologies (Etymologiae)",
      "authors": [
        "Isidore of Seville"
      ],
      "textUrl": "https://la.wikisource.org/wiki/Etymologiarum_libri_XX"
    },
    {
      "name": "On the Nature of Things (De Natura Rerum)",
      "authors": [
        "Isidore of Seville"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Isidore_of_Seville"
    },
    {
      "name": "Sentences (Sententiae)",
      "authors": [
        "Isidore of Seville"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Isidore_of_Seville"
    },
    {
      "name": "On Ecclesiastical Offices (De Ecclesiasticis Officiis)",
      "authors": [
        "Isidore of Seville"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Isidore_of_Seville"
    },
    {
      "name": "History of the Goths, Vandals, and Suevi",
      "authors": [
        "Isidore of Seville"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Isidore_of_Seville"
    },
    {
      "name": "Ambigua",
      "authors": [
        "Maximus the Confessor"
      ],
      "textUrl": "https://www.ccel.org/ccel/maximus"
    },
    {
      "name": "Mystagogia",
      "authors": [
        "Maximus the Confessor"
      ],
      "textUrl": "https://www.ccel.org/ccel/maximus"
    },
    {
      "name": "Questions to Thalassius",
      "authors": [
        "Maximus the Confessor"
      ],
      "textUrl": "https://www.ccel.org/ccel/maximus"
    },
    {
      "name": "Disputation with Pyrrhus",
      "authors": [
        "Maximus the Confessor"
      ],
      "textUrl": "https://www.ccel.org/ccel/maximus"
    },
    {
      "name": "Four Hundred Chapters on Love",
      "authors": [
        "Maximus the Confessor"
      ],
      "textUrl": "https://www.ccel.org/ccel/maximus"
    },
    {
      "name": "Life of Saint Eligius (Vita Sancti Eligii)",
      "authors": [
        "Audoin"
      ],
      "textUrl": "https://la.wikisource.org/wiki/Vita_S._Eligii"
    },
    {
      "name": "Letters (Correspondence) (selected)",
      "authors": [
        "Boniface"
      ],
      "textUrl": "https://elfinspell.com/Boniface1.html"
    },
    {
      "name": "Ecclesiastical History of the English People",
      "authors": [
        "The Venerable Bede"
      ],
      "textUrl": "https://www.ccel.org/ccel/bede"
    },
    {
      "name": "On the Reckoning of Time (De Temporum Ratione)",
      "authors": [
        "The Venerable Bede"
      ],
      "textUrl": "https://www.ccel.org/ccel/bede"
    },
    {
      "name": "Lives of the Abbots of Wearmouth and Jarrow",
      "authors": [
        "The Venerable Bede"
      ],
      "textUrl": "https://www.ccel.org/ccel/bede"
    },
    {
      "name": "Commentary on Mark",
      "authors": [
        "The Venerable Bede"
      ],
      "textUrl": "https://www.ccel.org/ccel/bede"
    },
    {
      "name": "On the Temple (De Templo)",
      "authors": [
        "The Venerable Bede"
      ],
      "textUrl": "https://www.ccel.org/ccel/bede"
    },
    {
      "name": "Commentary on the Apocalypse",
      "authors": [
        "Beatus of Liebana"
      ],
      "textUrl": "https://www.themorgan.org/collection/commentary-apocalypse/112348/285"
    },
    {
      "name": "Libellus Sacrosyllabus (against Adoptionism)",
      "authors": [
        "Paulinus II of Aquileia"
      ],
      "textUrl": "https://researchportal.helsinki.fi/en/publications/the-libellus-sacrosyllabus-of-paulinus-ii-of-aquileia-publishing-"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Paulinus II of Aquileia"
      ],
      "textUrl": "https://la.wikisource.org/wiki/Patrologia_Latina/99"
    },
    {
      "name": "On the Trinity and Incarnation (De Fide Sanctae Trinitatis)",
      "authors": [
        "Alcuin of York"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Alcuin"
    },
    {
      "name": "De Virtutibus et Vitiis",
      "authors": [
        "Alcuin of York"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Alcuin"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Alcuin of York"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Alcuin"
    },
    {
      "name": "Disputation with Pepin",
      "authors": [
        "Alcuin of York"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Alcuin"
    },
    {
      "name": "Life of Willibrord (Vita Willibrordi)",
      "authors": [
        "Alcuin of York"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Alcuin"
    },
    {
      "name": "On the Education of Clergy (De Institutione Clericorum)",
      "authors": [
        "Rabanus Maurus"
      ],
      "textUrl": "https://books.google.com/books/about/Rabani_Mauri_de_Institutione_Clericorum.html?id=hpP3wwEACAAJ"
    },
    {
      "name": "On the Nature of Things (De Rerum Naturis)",
      "authors": [
        "Rabanus Maurus"
      ],
      "textUrl": "https://books.google.com/books/about/De_rerum_naturis.html?id=Z1lr0QEACAAJ"
    },
    {
      "name": "On the Praises of the Holy Cross (De Laudibus Sanctae Crucis)",
      "authors": [
        "Rabanus Maurus"
      ],
      "textUrl": "https://la.wikisource.org/wiki/De_laudibus_Sanctae_Crucis_(Rabanus_Maurus)"
    },
    {
      "name": "Commentary on Matthew (selected)",
      "authors": [
        "Rabanus Maurus"
      ],
      "textUrl": "https://la.wikisource.org/wiki/Commentarium_in_Matthaeum_(Rabanus_Maurus)"
    },
    {
      "name": "Hymn: The Fallen Woman (Kassia’s Troparion)",
      "authors": [
        "Kassia of Byzantium"
      ],
      "textUrl": "https://www.musicale.gr/afieromata/kassiani/index_en.html"
    },
    {
      "name": "Hymns (selected)",
      "authors": [
        "Kassia of Byzantium"
      ],
      "textUrl": "https://byzantine.lib.princeton.edu/byzantine/translation/15956"
    },
    {
      "name": "Epigrams (selected)",
      "authors": [
        "Kassia of Byzantium"
      ],
      "textUrl": "https://byzantine.lib.princeton.edu/byzantine/translation/15956"
    },
    {
      "name": "Periphyseon (De Divisione Naturae)",
      "authors": [
        "John Scotus Eriugena"
      ],
      "textUrl": "https://www.booksamillion.com/p/Periphyseon/Johannes-Scotus-Eriugena/9780884024620"
    },
    {
      "name": "On Divine Predestination (De Praedestinatione)",
      "authors": [
        "John Scotus Eriugena"
      ],
      "textUrl": "https://www.barnesandnoble.com/w/treatise-on-divine-predestination-john-scottus-eriugena/1101996234"
    },
    {
      "name": "Homily on the Prologue of John",
      "authors": [
        "John Scotus Eriugena"
      ],
      "textUrl": "https://academic.oup.com/book/26478/chapter/194921583"
    },
    {
      "name": "Commentary on Pseudo-Dionysius (selected)",
      "authors": [
        "John Scotus Eriugena"
      ],
      "textUrl": "https://www.brepols.net/products/IS-9782503033112-1"
    },
    {
      "name": "Bibliotheca (Myriobiblon)",
      "authors": [
        "Photios I of Constantinople"
      ],
      "textUrl": "https://ccel.org/ccel/pearse/morefathers/files/photius_bibliotheca_01.htm"
    },
    {
      "name": "Mystagogy of the Holy Spirit",
      "authors": [
        "Photios I of Constantinople"
      ],
      "textUrl": "https://ccel.org/ccel/pearse/morefathers/files/photius_bibliotheca_01.htm"
    },
    {
      "name": "Amphilochia (selected)",
      "authors": [
        "Photios I of Constantinople"
      ],
      "textUrl": "https://ccel.org/ccel/pearse/morefathers/files/photius_bibliotheca_01.htm"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Photios I of Constantinople"
      ],
      "textUrl": "https://ccel.org/ccel/pearse/morefathers/files/photius_bibliotheca_01.htm"
    },
    {
      "name": "Liber Manualis (Handbook)",
      "authors": [
        "Dhuoda of Uzes"
      ],
      "textUrl": "https://www.cambridge.org/core/journals/studies-in-church-history/article/god-and-man-in-dhuodas-liber-manualis/21C62FC0807D1866CB216FBF0B03D396"
    },
    {
      "name": "Old Church Slavonic Translation of the Gospels (traditional attribution)",
      "authors": [
        "Cyril and Methodius"
      ],
      "textUrl": "https://hrcak.srce.hr/265410"
    },
    {
      "name": "Old Church Slavonic Liturgical Translations (selected, traditional attribution)",
      "authors": [
        "Cyril and Methodius"
      ],
      "textUrl": "https://hrcak.srce.hr/22379"
    },
    {
      "name": "Alphabet/Orthographic works (Glagolitic tradition) (traditional attribution)",
      "authors": [
        "Cyril and Methodius"
      ],
      "referenceUrl": "https://en.wikipedia.org/wiki/Glagolitic_script"
    },
    {
      "name": "Commentary on Martianus Capella (attributed)",
      "authors": [
        "Remigius of Auxerre"
      ],
      "textUrl": "https://www.ccel.org/ccel/wace/biodict.html?term=Remigius%20of%20Auxerre"
    },
    {
      "name": "Commentary on Boethius (attributed)",
      "authors": [
        "Remigius of Auxerre"
      ],
      "textUrl": "https://www.cambridge.org/core/journals/traditio/article/remigian-commentaries-on-boethiuss-de-consolatione-philosophiae/B3B2B8E9E0A04C5B2A9B7E0D6E4A0D8B"
    },
    {
      "name": "Glosses/Commentaries on Priscian (attributed)",
      "authors": [
        "Remigius of Auxerre"
      ],
      "textUrl": "https://www.ccel.org/ccel/wace/biodict.html?term=Remigius%20of%20Auxerre"
    },
    {
      "name": "Vita Sancti Geraldi (Life of St Gerald of Aurillac)",
      "authors": [
        "Odo of Cluny"
      ],
      "textUrl": "https://la.wikisource.org/wiki/Vita_S._Geraldi_(Odo_Cluniacensis)"
    },
    {
      "name": "Collationes (Conferences) (attributed)",
      "authors": [
        "Odo of Cluny"
      ],
      "textUrl": "https://la.wikisource.org/wiki/Patrologia_Latina/133"
    },
    {
      "name": "De Musica (attributed)",
      "authors": [
        "Odo of Cluny"
      ],
      "textUrl": "https://books.google.com/books?id=R4YXvAEACAAJ&printsec=frontcover"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Sylvester II / Gerbert of Aurillac"
      ],
      "textUrl": "https://epistolae.ctl.columbia.edu/people/21350.html"
    },
    {
      "name": "De Mensura Fistularum (On the Measure of Organ Pipes)",
      "authors": [
        "Sylvester II / Gerbert of Aurillac"
      ],
      "textUrl": "https://books.google.com/books?id=R4YXvAEACAAJ&printsec=frontcover"
    },
    {
      "name": "On the Body and Blood of the Lord (De Corpore et Sanguine Domini)",
      "authors": [
        "Lanfranc"
      ],
      "textUrl": "https://brill.com/view/book/9789004330443/BP000012.xml"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Lanfranc"
      ],
      "textUrl": "https://books.google.com/books/about/The_Letters_of_Lanfranc.html?id=6vt3nQEACAAJ"
    },
    {
      "name": "Proslogion",
      "authors": [
        "Anselm"
      ],
      "textUrl": "https://ccel.org/ccel/anselm"
    },
    {
      "name": "Monologion",
      "authors": [
        "Anselm"
      ],
      "textUrl": "https://ccel.org/ccel/anselm"
    },
    {
      "name": "Why God Became Man (Cur Deus Homo)",
      "authors": [
        "Anselm"
      ],
      "textUrl": "https://ccel.org/ccel/anselm"
    },
    {
      "name": "On Truth (De Veritate)",
      "authors": [
        "Anselm"
      ],
      "textUrl": "https://ccel.org/ccel/anselm"
    },
    {
      "name": "On the Freedom of the Will (De Libertate Arbitrii)",
      "authors": [
        "Anselm"
      ],
      "textUrl": "https://ccel.org/ccel/anselm"
    },
    {
      "name": "Glossa Ordinaria on the Bible (traditionally associated)",
      "authors": [
        "Anselm of Laon"
      ],
      "textUrl": "https://www.glossae.net/en/home/"
    },
    {
      "name": "Scivias",
      "authors": [
        "Hildegard of Bingen"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Hildegard_of_Bingen"
    },
    {
      "name": "Book of Life’s Merits (Liber Vitae Meritorum)",
      "authors": [
        "Hildegard of Bingen"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Hildegard_of_Bingen"
    },
    {
      "name": "Book of Divine Works (Liber Divinorum Operum)",
      "authors": [
        "Hildegard of Bingen"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Hildegard_of_Bingen"
    },
    {
      "name": "Physica",
      "authors": [
        "Hildegard of Bingen"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Hildegard_of_Bingen"
    },
    {
      "name": "Causae et Curae",
      "authors": [
        "Hildegard of Bingen"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Hildegard_of_Bingen"
    },
    {
      "name": "On Loving God (De Diligendo Deo)",
      "authors": [
        "Bernard of Clairvaux"
      ],
      "textUrl": "https://www.ccel.org/ccel/bernard"
    },
    {
      "name": "Sermons on the Song of Songs (selected)",
      "authors": [
        "Bernard of Clairvaux"
      ],
      "textUrl": "https://www.ccel.org/ccel/bernard"
    },
    {
      "name": "On Consideration (De Consideratione)",
      "authors": [
        "Bernard of Clairvaux"
      ],
      "textUrl": "https://www.ccel.org/ccel/bernard"
    },
    {
      "name": "On Grace and Free Choice (De Gratia et Libero Arbitrio)",
      "authors": [
        "Bernard of Clairvaux"
      ],
      "textUrl": "https://www.ccel.org/ccel/bernard"
    },
    {
      "name": "Life of St Malachy (Vita Sancti Malachiae)",
      "authors": [
        "Bernard of Clairvaux"
      ],
      "textUrl": "https://www.ccel.org/ccel/bernard"
    },
    {
      "name": "Summa Aurea",
      "authors": [
        "William of Auxerre"
      ],
      "textUrl": "https://www.britannica.com/topic/Summa-aurea"
    },
    {
      "name": "Canticle of the Creatures",
      "authors": [
        "Francis of Assisi"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Canticle_of_the_Sun"
    },
    {
      "name": "Earlier Rule (Regula non bullata)",
      "authors": [
        "Francis of Assisi"
      ],
      "textUrl": "https://www.ofm.org/franciscan-writings/earlier-rule"
    },
    {
      "name": "Later Rule (Regula bullata)",
      "authors": [
        "Francis of Assisi"
      ],
      "textUrl": "https://franciscan-archive.org/bullarium/TheRegulaBullataLSz.pdf"
    },
    {
      "name": "Testament",
      "authors": [
        "Francis of Assisi"
      ],
      "textUrl": "https://www.ofm.org/franciscan-writings/testament"
    },
    {
      "name": "Admonitions",
      "authors": [
        "Francis of Assisi"
      ],
      "textUrl": "https://www.franciscanarchive.org/franciscan-literature/assisi/admonitions/"
    },
    {
      "name": "On Light (De Luce)",
      "authors": [
        "Robert Grosseteste"
      ],
      "textUrl": "https://la.wikisource.org/wiki/De_luce"
    },
    {
      "name": "Hexaemeron (Commentary on Six Days of Creation)",
      "authors": [
        "Robert Grosseteste"
      ],
      "textUrl": "https://openlibrary.org/works/OL2878916W/Robert_Grosseteste_On_the_Six_Days_of_Creation"
    },
    {
      "name": "On Truth (De Veritate) (attributed/associated)",
      "authors": [
        "Robert Grosseteste"
      ],
      "textUrl": "https://plato.stanford.edu/archives/sum2024/entries/grosseteste/"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Robert Grosseteste"
      ],
      "textUrl": "https://plato.stanford.edu/archives/sum2024/entries/grosseteste/"
    },
    {
      "name": "Autobiography (attributed)",
      "authors": [
        "Nicephorus Blemmydes"
      ],
      "textUrl": "https://search.worldcat.org/title/Nicephori-Blemmydae-Autobiographia-sive-Curriculum-vitae-necnon-Epistula-universalior/oclc/1296420536"
    },
    {
      "name": "Epitome of Logic",
      "authors": [
        "Nicephorus Blemmydes"
      ],
      "textUrl": "https://books.google.com/books/about/Nicephori_Blemmidae_opera_omnia.html?id=yfQUAAAAQAAJ"
    },
    {
      "name": "Epitome of Physics",
      "authors": [
        "Nicephorus Blemmydes"
      ],
      "textUrl": "https://books.google.com/books/about/Nicephori_Blemmidae_opera_omnia.html?id=yfQUAAAAQAAJ"
    },
    {
      "name": "Latin Translation of Aristotle’s Metaphysics (attributed)",
      "authors": [
        "William of Moerbeke"
      ],
      "textUrl": "https://www.brepols.net/products/IS-9782503534793-1"
    },
    {
      "name": "Latin Translation of Proclus’ Elements of Theology",
      "authors": [
        "William of Moerbeke"
      ],
      "textUrl": "https://www.cambridge.org/core/journals/classical-review/article/abs/proclus-elementatio-theologica-translata-a-guillelmo-de-moerbecca-edited-by-h-boese-k-cm-thomas-bibliotheca-teubneriana-123-1-xvi-291-pp-leipzig-teubner-1980-dm-58/1D1CEB2AB74A979C6F3BC15A7F70CC69"
    },
    {
      "name": "Latin Translation of Archimedes (selected) (attributed)",
      "authors": [
        "William of Moerbeke"
      ],
      "textUrl": "https://blogs.bl.uk/digitisedmanuscripts/2022/08/from-constantinople-to-canterbury-the-medieval-manuscript-that-contains-euclid-archimedes-and-aristotle.html"
    },
    {
      "name": "Summa Theologiae",
      "authors": [
        "Thomas Aquinas"
      ],
      "textUrl": "https://www.newadvent.org/summa/"
    },
    {
      "name": "Summa Contra Gentiles",
      "authors": [
        "Thomas Aquinas"
      ],
      "textUrl": "https://ccel.org/ccel/aquinas"
    },
    {
      "name": "Catena Aurea",
      "authors": [
        "Thomas Aquinas"
      ],
      "textUrl": "https://ccel.org/ccel/aquinas"
    },
    {
      "name": "On Being and Essence (De Ente et Essentia)",
      "authors": [
        "Thomas Aquinas"
      ],
      "textUrl": "https://ccel.org/ccel/aquinas"
    },
    {
      "name": "Compendium of Theology",
      "authors": [
        "Thomas Aquinas"
      ],
      "textUrl": "https://ccel.org/ccel/aquinas"
    },
    {
      "name": "Ordinatio (Opus Oxoniense)",
      "authors": [
        "Duns Scotus"
      ],
      "textUrl": "https://www.ccel.org/s/scotus/"
    },
    {
      "name": "Reportatio (Lectura/Reportationes)",
      "authors": [
        "Duns Scotus"
      ],
      "textUrl": "https://www.ccel.org/s/scotus/"
    },
    {
      "name": "On the First Principle (De Primo Principio)",
      "authors": [
        "Duns Scotus"
      ],
      "textUrl": "https://www.ccel.org/s/scotus/"
    },
    {
      "name": "Questions on the Metaphysics (Quaestiones super Metaphysicam)",
      "authors": [
        "Duns Scotus"
      ],
      "textUrl": "https://www.ccel.org/s/scotus/"
    },
    {
      "name": "Theoremata (attributed)",
      "authors": [
        "Duns Scotus"
      ],
      "textUrl": "https://www.ccel.org/s/scotus/"
    },
    {
      "name": "The Divine Comedy",
      "authors": [
        "Dante Alighieri"
      ],
      "textUrl": "https://www.ccel.org/ccel/dante"
    },
    {
      "name": "Vita Nuova",
      "authors": [
        "Dante Alighieri"
      ],
      "textUrl": "https://www.ccel.org/ccel/dante"
    },
    {
      "name": "Convivio",
      "authors": [
        "Dante Alighieri"
      ],
      "textUrl": "https://www.ccel.org/ccel/dante"
    },
    {
      "name": "De Vulgari Eloquentia",
      "authors": [
        "Dante Alighieri"
      ],
      "textUrl": "https://www.ccel.org/ccel/dante"
    },
    {
      "name": "De Monarchia",
      "authors": [
        "Dante Alighieri"
      ],
      "textUrl": "https://www.ccel.org/ccel/dante"
    },
    {
      "name": "On the Cause of God (De Causa Dei)",
      "authors": [
        "Thomas Bradwardine"
      ],
      "textUrl": "https://books.google.com/books/about/De_causa_Dei.html?id=FPxJAAAAcAAJ"
    },
    {
      "name": "Tractatus de Proportionibus",
      "authors": [
        "Thomas Bradwardine"
      ],
      "textUrl": "https://www.britannica.com/biography/Thomas-Bradwardine"
    },
    {
      "name": "De Continuo (attributed/associated)",
      "authors": [
        "Thomas Bradwardine"
      ],
      "textUrl": "https://academic.oup.com/book/33556/chapter/287947098/chapter-pdf/39827504/oso-9780198809647-chapter-4.pdf"
    },
    {
      "name": "On the Truth of Holy Scripture (De Veritate Sacrae Scripturae)",
      "authors": [
        "John Wycliffe"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:John_Wycliffe"
    },
    {
      "name": "On the Church (De Ecclesia)",
      "authors": [
        "John Wycliffe"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:John_Wycliffe"
    },
    {
      "name": "On Civil Dominion (De Civili Dominio)",
      "authors": [
        "John Wycliffe"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:John_Wycliffe"
    },
    {
      "name": "On the Eucharist (De Eucharistia) (attributed)",
      "authors": [
        "John Wycliffe"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:John_Wycliffe"
    },
    {
      "name": "Trialogus (attributed)",
      "authors": [
        "John Wycliffe"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:John_Wycliffe"
    },
    {
      "name": "Revelations of Divine Love",
      "authors": [
        "Julian of Norwich"
      ],
      "textUrl": "https://ccel.org/ccel/julian/revelations"
    },
    {
      "name": "The Book of the City of Ladies",
      "authors": [
        "Christine de Pisan"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Christine_de_Pizan"
    },
    {
      "name": "The Treasure of the City of Ladies",
      "authors": [
        "Christine de Pisan"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Christine_de_Pizan"
    },
    {
      "name": "The Book of the Deeds and Good Morals of King Charles V",
      "authors": [
        "Christine de Pisan"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Christine_de_Pizan"
    },
    {
      "name": "Letter of the God of Love (Epistre au Dieu d’Amours)",
      "authors": [
        "Christine de Pisan"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Christine_de_Pizan"
    },
    {
      "name": "On the Church (De Ecclesia)",
      "authors": [
        "Jan Hus"
      ],
      "textUrl": "https://ccel.org/ccel/hus"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Jan Hus"
      ],
      "textUrl": "https://ccel.org/ccel/hus"
    },
    {
      "name": "On Simony",
      "authors": [
        "Jan Hus"
      ],
      "textUrl": "https://ccel.org/ccel/hus"
    },
    {
      "name": "Exposition of the Faith (selected) (attributed)",
      "authors": [
        "Jan Hus"
      ],
      "textUrl": "https://ccel.org/ccel/hus"
    },
    {
      "name": "The Imitation of Christ",
      "authors": [
        "Thomas a Kempis"
      ],
      "textUrl": "https://www.ccel.org/ccel/kempis"
    },
    {
      "name": "Prayers and Meditations (selected)",
      "authors": [
        "Thomas a Kempis"
      ],
      "textUrl": "https://www.ccel.org/ccel/kempis"
    },
    {
      "name": "Sermons (selected)",
      "authors": [
        "Thomas a Kempis"
      ],
      "textUrl": "https://www.ccel.org/ccel/kempis"
    },
    {
      "name": "On Learned Ignorance (De Docta Ignorantia)",
      "authors": [
        "Nicholas of Cusa"
      ],
      "textUrl": "https://www.ccel.org/ccel/nicolas"
    },
    {
      "name": "On the Peace of Faith (De Pace Fidei)",
      "authors": [
        "Nicholas of Cusa"
      ],
      "textUrl": "https://www.ccel.org/ccel/nicolas"
    },
    {
      "name": "On the Vision of God (De Visione Dei)",
      "authors": [
        "Nicholas of Cusa"
      ],
      "textUrl": "https://www.ccel.org/ccel/nicolas"
    },
    {
      "name": "On Conjectures (De Coniecturis)",
      "authors": [
        "Nicholas of Cusa"
      ],
      "textUrl": "https://www.ccel.org/ccel/nicolas"
    },
    {
      "name": "Idiota de Mente (The Layman on Mind)",
      "authors": [
        "Nicholas of Cusa"
      ],
      "textUrl": "https://www.ccel.org/ccel/nicolas"
    },
    {
      "name": "Triumph of the Cross",
      "authors": [
        "Savonarola"
      ],
      "textUrl": "https://www.gutenberg.org/ebooks/74508"
    },
    {
      "name": "Compendium of Revelations (Compendio di Rivelazioni) (attributed)",
      "authors": [
        "Savonarola"
      ],
      "textUrl": "https://books.google.com/books/about/Compendio_di_rivelazioni.html?id=MM8FlIEZGysC"
    },
    {
      "name": "Sermons (selected)",
      "authors": [
        "Savonarola"
      ],
      "textUrl": "https://oll.libertyfund.org/titles/savonarola-scelta-de-prediche-e-scritti"
    },
    {
      "name": "In Praise of Folly",
      "authors": [
        "Desiderius Erasmus"
      ],
      "textUrl": "https://www.ccel.org/ccel/erasmus"
    },
    {
      "name": "Handbook of the Christian Soldier (Enchiridion Militis Christiani)",
      "authors": [
        "Desiderius Erasmus"
      ],
      "textUrl": "https://www.ccel.org/ccel/erasmus"
    },
    {
      "name": "Colloquies",
      "authors": [
        "Desiderius Erasmus"
      ],
      "textUrl": "https://www.ccel.org/ccel/erasmus"
    },
    {
      "name": "On Free Will (De Libero Arbitrio)",
      "authors": [
        "Desiderius Erasmus"
      ],
      "textUrl": "https://www.ccel.org/ccel/erasmus"
    },
    {
      "name": "Novum Instrumentum Omne (Greek New Testament, 1516) / New Testament Paraphrases (selected)",
      "authors": [
        "Desiderius Erasmus"
      ],
      "textUrl": "https://www.ccel.org/ccel/erasmus"
    },
    {
      "name": "On the Revolutions of the Heavenly Spheres (De Revolutionibus Orbium Coelestium)",
      "authors": [
        "Nicholas Copernicus"
      ],
      "textUrl": "https://ads.harvard.edu/books/1543droc.book"
    },
    {
      "name": "A Short Account of the Destruction of the Indies",
      "authors": [
        "Bartolome de las Casas"
      ],
      "textUrl": "https://en.wikisource.org/wiki/A_Short_Account_of_the_Destruction_of_the_Indies"
    },
    {
      "name": "History of the Indies (Historia de las Indias)",
      "authors": [
        "Bartolome de las Casas"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Bartolom%C3%A9_de_las_Casas"
    },
    {
      "name": "In Defense of the Indians (Apologia)",
      "authors": [
        "Bartolome de las Casas"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Bartolom%C3%A9_de_las_Casas"
    },
    {
      "name": "Apologetic History Summary (Apologética Historia Sumaria)",
      "authors": [
        "Bartolome de las Casas"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Bartolom%C3%A9_de_las_Casas"
    },
    {
      "name": "Memorial de Remedios (Remedies for the Indies) (attributed/associated)",
      "authors": [
        "Bartolome de las Casas"
      ],
      "textUrl": "https://en.wikisource.org/wiki/Author:Bartolom%C3%A9_de_las_Casas"
    },
    {
      "name": "Utopia",
      "authors": [
        "Thomas More"
      ],
      "textUrl": "https://ccel.org/ccel/more"
    },
    {
      "name": "Dialogue of Comfort against Tribulation",
      "authors": [
        "Thomas More"
      ],
      "textUrl": "https://ccel.org/ccel/more"
    },
    {
      "name": "The Sadness of Christ (De Tristitia Christi)",
      "authors": [
        "Thomas More"
      ],
      "textUrl": "https://ccel.org/ccel/more"
    },
    {
      "name": "A Dialogue Concerning Heresies",
      "authors": [
        "Thomas More"
      ],
      "textUrl": "https://ccel.org/ccel/more"
    },
    {
      "name": "History of King Richard III",
      "authors": [
        "Thomas More"
      ],
      "textUrl": "https://ccel.org/ccel/more"
    },
    {
      "name": "Ninety-Five Theses",
      "authors": [
        "Martin Luther"
      ],
      "textUrl": "https://www.ccel.org/ccel/luther"
    },
    {
      "name": "Small Catechism",
      "authors": [
        "Martin Luther"
      ],
      "textUrl": "https://www.ccel.org/ccel/luther"
    },
    {
      "name": "Large Catechism",
      "authors": [
        "Martin Luther"
      ],
      "textUrl": "https://www.ccel.org/ccel/luther"
    },
    {
      "name": "The Bondage of the Will",
      "authors": [
        "Martin Luther"
      ],
      "textUrl": "https://www.ccel.org/ccel/luther"
    },
    {
      "name": "The Freedom of a Christian",
      "authors": [
        "Martin Luther"
      ],
      "textUrl": "https://www.ccel.org/ccel/luther"
    },
    {
      "name": "Sixty-Seven Articles",
      "authors": [
        "Huldrych Zwingli"
      ],
      "textUrl": "https://ccel.org/ccel/z/zwingli"
    },
    {
      "name": "Commentary on True and False Religion",
      "authors": [
        "Huldrych Zwingli"
      ],
      "textUrl": "https://ccel.org/ccel/z/zwingli"
    },
    {
      "name": "On the Lord’s Supper",
      "authors": [
        "Huldrych Zwingli"
      ],
      "textUrl": "https://ccel.org/ccel/z/zwingli"
    },
    {
      "name": "On the Providence of God (De Providentia Dei)",
      "authors": [
        "Huldrych Zwingli"
      ],
      "textUrl": "https://ccel.org/ccel/z/zwingli"
    },
    {
      "name": "Spiritual Exercises",
      "authors": [
        "Ignatius of Loyola"
      ],
      "textUrl": "https://ccel.org/ccel/ignatius/exercises"
    },
    {
      "name": "Constitutions of the Society of Jesus",
      "authors": [
        "Ignatius of Loyola"
      ],
      "textUrl": "https://ccel.org/ccel/ignatius/exercises"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Ignatius of Loyola"
      ],
      "textUrl": "https://ccel.org/ccel/ignatius/exercises"
    },
    {
      "name": "Memoriale (Spiritual Diary)",
      "authors": [
        "Peter Faber"
      ],
      "textUrl": "https://books.google.com/books/about/The_Letters_and_Instructions_of_Peter_Faber.html?id=8b7sAAAAMAAJ"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Peter Faber"
      ],
      "textUrl": "https://books.google.com/books/about/The_Letters_and_Instructions_of_Peter_Faber.html?id=8b7sAAAAMAAJ"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Francis Xavier"
      ],
      "textUrl": "https://books.google.com/books/about/The_Life_and_Letters_of_St_Francis_Xavie.html?id=gbJSAAAAcAAJ"
    },
    {
      "name": "Institutes of the Christian Religion",
      "authors": [
        "John Calvin"
      ],
      "textUrl": "https://www.ccel.org/ccel/calvin/institutes.html"
    },
    {
      "name": "Commentary on Romans",
      "authors": [
        "John Calvin"
      ],
      "textUrl": "https://www.ccel.org/ccel/calvin"
    },
    {
      "name": "Commentary on the Gospel of John",
      "authors": [
        "John Calvin"
      ],
      "textUrl": "https://www.ccel.org/ccel/calvin"
    },
    {
      "name": "Reply to Sadoleto",
      "authors": [
        "John Calvin"
      ],
      "textUrl": "https://www.ccel.org/ccel/calvin"
    },
    {
      "name": "On the Necessity of Reforming the Church",
      "authors": [
        "John Calvin"
      ],
      "textUrl": "https://www.ccel.org/ccel/calvin"
    },
    {
      "name": "The Life of Teresa of Jesus (Autobiography)",
      "authors": [
        "Teresa of Avila"
      ],
      "textUrl": "https://ccel.org/ccel/teresa"
    },
    {
      "name": "The Way of Perfection",
      "authors": [
        "Teresa of Avila"
      ],
      "textUrl": "https://ccel.org/ccel/teresa"
    },
    {
      "name": "The Interior Castle",
      "authors": [
        "Teresa of Avila"
      ],
      "textUrl": "https://ccel.org/ccel/teresa"
    },
    {
      "name": "The Book of the Foundations",
      "authors": [
        "Teresa of Avila"
      ],
      "textUrl": "https://ccel.org/ccel/teresa"
    },
    {
      "name": "Concepts of the Love of God",
      "authors": [
        "Teresa of Avila"
      ],
      "textUrl": "https://ccel.org/ccel/teresa"
    },
    {
      "name": "Ascent of Mount Carmel",
      "authors": [
        "John of the Cross"
      ],
      "textUrl": "https://www.ccel.org/ccel/john_cross"
    },
    {
      "name": "Dark Night of the Soul",
      "authors": [
        "John of the Cross"
      ],
      "textUrl": "https://www.ccel.org/ccel/john_cross"
    },
    {
      "name": "Spiritual Canticle",
      "authors": [
        "John of the Cross"
      ],
      "textUrl": "https://www.ccel.org/ccel/john_cross"
    },
    {
      "name": "Living Flame of Love",
      "authors": [
        "John of the Cross"
      ],
      "textUrl": "https://www.ccel.org/ccel/john_cross"
    },
    {
      "name": "Sayings of Light and Love (Dichos)",
      "authors": [
        "John of the Cross"
      ],
      "textUrl": "https://www.ccel.org/ccel/john_cross"
    },
    {
      "name": "Of Plymouth Plantation",
      "authors": [
        "William Bradford"
      ],
      "textUrl": "https://www.gutenberg.org/ebooks/24950"
    },
    {
      "name": "On the Mortification of Sin in Believers",
      "authors": [
        "John Owen"
      ],
      "textUrl": "https://www.ccel.org/ccel/owen"
    },
    {
      "name": "The Death of Death in the Death of Christ",
      "authors": [
        "John Owen"
      ],
      "textUrl": "https://www.ccel.org/ccel/owen"
    },
    {
      "name": "Communion with God",
      "authors": [
        "John Owen"
      ],
      "textUrl": "https://www.ccel.org/ccel/owen"
    },
    {
      "name": "The Glory of Christ",
      "authors": [
        "John Owen"
      ],
      "textUrl": "https://www.ccel.org/ccel/owen"
    },
    {
      "name": "A Discourse Concerning the Holy Spirit",
      "authors": [
        "John Owen"
      ],
      "textUrl": "https://www.ccel.org/ccel/owen"
    },
    {
      "name": "The Pilgrim’s Progress",
      "authors": [
        "John Bunyan"
      ],
      "textUrl": "https://ccel.org/ccel/bunyan"
    },
    {
      "name": "Grace Abounding to the Chief of Sinners",
      "authors": [
        "John Bunyan"
      ],
      "textUrl": "https://ccel.org/ccel/bunyan"
    },
    {
      "name": "The Holy War",
      "authors": [
        "John Bunyan"
      ],
      "textUrl": "https://ccel.org/ccel/bunyan"
    },
    {
      "name": "The Life and Death of Mr. Badman",
      "authors": [
        "John Bunyan"
      ],
      "textUrl": "https://ccel.org/ccel/bunyan"
    },
    {
      "name": "The Jerusalem Sinner Saved",
      "authors": [
        "John Bunyan"
      ],
      "textUrl": "https://ccel.org/ccel/bunyan"
    },
    {
      "name": "Centuries of Meditations",
      "authors": [
        "Thomas Traherne"
      ],
      "textUrl": "https://ccel.org/ccel/traherne/centuries"
    },
    {
      "name": "Thanksgivings (poems/prayers) (collected)",
      "authors": [
        "Thomas Traherne"
      ],
      "textUrl": "https://ccel.org/ccel/traherne/centuries"
    },
    {
      "name": "Christian Ethicks (attributed)",
      "authors": [
        "Thomas Traherne"
      ],
      "textUrl": "https://ccel.org/ccel/traherne/centuries"
    },
    {
      "name": "Philosophiæ Naturalis Principia Mathematica",
      "authors": [
        "Sir Isaac Newton"
      ],
      "textUrl": "https://plato.stanford.edu/entries/newton-principia/index.html"
    },
    {
      "name": "Opticks",
      "authors": [
        "Sir Isaac Newton"
      ],
      "textUrl": "https://www.britannica.com/topic/Opticks-by-Newton"
    },
    {
      "name": "Observations upon the Prophecies of Daniel and the Apocalypse of St. John",
      "authors": [
        "Sir Isaac Newton"
      ],
      "textUrl": "https://dev.gutenberg.org/files/16878/16878-h/16878-h.htm"
    },
    {
      "name": "Hymns and Sacred Poems (selected collections)",
      "authors": [
        "Charles Wesley",
        "John Wesley"
      ],
      "textUrl": "https://ccel.org/ccel/wesley/hymns"
    },
    {
      "name": "Charles Wesley’s Hymns (selected)",
      "authors": [
        "Charles Wesley"
      ],
      "textUrl": "https://ccel.org/ccel/wesley/hymns"
    },
    {
      "name": "Poems (selected)",
      "authors": [
        "Charles Wesley"
      ],
      "textUrl": "https://ccel.org/ccel/wesley/hymns"
    },
    {
      "name": "Journal (selected)",
      "authors": [
        "John Wesley"
      ],
      "textUrl": "https://ccel.org/ccel/wesley/journal"
    },
    {
      "name": "Sermons (selected)",
      "authors": [
        "John Wesley"
      ],
      "textUrl": "https://ccel.org/ccel/wesley/journal"
    },
    {
      "name": "Explanatory Notes upon the New Testament",
      "authors": [
        "John Wesley"
      ],
      "textUrl": "https://ccel.org/ccel/wesley/journal"
    },
    {
      "name": "Journals (selected)",
      "authors": [
        "George Whitefield"
      ],
      "textUrl": "https://ccel.org/ccel/whitefield/sermons"
    },
    {
      "name": "Sermons (selected)",
      "authors": [
        "George Whitefield"
      ],
      "textUrl": "https://ccel.org/ccel/whitefield/sermons"
    },
    {
      "name": "Damasian Epigrams (selected inscriptions/poems)",
      "authors": [
        "Pope Damasus I"
      ],
      "textUrl": "https://books.google.com/books/about/The_epigrams_of_St_Damasus.html?id=Y_C7pwAACAAJ"
    },
    {
      "name": "Life of Saint Augustine (Vita Augustini)",
      "authors": [
        "Possidius"
      ],
      "textUrl": "https://www.ccel.org/ccel/pearse/morefathers/files/possidius_life_of_augustine_02_text.htm"
    },
    {
      "name": "Letters (selected, as preserved)",
      "authors": [
        "Pope Cornelius"
      ],
      "textUrl": "https://www.ccel.org/ccel/schaff/anf05.iv.iv.html"
    },
    {
      "name": "Letters (selected, as preserved)",
      "authors": [
        "Pope Stephen I"
      ],
      "textUrl": "https://www.ccel.org/ccel/schaff/anf05.iv.iv.html"
    },
    {
      "name": "De Institutione Virginum (On the Instruction of Virgins)",
      "authors": [
        "Leander of Seville"
      ],
      "textUrl": "https://ora-et-labora.net/ORATIO/LEANDRO.html"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Pope Martin I"
      ],
      "textUrl": "https://la.wikisource.org/wiki/Patrologia_Latina/87"
    },
    {
      "name": "Letters (selected)",
      "authors": [
        "Pope Gregory II"
      ],
      "textUrl": "https://la.wikisource.org/wiki/Epistolae_et_canones_(Gregorius_II)"
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
