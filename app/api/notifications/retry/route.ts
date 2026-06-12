import { NextResponse } from "next/server";
import { sendBookingAlerts, type BookingAlertInput } from "@/lib/booking-alerts";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function minutesSince(value?: string | null) {
  if (!value) return 0;
  return Math.floor((Date.now() - new Date(value).getTime()) / 60000);
}

async function hasWorkerResponse(jobId: string) {
  if (!supabaseServer) return false;
  const { data } = await supabaseServer
    .from("request_messages")
    .select("id")
    .eq("job_id", jobId)
    .eq("sender_role", "worker")
    .limit(1);
  return Boolean(data?.length);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  if (!supabaseServer) return NextResponse.json({ ok: false, error: "Supabase server config missing." }, { status: 500 });

  const { data, error } = await supabaseServer
    .from("job_requests")
    .select("id,worker_id,service,problem_description,urgency,area,user_latitude,user_longitude,status,created_at")
    .eq("status", "Requested")
    .order("created_at", { ascending: true })
    .range(0, 100);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const results = [];
  for (const job of data || []) {
    const age = minutesSince(job.created_at);
    if (await hasWorkerResponse(job.id)) {
      results.push({ ok: true, skipped: true, jobId: job.id, reason: "Worker chat response already received." });
      continue;
    }

    const input: BookingAlertInput = {
      jobId: job.id,
      service: job.service || "",
      problem: job.problem_description || "",
      urgency: job.urgency || "Normal",
      area: job.area || "",
      userLatitude: job.user_latitude ?? null,
      userLongitude: job.user_longitude ?? null
    };

    if (job.urgency === "Emergency" && age >= 2) {
      results.push(await sendBookingAlerts(input, { radiusKm: 20, maxWorkers: 25, waveKey: "Emergency 20km admin alert", excludeAlreadyNotified: true, adminAlert: true }));
      continue;
    }

    if (job.worker_id && age >= 2) {
      results.push(await sendBookingAlerts(input, { radiusKm: 5, maxWorkers: 10, waveKey: "Direct fallback 5km alert", excludeAlreadyNotified: true }));
    }

    if (age >= 15) {
      results.push(await sendBookingAlerts(input, { radiusKm: 20, maxWorkers: 20, waveKey: "Retry 20km alert", excludeAlreadyNotified: true, adminAlert: true }));
    } else if (age >= 10) {
      results.push(await sendBookingAlerts(input, { radiusKm: 15, maxWorkers: 15, waveKey: "Retry 15km alert", excludeAlreadyNotified: true }));
    } else if (age >= 5) {
      results.push(await sendBookingAlerts(input, { radiusKm: 10, maxWorkers: 10, waveKey: "Retry 10km alert", excludeAlreadyNotified: true }));
    }
  }

  return NextResponse.json({ ok: true, checked: data?.length || 0, results });
}
