export async function onRequest({ env }) {
  const url = env.SUPABASE_URL || "";
  const anonKey = env.SUPABASE_ANON_KEY || "";

  const body = `window.SUPABASE_URL = ${JSON.stringify(url)};\nwindow.SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};\n`;

  return new Response(body, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
