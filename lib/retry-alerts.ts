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

function isStillSeekingConfirmation(status?: string | null) {
  return ["Requested", "Need More Details", "Accepted", "Quote Sent"].includes(status || "");
}

async function isDirectProfileRequest(jobId: string) {
  if (!supabaseServer) return false;
  const { data } = await supabaseServer
    .from("job_status_history")
    .select("id")
    .eq("job_id", jobId)
    .eq("status", "Selected professional alert")
    .maybeSingle();
  return Boolean(data);
}

export async function processRetryForJob(job: RetryJobRow) {
  if (!supabaseServer) return { ok: false, jobId: job.id, reason: "Supabase server config missing." };
  if (!isStillSeekingConfirmation(job.status)) return { ok: true, skipped: true, jobId: job.id, reason: `Booking already final or closed: ${job.status || "missing"}.` };

  const age = minutesSince(job.created_at);
  const input = bookingInput(job);
  const directProfileRequest = Boolean(job.worker_id && (await isDirectProfileRequest(job.id)));

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

  if (directProfileRequest) {
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

  if (job.urgency === "Urgent") {
    if (age >= 5) {
      return sendBookingAlerts(input, {
        radiusKm: 20,
        maxWorkers: 20,
        waveKey: "Urgent 20km admin alert",
        excludeAlreadyNotified: true,
        adminAlert: true
      });
    }
    if (age >= 2) {
      return sendBookingAlerts(input, {
        radiusKm: 15,
        maxWorkers: 15,
        waveKey: "Urgent 15km alert",
        excludeAlreadyNotified: true
      });
    }
    return { ok: true, skipped: true, jobId: job.id, reason: "Urgent retry wave not due yet." };
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
    .in("status", ["Requested", "Need More Details", "Accepted", "Quote Sent"])
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
