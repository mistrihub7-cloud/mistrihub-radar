import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type LocationPayload = {
  accountId?: string | null;
  role?: string | null;
  phone?: string | null;
  label?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
};

function validCoordinate(latitude?: number | null, longitude?: number | null) {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as LocationPayload;
  if (!validCoordinate(payload.latitude, payload.longitude)) {
    return NextResponse.json({ ok: false, error: "Valid latitude/longitude required." }, { status: 400 });
  }
  if (!supabaseServer) return NextResponse.json({ ok: false, error: "Supabase server config missing." }, { status: 500 });

  const { error } = await supabaseServer.from("user_locations").upsert(
    {
      account_id: payload.accountId || payload.phone || "guest",
      role: payload.role === "worker" ? "worker" : "user",
      phone: payload.phone || null,
      label: payload.label || null,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy ?? null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "account_id,role" }
  );

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
