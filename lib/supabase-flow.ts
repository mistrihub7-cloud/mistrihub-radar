import { workers, type Worker, type WorkerStatus } from "./data";
import {
  getMockAccount,
  getMockJob,
  getMockJobs,
  getWorkerRegistration,
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
  customer_name?: string | null;
  customer_phone?: string | null;
  user_latitude?: number | null;
  user_longitude?: number | null;
  quote_amount?: string | null;
  quote_note?: string | null;
  quote_eta?: string | null;
};

type WorkerRow = {
  id: string;
  user_id?: string | null;
  created_at?: string | null;
  name: string;
  category?: string;
  category_slug?: string | null;
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
  experience_years?: number | string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  profile_photo?: string | null;
};

type CreateJobInput = Omit<MockJobRequest, "id" | "createdAt" | "status" | "workerName">;

const JOB_SELECT =
  "id,user_id,worker_id,service,problem_description,urgency,preferred_date,preferred_time,area,photo_url,status,created_at,customer_name,customer_phone,user_latitude,user_longitude,quote_amount,quote_note,quote_eta";
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
    customerName: row.customer_name || undefined,
    customerPhone: row.customer_phone || undefined,
    userLatitude: row.user_latitude ?? undefined,
    userLongitude: row.user_longitude ?? undefined,
    photoPreview: row.photo_url || "",
    status: row.status,
    createdAt: row.created_at,
    workerQuestion: "",
    quoteAmount: row.quote_amount || "",
    quoteNote: row.quote_note || "",
    quoteEta: row.quote_eta || ""
  };
}

function normalizeContact(value?: string | null) {
  return (value || "").replace(/\D/g, "");
}

function normalizeEmail(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function workerIdentityKey(row: WorkerRow) {
  const email = normalizeEmail(row.email);
  if (email) return `email:${email}`;
  const phone = normalizeContact(row.phone || row.whatsapp).slice(-10);
  return phone ? `phone:${phone}` : `id:${row.id}`;
}

function workerMatchesLogin(row: WorkerRow, login: { phone?: string; email?: string }) {
  const loginEmail = normalizeEmail(login.email);
  if (loginEmail && normalizeEmail(row.email) === loginEmail) return true;

  const loginPhone = normalizeContact(login.phone).slice(-10);
  const workerPhone = normalizeContact(row.phone || row.whatsapp).slice(-10);
  return Boolean(loginPhone && workerPhone && loginPhone === workerPhone);
}

function jobBelongsToAccount(row: JobRequestRow, account: MockAccount | null) {
  if (!account) return false;
  const accountPhone = normalizeContact(account.phone);
  const jobPhone = normalizeContact(row.customer_phone);
  if (accountPhone && jobPhone) return accountPhone.slice(-10) === jobPhone.slice(-10);

  const accountName = account.name.trim().toLowerCase();
  const customerName = (row.customer_name || "").trim().toLowerCase();
  return Boolean(accountName && customerName && accountName === customerName);
}

function mockJobBelongsToAccount(job: MockJobRequest, account: MockAccount | null) {
  if (!account) return false;
  const accountPhone = normalizeContact(account.phone);
  const jobPhone = normalizeContact(job.customerPhone);
  if (accountPhone && jobPhone) return accountPhone.slice(-10) === jobPhone.slice(-10);

  const accountName = account.name.trim().toLowerCase();
  const customerName = (job.customerName || "").trim().toLowerCase();
  return Boolean(accountName && customerName && accountName === customerName);
}

function normalizeStatus(value?: string | null, availableToday?: boolean | null): WorkerStatus {
  if (value === "Available Today" || value === "Busy" || value === "Not Available") return value;
  return availableToday === false ? "Not Available" : "Available Today";
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isValidCoordinate(latitude?: number, longitude?: number) {
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

function isUuid(value?: string | null) {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
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

function mapWorkerRegistration(row: WorkerRow): WorkerRegistration {
  const radius = normalizeRadius(row.service_radius);
  return {
    id: row.id,
    role: "worker",
    name: row.name || "Worker",
    phone: row.phone || row.whatsapp || "",
    email: row.email || undefined,
    skill: row.category || row.skill || "Worker",
    experience: row.experience_years ? String(row.experience_years) : "0",
    city: row.city || "City",
    location: row.location || row.service_area || row.city || "Saved location",
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    serviceRadius: `${radius} km`,
    availability: normalizeStatus(row.availability_status, row.available_today),
    profilePhoto: row.profile_photo || "",
    idVerificationFile: ""
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
  if (!hasSupabaseConfig || !supabase || !isUuid(account.id)) return { ok: true, fallback: true };

  try {
    const { error } = await supabase.from("profiles").upsert({
      id: account.id,
      full_name: account.name,
      phone: account.phone,
      email: account.email || null,
      role: account.role
    });

    return { ok: !error, error: error?.message };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Profile save failed." };
  }
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
    if (!error && profile.email) {
      try {
        await supabase
          .from("workers")
          .update({ email: profile.email })
          .eq("id", workerId)
          .throwOnError();
      } catch {
        // Older workers tables may not have the optional email column yet.
      }
    }

    return { ok: !error, error: error?.message };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Worker save failed." };
  }
}

export async function findWorkerRegistrationByLogin(login: { phone?: string; email?: string }) {
  if (!hasSupabaseConfig || !supabase) return null;

  const loginEmail = normalizeEmail(login.email);
  const loginPhone = normalizeContact(login.phone).slice(-10);
  if (!loginEmail && !loginPhone) return null;

  try {
    const result = await withTimeout(
      supabase.from("workers").select("*").order("created_at", { ascending: false }).range(0, 999),
      8000,
      "Supabase worker login lookup timeout."
    );
    const { data, error } = result as { data?: WorkerRow[] | null; error?: { message?: string } | null };
    if (error || !data) return null;

    const match = data.find((worker) => workerMatchesLogin(worker, login));
    return match ? mapWorkerRegistration(match) : null;
  } catch {
    return null;
  }
}

async function loadMatchingWorkersForJob(input: CreateJobInput) {
  if (!supabase) return [];

  const { data, error } = await supabase.from("workers").select("*").range(0, 999);
  if (error || !data) return [];

  const selectedCategorySlug = categorySlugFor(input.service);
  const hasUserCoordinates = isValidCoordinate(input.userLatitude, input.userLongitude);

  return (data as WorkerRow[])
    .filter((worker) => {
      if (input.workerId) return worker.id === input.workerId;

      const workerCategorySlug = worker.category_slug || categorySlugFor(worker.category || worker.skill || "");
      if (workerCategorySlug !== selectedCategorySlug) return false;

      const status = normalizeStatus(worker.availability_status, worker.available_today);
      if (status === "Not Available") return false;

      if (!hasUserCoordinates || !isValidCoordinate(worker.latitude ?? undefined, worker.longitude ?? undefined)) return true;

      const distance = distanceKm(
        { latitude: input.userLatitude as number, longitude: input.userLongitude as number },
        { latitude: worker.latitude as number, longitude: worker.longitude as number }
      );
      const radius = Number(worker.service_radius || 10);
      return distance <= radius;
    })
    .sort((a, b) => {
      const aStatus = normalizeStatus(a.availability_status, a.available_today);
      const bStatus = normalizeStatus(b.availability_status, b.available_today);
      if (aStatus !== bStatus) return aStatus === "Available Today" ? -1 : 1;
      return Number(b.trust_score ?? b.trust ?? 70) - Number(a.trust_score ?? a.trust ?? 70);
    })
    .slice(0, 25);
}

async function notifyMatchingWorkers(jobId: string, input: CreateJobInput) {
  if (!supabase) return 0;

  try {
    const matchingWorkers = await loadMatchingWorkersForJob(input);
    if (!matchingWorkers.length) return 0;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mistrihub-radar.vercel.app";
    const requestUrl = `${siteUrl}/jobs/${jobId}`;
    const summary = input.problem.trim().slice(0, 120);

    const websiteNotifications = matchingWorkers.map((worker) => ({
      user_id: worker.user_id || null,
      title: "New job request",
      message: `${input.service} request in ${input.area}. ${input.urgency}. ${summary}`,
      type: "new_job_request"
    }));

    const whatsappNotifications = matchingWorkers.map((worker) => ({
      user_id: worker.user_id || null,
      title: "WhatsApp: new job request",
      message: `New job request\nService: ${input.service}\nArea: ${input.area}\nProblem: ${summary}\nOpen: ${requestUrl}`,
      type: "whatsapp_notification"
    }));

    const { error } = await supabase.from("notifications").insert([...websiteNotifications, ...whatsappNotifications]);
    if (error) return 0;
    return matchingWorkers.length;
  } catch {
    return 0;
  }
}

export async function createJobInSupabase(input: CreateJobInput) {
  if (!hasSupabaseConfig || !supabase) {
    return null;
  }

  try {
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

    try {
      await supabase
        .from("job_requests")
        .update({
          customer_name: input.customerName || null,
          customer_phone: input.customerPhone || null,
          user_latitude: input.userLatitude ?? null,
          user_longitude: input.userLongitude ?? null
        })
        .eq("id", id)
        .throwOnError();
    } catch {
      // Older databases may not have the optional contact/location columns yet.
    }

    try {
      await supabase
        .from("job_status_history")
        .insert({ job_id: id, status: "Requested", note: "Job request created" })
        .throwOnError();
    } catch {
      // History is helpful, but the job request itself is the important record.
    }
    await notifyMatchingWorkers(id, input);

    return mapJob(data as JobRequestRow);
  } catch {
    return null;
  }
}

export async function loadJobsFromSupabase(owner: "user" | "worker" = "user") {
  if (!hasSupabaseConfig || !supabase) {
    const localJobs = getMockJobs();
    return owner === "user" ? localJobs.filter((job) => mockJobBelongsToAccount(job, getMockAccount())) : localJobs;
  }

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

  const account = owner === "user" ? getMockAccount() : null;
  const visibleRows = owner === "user" && !userId ? data.filter((row) => jobBelongsToAccount(row as JobRequestRow, account)) : data;

  return visibleRows.map((row) => {
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
  const workerProfile = getWorkerRegistration();
  const update = {
    availability_status: settings.availability,
    available_today: settings.availability === "Available Today",
    service_radius: Number.parseInt(settings.serviceRadius, 10) || 10
  };

  if (userId) {
    const { data, error } = await supabase.from("workers").update(update).eq("user_id", userId).select("id").maybeSingle();
    return { ok: !error && Boolean(data), error: error?.message || (!data ? "Worker row not found." : undefined) };
  }

  if (!workerProfile?.id) return { ok: true, fallback: true };

  const { data, error } = await supabase.from("workers").update(update).eq("id", workerProfile.id).select("id").maybeSingle();
  return { ok: !error && Boolean(data), error: error?.message || (!data ? "Worker row not found." : undefined) };
}

export async function loadWorkersFromSupabase() {
  if (!hasSupabaseConfig || !supabase) return workers;

  try {
    const result = await withTimeout(
      supabase.from("workers").select("*").order("created_at", { ascending: false }).range(0, 999),
      8000,
      "Supabase workers load timeout."
    );
    const { data, error } = result as { data?: WorkerRow[] | null; error?: { message?: string } | null };
    if (error || !data) return workers;

    const seenWorkers = new Set<string>();
    return [...data]
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      })
      .filter((row) => {
        const key = workerIdentityKey(row);
        if (seenWorkers.has(key)) return false;
        seenWorkers.add(key);
        return true;
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
