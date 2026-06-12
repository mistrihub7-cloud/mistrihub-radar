"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cleanCategoryName } from "@/lib/category-display";
import {
  getMockAccount,
  getWorkerDeclinedJobs,
  getWorkerRegistration,
  markWorkerDeclinedJob,
  updateMockJob,
  type MockJobRequest,
  type WorkerRegistration
} from "@/lib/mock-store";
import { markJobAlertsRead } from "@/lib/alert-state";
import { loadJobsFromSupabase, updateJobInSupabase } from "@/lib/supabase-flow";
import { Icon } from "./simple-icons";

type JobsListView = "user-records" | "worker-requests" | "worker-history";

function isVisibleForWorker(job: MockJobRequest, profile: WorkerRegistration | null, declinedJobs: string[]) {
  if (!profile || declinedJobs.includes(job.id) || job.service !== profile.skill) return false;
  if (["Requested", "Need More Details"].includes(job.status)) return !job.workerId || job.workerId === profile.id;
  return job.workerId === profile.id && ["Accepted", "Quote Sent", "Quote Accepted", "On The Way", "In Progress", "Completed"].includes(job.status);
}

function filterJobsForView(jobs: MockJobRequest[], view: JobsListView) {
  if (view === "worker-requests") return jobs.filter((job) => ["Requested", "Need More Details"].includes(job.status));
  if (view === "worker-history") return jobs.filter((job) => !["Requested", "Need More Details"].includes(job.status));
  return jobs;
}

function displayStatus(status: MockJobRequest["status"]) {
  if (status === "Accepted") return "Waiting User Confirm";
  if (status === "Quote Accepted") return "User Confirmed";
  if (status === "Need More Details") return "Requested";
  if (status === "Quote Rejected") return "Declined";
  if (status === "Quote Sent") return "Accepted";
  return status;
}

function formatCompletedDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function JobsListClient({ owner = "user", view = owner === "worker" ? "worker-requests" : "user-records" }: { owner?: "user" | "worker"; view?: JobsListView }) {
  const router = useRouter();
  const [jobs, setJobs] = useState<MockJobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerProfile, setWorkerProfile] = useState<WorkerRegistration | null>(null);

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      const nextJobs = await loadJobsFromSupabase(owner);
      if (owner === "worker") {
        const profile = getWorkerRegistration();
        const declinedJobs = getWorkerDeclinedJobs();
        const visibleJobs = filterJobsForView(nextJobs.filter((job) => isVisibleForWorker(job, profile, declinedJobs)), view);
        setWorkerProfile(profile);
        setJobs(visibleJobs);
        markJobAlertsRead(getMockAccount(), visibleJobs, profile);
      } else {
        setJobs(filterJobsForView(nextJobs, view));
        markJobAlertsRead(getMockAccount(), nextJobs);
      }
      setLoading(false);
    }

    loadJobs();
    const onChange = () => loadJobs();
    window.addEventListener("mistrihub-mock-change", onChange);
    const timer = owner === "worker" ? undefined : window.setInterval(loadJobs, 5000);
    return () => {
      window.removeEventListener("mistrihub-mock-change", onChange);
      if (timer) window.clearInterval(timer);
    };
  }, [owner, view]);

  if (loading) {
    return <div className="card p-6 text-center text-sm font-bold text-slate-500">Loading jobs...</div>;
  }

  if (!jobs.length) {
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon name="jobs" />
        </span>
        <h1 className="mt-4 text-2xl font-black">
          {view === "worker-history" ? "No job history" : owner === "worker" ? "No new job requests" : "No job records"}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          {view === "worker-history"
            ? "Accepted, completed and cancelled worker jobs will appear here."
            : owner === "worker"
              ? "New booking requests will appear here."
              : "Book a professional to create your first request."}
        </p>
        <Link className="btn-primary mx-auto mt-5 max-w-xs" href={owner === "worker" ? "/dashboard/worker" : "/workers"}>
          {owner === "worker" ? "Back to Dashboard" : "Find Professional"}
        </Link>
      </div>
    );
  }

  async function refreshJobs() {
    const nextJobs = await loadJobsFromSupabase(owner);
    if (owner !== "worker") {
      setJobs(filterJobsForView(nextJobs, view));
      return;
    }

    const profile = getWorkerRegistration();
    const declinedJobs = getWorkerDeclinedJobs();
    setWorkerProfile(profile);
    setJobs(filterJobsForView(nextJobs.filter((job) => isVisibleForWorker(job, profile, declinedJobs)), view));
  }

  async function acceptJob(job: MockJobRequest) {
    if (!workerProfile) return;
    const update = {
      status: "Accepted" as const,
      workerId: workerProfile.id,
      workerName: workerProfile.name,
      workerPhone: workerProfile.phone
    };
    updateMockJob(job.id, update);
    setJobs((currentJobs) => currentJobs.map((item) => (item.id === job.id ? { ...item, ...update } : item)));
    const nextJob = await updateJobInSupabase(job.id, update);
    if (nextJob?.status === "Accepted" && nextJob.workerId && nextJob.workerId !== workerProfile.id) {
      markWorkerDeclinedJob(job.id);
    }
    await refreshJobs();
    router.push(`/jobs/${job.id}`);
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div className="card p-4" key={job.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-brand-600">{owner === "worker" ? "Job Request" : "Job Record"} ID: {job.id}</p>
              <h2 className="mt-1 text-xl font-black">{cleanCategoryName(job.service)} Request</h2>
              <p className="mt-1 text-sm text-slate-600">{job.workerName} - {job.area}</p>
            </div>
            <span className="status-pill bg-blue-50 text-brand-600">{displayStatus(job.status)}</span>
          </div>
          {owner === "worker" && !job.workerId ? (
            <p className="mt-3 rounded-2xl bg-brand-50 p-3 text-xs font-black text-brand-700">
              Fast Nearby Dispatch: nearest matching professionals can review this request. First expert who accepts gets the booking.
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-slate-600">{job.problem}</p>
          {job.status === "Completed" ? (
            <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-black text-emerald-700">
              Completed: {formatCompletedDate(job.completedAt) || "Date not recorded"}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn-primary h-10 px-4 text-sm" href={`/jobs/${job.id}`}>
              See Detail
            </Link>
            {owner === "worker" && ["Requested", "Need More Details"].includes(job.status) ? (
              <>
                <button className="btn-primary h-10 px-4 text-sm" disabled={!workerProfile} onClick={() => acceptJob(job)} type="button">
                  Accept Job
                </button>
                <Link className="btn-outline h-10 px-4 text-sm" href={`/jobs/${job.id}#job-chat`}>
                  Chat
                </Link>
              </>
            ) : null}
            {owner === "user" && ["Requested", "Need More Details"].includes(job.status) ? (
              <button
                className="btn-outline h-10 border-red-500 px-4 text-sm text-red-600"
                onClick={async () => {
                  updateMockJob(job.id, { status: "Cancelled" });
                  setJobs((currentJobs) => currentJobs.map((item) => (item.id === job.id ? { ...item, status: "Cancelled" } : item)));
                  await updateJobInSupabase(job.id, { status: "Cancelled" });
                  setJobs(filterJobsForView(await loadJobsFromSupabase(owner), view));
                }}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
