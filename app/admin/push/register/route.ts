import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type AdminPushPayload = {
  token?: string;
  endpoint?: string;
  p256dh?: string;
  auth?: string;
};

export async function POST(request: Request) {
  if (!isAdminAuthed()) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const payload = (await request.json().catch(() => ({}))) as AdminPushPayload;
  if (!payload.token) return NextResponse.json({ ok: false, error: "Token missing." }, { status: 400 });
  if (!supabaseServer) return NextResponse.json({ ok: false, error: "Supabase server config missing." }, { status: 500 });

  const row = {
    token: payload.token,
    registration_key: `${payload.token}:admin:mistrihub-admin`,
    user_id: null,
    account_id: "mistrihub-admin",
    role: "admin",
    name: "MistriHub Admin",
    phone: null,
    service: "admin",
    worker_id: null,
    endpoint: payload.endpoint || null,
    p256dh: payload.p256dh || null,
    auth: payload.auth || null,
    last_seen: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseServer.from("push_tokens").upsert(row, { onConflict: "registration_key" });
  if (error) {
    console.error("Admin FCM token save failed", { error: error.message });
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
