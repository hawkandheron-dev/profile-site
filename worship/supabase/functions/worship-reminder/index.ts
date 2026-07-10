// worship-reminder — sends the day-before reminder for the next service.
//
// Invocations:
//   - pg_cron (Saturdays 13:00 UTC) with { } body → reminds for "tomorrow" (America/New_York)
//   - Admin UI "Send now" / "Dry run" with { date, dry_run }
//
// Env (Supabase function secrets):
//   RESEND_API_KEY        — required for email sending
//   REMINDER_FROM_EMAIL   — sender, e.g. "Worship <worship@yourdomain.org>"
//   TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM — optional; enables SMS
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — provided automatically
import { createClient } from "npm:@supabase/supabase-js@2";

const LOCATION = "RCF";
const TZ = "America/New_York";

type Assignment = {
  status: string;
  note: string | null;
  person: { display_name: string; email: string | null; phone: string | null };
  role: { name: string; sort_order: number } | null;
};

function localDateParts(d: Date): { y: number; m: number; day: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const [y, m, day] = fmt.format(d).split("-").map(Number);
  return { y, m, day };
}

function isoTomorrow(): string {
  const { y, m, day } = localDateParts(new Date());
  const utcToday = Date.UTC(y, m - 1, day);
  return new Date(utcToday + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", timeZone: "UTC",
  });
}

function compose(service: Record<string, unknown>, assigned: Assignment[], songs: Array<Record<string, unknown>>): string {
  const lines: string[] = [];
  lines.push(`Worship reminder for ${formatDate(service.service_date as string)}${service.special ? ` (${service.special})` : ""}`);
  if (service.practice_time) lines.push(`Practice: ${service.practice_time}`);
  lines.push("");
  lines.push("Team:");
  for (const a of assigned) lines.push(`- ${a.person.display_name}: ${a.role?.name ?? ""}`);
  if (songs.length) {
    lines.push("");
    lines.push("Songs:");
    for (const s of songs) {
      const song = s.song as { title: string; links?: Array<{ url: string }> };
      const links = (song.links ?? []).map((l) => l.url);
      lines.push(`- ${song.title}${s.key_override ? ` (${s.key_override})` : ""}${links.length ? " " + links.join(" ") : ""}`);
    }
  }
  if (service.notes) {
    lines.push("");
    lines.push(`Notes: ${service.notes}`);
  }
  return lines.join("\n");
}

Deno.serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: { date?: string; dry_run?: boolean } = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }
  const url = new URL(req.url);
  const date = body.date || url.searchParams.get("date") || isoTomorrow();
  const dryRun = body.dry_run ?? url.searchParams.get("dry_run") === "1";

  const { data: service, error: svcErr } = await supabase
    .from("ws_services")
    .select("*, assignments:ws_assignments(status, note, role:ws_roles(name, sort_order), person:ws_people(display_name, email, phone))")
    .eq("service_date", date)
    .eq("location", LOCATION)
    .maybeSingle();
  if (svcErr) return json({ error: svcErr.message }, 500);
  if (!service) return json({ message: `No service on ${date}`, sent: false });

  const assigned: Assignment[] = (service.assignments ?? [])
    .filter((a: Assignment) => a.status === "assigned" && a.person)
    .sort((a: Assignment, b: Assignment) => (a.role?.sort_order ?? 0) - (b.role?.sort_order ?? 0));
  if (!assigned.length) return json({ message: `Nobody assigned on ${date}`, sent: false });

  const { data: songs } = await supabase
    .from("ws_service_songs")
    .select("key_override, sort_order, song:ws_songs(title, links:ws_song_links(url))")
    .eq("service_id", service.id)
    .order("sort_order");

  const text = compose(service, assigned, songs ?? []);
  const emailRecipients = assigned.filter((a) => a.person.email).map((a) => a.person.email!) ;
  const smsRecipients = assigned.filter((a) => a.person.phone).map((a) => a.person.phone!);

  const result: Record<string, unknown> = {
    date,
    dry_run: dryRun,
    message: text,
    email_recipients: emailRecipients,
    sms_recipients: smsRecipients,
  };

  if (dryRun) return json(result);

  // ── email via Resend ──────────────────────────────────────────────────
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (resendKey && emailRecipients.length) {
    const from = Deno.env.get("REMINDER_FROM_EMAIL") || "Worship Scheduler <onboarding@resend.dev>";
    let status = "ok", errMsg: string | null = null;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: emailRecipients,
          subject: `Worship reminder — ${formatDate(date)}`,
          text,
        }),
      });
      if (!res.ok) { status = "error"; errMsg = `Resend ${res.status}: ${await res.text()}`; }
    } catch (e) {
      status = "error"; errMsg = String(e);
    }
    await supabase.from("ws_reminder_log").insert({
      service_id: service.id, channel: "email", status,
      error: errMsg, recipients: emailRecipients.map((e) => ({ email: e })),
    });
    result.email_status = status;
    if (errMsg) result.email_error = errMsg;
  } else {
    result.email_status = resendKey ? "no-recipients" : "skipped (RESEND_API_KEY not set)";
  }

  // ── SMS via Twilio (enabled only when secrets exist) ─────────────────
  const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioFrom = Deno.env.get("TWILIO_FROM");
  if (twilioSid && twilioToken && twilioFrom && smsRecipients.length) {
    let status = "ok", errMsg: string | null = null;
    for (const phone of smsRecipients) {
      try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa(`${twilioSid}:${twilioToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ From: twilioFrom, To: `+1${phone}`, Body: text }),
        });
        if (!res.ok) { status = "error"; errMsg = `Twilio ${res.status} for ${phone}`; }
      } catch (e) {
        status = "error"; errMsg = String(e);
      }
    }
    await supabase.from("ws_reminder_log").insert({
      service_id: service.id, channel: "sms", status,
      error: errMsg, recipients: smsRecipients.map((p) => ({ phone: p })),
    });
    result.sms_status = status;
  } else {
    result.sms_status = "skipped (Twilio secrets not set)";
  }

  return json(result);
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
