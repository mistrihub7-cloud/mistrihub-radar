import { NextResponse } from "next/server";
import { cleanCategoryName } from "@/lib/category-display";
import { normalizePhone, sendPushToTokens, type PushTokenRow } from "@/lib/push-server";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type JobCreatedPayload = {
  jobId?: string;
  service?: string;
  area?: string;
  problem?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as JobCreatedPayload;
  if (!payload.jobId || !payload.service) {
    return NextResponse.json({ ok: false, error: "Job ID and service required." }, { status: 400 });
  }
  if (!supabaseServer) return NextResponse.json({ ok: false, error: "Supabase server config missing." }, { status: 500 });

  const { data, error } = await supabaseServer
    .from("push_tokens")
    .select("token,role,service")
    .eq("role", "worker")
    .eq("service", payload.service)
    .range(0, 999);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const rows = (data || []) as PushTokenRow[];
  const serviceLabel = cleanCategoryName(payload.service);
  const result = await sendPushToTokens({
    tokens: rows.map((row) => row.token),
    title: "New MistriHub.In job request",
    body: `${serviceLabel} request in ${payload.area || "your area"}. ${payload.problem?.slice(0, 80) || ""}`,
    url: `/jobs/${payload.jobId}`,
    jobId: payload.jobId
  });

  return NextResponse.json({ matched: rows.length, ...result });
}

export async function DELETE(request: Request) {
  const { phone } = (await request.json().catch(() => ({}))) as { phone?: string };
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || !supabaseServer) return NextResponse.json({ ok: false }, { status: 400 });
  await supabaseServer.from("push_tokens").delete().ilike("phone", `%${cleanPhone}`);
  return NextResponse.json({ ok: true });
}
