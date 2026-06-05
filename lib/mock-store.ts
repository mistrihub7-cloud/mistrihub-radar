import { workers } from "./data";

export type MockRole = "user" | "worker";

export type MockAccount = {
  id: string;
  role: MockRole;
  name: string;
  phone: string;
  email?: string;
};

export type MockJobRequest = {
  id: string;
  workerId: string;
  workerName: string;
  service: string;
  problem: string;
  urgency: "Normal" | "Urgent" | "Emergency";
  preferredDate: string;
  preferredTime: string;
  area: string;
  customerName?: string;
  customerPhone?: string;
  userLatitude?: number;
  userLongitude?: number;
  photoPreview?: string;
  photoPreview2?: string;
  status:
    | "Requested"
    | "Accepted"
    | "Quote Sent"
    | "Quote Accepted"
    | "Quote Rejected"
    | "On The Way"
    | "In Progress"
    | "Completed"
    | "Cancelled"
    | "Declined"
    | "Need More Details";
  createdAt: string;
  workerQuestion?: string;
  quoteAmount?: string;
  quoteNote?: string;
  quoteEta?: string;
};

export type WorkerRegistration = MockAccount & {
  skill: string;
  experience: string;
  city: string;
  location: string;
  latitude?: number;
  longitude?: number;
  serviceRadius: string;
  availability: "Available Today" | "Busy" | "Not Available";
  profilePhoto?: string;
  idVerificationFile?: string;
};

const ACCOUNT_KEY = "mistrihub.mock.account";
const SAVED_ACCOUNTS_KEY = "mistrihub.saved.accounts";
const WORKER_PROFILE_KEY = "mistrihub.mock.workerProfile";
const SAVED_WORKER_PROFILES_KEY = "mistrihub.saved.workerProfiles";
const JOBS_KEY = "mistrihub.mock.jobs";
const WORKER_SETTINGS_KEY = "mistrihub.mock.workerSettings";
const WORKER_DECLINED_JOBS_KEY = "mistrihub.mock.workerDeclinedJobs";
const SESSION_PREFIXES = ["mistrihub.", "sb-"];
const PRESERVED_SESSION_KEYS = new Set([
  "mistrihub.locationLabel",
  "mistrihub.locationLatitude",
  "mistrihub.locationLongitude",
  "mistrihub.locationLocked",
  "mistrihub.locationSkipped",
  SAVED_ACCOUNTS_KEY,
  SAVED_WORKER_PROFILES_KEY
]);

function canStore() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canStore()) return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canStore()) return;
  try {
    localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("mistrihub-mock-change"));
  } catch {
    localStorage.removeItem(key);
  }
}

function accountKeyFor(value: { phone?: string; email?: string }) {
  const email = value.email?.trim().toLowerCase();
  if (email) return `email:${email}`;
  const phone = (value.phone || "").replace(/\D/g, "").slice(-10);
  return phone ? `phone:${phone}` : "";
}

function getSavedWorkerProfiles() {
  return readJson<Record<string, WorkerRegistration>>(SAVED_WORKER_PROFILES_KEY, {});
}

function getSavedAccounts() {
  return readJson<Record<string, MockAccount>>(SAVED_ACCOUNTS_KEY, {});
}

function saveAccountByLogin(account: MockAccount) {
  const key = accountKeyFor(account);
  if (!key) return;
  writeJson(SAVED_ACCOUNTS_KEY, {
    ...getSavedAccounts(),
    [key]: account
  });
}

export function findSavedAccount(account: Pick<MockAccount, "phone" | "email">) {
  const key = accountKeyFor(account);
  const savedAccount = key ? getSavedAccounts()[key] || null : null;
  return savedAccount && (savedAccount.role === "user" || savedAccount.role === "worker") ? savedAccount : null;
}

function saveWorkerProfileByAccount(profile: WorkerRegistration) {
  const key = accountKeyFor(profile);
  if (!key) return;
  writeJson(SAVED_WORKER_PROFILES_KEY, {
    ...getSavedWorkerProfiles(),
    [key]: {
      ...profile,
      profilePhoto: profile.profilePhoto || "",
      idVerificationFile: profile.idVerificationFile ? "Selected" : ""
    }
  });
}

export function findSavedWorkerRegistration(account: Pick<MockAccount, "phone" | "email">) {
  const key = accountKeyFor(account);
  return key ? getSavedWorkerProfiles()[key] || null : null;
}

export function restoreWorkerRegistrationForAccount(account: Pick<MockAccount, "phone" | "email">) {
  const profile = findSavedWorkerRegistration(account);
  if (profile) {
    writeJson(WORKER_PROFILE_KEY, profile);
    writeJson(WORKER_SETTINGS_KEY, { availability: profile.availability, serviceRadius: profile.serviceRadius });
  }

  return profile;
}

export function getMockAccount() {
  const account = readJson<(MockAccount & { role?: string }) | null>(ACCOUNT_KEY, null);
  if (account && account.role !== "user" && account.role !== "worker") {
    clearMistriHubSession();
    return null;
  }

  return account as MockAccount | null;
}

export function saveMockAccount(account: MockAccount) {
  writeJson(ACCOUNT_KEY, account);
  saveAccountByLogin(account);
}

export function saveWorkerRegistration(profile: WorkerRegistration) {
  saveMockAccount({ id: profile.id, role: "worker", name: profile.name, phone: profile.phone, email: profile.email });
  const savedProfile = {
    ...profile,
    profilePhoto: profile.profilePhoto || "",
    idVerificationFile: profile.idVerificationFile ? "Selected" : ""
  };
  writeJson(WORKER_PROFILE_KEY, savedProfile);
  saveWorkerProfileByAccount(savedProfile);
}

export function getWorkerRegistration() {
  return readJson<WorkerRegistration | null>(WORKER_PROFILE_KEY, null);
}

export function getMockJobs() {
  return readJson<MockJobRequest[]>(JOBS_KEY, []);
}

export function getMockJob(jobId: string) {
  return getMockJobs().find((job) => job.id === jobId) || null;
}

export function createMockJob(input: Omit<MockJobRequest, "id" | "createdAt" | "status" | "workerName">) {
  const worker = workers.find((item) => item.id === input.workerId);
  const job: MockJobRequest = {
    ...input,
    id: `MH${Date.now().toString().slice(-6)}`,
    workerId: worker?.id || input.workerId || "",
    workerName: worker?.name || "Nearby matching workers",
    createdAt: new Date().toISOString(),
    status: "Requested"
  };
  writeJson(JOBS_KEY, [job, ...getMockJobs()]);
  return job;
}

export function updateMockJob(jobId: string, update: Partial<MockJobRequest>) {
  const nextJobs = getMockJobs().map((job) => (job.id === jobId ? { ...job, ...update } : job));
  writeJson(JOBS_KEY, nextJobs);
  return nextJobs.find((job) => job.id === jobId) || null;
}

export function getWorkerDeclinedJobs() {
  return readJson<string[]>(WORKER_DECLINED_JOBS_KEY, []);
}

export function markWorkerDeclinedJob(jobId: string) {
  writeJson(WORKER_DECLINED_JOBS_KEY, Array.from(new Set([jobId, ...getWorkerDeclinedJobs()])));
}

export function getWorkerSettings() {
  return readJson(WORKER_SETTINGS_KEY, {
    availability: "Available Today",
    serviceRadius: "10 km"
  });
}

export function saveWorkerSettings(settings: { availability: string; serviceRadius: string }) {
  writeJson(WORKER_SETTINGS_KEY, settings);
}

export function clearMistriHubSession() {
  if (!canStore()) return;

  const clearMatchingKeys = (storage: Storage) => {
    Object.keys(storage)
      .filter((key) => SESSION_PREFIXES.some((prefix) => key.startsWith(prefix)))
      .filter((key) => !PRESERVED_SESSION_KEYS.has(key))
      .forEach((key) => storage.removeItem(key));
  };

  clearMatchingKeys(localStorage);
  clearMatchingKeys(sessionStorage);
  window.dispatchEvent(new CustomEvent("mistrihub-mock-change"));
}
