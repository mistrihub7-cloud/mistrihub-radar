import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type PushTokenPayload = {
  token?: string;
  accountId?: string;
  role?: string;
  name?: string;
  phone?: string;
  service?: string;
  workerId?: string;
  endpoint?: string;
  p256dh?: string;
  auth?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as PushTokenPayload;
  if (!payload.token) return NextResponse.json({ ok: false, error: "Token missing." }, { status: 400 });
  if (!supabaseServer) return NextResponse.json({ ok: false, error: "Supabase server config missing." }, { status: 500 });

  const { error } = await supabaseServer.from("push_tokens").upsert(
    {
      token: payload.token,
      user_id: payload.accountId || null,
      account_id: payload.accountId || null,
      role: payload.role === "worker" ? "worker" : "user",
      name: payload.name || null,
      phone: payload.phone || null,
      service: payload.service || null,
      worker_id: payload.workerId || null,
      endpoint: payload.endpoint || null,
      p256dh: payload.p256dh || null,
      auth: payload.auth || null,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "token" }
  );

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
