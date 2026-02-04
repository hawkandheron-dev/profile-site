# profile-site

## Historical Eras — Environment Setup

Create `timeline-scratch/.env` from the example file and fill in the values:

```
VITE_CLERK_PUBLISHABLE_KEY="<CLERK_PUBLISHABLE_KEY>"
VITE_SUPABASE_URL="<SUPABASE_URL>"
VITE_SUPABASE_ANON_KEY="<SUPABASE_ANON_PUBLIC_KEY>"
```

### Clerk (authentication)

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Copy your **Publishable Key** from Dashboard > API Keys
3. Set `VITE_CLERK_PUBLISHABLE_KEY` in your `.env`

### Supabase (database)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **anon public key** from Settings > API
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env`

### Row Level Security (required)

RLS must be enabled on the `era_favorites` table so users can only access their own data. Example policy:

```sql
-- Enable RLS
ALTER TABLE era_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY "Users read own favorites"
  ON era_favorites FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Users can insert their own favorites
CREATE POLICY "Users insert own favorites"
  ON era_favorites FOR INSERT
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Users can delete their own favorites
CREATE POLICY "Users delete own favorites"
  ON era_favorites FOR DELETE
  USING (clerk_user_id = auth.jwt() ->> 'sub');
```

### Debug panel

To show the Supabase debug panel in the UI, add to your `.env`:

```
VITE_ENABLE_DEBUG="true"
```

### Notes

- The example file is committed as `timeline-scratch/.env.example` for reference.
- Do not commit real secrets; keep them in your local `.env` file.
