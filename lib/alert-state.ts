import type { MockAccount, MockJobRequest, WorkerRegistration } from "./mock-store";

export function jobAlertKey(job: MockJobRequest) {
  return `${job.id}:${job.status}:${job.workerId || "open"}`;
}

function readKeyFor(account: MockAccount | null, profile?: WorkerRegistration | null) {
  if (!account) return "";
  return account.role === "worker"
    ? `mistrihub.workerReadJobAlerts.${profile?.id || account.id}`
    : `mistrihub.userReadJobAlerts.${account.id}`;
}

export function readJobAlertKeys(account: MockAccount | null, profile?: WorkerRegistration | null) {
  if (typeof window === "undefined") return new Set<string>();
  const key = readKeyFor(account, profile);
  if (!key) return new Set<string>();
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]") as string[]);
  } catch {
    return new Set<string>();
  }
}

export function markJobAlertKeysRead(account: MockAccount | null, keys: string[], profile?: WorkerRegistration | null) {
  if (typeof window === "undefined" || !keys.length) return;
  const storageKey = readKeyFor(account, profile);
  if (!storageKey) return;
  const existing = readJobAlertKeys(account, profile);
  localStorage.setItem(storageKey, JSON.stringify(Array.from(new Set([...Array.from(existing), ...keys]))));
  window.dispatchEvent(new CustomEvent("mistrihub-job-alerts-read"));
}

export function markJobAlertsRead(account: MockAccount | null, jobs: MockJobRequest[], profile?: WorkerRegistration | null) {
  markJobAlertKeysRead(account, jobs.map(jobAlertKey), profile);
}

export function unreadJobAlerts(account: MockAccount | null, jobs: MockJobRequest[], profile?: WorkerRegistration | null) {
  const read = readJobAlertKeys(account, profile);
  return jobs.filter((job) => !read.has(jobAlertKey(job)));
}
