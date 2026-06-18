import { NextResponse } from "next/server";
import { normalizePhone, sendPushToTokens, type PushTokenRow } from "@/lib/push-server";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type ChatPushPayload = {
  jobId?: string;
  senderRole?: "user" | "worker";
  workerId?: string;
  customerPhone?: string;
  senderName?: string;
  message?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ChatPushPayload;
  if (!payload.jobId || !payload.senderRole) {
    return NextResponse.json({ ok: false, error: "Job ID and sender role required." }, { status: 400 });
  }
  if (!supabaseServer) return NextResponse.json({ ok: false, error: "Supabase server config missing." }, { status: 500 });

  let tokens: string[] = [];
  if (payload.senderRole === "worker") {
    const cleanPhone = normalizePhone(payload.customerPhone);
    const { data } = await supabaseServer.from("push_tokens").select("token,phone,role").eq("role", "user").range(0, 999);
    tokens = ((data || []) as PushTokenRow[]).filter((row) => normalizePhone(row.phone) === cleanPhone).map((row) => row.token);
  } else if (payload.workerId) {
    const { data } = await supabaseServer.from("push_tokens").select("token,worker_id,role").eq("role", "worker").eq("worker_id", payload.workerId).range(0, 999);
    tokens = ((data || []) as PushTokenRow[]).map((row) => row.token);
  }

  const result = await sendPushToTokens({
    tokens,
    title: "New MistriHub.In chat message",
    body: `${payload.senderName || "MistriHub user"}: ${(payload.message || "New message").slice(0, 90)}`,
    url: `/jobs/${payload.jobId}#job-chat`,
    jobId: payload.jobId
  });

  await supabaseServer.from("notification_logs").insert({
    request_id: payload.jobId,
    worker_id: payload.workerId || null,
    phone: normalizePhone(payload.customerPhone) || null,
    channel: "web_push",
    status: result.sent > 0 ? "sent" : "failed",
    error_message: result.sent > 0 ? null : result.reason || "No matching token or Firebase chat push failed"
  });

  return NextResponse.json({ matched: tokens.length, ...result });
}
