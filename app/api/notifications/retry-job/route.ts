import { NextResponse } from "next/server";
import { processRetryForJob, type RetryJobRow } from "@/lib/retry-alerts";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!supabaseServer) return NextResponse.json({ ok: false, error: "Supabase server config missing." }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const jobId = String(body.jobId || "").trim();
  if (!jobId) return NextResponse.json({ ok: false, error: "jobId missing." }, { status: 400 });

  const { data: job, error } = await supabaseServer
    .from("job_requests")
    .select("id,worker_id,service,problem_description,urgency,area,user_latitude,user_longitude,status,created_at")
    .eq("id", jobId)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!job) return NextResponse.json({ ok: false, error: "Job not found." }, { status: 404 });

  const result = await processRetryForJob(job as RetryJobRow);
  return NextResponse.json(result);
}
