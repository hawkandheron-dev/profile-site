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
} from './data/firstCenturyChurchSupabaseAdapter.js';
import { ChurchMap } from './components/FirstCenturyChurch/ChurchMap.jsx';
import { ChurchGraph } from './components/FirstCenturyChurch/ChurchGraph.jsx';
import { ChurchPanel } from './components/FirstCenturyChurch/ChurchPanel.jsx';
import { PersonPanel } from './components/FirstCenturyChurch/PersonPanel.jsx';
import { HouseholdPanel } from './components/FirstCenturyChurch/HouseholdPanel.jsx';
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
  const [modalStack, setModalStack] = useState([]); // [{ type, id }]
  const [selectedChurchId, setSelectedChurchId] = useState(null);
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

  // ── Modal stack ─────────────────────────────────────────────────────────

  const pushModal = useCallback((type, id) => {
    setModalStack(prev => {
      const top = prev[prev.length - 1];
      if (top && top.type === type && top.id === id) return prev;
      return [...prev, { type, id }];
    });
  }, []);
  const popModal = useCallback(() => setModalStack(prev => prev.slice(0, -1)), []);
  const closeAllModals = useCallback(() => setModalStack([]), []);
  const currentModal = modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;

  // ── Entity selection ────────────────────────────────────────────────────

  const handleSelectEntity = useCallback((type, id) => {
    setShowGlobalGraph(false);
    pushModal(type, id);
    if (type === 'church' && data) {
      setSelectedChurchId(id);
      const church = data.churchMap.get(id);
      if (church && mapRef.current?.flyTo) mapRef.current.flyTo(church.lng, church.lat);
    }
  }, [pushModal, data]);

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
    setShowGlobalGraph(false);
    closeAllModals();
    mapRef.current?.reset?.();
  }, [closeAllModals]);

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

  const showReset = !!(activeJourney || modalStack.length > 0 || selectedChurchId);

  const getPageContext = useCallback(() => ({
    app: 'first-century-church',
    url: window.location.pathname,
    activeFilters: { journey: activeJourney },
    selectedEntity: currentModal ? { type: currentModal.type, id: currentModal.id } : null,
    modalStack: modalStack.length > 0 ? modalStack : null,
  }), [activeJourney, currentModal, modalStack]);

  const handleGlobalGraphNode = useCallback((node) => {
    handleSelectEntity(node.type, node.entityId);
  }, [handleSelectEntity]);

  return (
    <div className="fcc-app">
      <header className="fcc-header">
        {data && (
          <div className="fcc-header-search">
            <ChurchSearch data={data} onSelect={handleSelectEntity} />
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
            onSelectChurch={(id) => handleSelectEntity('church', id)}
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
                      <button className="fcc-link-btn" onClick={() => handleSelectEntity('church', s.church_id)}>
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

          {currentModal && (
            <div className="fcc-side-panel">
              {currentModal.type === 'church' && (
                <ChurchPanel
                  data={data}
                  churchId={currentModal.id}
                  onSelectEntity={handleSelectEntity}
                  onClose={closeAllModals}
                />
              )}
              {currentModal.type === 'person' && (
                <PersonPanel
                  data={data}
                  personId={currentModal.id}
                  onSelectEntity={handleSelectEntity}
                  onClose={closeAllModals}
                  canGoBack={modalStack.length > 1}
                  onBack={popModal}
                />
              )}
              {currentModal.type === 'household' && (
                <HouseholdPanel
                  data={data}
                  householdId={currentModal.id}
                  onSelectEntity={handleSelectEntity}
                  onClose={closeAllModals}
                  canGoBack={modalStack.length > 1}
                  onBack={popModal}
                />
              )}
            </div>
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
