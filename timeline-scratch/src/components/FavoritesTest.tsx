import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { makeSupabaseClient } from '../lib/supabase';

const DEBUG_ENABLED = import.meta.env.VITE_ENABLE_DEBUG === 'true';

type FavoritesRow = Record<string, unknown>;

const FavoritesTest = () => {
  const { getToken, isSignedIn, userId } = useAuth();
  const [rows, setRows] = useState<FavoritesRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => {
    if (!isSignedIn) return null;
    return makeSupabaseClient(getToken);
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (!DEBUG_ENABLED) return;

    let isMounted = true;

    const loadFavorites = async () => {
      if (!supabase || !userId) {
        setRows(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error: queryError } = await supabase
        .from('era_favorites')
        .select('*')
        .eq('clerk_user_id', userId)
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
  }, [supabase, userId]);

  if (!DEBUG_ENABLED) return null;

  return (
    <section className="supabase-test">
      <h2>Favorites Debug Panel</h2>
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
