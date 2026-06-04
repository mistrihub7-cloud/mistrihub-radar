import { workers, type Worker, type WorkerStatus } from "./data";
import {
  getMockAccount,
  getMockJob,
  getMockJobs,
  saveMockAccount,
  saveWorkerRegistration,
  updateMockJob,
  type MockAccount,
  type MockJobRequest,
  type WorkerRegistration
} from "./mock-store";
import { hasSupabaseConfig, supabase } from "./supabase-client";

type JobRequestRow = {
  id: string;
  user_id: string | null;
  worker_id: string | null;
  service: string;
  problem_description: string;
  urgency: "Normal" | "Urgent" | "Emergency";
  preferred_date: string | null;
  preferred_time: string | null;
  area: string;
  photo_url: string | null;
  status: MockJobRequest["status"];
  created_at: string;
  quote_amount?: string | null;
  quote_note?: string | null;
  quote_eta?: string | null;
};

type WorkerRow = {
  id: string;
  created_at?: string | null;
  name: string;
  category?: string;
  skill?: string;
  location?: string;
  city?: string;
  service_area?: string;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number | string | null;
  review_count?: number | null;
  reviews?: number | null;
  trust_score?: number | null;
  trust?: number | null;
  jobs_completed?: number | null;
  jobs?: number | null;
  availability_status?: string | null;
  available_today?: boolean | null;
  service_radius?: number | null;
  fast_response_time?: number | null;
  phone?: string | null;
  whatsapp?: string | null;
  profile_photo?: string | null;
};

const JOB_SELECT =
  "id,user_id,worker_id,service,problem_description,urgency,preferred_date,preferred_time,area,photo_url,status,created_at,quote_amount,quote_note,quote_eta";
const JOB_SELECT_BASE =
  "id,user_id,worker_id,service,problem_description,urgency,preferred_date,preferred_time,area,photo_url,status,created_at";

function findWorker(workerId?: string | null) {
  return workers.find((worker) => worker.id === workerId);
}

function categorySlugFor(name: string) {
  const map: Record<string, string> = {
    Electrician: "electrician",
    Plumber: "plumber",
    Mechanic: "mechanic",
    Painter: "painter",
    "AC Repair": "ac-repair",
    Carpenter: "carpenter",
    Labour: "helper-labour",
    "Labour / Helper": "helper-labour",
    "Home Cleaning": "home-cleaning",
    Driver: "driver",
    Mason: "mason",
    Welder: "welder",
    "RO Service": "ro-service",
    CCTV: "cctv",
    "Tile / Marble": "tile-marble"
  };
  return map[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function mapJob(row: JobRequestRow, workerRow?: WorkerRow | null): MockJobRequest {
  const worker = findWorker(row.worker_id);
  return {
    id: row.id,
    workerId: row.worker_id || worker?.id || "",
    workerName: workerRow?.name || worker?.name || "Nearby matching workers",
    service: row.service,
    problem: row.problem_description,
    urgency: row.urgency,
    preferredDate: row.preferred_date || "",
    preferredTime: row.preferred_time || "",
    area: row.area,
    photoPreview: row.photo_url || "",
    status: row.status,
    createdAt: row.created_at,
    workerQuestion: "",
    quoteAmount: row.quote_amount || "",
    quoteNote: row.quote_note || "",
    quoteEta: row.quote_eta || ""
  };
}

function normalizeStatus(value?: string | null, availableToday?: boolean | null): WorkerStatus {
  if (value === "Available Today" || value === "Busy" || value === "Not Available") return value;
  return availableToday === false ? "Not Available" : "Available Today";
}

function normalizeRadius(value?: number | null): 5 | 10 | 15 | 20 {
  return value === 5 || value === 10 || value === 15 || value === 20 ? value : 10;
}

function mapWorker(row: WorkerRow): Worker {
  const status = normalizeStatus(row.availability_status, row.available_today);
  const rating = row.rating == null ? "0.0" : String(row.rating);
  return {
    id: row.id,
    name: row.name || "Worker",
    skill: row.category || row.skill || "Worker",
    location: row.location || row.service_area || "Saved location",
    city: row.city || "City",
    distance: "Distance after location",
    rating,
    reviews: Number(row.review_count ?? row.reviews ?? 0),
    trust: Number(row.trust_score ?? row.trust ?? 70),
    jobs: Number(row.jobs_completed ?? row.jobs ?? 0),
    response: row.fast_response_time ? `${row.fast_response_time} min` : "After request",
    status,
    serviceRadius: normalizeRadius(row.service_radius),
    distanceKm: 0,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    phone: row.phone || undefined,
    whatsapp: row.whatsapp || undefined,
    profilePhoto: row.profile_photo || undefined
  };
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(label)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function getSessionUserId() {
  return null;
}

export async function loadAccountFromSupabase() {
  return getMockAccount();
}

export async function saveProfileToSupabase(account: MockAccount) {
  saveMockAccount(account);
  if (!hasSupabaseConfig || !supabase || account.id.startsWith("mock-")) return { ok: true, fallback: true };

  const { error } = await supabase.from("profiles").upsert({
    id: account.id,
    full_name: account.name,
    phone: account.phone,
    email: account.email || null,
    role: account.role
  });

  return { ok: !error, error: error?.message };
}

export async function saveWorkerRegistrationToSupabase(profile: WorkerRegistration) {
  saveWorkerRegistration(profile);
  if (!hasSupabaseConfig || !supabase) return { ok: true, fallback: true };

  const radius = Number.parseInt(profile.serviceRadius, 10) || 10;
  const categorySlug = categorySlugFor(profile.skill);
  const workerId = profile.id;

  try {
    const result = await withTimeout(
      supabase.from("workers").upsert({
        id: workerId,
        user_id: null,
        name: profile.name,
        category: profile.skill,
        category_slug: categorySlug,
        experience_years: Number.parseInt(profile.experience, 10) || 0,
        rating: 0,
        review_count: 0,
        location: profile.location,
        city: profile.city,
        latitude: profile.latitude ?? null,
        longitude: profile.longitude ?? null,
        phone: profile.phone,
        whatsapp: profile.phone,
        profile_photo: profile.profilePhoto || "",
        short_description: `${profile.skill} service in ${profile.location}`,
        bio: `${profile.name} provides ${profile.skill} service from saved location in ${profile.city}.`,
        service_details: [profile.skill],
        available_today: profile.availability === "Available Today",
        service_radius: radius,
        availability_status: profile.availability,
        service_area: profile.location,
        verified_status: profile.idVerificationFile ? "Pending" : "Not Submitted"
      }),
      8000,
      "Supabase save timeout. workers table policy/columns/env check karo."
    );
    const { error } = result as { error?: { message?: string } | null };

    return { ok: !error, error: error?.message };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Worker save failed." };
  }
}

export async function createJobInSupabase(input: Omit<MockJobRequest, "id" | "createdAt" | "status" | "workerName">) {
  if (!hasSupabaseConfig || !supabase) {
    return null;
  }

  const userId = await getSessionUserId();
  const id = `MH${Date.now().toString().slice(-6)}`;

  const { data, error } = await supabase
    .from("job_requests")
    .insert({
      id,
      user_id: userId,
      worker_id: input.workerId || null,
      service: input.service,
      problem_description: input.problem,
      urgency: input.urgency,
      preferred_date: input.preferredDate || null,
      preferred_time: input.preferredTime || null,
      area: input.area,
      photo_url: input.photoPreview && !input.photoPreview.startsWith("data:") ? input.photoPreview : null,
      status: "Requested"
    })
    .select(JOB_SELECT_BASE)
    .single();

  if (error || !data) return null;

  await supabase.from("job_status_history").insert({ job_id: id, status: "Requested", note: "Job request created" });
  if (userId) {
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Job request created",
      message: `${input.service} request sent to worker.`,
      type: "new_job_request"
    });
  }

  return mapJob(data as JobRequestRow);
}

export async function loadJobsFromSupabase(owner: "user" | "worker" = "user") {
  if (!hasSupabaseConfig || !supabase) return getMockJobs();

  const userId = await getSessionUserId();
  let query = supabase
    .from("job_requests")
    .select(`${JOB_SELECT},workers(id,name,category,location,city)`)
    .order("created_at", { ascending: false });

  if (userId && owner === "user") {
    query = query.eq("user_id", userId);
  }

  if (userId && owner === "worker") {
    const { data: workerProfile } = await supabase.from("workers").select("id").eq("user_id", userId).maybeSingle();
    if (workerProfile?.id) {
      query = query.eq("worker_id", workerProfile.id);
    }
  }

  let { data, error } = (await query) as { data: any[] | null; error: { message?: string } | null };
  if (error) {
    let fallbackQuery = supabase
      .from("job_requests")
      .select(`${JOB_SELECT_BASE},workers(id,name,category,location,city)`)
      .order("created_at", { ascending: false });
    if (userId && owner === "user") fallbackQuery = fallbackQuery.eq("user_id", userId);
    if (userId && owner === "worker") {
      const { data: workerProfile } = await supabase.from("workers").select("id").eq("user_id", userId).maybeSingle();
      if (workerProfile?.id) fallbackQuery = fallbackQuery.eq("worker_id", workerProfile.id);
    }
    const fallback = await fallbackQuery;
    data = fallback.data;
    error = fallback.error;
  }
  if (error || !data) return getMockJobs();

  return data.map((row) => {
    const workerRow = Array.isArray(row.workers) ? row.workers[0] : row.workers;
    return mapJob(row as JobRequestRow, workerRow as WorkerRow | null);
  });
}

export async function loadJobFromSupabase(jobId: string) {
  if (!hasSupabaseConfig || !supabase) return getMockJob(jobId);

  const { data, error } = await supabase
    .from("job_requests")
    .select(`${JOB_SELECT},workers(id,name,category,location,city)`)
    .eq("id", jobId)
    .maybeSingle();

  if (error || !data) {
    const fallback = await supabase
      .from("job_requests")
      .select(`${JOB_SELECT_BASE},workers(id,name,category,location,city)`)
      .eq("id", jobId)
      .maybeSingle();
    if (fallback.error || !fallback.data) return getMockJob(jobId);
    const workerRow = Array.isArray(fallback.data.workers) ? fallback.data.workers[0] : fallback.data.workers;
    return mapJob(fallback.data as JobRequestRow, workerRow as WorkerRow | null);
  }
  const workerRow = Array.isArray(data.workers) ? data.workers[0] : data.workers;
  return mapJob(data as JobRequestRow, workerRow as WorkerRow | null);
}

export async function updateJobInSupabase(jobId: string, update: Partial<MockJobRequest>) {
  const localJob = updateMockJob(jobId, update);
  if (!hasSupabaseConfig || !supabase) return localJob;

  const dbUpdate: Record<string, string | null> = {};
  if (update.status) dbUpdate.status = update.status;
  if (update.workerId !== undefined) dbUpdate.worker_id = update.workerId || null;
  if (update.quoteAmount !== undefined) dbUpdate.quote_amount = update.quoteAmount || null;
  if (update.quoteNote !== undefined) dbUpdate.quote_note = update.quoteNote || null;
  if (update.quoteEta !== undefined) dbUpdate.quote_eta = update.quoteEta || null;

  if (Object.keys(dbUpdate).length) {
    let query = supabase
      .from("job_requests")
      .update(dbUpdate)
      .eq("id", jobId);

    if ((update.status === "Accepted" || update.status === "Quote Sent") && update.workerId) {
      query = query.in("status", ["Requested", "Need More Details"]);
    }

    const { data, error } = await query
      .select(JOB_SELECT)
      .maybeSingle();

    if (!error && data && update.status) {
      await supabase.from("job_status_history").insert({ job_id: jobId, status: update.status, note: "Status updated" });
      return mapJob(data as JobRequestRow);
    }

    if (error && (update.quoteAmount !== undefined || update.quoteNote !== undefined || update.quoteEta !== undefined)) {
      const fallbackUpdate: Record<string, string | null> = {};
      if (update.status) fallbackUpdate.status = update.status;
      if (update.workerId !== undefined) fallbackUpdate.worker_id = update.workerId || null;
      let fallbackQuery = supabase.from("job_requests").update(fallbackUpdate).eq("id", jobId);
      if ((update.status === "Accepted" || update.status === "Quote Sent") && update.workerId) {
        fallbackQuery = fallbackQuery.in("status", ["Requested", "Need More Details"]);
      }
      const fallback = await fallbackQuery.select(JOB_SELECT_BASE).maybeSingle();
      if (!fallback.error && fallback.data && update.status) {
        await supabase.from("job_status_history").insert({ job_id: jobId, status: update.status, note: "Status updated" });
        return { ...mapJob(fallback.data as JobRequestRow), ...update };
      }
    }

    if ((update.status === "Accepted" || update.status === "Quote Sent") && update.workerId && !data) {
      return loadJobFromSupabase(jobId);
    }
  }

  if (update.workerQuestion) {
    const userId = await getSessionUserId();
    if (userId) {
      await supabase.from("request_messages").insert({ job_id: jobId, sender_id: userId, message: update.workerQuestion });
    }
  }

  return localJob;
}

export async function saveWorkerSettingsToSupabase(settings: { availability: string; serviceRadius: string }) {
  if (!hasSupabaseConfig || !supabase) return { ok: true, fallback: true };

  const userId = await getSessionUserId();
  if (!userId) return { ok: true, fallback: true };

  const { error } = await supabase
    .from("workers")
    .update({
      availability_status: settings.availability,
      available_today: settings.availability === "Available Today",
      service_radius: Number.parseInt(settings.serviceRadius, 10) || 10
    })
    .eq("user_id", userId);

  return { ok: !error, error: error?.message };
}

export async function loadWorkersFromSupabase() {
  if (!hasSupabaseConfig || !supabase) return workers;

  try {
    const result = await withTimeout(supabase.from("workers").select("*"), 8000, "Supabase workers load timeout.");
    const { data, error } = result as { data?: WorkerRow[] | null; error?: { message?: string } | null };
    if (error || !data) return workers;

    return [...data]
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      })
      .map(mapWorker);
  } catch {
    return workers;
  }
}

export async function loadWorkerFromSupabase(workerId: string) {
  if (!hasSupabaseConfig || !supabase) return workers.find((worker) => worker.id === workerId) || null;

  const { data, error } = await supabase.from("workers").select("*").eq("id", workerId).maybeSingle();
  if (error || !data) return workers.find((worker) => worker.id === workerId) || null;

  return mapWorker(data as WorkerRow);
}
