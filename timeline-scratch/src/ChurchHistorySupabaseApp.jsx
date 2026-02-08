import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from '@clerk/clerk-react';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { TimelineSearch } from './components/Timeline/components/TimelineSearch.jsx';
import { fetchChurchHistoryData } from './data/churchHistorySupabaseAdapter.js';
import { churchHistoryConfig } from './data/churchHistoryData.js';
import { AddNoteModal } from './components/Notes/AddNoteModal.jsx';
import { ViewMyNotesModal } from './components/Notes/ViewMyNotesModal.jsx';
import { checkUserRole } from './services/adminService.js';
import { AdminSuggestionsPage } from './components/Suggestions/AdminSuggestionsPage.jsx';
import { SuggestNewModal } from './components/Suggestions/SuggestNewModal.jsx';
import './App.css';

const hasClerk = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * Auth header rendered only when Clerk is configured.
 * Isolated so the useAuth hook is always called inside ClerkProvider.
 */
function ClerkAuthHeader({ onAddNote, onViewNotes, isAdmin, isContributor, onReviewSuggestions, onSuggestNew }) {
  const { isSignedIn } = useAuth();

  return (
    <div className="auth-actions">
      {isSignedIn && (
        <>
          <button type="button" className="header-add-note" onClick={onAddNote}>
            + Add Note
          </button>
          <button type="button" className="header-add-note" onClick={onViewNotes}>
            View My Notes
          </button>
          {isContributor && (
            <button type="button" className="header-add-note header-suggest-new" onClick={onSuggestNew}>
              + Suggest New Entry
            </button>
          )}
          {isAdmin && (
            <button type="button" className="header-add-note header-review-suggestions" onClick={onReviewSuggestions}>
              Review Suggestions
            </button>
          )}
        </>
      )}
      <SignedOut>
        <span className="auth-hint">Sign in to save notes.</span>
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
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
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [viewNotesOpen, setViewNotesOpen] = useState(false);
  const [suggestNewOpen, setSuggestNewOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isContributor, setIsContributor] = useState(false);
  const [view, setView] = useState('timeline'); // 'timeline' | 'suggestions'
  const timelineRef = useRef(null);

  // Check role on sign-in
  useEffect(() => {
    if (!isSignedIn || !userId) {
      setIsAdmin(false);
      setIsContributor(false);
      return;
    }

    let cancelled = false;
    const getTokenForRole = () => getToken({ template: 'supabase' });

    checkUserRole(getTokenForRole, userId).then(result => {
      if (!cancelled) {
        setIsAdmin(result.isAdmin);
        setIsContributor(result.isContributor);
      }
    });

    return () => { cancelled = true; };
  }, [isSignedIn, userId, getToken]);

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
            <h1 className="site-title"><strong>History of the Christian Church</strong> <span>Lifespans</span></h1>
            {timelineData && (
              <TimelineSearch
                data={timelineData}
                onSelectItem={handleSearchSelect}
                onHighlight={handleSearchHighlight}
                onClearHighlight={handleSearchClearHighlight}
              />
            )}
          </div>
          <nav className="tab-nav">
            <a href="../../index.html" className="tab-button">Home</a>
            <a href="./church-history.html" className="tab-button">JSON Version</a>
            <a href="../../church-history-supabase.html" className="tab-button">Data Browser</a>
          </nav>
          <div className="header-right">
            <ClerkAuthHeader
              onAddNote={() => setAddNoteOpen(true)}
              onViewNotes={() => setViewNotesOpen(true)}
              isAdmin={isAdmin}
              isContributor={isContributor}
              onReviewSuggestions={() => setView('suggestions')}
              onSuggestNew={() => setSuggestNewOpen(true)}
            />
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
            <h1 className="site-title"><strong>History of the Christian Church</strong> <span>Lifespans</span></h1>
            {timelineData && (
              <TimelineSearch
                data={timelineData}
                onSelectItem={handleSearchSelect}
                onHighlight={handleSearchHighlight}
                onClearHighlight={handleSearchClearHighlight}
              />
            )}
          </div>
          <nav className="tab-nav">
            <a href="../../index.html" className="tab-button">Home</a>
            <a href="./church-history.html" className="tab-button">JSON Version</a>
            <a href="../../church-history-supabase.html" className="tab-button">Data Browser</a>
          </nav>
          <div className="header-right">
            <div className="auth-actions">
              <span className="auth-hint">Sign in to save notes</span>
              <button>Sign Up</button>
              <button>Sign In</button>
            </div>
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
