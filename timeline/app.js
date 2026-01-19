async function main() {
  const container = document.getElementById("timeline");
  const modal = document.getElementById("event-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDate = document.getElementById("modal-date");

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

  function formatYearLabel(year) {
    if (year <= 0) {
      return `${1 - year} BC`;
    }
    return `${year} AD`;
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

  function formatDateLabel(dateString) {
    const parts = parseDateParts(dateString);
    if (!parts) return "";
    const yearLabel = formatYearLabel(parts.year);
    if (!parts.month || !parts.day) return yearLabel;
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
    return `${monthName} ${parts.day}, ${yearLabel}`;
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
    modalTitle.textContent = item.content;
    if (item.end) {
      modalDate.textContent = `${formatDateLabel(item.start)} – ${formatDateLabel(
        item.end
      )}`;
    } else {
      modalDate.textContent = formatDateLabel(item.start);
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
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
