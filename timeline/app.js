async function main() {
  const container = document.getElementById("timeline");
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

  const options = {
    stack: true,
    horizontalScroll: true,
    zoomKey: "ctrlKey", // helps avoid accidental zoom; remove if you prefer always-zoom
    maxHeight: "100%",
    tooltip: { followMouse: true },
    // Set an initial window (roughly)
    start: new Date(200, 0, 1),
    end: new Date(600, 0, 1),
    min: minDate,
    max: maxDate
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

  // vis-timeline expects DataSet instances
  const groups = new vis.DataSet(data.groups);
  const items = new vis.DataSet(
    data.items.map((item) => {
      const decorated = {
        ...item,
        name: item.name || item.content
      };
      decorated.content = buildItemLabel(decorated);
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
}

main().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<pre style="padding:16px;color:#b00;">${err.stack || err}</pre>`;
});
