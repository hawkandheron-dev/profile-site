import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type TokenProvider = () => Promise<string | null | undefined>;

type EnvSource = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  REACT_APP_SUPABASE_URL?: string;
  REACT_APP_SUPABASE_ANON_KEY?: string;
};

const getEnv = (): EnvSource => {
  if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
    return import.meta.env as EnvSource;
  }
  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    return process.env as EnvSource;
  }
  return {};
};

const getSupabaseConfig = () => {
  const env = getEnv();
  const win = typeof window !== 'undefined' ? window as Record<string, unknown> : {};
  const url = (win.SUPABASE_URL as string) || env.VITE_SUPABASE_URL || env.REACT_APP_SUPABASE_URL;
  const anonKey = (win.SUPABASE_ANON_KEY as string) || env.VITE_SUPABASE_ANON_KEY || env.REACT_APP_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Set VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY or REACT_APP_SUPABASE_URL/REACT_APP_SUPABASE_ANON_KEY.'
    );
  }

  return { url, anonKey };
};

export const makeSupabaseClient = (getToken: TokenProvider): SupabaseClient => {
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    global: {
      fetch: async (input, init) => {
        const token = await getToken();
        const headers = new Headers(init?.headers || {});

        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }

        return fetch(input, {
          ...init,
          headers
        });
      }
    }
  });
};
