import { workers, type Worker, type WorkerStatus } from "./data";
import { professionalCategoryName } from "./category-display";
import {
  getMockAccount,
  getMockJob,
  getMockJobs,
  getMockRequestMessages,
  getWorkerRegistration,
  addMockRequestMessage,
  saveMockAccount,
  saveWorkerRegistration,
  updateMockJob,
  type MockAccount,
  type MockJobRequest,
  type MockRequestMessage,
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
  photo_url_2?: string | null;
  status: MockJobRequest["status"];
  created_at: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  user_latitude?: number | null;
  user_longitude?: number | null;
  worker_question?: string | null;
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

type ProfileRow = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  role?: MockAccount["role"] | null;
};

type RequestMessageRow = {
  id: string;
  job_id: string;
  worker_id?: string | null;
  worker_name?: string | null;
  sender_role?: MockAccount["role"] | null;
  sender_name?: string | null;
  message: string;
  created_at: string;
};

type WorkerReviewRow = {
  id: string;
  job_id: string;
  worker_id: string;
  customer_name?: string | null;
  rating: number;
  comment?: string | null;
  created_at: string;
};

type JobStatusHistoryRow = {
  job_id: string;
  status: string;
  note?: string | null;
  created_at: string | null;
};

export type JobDispatchEvent = {
  status: string;
  note: string;
  createdAt: string;
};

type CreateJobInput = Omit<MockJobRequest, "id" | "createdAt" | "status" | "workerName">;

const JOB_SELECT =
  "id,user_id,worker_id,service,problem_description,urgency,preferred_date,preferred_time,area,photo_url,photo_url_2,status,created_at,customer_name,customer_phone,user_latitude,user_longitude,worker_question,quote_amount,quote_note,quote_eta";
const JOB_SELECT_BASE =
  "id,user_id,worker_id,service,problem_description,urgency,preferred_date,preferred_time,area,photo_url,status,created_at";
const LOCAL_REVIEWS_KEY = "mistrihub.workerReviews";

function findWorker(workerId?: string | null) {
  return workers.find((worker) => worker.id === workerId);
}

function categorySlugFor(name: string) {
  const map: Record<string, string> = {
    Electrician: "electrician",
    "Electrical Expert": "electrician",
    Plumber: "plumber",
    "Plumbing Expert": "plumber",
    Mechanic: "mechanic",
    "Auto Mechanic": "mechanic",
    Painter: "painter",
    "Painting Professional": "painter",
    "AC Repair": "ac-repair",
    "AC Service Expert": "ac-repair",
    Carpenter: "carpenter",
    "Woodwork Expert": "carpenter",
    Labour: "helper-labour",
    "Labour / Helper": "helper-labour",
    "Labour Helper": "helper-labour",
    "Skilled Professional": "helper-labour",
    "Support Assistant": "helper-labour",
    "Home Cleaning": "home-cleaning",
    "Home Cleaning Expert": "home-cleaning",
    Driver: "driver",
    "Driver / Car Booking": "driver",
    "Driver Car Booking": "driver",
    "Driver & Car Service": "driver",
    Mason: "mason",
    "Construction Mason": "mason",
    Welder: "welder",
    "Welding Expert": "welder",
    "RO Service": "ro-service",
    "RO Water Technician": "ro-service",
    CCTV: "cctv",
    "CCTV Security Expert": "cctv",
    "Tile / Marble": "tile-marble",
    "Tile Marble": "tile-marble",
    "Tile & Marble Expert": "tile-marble"
  };
  return map[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function displayCategoryName(name?: string | null) {
  return professionalCategoryName(name);
}

function mapJob(row: JobRequestRow, workerRow?: WorkerRow | null): MockJobRequest {
  const worker = findWorker(row.worker_id);
  return {
    id: row.id,
    workerId: row.worker_id || worker?.id || "",
    workerName: workerRow?.name || worker?.name || "Nearby matching professionals",
    workerPhone: workerRow?.phone || workerRow?.whatsapp || worker?.phone || "",
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
    photoPreview2: row.photo_url_2 || "",
    status: row.status,
    createdAt: row.created_at,
    completedAt: undefined,
    workerQuestion: row.worker_question || "",
    quoteAmount: row.quote_amount || "",
    quoteNote: row.quote_note || "",
    quoteEta: row.quote_eta || ""
  };
}

async function loadCompletedDates(jobIds: string[]) {
  const ids = Array.from(new Set(jobIds.filter(Boolean)));
  const completedDates = new Map<string, string>();
  if (!hasSupabaseConfig || !supabase || !ids.length) return completedDates;

  const { data, error } = await supabase
    .from("job_status_history")
    .select("job_id,status,created_at")
    .in("job_id", ids)
    .eq("status", "Completed")
    .order("created_at", { ascending: false });

  if (error || !data) return completedDates;

  (data as JobStatusHistoryRow[]).forEach((row) => {
    if (row.job_id && row.created_at && !completedDates.has(row.job_id)) {
      completedDates.set(row.job_id, row.created_at);
    }
  });

  return completedDates;
}

function attachCompletedDates(jobs: MockJobRequest[], completedDates: Map<string, string>) {
  return jobs.map((job) => ({
    ...job,
    completedAt: job.completedAt || completedDates.get(job.id)
  }));
}

export async function loadJobDispatchEvents(jobId: string): Promise<JobDispatchEvent[]> {
  if (!hasSupabaseConfig || !supabase || !jobId) return [];

  const { data, error } = await supabase
    .from("job_status_history")
    .select("status,note,created_at")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as Array<{ status?: string | null; note?: string | null; created_at?: string | null }>)
    .filter((row) => {
      const status = row.status || "";
      return row.created_at && (status.toLowerCase().includes("alert") || ["Requested", "Accepted", "Quote Accepted", "Completed"].includes(status));
    })
    .map((row) => ({
      status: row.status || "",
      note: row.note || "",
      createdAt: row.created_at || ""
    }));
}

function normalizeContact(value?: string | null) {
  return (value || "").replace(/\D/g, "");
}

function normalizeEmail(value?: string | null) {
  return (value || "").trim().toLowerCase();
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

function calculateTrustScore(input: {
  jobs: number;
  reviews: number;
  rating: number;
  status: WorkerStatus;
  hasContact: boolean;
  hasLocation: boolean;
}) {
  const ratingBonus = input.reviews ? Math.max(0, Math.min(10, Math.round((input.rating - 3.5) * 8))) : 0;
  const score =
    55 +
    (input.hasContact ? 5 : 0) +
    (input.hasLocation ? 5 : 0) +
    (input.status === "Available Today" ? 5 : input.status === "Busy" ? 2 : 0) +
    Math.min(input.jobs * 3, 15) +
    Math.min(input.reviews * 2, 10) +
    ratingBonus;

  return Math.max(50, Math.min(95, score));
}

function mapWorker(row: WorkerRow): Worker {
  const status = normalizeStatus(row.availability_status, row.available_today);
  const rawRating = Number(row.rating ?? 0);
  const reviews = Number(row.review_count ?? row.reviews ?? 0);
  const jobs = Number(row.jobs_completed ?? row.jobs ?? 0);
  const rating = reviews && rawRating ? rawRating.toFixed(1) : "0.0";
  const trust = calculateTrustScore({
    jobs,
    reviews,
    rating: rawRating,
    status,
    hasContact: Boolean(row.phone || row.whatsapp),
    hasLocation: isValidCoordinate(row.latitude ?? undefined, row.longitude ?? undefined)
  });
  return {
    id: row.id,
    name: row.name || "Professional",
    skill: displayCategoryName(row.category || row.skill),
    location: row.location || row.service_area || "Saved location",
    city: row.city || "City",
    distance: "Distance after location",
    rating,
    reviews,
    trust,
    jobs,
    response: row.fast_response_time ? `${row.fast_response_time} min` : "After request",
    experience: row.experience_years
      ? `${row.experience_years}${String(row.experience_years).toLowerCase().includes("year") ? "" : " years"}`
      : undefined,
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
    name: row.name || "Professional",
    phone: row.phone || row.whatsapp || "",
    email: row.email || undefined,
    skill: displayCategoryName(row.category || row.skill),
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

function mapRequestMessage(row: RequestMessageRow): MockRequestMessage {
  return {
    id: row.id,
    jobId: row.job_id,
    workerId: row.worker_id || undefined,
    workerName: row.worker_name || undefined,
    senderRole: row.sender_role === "worker" ? "worker" : "user",
    senderName: row.sender_name || (row.sender_role === "worker" ? "Worker" : "User"),
    message: row.message,
    createdAt: row.created_at
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
  const normalizedPhone = normalizeContact(account.phone).slice(-10);
  const normalizedEmail = normalizeEmail(account.email);
  const existingAccount = await findUserAccountByLogin({ phone: normalizedPhone, email: normalizedEmail || undefined });
  const profileId = existingAccount?.id || (isUuid(account.id) ? account.id : globalThis.crypto?.randomUUID?.() || account.id);
  const accountToSave: MockAccount = {
    ...account,
    id: profileId,
    phone: normalizedPhone || account.phone.trim(),
    email: normalizedEmail || undefined
  };

  saveMockAccount(accountToSave);
  if (!hasSupabaseConfig || !supabase || !isUuid(accountToSave.id)) return { ok: true, fallback: true };

  try {
    const { error } = await supabase.from("profiles").upsert({
      id: accountToSave.id,
      full_name: accountToSave.name,
      phone: accountToSave.phone,
      email: accountToSave.email || null,
      role: accountToSave.role
    });

    return { ok: !error, error: error?.message, account: accountToSave };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Profile save failed." };
  }
}

export async function saveWorkerRegistrationToSupabase(profile: WorkerRegistration) {
  if (!hasSupabaseConfig || !supabase) {
    saveWorkerRegistration(profile);
    return { ok: true, fallback: true, workerId: profile.id };
  }

  const existingProfile = await findWorkerRegistrationByLogin({ phone: profile.phone, email: profile.email });
  const profileToSave = existingProfile ? { ...profile, id: existingProfile.id } : profile;
  saveWorkerRegistration(profileToSave);

  const radius = Number.parseInt(profile.serviceRadius, 10) || 10;
  const categorySlug = categorySlugFor(profile.skill);
  const workerId = profileToSave.id;
  const contactPhone = profile.phone.trim();
  const corePayload = {
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
    email: profile.email || null,
    phone: contactPhone,
    whatsapp: contactPhone,
    profile_photo: profile.profilePhoto || "",
    available_today: profile.availability === "Available Today",
    service_radius: radius,
    availability_status: profile.availability,
    service_area: profile.location
  };

  try {
    const payloads = [
      {
        ...corePayload,
        short_description: `${profile.skill} service in ${profile.location}`,
        bio: `${profile.name} provides ${profile.skill} service from saved location in ${profile.city}.`,
        service_details: [profile.skill],
        verified_status: profile.idVerificationFile ? "Pending" : "Not Submitted"
      },
      corePayload,
      {
        id: workerId,
        user_id: null,
        name: profile.name,
        category: profile.skill,
        location: profile.location,
        city: profile.city,
        latitude: profile.latitude ?? null,
        longitude: profile.longitude ?? null,
        email: profile.email || null,
        phone: contactPhone,
        whatsapp: contactPhone,
        profile_photo: profile.profilePhoto || ""
      },
      {
        id: workerId,
        name: profile.name,
        category: profile.skill,
        location: profile.location,
        city: profile.city,
        phone: contactPhone,
        whatsapp: contactPhone
      }
    ];

    let lastError = "";
    for (const payload of payloads) {
      const result = await withTimeout(
        supabase.from("workers").upsert(payload as Record<string, unknown>).select("id").maybeSingle(),
        8000,
        "Supabase save timeout. workers table policy/columns/env check karo."
      );
      const { error } = result as { error?: { message?: string } | null };
      if (!error) return { ok: true, workerId };
      lastError = error.message || lastError;
    }

    return { ok: false, error: lastError || "Worker save failed." };
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

export async function findUserAccountByLogin(login: { phone?: string; email?: string }) {
  if (!hasSupabaseConfig || !supabase) return null;

  const loginEmail = normalizeEmail(login.email);
  const loginPhone = normalizeContact(login.phone).slice(-10);
  if (!loginEmail && !loginPhone) return null;

  try {
    const result = await withTimeout(
      supabase.from("profiles").select("id,full_name,phone,email,role").range(0, 999),
      8000,
      "Supabase user login lookup timeout."
    );
    const { data, error } = result as { data?: ProfileRow[] | null; error?: { message?: string } | null };
    if (error || !data) return null;

    const match = data.find((profile) => {
      if (loginEmail && normalizeEmail(profile.email) === loginEmail) return true;
      const profilePhone = normalizeContact(profile.phone).slice(-10);
      return Boolean(loginPhone && profilePhone && loginPhone === profilePhone);
    });
    if (!match) return null;

    return {
      id: match.id,
      role: match.role === "worker" ? "worker" : "user",
      name: match.full_name || "User",
      phone: match.phone || login.phone || "",
      email: match.email || login.email
    } satisfies MockAccount;
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

async function sendSmartBookingAlerts(jobId: string, input: CreateJobInput) {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/notifications/booking-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        workerId: input.workerId || undefined,
        service: input.service,
        area: input.area,
        problem: input.problem,
        urgency: input.urgency,
        userLatitude: input.userLatitude,
        userLongitude: input.userLongitude
      })
    });
  } catch {
    // Notifications are a bonus channel; booking should continue even if alerts fail.
  }
}

async function sendFcmJobUpdated(job: MockJobRequest) {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/push/job-updated", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: job.id,
        status: job.status,
        customerPhone: job.customerPhone,
        workerId: job.workerId,
        service: job.service
      })
    });
  } catch {
    // Push is a bonus channel; status update should continue even if push fails.
  }
}

async function sendFcmChatMessage(input: Omit<MockRequestMessage, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const job = getMockJob(input.jobId) || (await loadJobFromSupabase(input.jobId));
  try {
    await fetch("/api/push/chat-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: input.jobId,
        senderRole: input.senderRole,
        workerId: input.workerId || job?.workerId || "",
        customerPhone: job?.customerPhone || "",
        senderName: input.senderName,
        message: input.message
      })
    });
  } catch {
    // Chat still saves even if push fails.
  }
}

export async function createJobInSupabase(input: CreateJobInput) {
  if (!hasSupabaseConfig || !supabase) {
    return null;
  }

  try {
    const userId = await getSessionUserId();
    const id = `MH${Date.now().toString().slice(-6)}`;

    const insertResult = await withTimeout(
      supabase
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
          photo_url: input.photoPreview || null,
          status: "Requested"
        })
        .select(JOB_SELECT_BASE)
        .single(),
      8000,
      "Supabase job request save timeout."
    );
    const { data, error } = insertResult as { data?: JobRequestRow | null; error?: { message?: string } | null };

    if (error || !data) return null;

    try {
      await supabase
        .from("job_requests")
        .update({
          customer_name: input.customerName || null,
          customer_phone: input.customerPhone || null,
          user_latitude: input.userLatitude ?? null,
          user_longitude: input.userLongitude ?? null,
          photo_url_2: input.photoPreview2 || null
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
    await Promise.allSettled([
      withTimeout(sendSmartBookingAlerts(id, input), 8000, "Smart booking alert timeout.")
    ]);

    return { ...mapJob(data as JobRequestRow), photoPreview2: input.photoPreview2 || "" };
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
    .select(`${JOB_SELECT},workers(id,name,category,location,city,phone,whatsapp)`)
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
      .select(`${JOB_SELECT_BASE},workers(id,name,category,location,city,phone,whatsapp)`)
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

  const mappedJobs = visibleRows.map((row) => {
    const workerRow = Array.isArray(row.workers) ? row.workers[0] : row.workers;
    return mapJob(row as JobRequestRow, workerRow as WorkerRow | null);
  });
  return attachCompletedDates(mappedJobs, await loadCompletedDates(mappedJobs.map((job) => job.id)));
}

export async function loadJobFromSupabase(jobId: string) {
  if (!hasSupabaseConfig || !supabase) return getMockJob(jobId);

  const { data, error } = await supabase
    .from("job_requests")
    .select(`${JOB_SELECT},workers(id,name,category,location,city,phone,whatsapp)`)
    .eq("id", jobId)
    .maybeSingle();

  if (error || !data) {
    const fallback = await supabase
      .from("job_requests")
      .select(`${JOB_SELECT_BASE},workers(id,name,category,location,city,phone,whatsapp)`)
      .eq("id", jobId)
      .maybeSingle();
    if (fallback.error || !fallback.data) return getMockJob(jobId);
    const workerRow = Array.isArray(fallback.data.workers) ? fallback.data.workers[0] : fallback.data.workers;
    const mappedJob = mapJob(fallback.data as JobRequestRow, workerRow as WorkerRow | null);
    return attachCompletedDates([mappedJob], await loadCompletedDates([mappedJob.id]))[0];
  }
  const workerRow = Array.isArray(data.workers) ? data.workers[0] : data.workers;
  const mappedJob = mapJob(data as JobRequestRow, workerRow as WorkerRow | null);
  return attachCompletedDates([mappedJob], await loadCompletedDates([mappedJob.id]))[0];
}

export async function updateJobInSupabase(jobId: string, update: Partial<MockJobRequest>) {
  const updateWithCompletedAt = update.status === "Completed" && !update.completedAt ? { ...update, completedAt: new Date().toISOString() } : update;
  const localJob = updateMockJob(jobId, updateWithCompletedAt);
  if (!hasSupabaseConfig || !supabase) return localJob;

  const dbUpdate: Record<string, string | null> = {};
  if (update.status) dbUpdate.status = update.status;
  if (update.workerId !== undefined) dbUpdate.worker_id = update.workerId || null;
  if (update.workerQuestion !== undefined) dbUpdate.worker_question = update.workerQuestion || null;
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
      const mappedJob = {
        ...mapJob(data as JobRequestRow),
        completedAt: update.status === "Completed" ? updateWithCompletedAt.completedAt : undefined
      };
      await sendFcmJobUpdated(mappedJob);
      return mappedJob;
    }

    if (error && (update.quoteAmount !== undefined || update.quoteNote !== undefined || update.quoteEta !== undefined || update.workerQuestion !== undefined)) {
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
        const mappedJob = { ...mapJob(fallback.data as JobRequestRow), ...updateWithCompletedAt };
        await sendFcmJobUpdated(mappedJob);
        return mappedJob;
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

export async function loadRequestMessages(jobId: string, workerId?: string) {
  if (!hasSupabaseConfig || !supabase) {
    const localMessages = getMockRequestMessages(jobId);
    return workerId ? localMessages.filter((message) => !message.workerId || message.workerId === workerId) : localMessages;
  }

  const { data, error } = await supabase
    .from("request_messages")
    .select("id,job_id,worker_id,worker_name,sender_role,sender_name,message,created_at")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    const localMessages = getMockRequestMessages(jobId);
    return workerId ? localMessages.filter((message) => !message.workerId || message.workerId === workerId) : localMessages;
  }
  const messages = (data as RequestMessageRow[]).map(mapRequestMessage);
  if (!workerId) return messages;
  return messages.filter((message) => !message.workerId || message.workerId === workerId);
}

export async function sendRequestMessage(input: Omit<MockRequestMessage, "id" | "createdAt">) {
  const localMessage = addMockRequestMessage(input);
  if (!hasSupabaseConfig || !supabase) return localMessage;

  const { data, error } = await supabase
    .from("request_messages")
    .insert({
      job_id: input.jobId,
      worker_id: input.workerId || null,
      worker_name: input.workerName || null,
      sender_role: input.senderRole,
      sender_name: input.senderName,
      message: input.message
    })
    .select("id,job_id,worker_id,worker_name,sender_role,sender_name,message,created_at")
    .maybeSingle();

  if (error || !data) return localMessage;
  await sendFcmChatMessage(input);
  return mapRequestMessage(data as RequestMessageRow);
}

function readLocalReviews() {
  if (typeof window === "undefined") return [] as WorkerReviewRow[];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_REVIEWS_KEY) || "[]") as WorkerReviewRow[];
  } catch {
    return [];
  }
}

function writeLocalReviews(reviews: WorkerReviewRow[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
}

export async function loadReviewForJob(jobId: string) {
  if (!hasSupabaseConfig || !supabase) {
    return readLocalReviews().find((review) => review.job_id === jobId) || null;
  }

  const { data, error } = await supabase.from("worker_reviews").select("*").eq("job_id", jobId).maybeSingle();
  if (error || !data) return readLocalReviews().find((review) => review.job_id === jobId) || null;
  return data as WorkerReviewRow;
}

export async function loadWorkerReviews(workerId: string) {
  if (!hasSupabaseConfig || !supabase) return [] as WorkerReviewRow[];

  const { data, error } = await supabase
    .from("worker_reviews")
    .select("id,job_id,worker_id,customer_name,rating,comment,created_at")
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false })
    .range(0, 20);

  if (error) return [] as WorkerReviewRow[];
  return (data || []) as WorkerReviewRow[];
}

export async function saveWorkerReview(input: {
  jobId: string;
  workerId: string;
  customerName?: string;
  rating: number;
  comment?: string;
}) {
  const review: WorkerReviewRow = {
    id: globalThis.crypto?.randomUUID?.() || `review-${Date.now()}`,
    job_id: input.jobId,
    worker_id: input.workerId,
    customer_name: input.customerName || null,
    rating: input.rating,
    comment: input.comment || null,
    created_at: new Date().toISOString()
  };

  const localReviews = readLocalReviews().filter((item) => item.job_id !== input.jobId);
  writeLocalReviews([...localReviews, review]);

  if (!hasSupabaseConfig || !supabase) return { ok: true, review, fallback: true };

  const { data, error } = await supabase
    .from("worker_reviews")
    .upsert(
      {
        job_id: input.jobId,
        worker_id: input.workerId,
        customer_name: input.customerName || null,
        rating: input.rating,
        comment: input.comment || null
      },
      { onConflict: "job_id" }
    )
    .select("*")
    .maybeSingle();

  if (error) return { ok: true, review, fallback: true, error: error.message };
  return { ok: true, review: (data as WorkerReviewRow | null) || review };
}

export async function saveWorkerSettingsToSupabase(settings: { availability: string; serviceRadius: string; whatsappNotifications?: boolean; browserNotifications?: boolean }) {
  if (!hasSupabaseConfig || !supabase) return { ok: true, fallback: true };

  const userId = await getSessionUserId();
  const workerProfile = getWorkerRegistration();
  const update = {
    availability_status: settings.availability,
    available_today: settings.availability === "Available Today",
    service_radius: Number.parseInt(settings.serviceRadius, 10) || 10
  };
  const notificationUpdate = {
    whatsapp_notifications: settings.whatsappNotifications !== false,
    browser_notifications: settings.browserNotifications !== false
  };

  async function saveOptionalNotificationSettings(column: "user_id" | "id", value: string) {
    if (!supabase) return;
    await supabase.from("workers").update(notificationUpdate).eq(column, value);
  }

  if (userId) {
    const { data, error } = await supabase.from("workers").update(update).eq("user_id", userId).select("id").maybeSingle();
    if (!error && data) await saveOptionalNotificationSettings("user_id", userId);
    return { ok: !error && Boolean(data), error: error?.message || (!data ? "Worker row not found." : undefined) };
  }

  if (!workerProfile?.id) return { ok: true, fallback: true };

  const { data, error } = await supabase.from("workers").update(update).eq("id", workerProfile.id).select("id").maybeSingle();
  if (!error && data) await saveOptionalNotificationSettings("id", workerProfile.id);
  return { ok: !error && Boolean(data), error: error?.message || (!data ? "Worker row not found." : undefined) };
}

async function loadReviewStatsByWorker() {
  const stats = new Map<string, { rating: number; reviews: number }>();
  if (!supabase) return stats;

  try {
    const { data, error } = await supabase.from("worker_reviews").select("worker_id,rating").range(0, 999);
    if (error || !data) return stats;

    (data as Array<{ worker_id?: string | null; rating?: number | null }>).forEach((review) => {
      if (!review.worker_id || !review.rating) return;
      const current = stats.get(review.worker_id) || { rating: 0, reviews: 0 };
      stats.set(review.worker_id, {
        rating: current.rating + Number(review.rating),
        reviews: current.reviews + 1
      });
    });

    stats.forEach((value, workerId) => {
      stats.set(workerId, { rating: value.reviews ? value.rating / value.reviews : 0, reviews: value.reviews });
    });
  } catch {
    return stats;
  }

  return stats;
}

async function loadCompletedJobCountsByWorker() {
  if (!supabase) return new Map<string, number>();

  try {
    const { data, error } = await supabase
      .from("job_requests")
      .select("worker_id,status")
      .eq("status", "Completed")
      .range(0, 999);
    if (error || !data) return new Map<string, number>();

    return (data as Array<{ worker_id?: string | null; status?: string | null }>).reduce((counts, job) => {
      if (job.worker_id) counts.set(job.worker_id, (counts.get(job.worker_id) || 0) + 1);
      return counts;
    }, new Map<string, number>());
  } catch {
    return new Map<string, number>();
  }
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
    const completedJobCounts = await loadCompletedJobCountsByWorker();
    const reviewStats = await loadReviewStatsByWorker();

    const seenWorkerEmails = new Set<string>();
    const seenWorkerPhones = new Set<string>();
    const seenWorkerIds = new Set<string>();
    return [...data]
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      })
      .filter((row) => {
        const email = normalizeEmail(row.email);
        const phone = normalizeContact(row.phone || row.whatsapp).slice(-10);
        if ((email && seenWorkerEmails.has(email)) || (phone && seenWorkerPhones.has(phone))) return false;
        if (!email && !phone && seenWorkerIds.has(row.id)) return false;
        if (email) seenWorkerEmails.add(email);
        if (phone) seenWorkerPhones.add(phone);
        if (!email && !phone) seenWorkerIds.add(row.id);
        return true;
      })
      .map((row) =>
        {
          const stats = reviewStats.get(row.id);
          return mapWorker({
          ...row,
            rating: stats?.rating ?? row.rating,
            review_count: stats?.reviews ?? row.review_count,
            jobs_completed: Math.max(Number(row.jobs_completed ?? row.jobs ?? 0), completedJobCounts.get(row.id) || 0)
          });
        }
      );
  } catch {
    return workers;
  }
}

export async function loadWorkerFromSupabase(workerId: string) {
  if (!hasSupabaseConfig || !supabase) return workers.find((worker) => worker.id === workerId) || null;

  try {
    const result = await withTimeout(
      supabase.from("workers").select("*").eq("id", workerId).maybeSingle(),
      8000,
      "Supabase worker profile load timeout."
    );
    const { data, error } = result as { data?: WorkerRow | null; error?: { message?: string } | null };
    if (error || !data) return workers.find((worker) => worker.id === workerId) || null;

    const [completedJobCounts, reviewStats] = await Promise.all([
      withTimeout(loadCompletedJobCountsByWorker(), 4000, "Completed job count timeout.").catch(() => new Map<string, number>()),
      withTimeout(loadReviewStatsByWorker(), 4000, "Review stats timeout.").catch(() => new Map<string, { rating: number; reviews: number }>())
    ]);
    const row = data as WorkerRow;
    const stats = reviewStats.get(row.id);
    return mapWorker({
      ...row,
      rating: stats?.rating ?? row.rating,
      review_count: stats?.reviews ?? row.review_count,
      jobs_completed: Math.max(Number(row.jobs_completed ?? row.jobs ?? 0), completedJobCounts.get(row.id) || 0)
    });
  } catch {
    return workers.find((worker) => worker.id === workerId) || null;
  }
}
