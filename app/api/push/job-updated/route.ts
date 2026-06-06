import { NextResponse } from "next/server";
import { normalizePhone, sendPushToTokens, type PushTokenRow } from "@/lib/push-server";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type JobUpdatedPayload = {
  jobId?: string;
  status?: string;
  customerPhone?: string;
  workerId?: string;
  service?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as JobUpdatedPayload;
  if (!payload.jobId || !payload.status) {
    return NextResponse.json({ ok: false, error: "Job ID and status required." }, { status: 400 });
  }
  if (!supabaseServer) return NextResponse.json({ ok: false, error: "Supabase server config missing." }, { status: 500 });

  const cleanCustomerPhone = normalizePhone(payload.customerPhone);
  let tokens: string[] = [];

  if (cleanCustomerPhone) {
    const { data } = await supabaseServer.from("push_tokens").select("token,phone,role").eq("role", "user").range(0, 999);
    tokens = ((data || []) as PushTokenRow[])
      .filter((row) => normalizePhone(row.phone) === cleanCustomerPhone)
      .map((row) => row.token);
  }

  if (!tokens.length && payload.workerId) {
    const { data } = await supabaseServer.from("push_tokens").select("token,worker_id,role").eq("role", "worker").eq("worker_id", payload.workerId).range(0, 999);
    tokens = ((data || []) as PushTokenRow[]).map((row) => row.token);
  }

  const result = await sendPushToTokens({
    tokens,
    title: "MistriHub job update",
    body: `${payload.service || "Your job"} is now ${payload.status}.`,
    url: `/jobs/${payload.jobId}`,
    jobId: payload.jobId
  });

  return NextResponse.json({ matched: tokens.length, ...result });
}
