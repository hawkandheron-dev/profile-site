import { useEffect, useRef, useCallback, useState } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCollide } from 'd3-force';
import { iconKeyFor, drawNodeIcon } from './personIcons.js';
import './ChurchWebOverlay.css';

// Bubble radius. Non-church nodes are drawn larger than their force-layout
// `val` so their iconography (profile / house / foot) reads at a glance.
function nodeRadius(n) {
  if (n.type === 'church') return Math.max(3, n.val || 4);
  if (n.type === 'household') return 11;
  if (n.type === 'person') return n.isTraveler || n.isVisitor ? 12 : 11;
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
  if (node.type === 'household') return 'Household';
  if (node.isTraveler) {
    return `Connects ${node.churchCount} ${node.churchCount === 1 ? 'community' : 'communities'}`;
  }
  return node.role ? node.role.replace(/-/g, ' ') : null;
}

// Stable 0..1 hash from a string — used to give each person a deterministic
// per-render distance multiplier so the orbit reads as a cloud, not a ring.
function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

// Member-ring radius (px) at map zoom level REF_ZOOM. Other orbits derive from
// this. The exponent controls how quickly orbits grow with the map's zoom —
// a value < 1 means orbits expand more gently than the map.
const BASE_MEMBER_ORBIT = 56;
const ORBIT_ZOOM_EXP = 0.65;
const REF_ZOOM = 5;
// 'Network' mode: each person links to its K closest peers — computed live
// from current simulation positions. Keeps the mesh expressive (you can see
// who's near whom) without the visual noise of a full N² mesh.
const NETWORK_K = 4;

/**
 * Geo-anchored connection web drawn on a transparent canvas over the map.
 *
 * Church nodes are pinned to their real map coordinates every frame; person
 * and household nodes are positioned by a d3-force simulation in screen-pixel
 * space. The orbit ring sizes scale (more gently than the map) with the map
 * zoom so the cloud expands when you zoom in and stays visible when you zoom
 * out, clamped to a fraction of the viewport.
 *
 * The canvas is pointer-events:none — hover and click hit-testing happens on
 * the map's canvas container, so the map keeps its native interactions and
 * empty-space clicks still reach it.
 */
export function ChurchWebOverlay({
  map, graph, onSelectNode, selectedId, webStyle = 'spokes',
}) {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  // Node ids of the focused church's peers (people + households tied to it).
  // Used in 'web' mode to draw a K-nearest-neighbour mesh; the K=4 lookup
  // runs each frame from live positions, so the mesh tracks the cloud.
  // The simulation never sees these edges — the orbit layout stays identical
  // across line-style modes.
  const peerNodeIdsRef = useRef([]);
  const nodeByIdRef = useRef(new Map());
  const focusChurchRef = useRef(null);
  const radiiRef = useRef({
    member: BASE_MEMBER_ORBIT,
    visitor: BASE_MEMBER_ORBIT * 1.7,
    household: BASE_MEMBER_ORBIT * 0.55,
    householdMember: BASE_MEMBER_ORBIT * 0.32,
    bridge: BASE_MEMBER_ORBIT * 1.2,
  });
  const hoverRef = useRef(null);
  const selectedRef = useRef(selectedId);
  const webStyleRef = useRef(webStyle);
  const onSelectRef = useRef(onSelectNode);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => { onSelectRef.current = onSelectNode; }, [onSelectNode]);

  // Compute orbit radii for the current map zoom + viewport. Clamped so the
  // cloud is never collapsed (min member ring 35px) and never larger than
  // ~36% of the smaller viewport dimension — keeps the orbit a tight halo
  // around the city rather than a full-viewport bloom.
  const computeRadii = useCallback(() => {
    if (!map) return;
    const container = map.getContainer();
    const w = container.clientWidth;
    const h = container.clientHeight;
    const cap = Math.min(w, h) * 0.36;
    const mult = Math.pow(2, (map.getZoom() - REF_ZOOM) * ORBIT_ZOOM_EXP);
    const member = Math.max(35, Math.min(cap / 1.4, BASE_MEMBER_ORBIT * mult));
    radiiRef.current = {
      member,
      visitor: Math.min(cap, member * 1.4),
      household: member * 0.5,
      householdMember: member * 0.3,
      bridge: member * 1.2,
    };
  }, [map]);

  // Hoisted so the map-sync effect can re-apply it on zoom — d3-force caches
  // distances at `.distance()` call time, so just mutating radiiRef isn't
  // enough to make the orbits expand. Re-applying this function pushes the
  // current radii into the cached array.
  //
  // Per-person stable jitter scatters member/visitor dots across a wide band
  // so the cluster looks like an organic cloud instead of a perfect ring.
  const linkDistance = useCallback((l) => {
    const r = radiiRef.current;
    const srcId = typeof l.source === 'object' ? l.source.id : l.source;
    const jitter = 0.7 + hashStr(srcId) * 0.7; // 0.7 .. 1.4
    switch (l.kind) {
      case 'household-member': return r.householdMember;
      case 'household': return r.household;
      case 'bridge': return r.bridge;
      case 'visitor': return r.visitor * jitter;
      default: return r.member * jitter; // member
    }
  }, []);

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

    const style = webStyleRef.current;

    // Click-pinned highlight stays on; hover takes precedence when active.
    const hoverId = hoverRef.current;
    const selId = selectedRef.current;
    const activeId = hoverId || selId;
    // For neighbour-set computation we always use the spoke graph — peer
    // links in 'web' mode are a visual layer, not a navigation one.
    const neighborIds = activeId ? neighborSet(links, activeId) : null;
    const focus = focusChurchRef.current;

    // Person↔person mesh (only in 'web' mode). Each peer gets a line to its
    // K nearest peers, computed from current positions; the edge set is
    // de-duped so a mutual pair only draws once. Drawn under structural
    // links so bridges and active spokes always read on top.
    if (style === 'web') {
      const peers = peerNodeIdsRef.current
        .map(id => nodeByIdRef.current.get(id))
        .filter(n => n && n.x != null);
      const drawn = new Set();
      ctx.strokeStyle = 'rgba(107, 91, 69, 0.28)';
      ctx.lineWidth = 0.9;
      peers.forEach(a => {
        const nearest = peers
          .filter(b => b !== a)
          .map(b => ({ b, d2: (b.x - a.x) ** 2 + (b.y - a.y) ** 2 }))
          .sort((x, y) => x.d2 - y.d2)
          .slice(0, NETWORK_K);
        nearest.forEach(({ b }) => {
          const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
          if (drawn.has(key)) return;
          drawn.add(key);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });
      });
    }

    links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source : nodeByIdRef.current.get(l.source);
      const t = typeof l.target === 'object' ? l.target : nodeByIdRef.current.get(l.target);
      if (!s || !t || s.x == null || t.x == null) return;
      const isBridge = l.kind === 'bridge';
      const on = neighborIds ? (neighborIds.has(s.id) && neighborIds.has(t.id)) : null;

      // Structural spokes (member/visitor/household/household-member) hide
      // entirely in 'hidden' and 'web' modes — unless this spoke belongs to
      // the active (hover/selected) node, in which case it lights up so the
      // user can still trace what's connected to what.
      if (!isBridge && style !== 'spokes' && !on) return;

      if (isBridge) {
        // Bridge connections only render when the active (hovered/selected)
        // node is involved. The default view stays clean — the dots are the
        // headline, and the connections only surface as you investigate.
        if (!on) return;

        const head = 0.8;

        let ctrlX;
        let ctrlY;
        if (focus) {
          // Control point sits at the angular midpoint between person and
          // target (short way around the focused church), well outside the
          // outer ring. Same-side targets read as spoke-then-bend; opposite-
          // side targets sweep wide around the cluster instead of cutting
          // through it.
          const angP = Math.atan2(s.y - focus.y, s.x - focus.x);
          const angT = Math.atan2(t.y - focus.y, t.x - focus.x);
          let dAng = angT - angP;
          while (dAng > Math.PI) dAng -= 2 * Math.PI;
          while (dAng < -Math.PI) dAng += 2 * Math.PI;
          const angMid = angP + dAng / 2;
          const ctrlDist = radiiRef.current.visitor * 2.2;
          ctrlX = focus.x + Math.cos(angMid) * ctrlDist;
          ctrlY = focus.y + Math.sin(angMid) * ctrlDist;
        } else {
          ctrlX = (s.x + t.x) / 2;
          ctrlY = (s.y + t.y) / 2;
        }

        // Gradient runs along the curve's start tangent (from s toward the
        // control point) for a fixed screen distance — keeps the visible
        // portion anchored to the actual direction the curve leaves in.
        const gdx = ctrlX - s.x;
        const gdy = ctrlY - s.y;
        const gLen = Math.hypot(gdx, gdy) || 1;
        const ux = gdx / gLen;
        const uy = gdy / gLen;
        const fadeLen = 1100;
        const grad = ctx.createLinearGradient(
          s.x, s.y,
          s.x + ux * fadeLen, s.y + uy * fadeLen,
        );
        grad.addColorStop(0, `rgba(217, 140, 43, ${head})`);
        grad.addColorStop(1, 'rgba(217, 140, 43, 0)');

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        if (focus) {
          ctx.quadraticCurveTo(ctrlX, ctrlY, t.x, t.y);
        } else {
          ctx.lineTo(t.x, t.y);
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        return;
      }

      // Structural links (member / visitor / household / household-member).
      // The active node's own spoke highlights amber; everything else holds
      // its default tone — no dim-out of other people / households.
      let color = 'rgba(107, 91, 69, 0.4)';
      let width = 1.1;
      if (on) {
        color = 'rgba(217, 140, 43, 0.85)';
        width = 2;
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
      const r = nodeRadius(n);
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = n.color || '#6b8caf';
      ctx.fill();
      if (n.type === 'church') {
        ctx.lineWidth = n.isOtherChurch ? 1.5 : 3;
        ctx.strokeStyle = n.isOtherChurch ? '#faf6eb' : '#2c2418';
      } else {
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = '#faf6eb';
      }
      ctx.stroke();

      // Iconography (person/household/traveler). Church nodes remain plain
      // coloured discs so they read as places, not people.
      const iconKey = iconKeyFor(n);
      if (iconKey) {
        ctx.fillStyle = '#faf6eb';
        drawNodeIcon(ctx, iconKey, n.x, n.y, r);
      }

      // Labels: always visible in the focused web — but the hovered node's
      // name is taken over by the floating tooltip, so suppress it here.
      const isHovered = n.id === hoverId;
      if (!isHovered) {
        const fontSize = n.type === 'church' ? 12.5 : 9.5;
        ctx.font = `${n.type === 'church' ? '600 ' : ''}${fontSize}px 'Alegreya Sans', system-ui, sans-serif`;
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(250, 246, 235, 0.95)';
        ctx.fillStyle = '#2c2418';
        let lx;
        let ly;
        if (focus && n.id !== focus.id) {
          // Place the label outward from the focused church.
          const rx = n.x - focus.x;
          const ry = n.y - focus.y;
          const rLen = Math.hypot(rx, ry) || 1;
          const ux = rx / rLen;
          const uy = ry / rLen;
          lx = n.x + ux * (r + 4);
          ly = n.y + uy * (r + 4);
          ctx.textAlign = ux > 0.35 ? 'left' : ux < -0.35 ? 'right' : 'center';
          ctx.textBaseline = uy > 0.35 ? 'top' : uy < -0.35 ? 'bottom' : 'middle';
        } else {
          lx = n.x;
          ly = n.y + r + 2.5;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
        }
        const label = n.label || '';
        ctx.strokeText(label, lx, ly);
        ctx.fillText(label, lx, ly);
      }
    });
  }, [map]);

  // Persistent click-highlight: track the App's selectedId and redraw.
  useEffect(() => {
    selectedRef.current = selectedId;
    draw();
  }, [selectedId, draw]);

  // Webstyle changes (spokes / web / hidden) are pure render — no relayout.
  useEffect(() => {
    webStyleRef.current = webStyle;
    draw();
  }, [webStyle, draw]);

  // Build / rebuild the simulation when the focused graph changes.
  useEffect(() => {
    if (!map || !graph || !graph.nodes || !graph.nodes.length) return undefined;

    computeRadii();

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
    focusChurchRef.current = focusChurch || null;

    const seedRing = radiiRef.current.member;
    nodes.forEach(n => {
      if (n.x == null) {
        const bx = focusChurch ? focusChurch.x : w / 2;
        const by = focusChurch ? focusChurch.y : h / 2;
        const a = Math.random() * Math.PI * 2;
        const d = seedRing * 0.5 + Math.random() * seedRing * 0.6;
        n.x = bx + Math.cos(a) * d;
        n.y = by + Math.sin(a) * d;
      }
    });

    const links = graph.links.map(l => ({ ...l }));

    const linkStrength = (l) => {
      switch (l.kind) {
        case 'bridge': return 0;
        case 'household-member': return 0.6;
        case 'household': return 0.35;
        case 'visitor': return 0.3;
        default: return 0.5;
      }
    };

    const sim = forceSimulation(nodes)
      .force('link', forceLink(links).id(d => d.id)
        .distance(linkDistance)
        .strength(linkStrength))
      .force('charge', forceManyBody().strength(-110).distanceMax(260))
      .force('collide', forceCollide().radius(d => nodeRadius(d) + 7).strength(0.9))
      .alpha(1)
      .alphaDecay(0.028)
      .on('tick', draw);

    // Identify the focused church's peers: every person/household tied to it
    // via a structural spoke. The mesh-edge selection happens later in draw(),
    // from live positions, so each frame can target the K nearest neighbours.
    const focusChurchId = focusChurch?.id;
    const peerIds = [];
    if (focusChurchId) {
      const peerSet = new Set();
      links.forEach(l => {
        if (l.kind !== 'member' && l.kind !== 'visitor' && l.kind !== 'household') return;
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        if (s === focusChurchId) peerSet.add(t);
        else if (t === focusChurchId) peerSet.add(s);
      });
      peerSet.forEach(id => {
        const n = byId.get(id);
        if (n && (n.type === 'person' || n.type === 'household')) peerIds.push(id);
      });
    }

    simRef.current = sim;
    nodesRef.current = nodes;
    linksRef.current = links;
    peerNodeIdsRef.current = peerIds;
    nodeByIdRef.current = byId;
    draw();

    return () => { sim.stop(); };
  }, [map, graph, draw, computeRadii, linkDistance]);

  // Map sync: re-pin churches, rescale orbits for the current zoom, redraw.
  useEffect(() => {
    if (!map) return undefined;

    const syncToMap = () => {
      computeRadii();
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
        if (sim) {
          // Re-push the (zoom-scaled) target distances into the link force's
          // cached array — d3-force only re-reads them when .distance() is
          // called, not when the closure's source data changes.
          sim.force('link').distance(linkDistance);
          sim.alpha(Math.max(sim.alpha(), 0.3)).restart();
        }
      }
      draw();
    };

    map.on('move', syncToMap);
    map.on('resize', syncToMap);
    return () => {
      map.off('move', syncToMap);
      map.off('resize', syncToMap);
    };
  }, [map, draw, computeRadii, linkDistance]);

  // Hover + click hit-testing.
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
