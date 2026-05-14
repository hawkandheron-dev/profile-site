import { useEffect, useRef, useCallback, useState } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCollide } from 'd3-force';
import './ChurchWebOverlay.css';

function nodeRadius(n) {
  return Math.max(3, n.val || 4);
}

function neighborSet(links, id) {
  const ids = new Set([id]);
  links.forEach(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source;
    const t = typeof l.target === 'object' ? l.target.id : l.target;
    if (s === id) ids.add(t);
    if (t === id) ids.add(s);
  });
  return ids;
}

function tooltipSub(node) {
  if (node.type === 'church') return node.isOtherChurch ? 'Connected church' : 'Church';
  if (node.type === 'household') return 'House church';
  if (node.isTraveler) {
    return `Connects ${node.churchCount} ${node.churchCount === 1 ? 'community' : 'communities'}`;
  }
  return node.role ? node.role.replace(/-/g, ' ') : null;
}

/**
 * Geo-anchored connection web drawn on a transparent canvas over the map.
 *
 * Church nodes are pinned to their real map coordinates (via map.project)
 * every frame; person and household nodes are positioned by a d3-force
 * simulation running in screen-pixel space. As the map pans/zooms the church
 * anchors are re-projected and the whole web is translated to follow.
 *
 * The canvas itself is pointer-events:none — hover and click hit-testing is
 * done by listening on the map's canvas container, so the map keeps all of
 * its native interactions and empty-space clicks still reach it.
 */
export function ChurchWebOverlay({ map, graph, onSelectNode }) {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const nodeByIdRef = useRef(new Map());
  const hoverRef = useRef(null);
  const onSelectRef = useRef(onSelectNode);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => { onSelectRef.current = onSelectNode; }, [onSelectNode]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = map?.getContainer();
    if (!canvas || !container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const nodes = nodesRef.current;
    const links = linksRef.current;
    if (!nodes.length) return;

    const hoverId = hoverRef.current;
    const neighborIds = hoverId ? neighborSet(links, hoverId) : null;

    links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source : nodeByIdRef.current.get(l.source);
      const t = typeof l.target === 'object' ? l.target : nodeByIdRef.current.get(l.target);
      if (!s || !t || s.x == null || t.x == null) return;
      let color = 'rgba(107, 91, 69, 0.32)';
      let width = 1;
      if (neighborIds) {
        const on = neighborIds.has(s.id) && neighborIds.has(t.id);
        color = on ? 'rgba(217, 140, 43, 0.8)' : 'rgba(107, 91, 69, 0.07)';
        width = on ? 2 : 0.5;
      }
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    });

    nodes.forEach(n => {
      if (n.x == null || n.y == null) return;
      const dimmed = neighborIds && !neighborIds.has(n.id);
      ctx.globalAlpha = dimmed ? 0.16 : 1;
      const r = nodeRadius(n);
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = n.color || '#6b8caf';
      ctx.fill();
      if (n.type === 'church') {
        ctx.lineWidth = n.isOtherChurch ? 1.5 : 3;
        ctx.strokeStyle = n.isOtherChurch ? '#faf6eb' : '#2c2418';
      } else {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#faf6eb';
      }
      ctx.stroke();

      const showLabel = n.type === 'church' || n.type === 'household' || n.id === hoverId;
      if (showLabel) {
        const fontSize = n.type === 'church' ? 12.5 : 10.5;
        ctx.font = `${n.type === 'church' ? '600 ' : ''}${fontSize}px 'Alegreya Sans', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(250, 246, 235, 0.95)';
        ctx.fillStyle = '#2c2418';
        const label = n.label || '';
        const ly = n.y + r + 2.5;
        ctx.strokeText(label, n.x, ly);
        ctx.fillText(label, n.x, ly);
      }
      ctx.globalAlpha = 1;
    });
  }, [map]);

  // Build the simulation. The overlay is keyed by the focused church, so it
  // mounts fresh for each church — this effect runs once per mount.
  useEffect(() => {
    if (!map || !graph || !graph.nodes || !graph.nodes.length) return undefined;

    const container = map.getContainer();
    const w = container.clientWidth;
    const h = container.clientHeight;

    const nodes = graph.nodes.map(n => ({ ...n }));
    const byId = new Map(nodes.map(n => [n.id, n]));

    nodes.forEach(n => {
      if (n.type === 'church' && n.lat != null && n.lng != null) {
        const p = map.project([n.lng, n.lat]);
        n.x = p.x; n.y = p.y;
        n.fx = p.x; n.fy = p.y;
      }
    });
    const focusChurch = nodes.find(n => n.type === 'church' && !n.isOtherChurch && n.fx != null)
      || nodes.find(n => n.type === 'church' && n.fx != null);
    nodes.forEach(n => {
      if (n.x == null) {
        const bx = focusChurch ? focusChurch.x : w / 2;
        const by = focusChurch ? focusChurch.y : h / 2;
        const a = Math.random() * Math.PI * 2;
        const d = 30 + Math.random() * 70;
        n.x = bx + Math.cos(a) * d;
        n.y = by + Math.sin(a) * d;
      }
    });

    const links = graph.links.map(l => ({ ...l }));

    const sim = forceSimulation(nodes)
      .force('link', forceLink(links).id(d => d.id)
        .distance(l => (l.kind === 'household-member' ? 30 : l.kind === 'household' ? 46 : 58))
        .strength(0.32))
      .force('charge', forceManyBody().strength(-120).distanceMax(260))
      .force('collide', forceCollide().radius(d => nodeRadius(d) + 7).strength(0.9))
      .alpha(1)
      .alphaDecay(0.028)
      .on('tick', draw);

    simRef.current = sim;
    nodesRef.current = nodes;
    linksRef.current = links;
    nodeByIdRef.current = byId;
    draw();

    return () => { sim.stop(); };
  }, [map, graph, draw]);

  // Keep church nodes pinned to geography as the map moves; drag the rest along.
  useEffect(() => {
    if (!map) return undefined;

    const syncToMap = () => {
      const nodes = nodesRef.current;
      if (nodes.length) {
        let dx = 0; let dy = 0;
        let haveDelta = false;
        nodes.forEach(n => {
          if (n.type === 'church' && n.lat != null && n.lng != null) {
            const p = map.project([n.lng, n.lat]);
            if (!n.isOtherChurch && !haveDelta && n.fx != null) {
              dx = p.x - n.fx; dy = p.y - n.fy; haveDelta = true;
            }
            n.fx = p.x; n.fy = p.y;
            n.x = p.x; n.y = p.y;
          }
        });
        if (haveDelta && (dx || dy)) {
          nodes.forEach(n => {
            if (!(n.type === 'church' && n.lat != null && n.lng != null)) {
              n.x += dx; n.y += dy;
            }
          });
        }
        const sim = simRef.current;
        if (sim) sim.alpha(Math.max(sim.alpha(), 0.18)).restart();
      }
      draw();
    };

    map.on('move', syncToMap);
    map.on('resize', syncToMap);
    return () => {
      map.off('move', syncToMap);
      map.off('resize', syncToMap);
    };
  }, [map, draw]);

  // Hover + click hit-testing, driven off the map's own canvas container.
  useEffect(() => {
    if (!map) return undefined;
    const el = map.getCanvasContainer();

    const pick = (ev) => {
      const rect = el.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      let best = null;
      let bestD = Infinity;
      nodesRef.current.forEach(n => {
        if (n.x == null) return;
        const reach = nodeRadius(n) + 5;
        const d = (n.x - x) ** 2 + (n.y - y) ** 2;
        if (d <= reach * reach && d < bestD) { best = n; bestD = d; }
      });
      return best;
    };

    const onMouseMove = (ev) => {
      if (ev.buttons) {
        if (hoverRef.current) { hoverRef.current = null; setTooltip(null); draw(); }
        return;
      }
      const node = pick(ev);
      const id = node ? node.id : null;
      el.style.cursor = node ? 'pointer' : '';
      if (id !== hoverRef.current) {
        hoverRef.current = id;
        setTooltip(node ? { label: node.label, sub: tooltipSub(node), x: node.x, y: node.y } : null);
        draw();
      }
    };

    const onMouseLeave = () => {
      if (hoverRef.current) { hoverRef.current = null; draw(); }
      setTooltip(null);
      el.style.cursor = '';
    };

    const onClick = (ev) => {
      const node = pick(ev);
      if (node) {
        ev.stopPropagation();
        onSelectRef.current?.(node);
      }
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('click', onClick, true);
    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('click', onClick, true);
      el.style.cursor = '';
    };
  }, [map, draw]);

  return (
    <div className="fcc-web-overlay">
      <canvas ref={canvasRef} className="fcc-web-canvas" />
      {tooltip && (
        <div
          className="fcc-web-tooltip"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <strong>{tooltip.label}</strong>
          {tooltip.sub && <span>{tooltip.sub}</span>}
        </div>
      )}
    </div>
  );
}
