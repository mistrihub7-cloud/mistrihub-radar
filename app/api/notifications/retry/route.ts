import { NextResponse } from "next/server";
import { processRetryJobs } from "@/lib/retry-alerts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const result = await processRetryJobs();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
