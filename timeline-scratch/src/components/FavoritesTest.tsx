import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { makeSupabaseClient } from '../lib/supabase';

type FavoritesRow = Record<string, unknown>;

const FavoritesTest = () => {
  const { getToken, isSignedIn } = useAuth();
  const [rows, setRows] = useState<FavoritesRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => {
    if (!isSignedIn) return null;
    return makeSupabaseClient(getToken);
  }, [getToken, isSignedIn]);

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      if (!supabase) {
        setRows(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error: queryError } = await supabase
        .from('era_favorites')
        .select('*')
        .limit(10);

      if (!isMounted) return;

      if (queryError) {
        setError(queryError.message);
        setRows(null);
      } else {
        setRows(data ?? []);
        setError(null);
      }
      setLoading(false);
    };

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return (
    <section className="supabase-test">
      <h2>Favorites Test</h2>
      {!isSignedIn && <p>Sign in to load favorites from Supabase.</p>}
      {isSignedIn && loading && <p>Loading...</p>}
      {isSignedIn && error && <p className="supabase-error">{error}</p>}
      {isSignedIn && rows && (
        <pre className="supabase-test-output">{JSON.stringify(rows, null, 2)}</pre>
      )}
    </section>
  );
};

export default FavoritesTest;

/*
Temporary usage:
- Import and render <FavoritesTest /> in the HistoricalErasApp header (already mounted).
- Verify in DevTools Network that Supabase requests include Authorization: Bearer <token>.
- Confirm RLS: signed-out should fail, signed-in should return rows.
*/
