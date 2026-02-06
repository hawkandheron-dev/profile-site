export async function onRequest({ env }) {
  const url = env.SUPABASE_URL || "";
  const anonKey = env.SUPABASE_ANON_KEY || "";
  const clerkPubKey = env.CLERK_PUBLISHABLE_KEY || "";

  const body = [
    `window.SUPABASE_URL = ${JSON.stringify(url)};`,
    `window.SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};`,
    `window.CLERK_PUBLISHABLE_KEY = ${JSON.stringify(clerkPubKey)};`,
  ].join('\n') + '\n';

  return new Response(body, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
