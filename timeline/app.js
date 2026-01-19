async function main() {
  const container = document.getElementById("timeline");
  const modal = document.getElementById("event-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalForm = document.getElementById("modal-form");
  const modalError = document.getElementById("modal-error");
  const addPersonButton = document.getElementById("add-person-button");
  const fieldName = document.getElementById("field-name");
  const fieldBirth = document.getElementById("field-birth");
  const fieldDeath = document.getElementById("field-death");
  const fieldDescription = document.getElementById("field-description");

  const res = await fetch("./events.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load events.json: ${res.status}`);
  const data = await res.json();

  // vis-timeline expects DataSet instances
  const groups = new vis.DataSet(data.groups);
  const items = new vis.DataSet(data.items);

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

  const timeline = new vis.Timeline(container, items, groups, options);

  let activeItemId = null;

  function formatYearLabel(year) {
    if (year <= 0) {
      return `${1 - year} BC`;
    }
    return `${year} AD`;
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
    const yearLabel = formatYearLabel(parts.year);
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

  function parseFlexibleDate(value) {
    if (!value) return null;
    const cleaned = value.trim().replace(/\s+/g, " ");
    if (!cleaned) return null;
    const tokens = cleaned.split(" ");
    const eraToken = tokens.pop();
    if (!eraToken) return null;
    const era = eraToken.toUpperCase();
    if (era !== "AD" && era !== "BC") return null;

    const monthMap = {
      JAN: 1,
      FEB: 2,
      MAR: 3,
      APR: 4,
      MAY: 5,
      JUN: 6,
      JUL: 7,
      AUG: 8,
      SEP: 9,
      OCT: 10,
      NOV: 11,
      DEC: 12
    };

    let month = null;
    let day = null;
    let year = null;

    if (tokens.length === 1) {
      year = Number.parseInt(tokens[0], 10);
    } else if (tokens.length === 2) {
      const monthToken = tokens[0].slice(0, 3).toUpperCase();
      month = monthMap[monthToken];
      year = Number.parseInt(tokens[1], 10);
    } else if (tokens.length === 3) {
      const monthToken = tokens[0].slice(0, 3).toUpperCase();
      month = monthMap[monthToken];
      day = Number.parseInt(tokens[1], 10);
      year = Number.parseInt(tokens[2], 10);
    } else {
      return null;
    }

    if (!year || Number.isNaN(year)) return null;
    if (month && Number.isNaN(month)) return null;
    if (day && Number.isNaN(day)) return null;

    const storedYear = era === "BC" ? -(year - 1) : year;
    const paddedYear = String(Math.abs(storedYear)).padStart(4, "0");
    const yearPrefix = storedYear < 0 ? "-" : "";
    const monthValue = month ? String(month).padStart(2, "0") : "01";
    const dayValue = day ? String(day).padStart(2, "0") : "01";
    const iso = `${yearPrefix}${paddedYear}-${monthValue}-${dayValue}`;
    const precision = day ? "day" : month ? "month" : "year";

    return { iso, precision };
  }

  function formatDateInput(dateString, precision) {
    if (!dateString) return "";
    const parts = parseDateParts(dateString);
    if (!parts) return "";
    const yearLabel = formatYearLabel(parts.year);
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
    return `${monthName} ${parts.day} ${yearLabel}`;
  }

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
      label.textContent = formatYearLabel(year);
    });
  }

  function openModal(item) {
    modalTitle.textContent = item ? "Edit entry" : "Add person";
    modalError.textContent = "";
    activeItemId = item ? item.id : null;
    const startPrecision =
      item?.startPrecision || precisionFromParts(parseDateParts(item?.start));
    const endPrecision =
      item?.endPrecision || precisionFromParts(parseDateParts(item?.end));
    fieldName.value = item?.content || "";
    fieldBirth.value = item?.start ? formatDateInput(item.start, startPrecision) : "";
    fieldDeath.value = item?.end ? formatDateInput(item.end, endPrecision) : "";
    fieldDescription.value = item?.description || "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    fieldName.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activeItemId = null;
  }

  function saveItem(event) {
    event.preventDefault();
    modalError.textContent = "";
    const name = fieldName.value.trim();
    const birthRaw = fieldBirth.value.trim();
    const deathRaw = fieldDeath.value.trim();
    const description = fieldDescription.value.trim();

    if (!name) {
      modalError.textContent = "Name is required.";
      return;
    }

    const birth = parseFlexibleDate(birthRaw);
    if (!birth) {
      modalError.textContent =
        "Birth must be like \"Jan 15 151 AD\", \"Jan 151 AD\", or \"151 AD\".";
      return;
    }

    const death = deathRaw ? parseFlexibleDate(deathRaw) : null;
    if (deathRaw && !death) {
      modalError.textContent =
        "Death must be like \"Jan 15 151 AD\", \"Jan 151 AD\", or \"151 AD\".";
      return;
    }

    const baseItem = {
      content: name,
      description: description || "",
      start: birth.iso,
      startPrecision: birth.precision
    };

    if (death) {
      baseItem.end = death.iso;
      baseItem.endPrecision = death.precision;
      baseItem.type = "range";
    } else {
      baseItem.type = "point";
    }

    if (activeItemId) {
      const existing = items.get(activeItemId);
      items.update({
        ...existing,
        ...baseItem
      });
    } else {
      items.add({
        id: `person-${Date.now()}`,
        group: "people",
        ...baseItem
      });
    }

    closeModal();
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
  });

  modalForm.addEventListener("submit", saveItem);

  addPersonButton.addEventListener("click", () => {
    openModal(null);
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
