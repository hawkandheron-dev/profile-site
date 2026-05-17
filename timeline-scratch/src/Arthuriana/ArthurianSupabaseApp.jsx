import { useState, useEffect } from 'react';
import { fetchArthurianData } from '../data/arthurianSupabaseAdapter.js';
import { ArthurianApp } from './ArthurianApp.jsx';

export function ArthurianSupabaseApp() {
  const [state, setState] = useState({ status: 'loading', characters: null, realmData: null });

  useEffect(() => {
    fetchArthurianData()
      .then(({ characters, realmData }) => setState({ status: 'ready', characters, realmData }))
      .catch((err) => setState({ status: 'error', error: err.message, characters: null, realmData: null }));
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="app-loading">
        <div className="app-loading-inner">
          <div className="app-loading-crest" aria-hidden="true">⚔</div>
          <div>Summoning the Roll of Arms…</div>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="app-error">
        <div className="app-error-inner">
          <div className="app-error-title">The Herald is unavailable</div>
          <div className="app-error-msg">{state.error}</div>
        </div>
      </div>
    );
  }

  return <ArthurianApp characters={state.characters} realmData={state.realmData} />;
}
