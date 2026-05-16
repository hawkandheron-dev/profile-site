import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './ChurchGraph.css';

/**
 * Force-directed "web" of churches and the people connected to them.
 * Church nodes are large and labeled; person nodes are smaller, with
 * travelers (people connected to 2+ churches) drawn larger and in an
 * accent color so the bridges between communities stand out.
 *
 * graphData: { nodes, links } prebuilt by the data adapter.
 */
export function ChurchGraph({ graphData, focusEntityId, onSelectNode, mode }) {
  const wrapRef = useRef(null);
  const fgRef = useRef(null);
  const [size, setSize] = useState({ width: 400, height: 400 });
  const [hoverId, setHoverId] = useState(null);

  // Size the canvas to its container
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Set of node ids adjacent to the hovered node (for highlight)
  const neighborIds = useMemo(() => {
    if (!hoverId) return null;
    const ids = new Set([hoverId]);
    (graphData.links || []).forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      if (s === hoverId) ids.add(t);
      if (t === hoverId) ids.add(s);
    });
    return ids;
  }, [hoverId, graphData.links]);

  // Re-fit the view whenever the graph data changes
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const t = setTimeout(() => {
      try { fg.zoomToFit(500, 60); } catch { /* ignore */ }
    }, 350);
    return () => clearTimeout(t);
  }, [graphData]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const isChurch = node.type === 'church';
    const isHousehold = node.type === 'household';
    const r = Math.max(2, node.val || 4);
    const dimmed = neighborIds && !neighborIds.has(node.id);
    const isFocus = node.entityId === focusEntityId;

    ctx.globalAlpha = dimmed ? 0.15 : 1;

    // Node shape
    ctx.beginPath();
    if (isChurch) {
      // Churches: rounded square "marker"
      const s = r;
      ctx.arc(node.x, node.y, s, 0, 2 * Math.PI);
    } else {
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    }
    ctx.fillStyle = node.color || (isHousehold ? '#8a7fae' : '#6b8caf');
    ctx.fill();

    if (isChurch || isFocus) {
      ctx.lineWidth = isFocus ? 2.5 : 1.5;
      ctx.strokeStyle = isFocus ? '#2c2418' : '#faf6eb';
      ctx.stroke();
    } else if (node.isTraveler) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#faf6eb';
      ctx.stroke();
    }

    // Labels: always for churches; for people only when zoomed in or hovered
    const showLabel = isChurch || node.id === hoverId || globalScale > 2.2;
    if (showLabel) {
      const fontSize = (isChurch ? 12 : 10) / globalScale;
      ctx.font = `${isChurch ? '600 ' : ''}${fontSize}px 'Alegreya Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#2c2418';
      ctx.strokeStyle = 'rgba(250, 246, 235, 0.9)';
      ctx.lineWidth = 2.5 / globalScale;
      const label = node.label || '';
      const ly = node.y + r + 1.5 / globalScale;
      ctx.strokeText(label, node.x, ly);
      ctx.fillText(label, node.x, ly);
    }

    ctx.globalAlpha = 1;
  }, [neighborIds, hoverId, focusEntityId]);

  const linkColor = useCallback((link) => {
    if (!neighborIds) return 'rgba(107, 91, 69, 0.25)';
    const s = typeof link.source === 'object' ? link.source.id : link.source;
    const t = typeof link.target === 'object' ? link.target.id : link.target;
    return (neighborIds.has(s) && neighborIds.has(t))
      ? 'rgba(217, 140, 43, 0.7)'
      : 'rgba(107, 91, 69, 0.06)';
  }, [neighborIds]);

  const handleClick = useCallback((node) => {
    if (node && onSelectNode) onSelectNode(node);
  }, [onSelectNode]);

  const isEmpty = !graphData.nodes || graphData.nodes.length === 0;

  return (
    <div className={`fcc-graph-wrap fcc-graph-wrap--${mode || 'focused'}`} ref={wrapRef}>
      {isEmpty ? (
        <div className="fcc-graph-empty">No connections to show.</div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          width={size.width}
          height={size.height}
          graphData={graphData}
          backgroundColor="#f4eedc"
          nodeRelSize={1}
          nodeVal={(n) => n.val || 4}
          nodeLabel={(n) => (
            n.type === 'church'
              ? `${n.label}`
              : `${n.label}${n.isTraveler ? ` — connects ${n.churchCount} churches` : ''}`
          )}
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, Math.max(3, node.val || 4), 0, 2 * Math.PI);
            ctx.fill();
          }}
          linkColor={linkColor}
          linkWidth={(l) => {
            if (!neighborIds) return 0.6;
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;
            return (neighborIds.has(s) && neighborIds.has(t)) ? 1.6 : 0.4;
          }}
          onNodeClick={handleClick}
          onNodeHover={(n) => setHoverId(n ? n.id : null)}
          cooldownTicks={120}
          onEngineStop={() => {
            try { fgRef.current?.zoomToFit(400, 60); } catch { /* ignore */ }
          }}
        />
      )}
    </div>
  );
}
