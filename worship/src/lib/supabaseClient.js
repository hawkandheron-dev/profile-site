import { createClient } from '@supabase/supabase-js'

let client = null

/**
 * Config resolution order:
 * 1. Vite env vars (local dev, worship/.env)
 * 2. /api/worship-config Cloudflare Pages Function (production runtime)
 */
export async function getSupabase() {
  if (client) return client
  let url = import.meta.env.VITE_WORSHIP_SUPABASE_URL
  let key = import.meta.env.VITE_WORSHIP_SUPABASE_ANON_KEY
  if (!url || !key) {
    try {
      const res = await fetch('/api/worship-config')
      if (res.ok) {
        const cfg = await res.json()
        url = url || cfg.supabaseUrl
        key = key || cfg.supabaseAnonKey
      }
    } catch {
      // fall through to the error below
    }
  }
  if (!url || !key) {
    throw new Error(
      'Supabase config missing. Set VITE_WORSHIP_SUPABASE_URL / VITE_WORSHIP_SUPABASE_ANON_KEY (local) or WORSHIP_SUPABASE_URL / WORSHIP_SUPABASE_ANON_KEY (Cloudflare Pages).'
    )
  }
  client = createClient(url, key)
  return client
}
