"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { accountDisplayName } from "@/lib/display-name";
import {
  clearMistriHubSession,
  getMockAccount,
  getWorkerRegistration,
  getWorkerSettings,
  saveMockAccount,
  saveWorkerRegistration,
  saveWorkerSettings,
  type MockJobRequest,
  type WorkerRegistration
} from "@/lib/mock-store";
import { getJobAlertsEnabled, requestJobAlertPermission, saveJobAlertsEnabled, showJobNotification } from "@/lib/notifications";
import { loadJobsFromSupabase, saveWorkerSettingsToSupabase } from "@/lib/supabase-flow";
import { NotificationBell } from "./notification-bell";
import { Icon } from "./simple-icons";

function MenuRow({ href, icon, label, value, badge }: { href: string; icon: string; label: string; value?: string; badge?: string }) {
  return (
    <Link className="flex items-center gap-4 border-b border-slate-100 py-4" href={href}>
      <span className="grid h-10 w-10 place-items-center rounded-xl text-brand-600">
        <Icon className="h-6 w-6" name={icon} />
      </span>
      <span className="flex-1 text-base font-black text-slate-950">{label}</span>
      {badge ? <span className="grid h-8 w-8 place-items-center rounded-full bg-red-500 text-sm font-black text-white">{badge}</span> : null}
      {value ? <span className="text-sm font-black text-slate-700">{value}</span> : null}
      <span className="text-2xl font-bold text-slate-400">&gt;</span>
    </Link>
  );
}

function isVisibleForWorker(job: MockJobRequest, profile: WorkerRegistration | null) {
  if (!profile || job.service !== profile.skill) return false;
  if (["Requested", "Need More Details"].includes(job.status)) return !job.workerId || job.workerId === profile.id;
  return job.workerId === profile.id && ["Accepted", "Quote Sent", "Quote Accepted", "On The Way", "In Progress", "Completed"].includes(job.status);
}

export function WorkerDashboardClient() {
  const [jobs, setJobs] = useState<MockJobRequest[]>([]);
  const [availability, setAvailability] = useState("Available Today");
  const [serviceRadius, setServiceRadius] = useState("10 km");
  const [profile, setProfile] = useState<WorkerRegistration | null>(null);
  const [accountName, setAccountName] = useState("Worker");
  const [statusMessage, setStatusMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const availabilityOptions = ["Available Today", "Busy", "Not Available"];

  useEffect(() => {
    let workerProfile: WorkerRegistration | null = null;

    async function loadDashboard() {
      const account = getMockAccount();
      if (!account) {
        window.location.replace("/login");
        return;
      }
      workerProfile = getWorkerRegistration();
      const settings = getWorkerSettings();
      setAvailability(settings.availability);
      setServiceRadius(settings.serviceRadius);
      setProfile(workerProfile);
      setAccountName(accountDisplayName(account, workerProfile));
      await refreshWorkerJobs(workerProfile, false);
    }

    async function refreshWorkerJobs(currentProfile: WorkerRegistration | null, notify: boolean) {
      const nextJobs = await loadJobsFromSupabase("worker");
      const visibleJobs = nextJobs.filter((job) => isVisibleForWorker(job, currentProfile));
      setJobs(visibleJobs);

      if (!notify || typeof window === "undefined" || !currentProfile) return;

      const pendingJobs = visibleJobs.filter((job) => job.status === "Requested");
      const seenKey = `mistrihub.workerSeenJobs.${currentProfile.id}`;
      const seen = new Set(JSON.parse(localStorage.getItem(seenKey) || "[]") as string[]);
      const newJobs = pendingJobs.filter((job) => !seen.has(job.id));
      if (!newJobs.length) return;

      localStorage.setItem(seenKey, JSON.stringify(Array.from(new Set(Array.from(seen).concat(pendingJobs.map((job) => job.id))))));
      const latestJob = newJobs[0];
      setAlertMessage(`${newJobs.length} new job request${newJobs.length > 1 ? "s" : ""} received.`);
      if (getJobAlertsEnabled() && "Notification" in window && Notification.permission === "granted") {
        showJobNotification("New MistriHub job request", {
          body: `${latestJob.service} - ${latestJob.area}`,
          tag: latestJob.id,
          data: { url: "/worker-request" }
        }).catch(() => undefined);
      }
    }

    loadDashboard();
    setNotificationPermission("Notification" in window ? Notification.permission : "unsupported");
    setAlertsEnabled(getJobAlertsEnabled());
    const timer = window.setInterval(() => refreshWorkerJobs(workerProfile, true), 20000);
    return () => window.clearInterval(timer);
  }, []);

  async function enableJobAlerts() {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      setAlertMessage("Is browser mein notification support nahi hai.");
      return;
    }

    const permission = await requestJobAlertPermission();
    setNotificationPermission(permission);
    setAlertsEnabled(permission === "granted");
    saveJobAlertsEnabled(permission === "granted");
    if (permission !== "granted") {
      setAlertMessage("Notification allow nahi hua.");
      return;
    }

    const { hasFirebaseMessagingConfig, registerFcmToken } = await import("@/lib/fcm-client");
    const tokenResult = await registerFcmToken();
    setAlertMessage(
      tokenResult.ok
        ? "Job alerts saved. Mobile/PWA push notification active hai."
        : hasFirebaseMessagingConfig()
          ? `Browser alert saved. FCM token save nahi hua: ${tokenResult.reason}`
          : "Browser alert saved. FCM keys add karne ke baad mobile push active hoga."
    );
  }

  async function saveAvailability(nextAvailability: string) {
    setAvailability(nextAvailability);
    saveWorkerSettings({ availability: nextAvailability, serviceRadius });
    if (profile) {
      const nextProfile = { ...profile, availability: nextAvailability as WorkerRegistration["availability"], serviceRadius };
      saveWorkerRegistration(nextProfile);
      setProfile(nextProfile);
    }
    const result = await saveWorkerSettingsToSupabase({ availability: nextAvailability, serviceRadius });
    setStatusMessage(result.ok ? "Status saved. Site par update ho gaya." : "Status local save hua. Supabase row/policy check karo.");
  }

  function logout() {
    clearMistriHubSession();
    window.location.replace("/login");
  }

  function switchToUser() {
    const account = getMockAccount();
    const worker = getWorkerRegistration();
    if (!account) return;
    saveMockAccount({
      ...account,
      role: "user",
      name: worker?.name || account.name,
      phone: worker?.phone || account.phone,
      email: worker?.email || account.email
    });
    window.location.href = "/dashboard/user";
  }

  const activeRequests = jobs.filter((job) => job.status === "Requested" && (!profile?.id || !job.workerId || job.workerId === profile.id)).length;
  const completedJobs = jobs.filter((job) => job.status === "Completed" && profile?.id && job.workerId === profile.id).length;

  return (
    <div className="space-y-7 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {profile?.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={profile.name} className="h-20 w-20 rounded-full object-cover shadow-sm" src={profile.profilePhoto} />
          ) : (
            <div className="worker-avatar !h-20 !w-20" />
          )}
          <div>
            <h1 className="text-2xl font-black leading-tight text-slate-950 md:text-3xl">Hello, {accountName}</h1>
            <p className="text-base font-bold text-slate-500">{profile?.skill || "Worker profile"}</p>
          </div>
        </div>
        <NotificationBell className="grid h-12 w-12 place-items-center rounded-full text-slate-900" />
      </div>

      <section className="card p-4">
        <h2 className="font-black text-slate-950">Account mode</h2>
        <p className="mt-1 text-sm font-bold text-slate-500">Worker mode active hai. Service book karne ke liye user mode par switch karo.</p>
        <button className="btn-outline mt-4 w-full" onClick={switchToUser} type="button">
          Switch to User Mode
        </button>
      </section>

      <section className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-black text-slate-950">Job alerts</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {notificationPermission === "granted" && alertsEnabled
                ? "Job alerts saved. Dashboard/PWA open rahe toh new request alert milega."
                : "New job ke liye browser/PWA notification allow karo."}
            </p>
          </div>
          {activeRequests ? <span className="grid h-8 min-w-8 place-items-center rounded-full bg-red-500 px-2 text-sm font-black text-white">{activeRequests}</span> : null}
        </div>
        {notificationPermission !== "granted" || !alertsEnabled ? (
          <button className="btn-primary mt-4 w-full" onClick={enableJobAlerts} type="button">
            Allow Job Alerts
          </button>
        ) : null}
        {alertMessage ? <p className="mt-3 rounded-2xl bg-brand-50 p-3 text-xs font-black text-brand-700">{alertMessage}</p> : null}
      </section>

      <section className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Icon className="h-5 w-5 text-brand-600" name="shield" />
          <h2 className="font-black text-slate-950">Worker status</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {availabilityOptions.map((item) => {
            const active = availability === item;
            const label = item === "Available Today" ? "Available" : item;
            const activeClass =
              item === "Available Today"
                ? "bg-emerald-600 text-white border-emerald-600"
                : item === "Busy"
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-slate-800 text-white border-slate-800";
            return (
              <button
                className={`min-h-11 rounded-xl border px-2 text-xs font-black transition ${
                  active ? activeClass : "border-slate-200 bg-white text-slate-700"
                }`}
                key={item}
                onClick={() => saveAvailability(item)}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs font-bold text-slate-500">Current: {availability === "Available Today" ? "Available" : availability}</p>
        {statusMessage ? <p className="mt-2 text-xs font-black text-brand-600">{statusMessage}</p> : null}
      </section>

      <div className="grid grid-cols-3 gap-4">
        {[
          ["Today's Jobs", activeRequests.toString()],
          ["Completed", completedJobs.toString()],
          ["Rating", "0.0"]
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm" key={label}>
            <p className="text-sm font-black text-slate-600">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <section className="card px-5 py-2">
        <MenuRow badge={activeRequests ? activeRequests.toString() : undefined} href="/worker-request" icon="jobs" label="New Job Requests" />
        <MenuRow href="/jobs" icon="calendar" label="My Jobs" />
        <MenuRow href="/jobs" icon="star" label="Reviews" value="New" />
        <MenuRow href="/worker/profile" icon="user" label="Edit Profile" />
        <button className="flex w-full items-center gap-4 py-4 text-left" onClick={logout} type="button">
          <span className="grid h-10 w-10 place-items-center rounded-xl text-red-600">
            <Icon className="h-7 w-7" name="user" />
          </span>
          <span className="flex-1 text-lg font-black text-red-600">Logout</span>
          <span className="text-2xl font-bold text-slate-400">&gt;</span>
        </button>
      </section>
    </div>
  );
}
