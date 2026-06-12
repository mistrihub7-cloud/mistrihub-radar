import { NextResponse } from "next/server";
import { sendBookingAlerts, type BookingAlertInput } from "@/lib/booking-alerts";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Payload = BookingAlertInput;

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

  const result = await sendBookingAlerts(input, {
    radiusKm: input.workerId ? 15 : input.urgency === "Emergency" ? 15 : 15,
    maxWorkers: input.workerId ? 1 : 10,
    waveKey: input.workerId ? "Direct profile alert" : input.urgency === "Emergency" ? "Emergency 15km alert" : "Initial 15km alert",
    excludeAlreadyNotified: false,
    adminAlert: input.urgency === "Emergency"
  });

  return NextResponse.json(result);
}
