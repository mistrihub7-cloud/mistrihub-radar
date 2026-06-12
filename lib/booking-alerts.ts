import { cleanCategoryName, professionalCategoryName } from "./category-display";
import { normalizePhone, sendPushToTokens, type PushTokenRow } from "./push-server";
import { supabaseServer } from "./supabase-server";

type WorkerAlertRow = {
  id: string;
  user_id?: string | null;
  name?: string | null;
  category?: string | null;
  category_slug?: string | null;
  skill?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  whatsapp?: string | null;
  availability_status?: string | null;
  available_today?: boolean | null;
  service_radius?: number | null;
  trust_score?: number | null;
  trust?: number | null;
  whatsapp_notifications?: boolean | null;
  browser_notifications?: boolean | null;
};

export type BookingAlertInput = {
  jobId: string;
  service: string;
  area?: string | null;
  problem?: string | null;
  urgency?: string | null;
  workerId?: string | null;
  userLatitude?: number | null;
  userLongitude?: number | null;
};

type MatchedWorker = WorkerAlertRow & {
  distanceKm?: number;
};

const categoryAliases: Record<string, string> = {
  Electrician: "electrician",
  "Electrical Expert": "electrician",
  Plumber: "plumber",
  "Plumbing Expert": "plumber",
  Mechanic: "mechanic",
  "Auto Mechanic": "mechanic",
  Painter: "painter",
  "Painting Professional": "painter",
  "AC Repair": "ac-repair",
  "AC Service Expert": "ac-repair",
  Carpenter: "carpenter",
  "Woodwork Expert": "carpenter",
  Labour: "helper-labour",
  Helper: "helper-labour",
  "Labour Helper": "helper-labour",
  "Skilled Professional": "helper-labour",
  "Support Assistant": "helper-labour",
  "Home Cleaning": "home-cleaning",
  "Home Cleaning Expert": "home-cleaning",
  Driver: "driver",
  "Driver Car Booking": "driver",
  "Driver / Car Booking": "driver",
  "Driver & Car Service": "driver",
  Mason: "mason",
  "Construction Mason": "mason",
  Welder: "welder",
  "Welding Expert": "welder",
  "RO Service": "ro-service",
  "RO Water Technician": "ro-service",
  CCTV: "cctv",
  "CCTV Security Expert": "cctv",
  "Tile Marble": "tile-marble",
  "Tile / Marble": "tile-marble",
  "Tile & Marble Expert": "tile-marble"
};

function categorySlugFor(value?: string | null) {
  const name = (value || "").trim();
  if (!name) return "";
  return categoryAliases[name] || categoryAliases[professionalCategoryName(name)] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isValidCoordinate(latitude?: number | null, longitude?: number | null) {
  return typeof latitude === "number" && typeof longitude === "number" && Number.isFinite(latitude) && Number.isFinite(longitude);
}

function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const earthRadiusKm = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Number((2 * earthRadiusKm * Math.asin(Math.sqrt(h))).toFixed(1));
}

function normalizeStatus(worker: WorkerAlertRow) {
  if (worker.availability_status) return worker.availability_status;
  if (worker.available_today === false) return "Not Available";
  return "Available Today";
}

function normalizeWhatsAppNumber(value?: string | null) {
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) return "";
  const withCountryCode = digits.length <= 10 ? `91${digits.slice(-10)}` : digits;
  return `whatsapp:+${withCountryCode}`;
}

function twilioFrom() {
  const raw = process.env.TWILIO_WHATSAPP_FROM || "";
  if (!raw) return "";
  return raw.startsWith("whatsapp:") ? raw : `whatsapp:${raw}`;
}

async function sendTwilioWhatsApp(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = twilioFrom();
  if (!accountSid || !authToken || !from || !to) {
    return { ok: false, skipped: true, reason: "Twilio env missing or worker WhatsApp missing." };
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      From: from,
      To: to,
      Body: body
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return { ok: false, skipped: false, reason: text || `Twilio HTTP ${response.status}` };
  }
  return { ok: true, skipped: false };
}

async function alreadySentWave(jobId: string, waveKey: string) {
  if (!supabaseServer) return false;
  const { data } = await supabaseServer
    .from("job_status_history")
    .select("id")
    .eq("job_id", jobId)
    .eq("status", waveKey)
    .maybeSingle();
  return Boolean(data);
}

async function markWave(jobId: string, waveKey: string, note: string) {
  if (!supabaseServer) return;
  await supabaseServer.from("job_status_history").insert({ job_id: jobId, status: waveKey, note });
}

async function previouslyNotifiedUserIds(jobId: string) {
  if (!supabaseServer) return new Set<string>();
  const { data } = await supabaseServer
    .from("notifications")
    .select("user_id,message,type")
    .in("type", ["new_job_request", "whatsapp_job_alert", "browser_job_alert"])
    .ilike("message", `%${jobId}%`)
    .range(0, 999);
  return new Set((data || []).map((item: any) => item.user_id).filter(Boolean));
}

async function loadMatchingWorkers(input: BookingAlertInput, radiusKm: number, maxWorkers: number, excludeAlreadyNotified: boolean) {
  if (!supabaseServer) return [] as MatchedWorker[];
  const { data, error } = await supabaseServer.from("workers").select("*").range(0, 999);
  if (error || !data) return [];

  const selectedCategorySlug = categorySlugFor(input.service);
  const hasCoordinates = isValidCoordinate(input.userLatitude, input.userLongitude);
  const alreadyNotified = excludeAlreadyNotified ? await previouslyNotifiedUserIds(input.jobId) : new Set<string>();

  return (data as WorkerAlertRow[])
    .map((worker) => {
      const workerCategorySlug = worker.category_slug || categorySlugFor(worker.category || worker.skill);
      if (input.workerId && worker.id !== input.workerId) return null;
      if (!input.workerId && workerCategorySlug !== selectedCategorySlug) return null;
      if (normalizeStatus(worker) === "Not Available") return null;
      if (worker.user_id && alreadyNotified.has(worker.user_id)) return null;

      let calculatedDistance: number | undefined;
      if (hasCoordinates && isValidCoordinate(worker.latitude, worker.longitude)) {
        calculatedDistance = distanceKm(
          { latitude: input.userLatitude as number, longitude: input.userLongitude as number },
          { latitude: worker.latitude as number, longitude: worker.longitude as number }
        );
        const workerRadius = Number(worker.service_radius || 10);
        if (calculatedDistance > radiusKm || calculatedDistance > workerRadius) return null;
      }

      return { ...worker, distanceKm: calculatedDistance };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const left = a as MatchedWorker;
      const right = b as MatchedWorker;
      if (left.distanceKm !== undefined && right.distanceKm !== undefined) return left.distanceKm - right.distanceKm;
      return Number(right.trust_score ?? right.trust ?? 70) - Number(left.trust_score ?? left.trust ?? 70);
    })
    .slice(0, maxWorkers) as MatchedWorker[];
}

function alertBody(input: BookingAlertInput, worker: MatchedWorker) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mistrihub.in";
  const requestUrl = `${siteUrl.replace(/\/$/, "")}/jobs/${input.jobId}`;
  const serviceLabel = cleanCategoryName(input.service);
  const distance = worker.distanceKm !== undefined ? `${worker.distanceKm} KM` : "Nearby service area";
  return [
    "New Work Request",
    "",
    `Job ID: ${input.jobId}`,
    `Category: ${serviceLabel}`,
    `Location: ${input.area || "Customer area"}`,
    `Problem: ${(input.problem || "Open request for details").slice(0, 140)}`,
    `Distance: ${distance}`,
    "",
    "Open Request:",
    requestUrl
  ].join("\n");
}

export async function sendBookingAlerts(
  input: BookingAlertInput,
  options: { radiusKm?: number; maxWorkers?: number; waveKey?: string; excludeAlreadyNotified?: boolean; adminAlert?: boolean } = {}
) {
  if (!supabaseServer) return { ok: false, matched: 0, whatsappSent: 0, pushSent: 0, reason: "Supabase server config missing." };

  const radiusKm = options.radiusKm || (input.urgency === "Emergency" ? 15 : 15);
  const maxWorkers = options.maxWorkers || 10;
  const waveKey = options.waveKey || `Alert ${radiusKm}km`;
  if (await alreadySentWave(input.jobId, waveKey)) {
    return { ok: true, skipped: true, matched: 0, whatsappSent: 0, pushSent: 0 };
  }

  const workers = await loadMatchingWorkers(input, radiusKm, maxWorkers, Boolean(options.excludeAlreadyNotified));
  const serviceLabel = cleanCategoryName(input.service);
  let whatsappSent = 0;

  const websiteNotifications = workers.map((worker) => ({
    user_id: worker.user_id || null,
    title: "New job request",
    message: `Job ${input.jobId}: ${serviceLabel} request in ${input.area || "customer area"}. Open request details.`,
    type: "new_job_request"
  }));

  if (websiteNotifications.length) {
    await supabaseServer.from("notifications").insert(websiteNotifications);
  }

  for (const worker of workers) {
    if (worker.whatsapp_notifications === false) continue;
    const to = normalizeWhatsAppNumber(worker.whatsapp || worker.phone);
    const result = await sendTwilioWhatsApp(to, alertBody(input, worker));
    if (result.ok) whatsappSent += 1;
    await supabaseServer.from("notifications").insert({
      user_id: worker.user_id || null,
      title: result.ok ? "WhatsApp alert sent" : "WhatsApp alert queued",
      message: `Job ${input.jobId}: ${result.ok ? "Sent" : result.reason || "Skipped"} to ${worker.name || "professional"}`,
      type: "whatsapp_job_alert"
    });
  }

  const pushWorkers = workers.filter((worker) => worker.browser_notifications !== false);
  const pushWorkerIds = new Set(pushWorkers.map((worker) => worker.id).filter(Boolean));
  const pushPhones = new Set(pushWorkers.map((worker) => normalizePhone(worker.phone || worker.whatsapp)).filter(Boolean));
  let pushSent = 0;
  if (pushWorkerIds.size || pushPhones.size) {
    const { data: tokens } = await supabaseServer
      .from("push_tokens")
      .select("token,worker_id,phone,role")
      .eq("role", "worker")
      .range(0, 999);
    const matchedTokens = ((tokens || []) as PushTokenRow[]).filter((row) => {
      const tokenWorkerId = row.worker_id || "";
      const tokenPhone = normalizePhone(row.phone);
      return (tokenWorkerId && pushWorkerIds.has(tokenWorkerId)) || (tokenPhone && pushPhones.has(tokenPhone));
    });
    const pushResult = await sendPushToTokens({
      tokens: matchedTokens.map((row) => row.token),
      title: "New MistriHub.In work request",
      body: `${serviceLabel} request in ${input.area || "your area"}. ${(input.problem || "").slice(0, 80)}`,
      url: `/jobs/${input.jobId}`,
      jobId: input.jobId
    });
    pushSent = pushResult.sent || 0;
    await supabaseServer.from("notifications").insert({
      user_id: null,
      title: "Browser push result",
      message: `Job ${input.jobId}: matched ${matchedTokens.length} saved FCM tokens, sent ${pushSent}.`,
      type: "browser_job_alert"
    });
  }

  const note = `${workers.length} matching professionals notified within ${radiusKm} km. WhatsApp sent: ${whatsappSent}. Browser push sent: ${pushSent}.`;
  await markWave(input.jobId, waveKey, note);

  if (options.adminAlert) {
    await supabaseServer.from("notifications").insert({
      user_id: null,
      title: input.urgency === "Emergency" ? "Admin alert: emergency request" : "Admin alert: no response escalation",
      message: `Job ${input.jobId}: ${serviceLabel} in ${input.area || "customer area"}. ${note}`,
      type: "admin_alert"
    });
  }

  return { ok: true, matched: workers.length, whatsappSent, pushSent, radiusKm };
}
