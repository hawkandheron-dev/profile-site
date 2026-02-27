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
import { Timeline } from './components/Timeline/Timeline.jsx';
import { TimelineSearch } from './components/Timeline/components/TimelineSearch.jsx';
import { fetchChurchHistoryData } from './data/churchHistorySupabaseAdapter.js';
import { churchHistoryConfig } from './data/churchHistoryData.js';
import { AddNoteModal } from './components/Notes/AddNoteModal.jsx';
import { ViewMyNotesModal } from './components/Notes/ViewMyNotesModal.jsx';
import { checkUserRole, ensureUserExists } from './services/adminService.js';
import { AdminSuggestionsPage } from './components/Suggestions/AdminSuggestionsPage.jsx';
import { SuggestNewModal } from './components/Suggestions/SuggestNewModal.jsx';
import { IssueCreatorButton } from './components/IssueCreator/IssueCreatorButton.jsx';
import { Icon } from './components/Timeline/components/Icon.jsx';
import './App.css';

const BIRD_LOGO = new URL('../../../resources/logos/Windhover_BLK.png', import.meta.url).href;

const hasClerk = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function NavDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button className="btn btn-icon nav-dropdown-toggle" onClick={() => setOpen(!open)} title="Navigation">
        <Icon name="menu" size={18} />
      </button>
      {open && (
        <div className="nav-dropdown-menu">
          <a href="../../index.html" className="nav-dropdown-item" onClick={() => setOpen(false)}>Home</a>
          <a href="./church-history.html" className="nav-dropdown-item" onClick={() => setOpen(false)}>JSON Version</a>
          <a href="../../church-history-supabase.html" className="nav-dropdown-item" onClick={() => setOpen(false)}>Data Browser</a>
        </div>
      )}
    </div>
  );
}

/**
 * Auth header rendered only when Clerk is configured.
 * Isolated so the useAuth hook is always called inside ClerkProvider.
 */
function ClerkAuthHeader({ onAddNote, onViewNotes, isAdmin, isContributor, onReviewSuggestions, onSuggestNew, getToken, clerkUserId, getPageContext }) {
  const { isSignedIn } = useAuth();

  return (
    <div className="auth-actions">
      {isSignedIn && (
        <>
          <button type="button" className="btn" onClick={onAddNote}>
            + Add Note
          </button>
          <button type="button" className="btn" onClick={onViewNotes}>
            View My Notes
          </button>
          {isContributor && (
            <button type="button" className="btn btn-action" onClick={onSuggestNew}>
              + Suggest New Entry
            </button>
          )}
          <IssueCreatorButton
            isContributor={isContributor}
            isAdmin={isAdmin}
            getToken={getToken}
            clerkUserId={clerkUserId}
            appId="ch-timeline"
            getPageContext={getPageContext}
          />
          {isAdmin && (
            <button type="button" className="btn btn-warning" onClick={onReviewSuggestions}>
              Review Suggestions
            </button>
          )}
        </>
      )}
      <SignedOut>
        <SignInButton mode="modal">
          <button className="btn" title="Sign in to save notes, add entries, or make suggestions">Sign In</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="btn" title="Sign in to save notes, add entries, or make suggestions">Sign Up</button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}

/**
 * Inner app that calls useAuth — only rendered when ClerkProvider wraps us.
 */
function AuthenticatedApp({ timelineData, loading, error, allPeople, onReloadData }) {
  const { getToken, isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [viewNotesOpen, setViewNotesOpen] = useState(false);
  const [suggestNewOpen, setSuggestNewOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isContributor, setIsContributor] = useState(false);
  const [view, setView] = useState('timeline'); // 'timeline' | 'suggestions'
  const timelineRef = useRef(null);

  // Auto-register user on sign-in, then check their role.
  // Wait for clerkUser to be loaded so we capture display name & email.
  const clerkUserLoaded = clerkUser && clerkUser.id;

  useEffect(() => {
    if (!isSignedIn || !userId || !clerkUserLoaded) {
      if (!isSignedIn) {
        setIsAdmin(false);
        setIsContributor(false);
      }
      return;
    }

    let cancelled = false;
    const getTokenForSupabase = () => getToken({ template: 'supabase' });

    const email = clerkUser?.primaryEmailAddress?.emailAddress;
    const displayName = clerkUser?.fullName || clerkUser?.firstName || null;

    // Ensure the user has a row in the users table (creates as 'viewer' if new)
    ensureUserExists(getTokenForSupabase, userId, email, displayName)
      .then(() => checkUserRole(getTokenForSupabase, userId))
      .then(result => {
        if (!cancelled) {
          setIsAdmin(result.isAdmin);
          setIsContributor(result.isContributor);
        }
      });

    return () => { cancelled = true; };
  }, [isSignedIn, userId, getToken, clerkUserLoaded]);

  const handleAddNoteClose = useCallback(() => {
    setAddNoteOpen(false);
  }, []);

  const authContext = isSignedIn
    ? { getToken, clerkUserId: userId, isSignedIn: true }
    : null;

  const adminContext = isAdmin
    ? { isAdmin: true, getToken: () => getToken({ template: 'supabase' }) }
    : null;

  const contributorContext = isContributor
    ? { isContributor: true, getToken: () => getToken({ template: 'supabase' }), clerkUserId: userId }
    : null;

  // Rich context capture for the issue creator
  const getPageContext = useCallback(() => ({
    app: 'ch-timeline',
    url: window.location.pathname,
    view,
  }), [view]);

  const getTokenForSupabase = useCallback(() => getToken({ template: 'supabase' }), [getToken]);

  const handleEntityUpdated = useCallback(() => {
    onReloadData?.();
  }, [onReloadData]);

  const handleSearchSelect = useCallback((type, item) => {
    timelineRef.current?.selectItem(type, item);
  }, []);

  const handleSearchHighlight = useCallback((matches, currentIdx, query) => {
    timelineRef.current?.highlight(matches, currentIdx, query);
  }, []);

  const handleSearchClearHighlight = useCallback(() => {
    timelineRef.current?.clearHighlight();
  }, []);

  // When viewing the suggestions page
  if (view === 'suggestions' && isAdmin) {
    return (
      <>
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="site-title"><strong>History of the Christian Church</strong> <span>Lifespans</span></h1>
            </div>
            <div className="header-right">
              <ClerkAuthHeader
                onAddNote={() => setAddNoteOpen(true)}
                onViewNotes={() => setViewNotesOpen(true)}
                isAdmin={isAdmin}
                isContributor={isContributor}
                onReviewSuggestions={() => setView('suggestions')}
                onSuggestNew={() => setSuggestNewOpen(true)}
                getToken={getTokenForSupabase}
                clerkUserId={userId}
                getPageContext={getPageContext}
              />
            </div>
          </div>
        </header>
        <div className="tab-content" style={{ overflow: 'auto' }}>
          <AdminSuggestionsPage
            getToken={() => getToken({ template: 'supabase' })}
            clerkUserId={userId}
            onBack={() => setView('timeline')}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            {timelineData && (
              <TimelineSearch
                data={timelineData}
                onSelectItem={handleSearchSelect}
                onHighlight={handleSearchHighlight}
                onClearHighlight={handleSearchClearHighlight}
                homeLink={
                  <a href="../../index.html" className="header-bird-link" title="Back to Windhover">
                    <img src={BIRD_LOGO} alt="Windhover" className="header-bird-logo" />
                  </a>
                }
              />
            )}
          </div>
          <div className="header-right">
            <ClerkAuthHeader
              onAddNote={() => setAddNoteOpen(true)}
              onViewNotes={() => setViewNotesOpen(true)}
              isAdmin={isAdmin}
              isContributor={isContributor}
              onReviewSuggestions={() => setView('suggestions')}
              onSuggestNew={() => setSuggestNewOpen(true)}
              getToken={getTokenForSupabase}
              clerkUserId={userId}
              getPageContext={getPageContext}
            />
            <NavDropdown />
          </div>
        </div>
      </header>

      <div className="tab-content">
        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
            Loading data from Supabase...
          </div>
        )}
        {error && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>
            Error: {error}
          </div>
        )}
        {!loading && !error && timelineData && (
          <div className="timeline-wrapper">
            <Timeline
              ref={timelineRef}
              data={timelineData}
              config={churchHistoryConfig}
              showBackgroundImage
              authContext={authContext}
              allPeople={allPeople}
              adminContext={adminContext}
              contributorContext={contributorContext}
              onEntityUpdated={handleEntityUpdated}
              onDataChanged={handleEntityUpdated}
            />
          </div>
        )}
      </div>

      {addNoteOpen && (
        <AddNoteModal
          isOpen
          onClose={handleAddNoteClose}
          people={allPeople}
          getToken={getToken}
          clerkUserId={userId}
        />
      )}

      {viewNotesOpen && (
        <ViewMyNotesModal
          isOpen
          onClose={() => setViewNotesOpen(false)}
          people={allPeople}
          getToken={getToken}
          clerkUserId={userId}
        />
      )}

      {suggestNewOpen && (
        <SuggestNewModal
          isOpen
          onClose={() => setSuggestNewOpen(false)}
          getToken={() => getToken({ template: 'supabase' })}
          clerkUserId={userId}
        />
      )}
    </>
  );
}

/**
 * Unauthenticated fallback (no Clerk key configured).
 */
function UnauthenticatedApp({ timelineData, loading, error }) {
  const timelineRef = useRef(null);

  const handleSearchSelect = useCallback((type, item) => {
    timelineRef.current?.selectItem(type, item);
  }, []);

  const handleSearchHighlight = useCallback((matches, currentIdx, query) => {
    timelineRef.current?.highlight(matches, currentIdx, query);
  }, []);

  const handleSearchClearHighlight = useCallback(() => {
    timelineRef.current?.clearHighlight();
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            {timelineData && (
              <TimelineSearch
                data={timelineData}
                onSelectItem={handleSearchSelect}
                onHighlight={handleSearchHighlight}
                onClearHighlight={handleSearchClearHighlight}
                homeLink={
                  <a href="../../index.html" className="header-bird-link" title="Back to Windhover">
                    <img src={BIRD_LOGO} alt="Windhover" className="header-bird-logo" />
                  </a>
                }
              />
            )}
          </div>
          <div className="header-right">
            <div className="auth-actions">
              <button className="btn" title="Sign in to save notes, add entries, or make suggestions">Sign In</button>
              <button className="btn" title="Sign in to save notes, add entries, or make suggestions">Sign Up</button>
            </div>
            <NavDropdown />
          </div>
        </div>
      </header>
      <div className="tab-content">
        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
            Loading data from Supabase...
          </div>
        )}
        {error && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>
            Error: {error}
          </div>
        )}
        {!loading && !error && timelineData && (
          <div className="timeline-wrapper">
            <Timeline
              ref={timelineRef}
              data={timelineData}
              config={churchHistoryConfig}
              showBackgroundImage
            />
          </div>
        )}
      </div>
    </>
  );
}

function ChurchHistorySupabaseApp() {
  const [timelineData, setTimelineData] = useState(null);
  const [allPeople, setAllPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        if (!timelineData) {
          setLoading(true);
        }
        setError(null);
        const result = await fetchChurchHistoryData();
        if (!cancelled) {
          setTimelineData(result.data);
          const people = (result.data.people || []).map(p => ({
            id: p.id,
            name: p.name,
          }));
          setAllPeople(people);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const handleReloadData = useCallback(() => {
    setReloadKey(k => k + 1);
  }, []);

  return (
    <div className="app">
      {hasClerk ? (
        <AuthenticatedApp
          timelineData={timelineData}
          loading={loading}
          error={error}
          allPeople={allPeople}
          onReloadData={handleReloadData}
        />
      ) : (
        <UnauthenticatedApp
          timelineData={timelineData}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}

export default ChurchHistorySupabaseApp;
