async function main() {
  const container = document.getElementById("timeline");
  const loadingIndicator = document.getElementById("timeline-loading");
  const modal = document.getElementById("event-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDate = document.getElementById("modal-date");
  const modalDescription = document.getElementById("modal-description");
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

  const categoryMeta = {
    people: { icon: "👤", className: "cat-people" },
    councils: { icon: "🏛️", className: "cat-councils" },
    "roman-emperors": { icon: "⚔️", className: "cat-roman-emperors" },
    documents: { icon: "📜", className: "cat-documents" },
    events: { icon: "📌", className: "cat-events" },
    eras: { icon: "⏳", className: "cat-eras" }
  };

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
