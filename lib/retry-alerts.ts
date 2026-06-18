import { sendBookingAlerts, type BookingAlertInput } from "./booking-alerts";
import { supabaseServer } from "./supabase-server";

export type RetryJobRow = {
  id: string;
  worker_id?: string | null;
  service?: string | null;
  problem_description?: string | null;
  urgency?: string | null;
  area?: string | null;
  user_latitude?: number | null;
  user_longitude?: number | null;
  status?: string | null;
  created_at?: string | null;
};

function minutesSince(value?: string | null) {
  if (!value) return 0;
  return Math.floor((Date.now() - new Date(value).getTime()) / 60000);
}

async function hasWorkerResponse(jobId: string) {
  if (!supabaseServer) return false;
  const { data } = await supabaseServer
    .from("request_messages")
    .select("id")
    .eq("job_id", jobId)
    .eq("sender_role", "worker")
    .limit(1);
  return Boolean(data?.length);
}

function bookingInput(job: RetryJobRow): BookingAlertInput {
  return {
    jobId: job.id,
    service: job.service || "",
    problem: job.problem_description || "",
    urgency: job.urgency || "Normal",
    area: job.area || "",
    userLatitude: job.user_latitude ?? null,
    userLongitude: job.user_longitude ?? null
  };
}

export async function processRetryForJob(job: RetryJobRow) {
  if (!supabaseServer) return { ok: false, jobId: job.id, reason: "Supabase server config missing." };
  if (job.status !== "Requested") return { ok: true, skipped: true, jobId: job.id, reason: `Status is ${job.status || "missing"}.` };

  const age = minutesSince(job.created_at);
  if (await hasWorkerResponse(job.id)) {
    return { ok: true, skipped: true, jobId: job.id, reason: "Professional chat response already received." };
  }

  const input = bookingInput(job);
  if (job.urgency === "Emergency") {
    if (age >= 2) {
      return sendBookingAlerts(input, {
        radiusKm: 20,
        maxWorkers: 25,
        waveKey: "Emergency 20km admin alert",
        excludeAlreadyNotified: true,
        adminAlert: true
      });
    }
    return { ok: true, skipped: true, jobId: job.id, reason: "Emergency admin wave not due yet." };
  }

  if (job.worker_id) {
    if (age >= 10) {
      return sendBookingAlerts(input, {
        radiusKm: 20,
        maxWorkers: 20,
        waveKey: "Direct fallback 20km admin alert",
        excludeAlreadyNotified: true,
        adminAlert: true
      });
    }
    if (age >= 5) {
      return sendBookingAlerts(input, {
        radiusKm: 15,
        maxWorkers: 15,
        waveKey: "Direct fallback 15km alert",
        excludeAlreadyNotified: true
      });
    }
    if (age >= 2) {
      return sendBookingAlerts(input, {
        radiusKm: 10,
        maxWorkers: 10,
        waveKey: "Direct fallback 10km alert",
        excludeAlreadyNotified: true
      });
    }
    return { ok: true, skipped: true, jobId: job.id, reason: "Direct fallback wave not due yet." };
  }

  if (age >= 10) {
    return sendBookingAlerts(input, {
      radiusKm: 20,
      maxWorkers: 20,
      waveKey: "Retry 20km alert",
      excludeAlreadyNotified: true,
      adminAlert: true
    });
  }
  if (age >= 5) {
    return sendBookingAlerts(input, {
      radiusKm: 15,
      maxWorkers: 15,
      waveKey: "Retry 15km alert",
      excludeAlreadyNotified: true
    });
  }
  if (age >= 2) {
    return sendBookingAlerts(input, {
      radiusKm: 10,
      maxWorkers: 10,
      waveKey: "Retry 10km alert",
      excludeAlreadyNotified: true
    });
  }
  return { ok: true, skipped: true, jobId: job.id, reason: "Retry wave not due yet." };
}

export async function loadRetryJobs(limit = 100) {
  if (!supabaseServer) return { data: [] as RetryJobRow[], error: { message: "Supabase server config missing." } };
  return supabaseServer
    .from("job_requests")
    .select("id,worker_id,service,problem_description,urgency,area,user_latitude,user_longitude,status,created_at")
    .eq("status", "Requested")
    .order("created_at", { ascending: true })
    .range(0, limit);
}

export async function processRetryJobs() {
  const { data, error } = await loadRetryJobs();
  if (error) return { ok: false, checked: 0, error: error.message, results: [] as any[] };

  const results = [];
  for (const job of data || []) {
    results.push(await processRetryForJob(job as RetryJobRow));
  }
  return { ok: true, checked: data?.length || 0, results };
}
