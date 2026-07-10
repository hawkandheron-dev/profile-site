export async function onRequest({ env }) {
  const body = JSON.stringify({
    supabaseUrl: env.WORSHIP_SUPABASE_URL || "",
    supabaseAnonKey: env.WORSHIP_SUPABASE_ANON_KEY || "",
  });

  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
