import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const tableSelect = document.querySelector("#tableSelect");
const limitInput = document.querySelector("#limitInput");
const searchInput = document.querySelector("#searchInput");
const refreshButton = document.querySelector("#refreshButton");
const statusEl = document.querySelector("#status");
const rowCountEl = document.querySelector("#rowCount");
const tableWrap = document.querySelector("#tableWrap");

const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";

const tableConfig = [
  { id: "Pantheons", label: "Pantheons", orderBy: "name" },
  { id: "Gods", label: "Gods", orderBy: "name" },
  { id: "Heroes", label: "Heroes", orderBy: "name" },
  { id: "Hero Favors", label: "Hero Favors", orderBy: "hero_id" },
  { id: "Hero Works", label: "Hero Works", orderBy: "hero_id" },
  { id: "God Epithets", label: "God Epithets", orderBy: "god_id" },
];

let supabase = null;
let latestRows = [];

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

async function loadTable() {
  if (!supabase) {
    setStatus("Missing Supabase configuration.", true);
    return;
  }

  const tableName = tableSelect.value;
  const config = tableConfig.find((entry) => entry.id === tableName);
  const limit = Math.min(Math.max(Number(limitInput.value) || 50, 1), 500);
  setStatus(`Loading ${tableName}...`);

  let query = supabase.from(tableName).select("*").limit(limit);
  if (config && config.orderBy) {
    query = query.order(config.orderBy, { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    setStatus(error.message, true);
    latestRows = [];
    renderTable([]);
    return;
  }

  latestRows = data || [];
  setStatus(`Loaded ${latestRows.length} rows from ${tableName}.`);
  applySearchFilter();
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
  searchInput.addEventListener("input", applySearchFilter);

  loadTable();
}

init();
