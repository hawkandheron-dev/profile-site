# Inviting contributors to the Church History Timeline

This is the operator guide for pre-provisioning a contributor. Once invited,
the contributor signs up with Clerk using their invited email and is granted
the `contributor` role automatically on first sign-in.

## How the invite flow works

Admins seed a row in `public.users` keyed by email with `role = 'contributor'`
**before** the user signs up. The `clerk_user_id` column is left NULL.

When the invitee signs in for the first time via Clerk, the app's
`ensureUserExists()` function (`timeline-scratch/src/services/adminService.js`)
finds the pending row by email and UPDATEs `clerk_user_id` on it — "claiming"
the row in place. Their pre-assigned role is preserved.

The claim is gated by a Row Level Security policy
(`"Users can claim pending invite"` added in migration
`20260421100000_pending_contributors.sql`) that requires the JWT's `email`
claim to match the row's email, so a user cannot claim another person's invite.

### JWT prerequisite

The Clerk "supabase" JWT template **must** expose the user's primary email as
the `email` claim. Verify in the Clerk dashboard (JWT Templates → supabase):

```json
{
  "email": "{{user.primary_email_address}}"
}
```

If this claim is missing, the claim-on-sign-in UPDATE will be rejected by RLS
and the invitee will fall back to a plain `viewer` row.

## Invite SQL

Run against the Supabase project (SQL editor or `psql`):

```sql
INSERT INTO public.users (email, role, display_name)
VALUES ('jane@example.com', 'contributor', 'Jane Smith');
```

- `email` is required and must match the email the invitee will use with Clerk.
- `display_name` is optional — if omitted, it'll be backfilled from Clerk on
  first sign-in.
- `role` is `'contributor'` for invited collaborators (use `'admin'` for
  full-access operators).

To invite several people at once:

```sql
INSERT INTO public.users (email, role) VALUES
  ('alice@example.com', 'contributor'),
  ('bob@example.com',   'contributor'),
  ('carol@example.com', 'contributor');
```

## Revoking an invite before it's claimed

```sql
DELETE FROM public.users
WHERE lower(email) = lower('jane@example.com')
  AND clerk_user_id IS NULL;
```

## Checking invite status

```sql
SELECT email, role, clerk_user_id, created_at
FROM public.users
WHERE role = 'contributor'
ORDER BY created_at DESC;
```

Rows with `clerk_user_id = NULL` are still pending (the invitee hasn't signed
up yet). Rows with `clerk_user_id` populated have been claimed.

## The contributor's experience

After signing up with their invited email, contributors see a "Getting
Started" button in the app header. That page shows:

1. A guided walkthrough of how to submit free-form feedback.
2. A list of all their submissions, each with a status
   (Submitted → In Review → On Roadmap → Implemented, or Not Going To Do)
   and a discussion thread where admins can reply.

## Admin-side workflow (for launch)

The Getting Started page only covers the contributor experience. Until an
admin UI for App_Issues triage is built, admins can change statuses and post
comments via SQL:

```sql
-- Move an issue to "in review"
UPDATE public."App_Issues"
SET status = 'in_review'
WHERE issue_id = 42;

-- Mark an issue as "implemented" with notes
UPDATE public."App_Issues"
SET status = 'implemented',
    resolver_notes = 'Fixed in deploy 2026-04-21.',
    resolved_by = '<your-clerk-user-id>',
    resolved_at = now()
WHERE issue_id = 42;

-- Post an admin comment
INSERT INTO public."App_Issue_Comments" (issue_id, author_clerk_user_id, body)
VALUES (42, '<your-clerk-user-id>', 'Thanks — adding this to the roadmap.');
```
