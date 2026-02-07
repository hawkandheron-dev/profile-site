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
import './App.css';

const hasClerk = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * Auth header rendered only when Clerk is configured.
 * Isolated so the useAuth hook is always called inside ClerkProvider.
 */
function ClerkAuthHeader({ onAddNote, onViewNotes }) {
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
function AuthenticatedApp({ timelineData, loading, error, allPeople, refetchData }) {
  const { getToken, isSignedIn, userId } = useAuth();
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [viewNotesOpen, setViewNotesOpen] = useState(false);
  const timelineRef = useRef(null);

  const handleAddNoteClose = useCallback(() => {
    setAddNoteOpen(false);
  }, []);

  const authContext = isSignedIn
    ? { getToken, clerkUserId: userId, isSignedIn: true }
    : null;

  // Search handlers that delegate to Timeline ref
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
            <ClerkAuthHeader onAddNote={() => setAddNoteOpen(true)} onViewNotes={() => setViewNotesOpen(true)} />
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
              onDataChanged={refetchData}
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
    </>
  );
}

/**
 * Unauthenticated fallback (no Clerk key configured).
 */
function UnauthenticatedApp({ timelineData, loading, error }) {
  const timelineRef = useRef(null);

  // Search handlers that delegate to Timeline ref
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchChurchHistoryData();
      setTimelineData(result.data);
      const people = (result.data.people || []).map(p => ({
        id: p.id,
        name: p.name,
      }));
      setAllPeople(people);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Refetch without showing the loading spinner (for background refreshes after edits)
  const refetchData = useCallback(async () => {
    try {
      const result = await fetchChurchHistoryData();
      setTimelineData(result.data);
      const people = (result.data.people || []).map(p => ({
        id: p.id,
        name: p.name,
      }));
      setAllPeople(people);
    } catch (err) {
      console.warn('Background refetch failed:', err.message);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="app">
      {hasClerk ? (
        <AuthenticatedApp
          timelineData={timelineData}
          loading={loading}
          error={error}
          allPeople={allPeople}
          refetchData={refetchData}
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
