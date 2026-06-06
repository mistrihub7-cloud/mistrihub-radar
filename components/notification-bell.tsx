"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getWorkerDeclinedJobs,
  getWorkerRegistration,
  type MockAccount,
  type MockJobRequest,
  type WorkerRegistration
} from "@/lib/mock-store";
import { getJobAlertsEnabled, requestJobAlertPermission, saveJobAlertsEnabled, showJobNotification } from "@/lib/notifications";
import { loadJobsFromSupabase } from "@/lib/supabase-flow";
import { Icon } from "./simple-icons";
import { useAccountState } from "./use-account-state";

function visibleWorkerJobs(jobs: MockJobRequest[], profile: WorkerRegistration | null) {
  const declined = getWorkerDeclinedJobs();
  return jobs.filter((job) => {
    if (declined.includes(job.id)) return false;
    if (profile && job.service !== profile.skill) return false;
    if (job.workerId && profile && job.workerId !== profile.id) return false;
    return job.status === "Requested";
  });
}

function alertJobsFor(account: MockAccount | null, jobs: MockJobRequest[], profile: WorkerRegistration | null) {
  if (account?.role === "worker") return visibleWorkerJobs(jobs, profile);
  return jobs.filter((job) => ["Accepted", "On The Way", "In Progress", "Cancelled"].includes(job.status));
}

export function NotificationBell({ className = "grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-900" }: { className?: string }) {
  const { account, ready } = useAccountState();
  const [count, setCount] = useState(0);
  const href = useMemo(() => (account?.role === "worker" ? "/worker-request" : account ? "/jobs" : "/login"), [account]);

  useEffect(() => {
    if (!ready || !account) {
      setCount(0);
      return;
    }

    let cancelled = false;
    const activeAccount = account;
    const profile = getWorkerRegistration();
    const seenKey = activeAccount.role === "worker" ? `mistrihub.workerSeenJobs.${profile?.id || activeAccount.id}` : `mistrihub.userSeenJobs.${activeAccount.id}`;

    async function loadAlerts(notify: boolean) {
      const jobs = await loadJobsFromSupabase(activeAccount.role === "worker" ? "worker" : "user");
      if (cancelled) return;
      const alerts = alertJobsFor(activeAccount, jobs, profile);
      setCount(alerts.length);

      if (!notify || typeof window === "undefined" || !alerts.length || !getJobAlertsEnabled()) return;
      const seen = new Set(JSON.parse(localStorage.getItem(seenKey) || "[]") as string[]);
      const newAlerts = alerts.filter((job) => !seen.has(job.id));
      localStorage.setItem(seenKey, JSON.stringify(Array.from(new Set([...Array.from(seen), ...alerts.map((job) => job.id)]))));
      if (!newAlerts.length || !("Notification" in window) || Notification.permission !== "granted") return;

      const job = newAlerts[0];
      showJobNotification(activeAccount.role === "worker" ? "New MistriHub job request" : "MistriHub job update", {
        body: `${job.service} - ${job.status} - ${job.area}`,
        tag: job.id,
        data: { url: activeAccount.role === "worker" ? "/worker-request" : `/jobs/${job.id}` }
      }).catch(() => undefined);
    }

    loadAlerts(false);
    const timer = window.setInterval(() => loadAlerts(true), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [account, ready]);

  return (
    <Link
      aria-label="Notifications"
      className={`${className} relative`}
      href={href}
      onClick={() => {
        if ("Notification" in window && Notification.permission === "granted") {
          saveJobAlertsEnabled(true);
          import("@/lib/fcm-client").then(({ registerFcmToken }) => registerFcmToken()).catch(() => null);
        } else if ("Notification" in window) {
          requestJobAlertPermission()
            .then((permission) => {
              if (permission === "granted") {
                import("@/lib/fcm-client").then(({ registerFcmToken }) => registerFcmToken()).catch(() => null);
              }
            })
            .catch(() => null);
        }
      }}
    >
      <Icon name="bell" />
      {count ? (
        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black leading-none text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
