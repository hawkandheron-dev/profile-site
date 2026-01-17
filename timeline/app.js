async function main() {
  const container = document.getElementById("timeline");

  const res = await fetch("./events.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load events.json: ${res.status}`);
  const data = await res.json();

  // vis-timeline expects DataSet instances
  const groups = new vis.DataSet(data.groups);
  const items = new vis.DataSet(data.items);

  const options = {
    stack: true,
    horizontalScroll: true,
    zoomKey: "ctrlKey", // helps avoid accidental zoom; remove if you prefer always-zoom
    maxHeight: "100%",
    tooltip: { followMouse: true },
    // Set an initial window (roughly)
    start: "0200-01-01",
    end: "0600-01-01"
  };

  const timeline = new vis.Timeline(container, items, groups, options);

  timeline.on("select", (props) => {
    const id = props.items?.[0];
    if (!id) return;
    const item = items.get(id);
    // For now, just prove click works:
    alert(`${item.content}\n${item.start}${item.end ? " – " + item.end : ""}`);
  });
}

main().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<pre style="padding:16px;color:#b00;">${err.stack || err}</pre>`;
});
