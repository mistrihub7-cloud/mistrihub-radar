import { NextResponse } from "next/server";
import { sendBookingAlerts, type BookingAlertInput } from "@/lib/booking-alerts";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Payload = BookingAlertInput;

async function sendFirstMatchingWave(input: BookingAlertInput) {
  if (input.workerId) {
    return sendBookingAlerts(input, {
      radiusKm: 0,
      maxWorkers: 1,
      waveKey: "Selected professional alert",
      excludeAlreadyNotified: false,
      adminAlert: false
    });
  }

  const waves =
    input.urgency === "Emergency"
      ? [{ radiusKm: 15, maxWorkers: 15, waveKey: "Emergency 15km alert" }]
      : input.urgency === "Urgent"
        ? [
            { radiusKm: 10, maxWorkers: 12, waveKey: "Urgent 10km alert" },
            { radiusKm: 15, maxWorkers: 15, waveKey: "Urgent 15km alert" }
          ]
        : [
            { radiusKm: 5, maxWorkers: 8, waveKey: "Initial 5km alert" },
            { radiusKm: 10, maxWorkers: 10, waveKey: "Retry 10km alert" },
            { radiusKm: 15, maxWorkers: 15, waveKey: "Retry 15km alert" }
          ];

  const results = [];
  for (const wave of waves) {
    const result = await sendBookingAlerts(input, {
      ...wave,
      excludeAlreadyNotified: results.length > 0,
      adminAlert: false
    });
    results.push(result);
    if (result.skipped || result.matched > 0) break;
  }

  const last = results[results.length - 1] || { ok: false, matched: 0, whatsappSent: 0, pushSent: 0 };
  return {
    ...last,
    matched: results.reduce((sum, item) => sum + (item.matched || 0), 0),
    whatsappSent: results.reduce((sum, item) => sum + (item.whatsappSent || 0), 0),
    pushSent: results.reduce((sum, item) => sum + (item.pushSent || 0), 0),
    results
  };
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Payload;
  if (!payload.jobId) return NextResponse.json({ ok: false, error: "Job ID required." }, { status: 400 });
  if (!supabaseServer) return NextResponse.json({ ok: false, error: "Supabase server config missing." }, { status: 500 });

  const { data: job } = await supabaseServer
    .from("job_requests")
    .select("id,worker_id,service,problem_description,urgency,area,user_latitude,user_longitude,status")
    .eq("id", payload.jobId)
    .maybeSingle();

  if (!job) return NextResponse.json({ ok: false, error: "Job not found." }, { status: 404 });

  const input: BookingAlertInput = {
    jobId: job.id,
    workerId: job.worker_id || payload.workerId || null,
    service: job.service || payload.service || "",
    problem: job.problem_description || payload.problem || "",
    urgency: job.urgency || payload.urgency || "Normal",
    area: job.area || payload.area || "",
    userLatitude: job.user_latitude ?? payload.userLatitude ?? null,
    userLongitude: job.user_longitude ?? payload.userLongitude ?? null
  };

  const result = await sendFirstMatchingWave(input);

  return NextResponse.json(result);
}
