import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const tableSelect = document.querySelector("#tableSelect");
const limitInput = document.querySelector("#limitInput");
const searchInput = document.querySelector("#searchInput");
const refreshButton = document.querySelector("#refreshButton");
const loadMoreButton = document.querySelector("#loadMoreButton");
const statusEl = document.querySelector("#status");
const rowCountEl = document.querySelector("#rowCount");
const tableWrap = document.querySelector("#tableWrap");

const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";

const tableConfig = [
  { id: "CH_People", label: "People", orderBy: "name" },
  { id: "CH_Eras", label: "Eras", orderBy: "start_year" },
  { id: "CH_Events", label: "Events", orderBy: "event_date" },
  { id: "CH_Connections", label: "Connections", orderBy: "person_id_1" },
  { id: "CH_Sources", label: "Sources", orderBy: "source_id" },
  { id: "CH_Source_Figures", label: "Source Figures", orderBy: "source_id" },
  { id: "CH_Works", label: "Works", orderBy: "person_id" },
];

let supabase = null;
let latestRows = [];
let currentOffset = 0;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("supabase-error", isError);
}

function setRowCount(count) {
  rowCountEl.textContent = `Rows: ${count}`;
}

function renderTable(rows) {
  tableWrap.innerHTML = "";
  if (!rows.length) {
    tableWrap.innerHTML = '<div class="supabase-empty">No rows found.</div>';
    setRowCount(0);
    return;
  }

  const columns = Object.keys(rows[0]);
  const table = document.createElement("table");
  table.className = "supabase-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  columns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    columns.forEach((col) => {
      const td = document.createElement("td");
      const value = row[col];
      if (value === null || value === undefined) {
        td.textContent = "";
      } else if (typeof value === "object") {
        td.textContent = JSON.stringify(value);
      } else {
        td.textContent = String(value);
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrap.appendChild(table);
  setRowCount(rows.length);
}

function applySearchFilter() {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    renderTable(latestRows);
    return;
  }

  const filtered = latestRows.filter((row) => {
    return Object.values(row).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(term);
    });
  });
  renderTable(filtered);
}

async function loadTable(append = false) {
  if (!supabase) {
    setStatus("Missing Supabase configuration.", true);
    return;
  }

  const tableName = tableSelect.value;
  const config = tableConfig.find((entry) => entry.id === tableName);
  const limit = Math.min(Math.max(Number(limitInput.value) || 50, 1), 500);

  if (!append) {
    currentOffset = 0;
    latestRows = [];
    // Clear search input and table display when switching tables
    searchInput.value = "";
    renderTable([]);
  }

  setStatus(`Loading ${tableName}...`);

  let query = supabase.from(tableName).select("*").range(currentOffset, currentOffset + limit - 1);
  if (config && config.orderBy) {
    query = query.order(config.orderBy, { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    setStatus(error.message, true);
    if (!append) {
      latestRows = [];
      renderTable([]);
    }
    loadMoreButton.style.display = "none";
    return;
  }

  const newRows = data || [];
  latestRows = append ? [...latestRows, ...newRows] : newRows;
  currentOffset = latestRows.length;

  setStatus(`Loaded ${latestRows.length} rows from ${tableName}.`);

  // Show/hide Load More button based on whether we got a full batch
  loadMoreButton.style.display = newRows.length === limit ? "inline-flex" : "none";

  applySearchFilter();
}

async function loadMore() {
  await loadTable(true);
}

function init() {
  tableConfig.forEach((table) => {
    const option = document.createElement("option");
    option.value = table.id;
    option.textContent = table.label;
    tableSelect.appendChild(option);
  });

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    setStatus("Supabase keys missing. Check /api/supabase-config.", true);
    return;
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  setStatus("Ready.");

  tableSelect.addEventListener("change", loadTable);
  refreshButton.addEventListener("click", loadTable);
  loadMoreButton.addEventListener("click", loadMore);
  searchInput.addEventListener("input", applySearchFilter);

  loadTable();
}

init();
