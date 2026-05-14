import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/clerk-react';
import {
  fetchFirstCenturyChurchData,
  buildGlobalGraph,
  buildChurchGraph,
} from './data/firstCenturyChurchSupabaseAdapter.js';
import { ChurchMap } from './components/FirstCenturyChurch/ChurchMap.jsx';
import { ChurchGraph } from './components/FirstCenturyChurch/ChurchGraph.jsx';
import { NodeDetailCard } from './components/FirstCenturyChurch/NodeDetailCard.jsx';
import { JourneyOverlayControl } from './components/FirstCenturyChurch/JourneyOverlayControl.jsx';
import { ChurchSearch } from './components/FirstCenturyChurch/ChurchSearch.jsx';
import { checkUserRole, ensureUserExists } from './services/adminService.js';
import { IssueCreatorButton } from './components/IssueCreator/IssueCreatorButton.jsx';
import './FirstCenturyChurchApp.css';

const hasClerk = !!(window.CLERK_PUBLISHABLE_KEY || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

function FirstCenturyChurchApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChurchId, setSelectedChurchId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null); // { type, id } | null
  const [activeJourney, setActiveJourney] = useState(null); // journey_id | null
  const [showGlobalGraph, setShowGlobalGraph] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isContributor, setIsContributor] = useState(false);
  const mapRef = useRef(null);

  // Auth state (only used when Clerk is configured)
  const auth = hasClerk ? useAuth() : {}; // eslint-disable-line react-hooks/rules-of-hooks
  const userHook = hasClerk ? useUser() : {}; // eslint-disable-line react-hooks/rules-of-hooks
  const { getToken, isSignedIn, userId } = auth;
  const clerkUser = userHook.user;
  const clerkUserLoaded = clerkUser && clerkUser.id;

  // Auto-register the user on sign-in, then check their role
  useEffect(() => {
    if (!hasClerk || !isSignedIn || !userId || !clerkUserLoaded) {
      if (!isSignedIn) { setIsAdmin(false); setIsContributor(false); }
      return;
    }
    let cancelled = false;
    const getTokenForSupabase = () => getToken({ template: 'supabase' });
    const email = clerkUser?.primaryEmailAddress?.emailAddress;
    const displayName = clerkUser?.fullName || clerkUser?.firstName || null;

    ensureUserExists(getTokenForSupabase, userId, email, displayName)
      .then(() => checkUserRole(getTokenForSupabase, userId))
      .then(result => {
        if (!cancelled) { setIsAdmin(result.isAdmin); setIsContributor(result.isContributor); }
      });
    return () => { cancelled = true; };
  }, [isSignedIn, userId, getToken, clerkUserLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFirstCenturyChurchData();
        if (!cancelled) { setData(result); setLoading(false); }
      } catch (err) {
        if (!cancelled) { setError(err.message); setLoading(false); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Selection ───────────────────────────────────────────────────────────

  // Focus a church: anchor its connection web on the map, frame the church
  // together with the other churches its travelers bridge to, and open its
  // detail card.
  const handleSelectChurch = useCallback((churchId) => {
    if (!data) return;
    const church = data.churchMap.get(churchId);
    if (!church) return;
    setShowGlobalGraph(false);
    setSelectedChurchId(churchId);
    setSelectedNode({ type: 'church', id: churchId });

    const graph = buildChurchGraph(data, churchId);
    const others = (graph.otherChurchIds || [])
      .map(id => data.churchMap.get(id))
      .filter(c => c && c.lat != null && c.lng != null);
    if (others.length && church.lat != null && church.lng != null) {
      const lngs = [church.lng, ...others.map(c => c.lng)];
      const lats = [church.lat, ...others.map(c => c.lat)];
      mapRef.current?.fitBounds?.([
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ]);
    } else if (church.lat != null && church.lng != null) {
      mapRef.current?.flyTo?.(church.lng, church.lat);
    }
  }, [data]);

  // A node clicked in the on-map web: churches re-focus the web, people and
  // households open the detail card.
  const handleSelectNode = useCallback((node) => {
    if (node.type === 'church') handleSelectChurch(node.entityId);
    else setSelectedNode({ type: node.type, id: node.entityId });
  }, [handleSelectChurch]);

  // Navigation from inside the detail card (by type + entity id).
  const handleCardNavigate = useCallback((type, id) => {
    if (type === 'church') handleSelectChurch(id);
    else setSelectedNode({ type, id });
  }, [handleSelectChurch]);

  // Clicking empty land/sea on the map clears the focused web + card.
  const handleBackgroundClick = useCallback(() => {
    setSelectedChurchId(null);
    setSelectedNode(null);
  }, []);

  // Header search: churches focus the on-map web; people focus their primary
  // church's web and open their own card.
  const handleSearchSelect = useCallback((type, id) => {
    if (type === 'church') {
      handleSelectChurch(id);
    } else if (type === 'person') {
      const memberships = data?.personMembershipsMap.get(id) || [];
      const primary = memberships.find(m => m.is_primary) || memberships[0];
      if (primary) handleSelectChurch(primary.church_id);
      setSelectedNode({ type: 'person', id });
    }
  }, [data, handleSelectChurch]);

  // ── Journey overlay ─────────────────────────────────────────────────────

  const handleJourneySelect = useCallback((journeyId) => {
    setActiveJourney(prev => {
      const next = prev === journeyId ? null : journeyId;
      if (next && data) {
        const stops = (data.journeyStopsMap.get(next) || []).filter(s => s.lat != null && s.lng != null);
        if (stops.length > 1) {
          const lngs = stops.map(s => s.lng);
          const lats = stops.map(s => s.lat);
          mapRef.current?.fitBounds?.([
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ]);
        }
      }
      return next;
    });
  }, [data]);

  // ── Reset ───────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setActiveJourney(null);
    setSelectedChurchId(null);
    setSelectedNode(null);
    setShowGlobalGraph(false);
    mapRef.current?.reset?.();
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────

  const activeJourneyObj = useMemo(
    () => (activeJourney && data ? data.journeyMap.get(activeJourney) : null),
    [activeJourney, data],
  );
  const activeJourneyStops = useMemo(
    () => (activeJourney && data ? data.journeyStopsMap.get(activeJourney) || [] : []),
    [activeJourney, data],
  );
  const globalGraphData = useMemo(
    () => (showGlobalGraph && data ? buildGlobalGraph(data) : { nodes: [], links: [] }),
    [showGlobalGraph, data],
  );
  const focusedGraph = useMemo(
    () => (selectedChurchId && data ? buildChurchGraph(data, selectedChurchId) : null),
    [selectedChurchId, data],
  );

  const showReset = !!(activeJourney || selectedChurchId || selectedNode);

  const getPageContext = useCallback(() => ({
    app: 'first-century-church',
    url: window.location.pathname,
    activeFilters: { journey: activeJourney },
    selectedEntity: selectedNode
      || (selectedChurchId ? { type: 'church', id: selectedChurchId } : null),
  }), [activeJourney, selectedNode, selectedChurchId]);

  const handleGlobalGraphNode = useCallback((node) => {
    setShowGlobalGraph(false);
    handleSelectNode(node);
  }, [handleSelectNode]);

  return (
    <div className="fcc-app">
      <header className="fcc-header">
        {data && (
          <div className="fcc-header-search">
            <ChurchSearch data={data} onSelect={handleSearchSelect} />
          </div>
        )}
        {hasClerk && (
          <div className="fcc-header-auth">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="fcc-auth-btn" title="Sign in to report issues">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="fcc-auth-btn" title="Create an account">Sign Up</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <IssueCreatorButton
                isContributor={isContributor}
                isAdmin={isAdmin}
                getToken={() => getToken({ template: 'supabase' })}
                clerkUserId={userId}
                appId="first-century-church"
                getPageContext={getPageContext}
              />
              <UserButton />
            </SignedIn>
          </div>
        )}
      </header>

      {loading && <div className="fcc-loading">Loading the first-century church…</div>}
      {error && <div className="fcc-error">Error: {error}</div>}

      {!loading && !error && data && (
        <>
          <ChurchMap
            ref={mapRef}
            churches={data.churches}
            churchPersonCount={data.churchPersonCount}
            selectedChurchId={selectedChurchId}
            onSelectChurch={handleSelectChurch}
            onBackgroundClick={handleBackgroundClick}
            focusedGraph={focusedGraph}
            onSelectNode={handleSelectNode}
            journeyStops={activeJourneyStops}
            journeyColor={activeJourneyObj?.color}
          />

          <JourneyOverlayControl
            journeys={data.journeys}
            activeJourney={activeJourney}
            onJourneySelect={handleJourneySelect}
            onShowGlobalGraph={() => setShowGlobalGraph(true)}
            showReset={showReset}
            onReset={handleReset}
          />

          {activeJourneyObj && (
            <div className="fcc-journey-info" style={{ '--journey-color': activeJourneyObj.color || '#b05ca0' }}>
              <h3>{activeJourneyObj.name}</h3>
              {activeJourneyObj.description && <p>{activeJourneyObj.description}</p>}
              <ol className="fcc-journey-stop-list">
                {activeJourneyStops.map(s => (
                  <li key={s.id}>
                    {s.church_id ? (
                      <button className="fcc-link-btn" onClick={() => handleSelectChurch(s.church_id)}>
                        {s.displayName}
                      </button>
                    ) : (
                      <span>{s.displayName}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {selectedNode && (
            <NodeDetailCard
              data={data}
              node={selectedNode}
              onNavigate={handleCardNavigate}
              onClose={() => setSelectedNode(null)}
            />
          )}

          {showGlobalGraph && (
            <div className="fcc-global-overlay">
              <div className="fcc-global-header">
                <div>
                  <h2>The whole web</h2>
                  <p>
                    {data.people.length} people across {data.churches.length} churches —
                    orange dots traveled between communities. Click any dot to explore.
                  </p>
                </div>
                <button className="fcc-panel-close" onClick={() => setShowGlobalGraph(false)} aria-label="Close">×</button>
              </div>
              <div className="fcc-global-graph">
                <ChurchGraph
                  graphData={globalGraphData}
                  onSelectNode={handleGlobalGraphNode}
                  mode="global"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FirstCenturyChurchApp;
