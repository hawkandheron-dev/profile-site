import { useState, useEffect, useCallback } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from '@clerk/clerk-react';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { fetchChurchHistoryData } from './data/churchHistorySupabaseAdapter.js';
import { churchHistoryConfig } from './data/churchHistoryData.js';
import { AddNoteModal } from './components/Notes/AddNoteModal.jsx';
import './App.css';

const hasClerk = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * Auth header rendered only when Clerk is configured.
 * Isolated so the useAuth hook is always called inside ClerkProvider.
 */
function ClerkAuthHeader({ onAddNote }) {
  const { isSignedIn } = useAuth();

  return (
    <div className="auth-actions">
      {isSignedIn && (
        <button type="button" className="header-add-note" onClick={onAddNote}>
          + Add Note
        </button>
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
function AuthenticatedApp({ timelineData, loading, error, allPeople }) {
  const { getToken, isSignedIn, userId } = useAuth();
  const [addNoteOpen, setAddNoteOpen] = useState(false);

  const handleAddNoteClose = useCallback(() => {
    setAddNoteOpen(false);
  }, []);

  const authContext = isSignedIn
    ? { getToken, clerkUserId: userId, isSignedIn: true }
    : null;

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <h1>Church History Timeline (Supabase)</h1>
          <nav className="tab-nav">
            <a href="../../index.html" className="tab-button">Home</a>
            <a href="./church-history.html" className="tab-button">JSON Version</a>
            <a href="../../church-history-supabase.html" className="tab-button">Data Browser</a>
          </nav>
        </div>
        <ClerkAuthHeader onAddNote={() => setAddNoteOpen(true)} />
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
              data={timelineData}
              config={churchHistoryConfig}
              authContext={authContext}
              allPeople={allPeople}
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
    </>
  );
}

/**
 * Unauthenticated fallback (no Clerk key configured).
 */
function UnauthenticatedApp({ timelineData, loading, error }) {
  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <h1>Church History Timeline (Supabase)</h1>
          <nav className="tab-nav">
            <a href="../../index.html" className="tab-button">Home</a>
            <a href="./church-history.html" className="tab-button">JSON Version</a>
            <a href="../../church-history-supabase.html" className="tab-button">Data Browser</a>
          </nav>
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

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchChurchHistoryData();
        if (!cancelled) {
          setTimelineData(result.data);
          // Build a simple list of {id, name} for the people selector
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
  }, []);

  return (
    <div className="app">
      {hasClerk ? (
        <AuthenticatedApp
          timelineData={timelineData}
          loading={loading}
          error={error}
          allPeople={allPeople}
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
