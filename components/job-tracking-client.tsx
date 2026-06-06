"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMockAccount, updateMockJob, type MockJobRequest } from "@/lib/mock-store";
import { loadJobFromSupabase, updateJobInSupabase } from "@/lib/supabase-flow";
import { ContactActions } from "./contact-actions";
import { JobChat } from "./job-chat";
import { Icon } from "./simple-icons";

const timeline = ["Requested", "Accepted", "On The Way", "In Progress", "Completed", "Declined", "Cancelled"];

function normalizeTimelineStatus(status: MockJobRequest["status"]) {
  if (status === "Quote Sent" || status === "Quote Accepted") return "Accepted";
  if (status === "Quote Rejected") return "Declined";
  return status;
}

function nextWorkerStatus(status: MockJobRequest["status"]): MockJobRequest["status"] | null {
  if (status === "Requested" || status === "Need More Details") return "Accepted";
  if (status === "Accepted" || status === "Quote Sent" || status === "Quote Accepted") return "On The Way";
  if (status === "On The Way") return "In Progress";
  if (status === "In Progress") return "Completed";
  return null;
}

export function JobTrackingClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<MockJobRequest | null>(null);
  const [isWorkerMode, setIsWorkerMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadJob() {
      setLoading(true);
      setIsWorkerMode(getMockAccount()?.role === "worker");
      const nextJob = await loadJobFromSupabase(jobId);
      if (!cancelled) setJob(nextJob);
      setLoading(false);
    }

    loadJob();
    const timer = window.setInterval(async () => {
      const nextJob = await loadJobFromSupabase(jobId);
      if (!cancelled) setJob(nextJob);
    }, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [jobId]);

  if (loading) {
    return <div className="card p-6 text-center text-sm font-bold text-slate-500">Loading job...</div>;
  }

  if (!job) {
    return (
      <div className="card p-6 text-center">
        <h1 className="text-2xl font-black">Job not found</h1>
        <p className="mt-2 text-sm text-slate-600">This job was not found in the current booking records.</p>
        <Link className="btn-outline mx-auto mt-5 max-w-xs" href="/jobs">Back to Jobs</Link>
      </div>
    );
  }

  const timelineStatus = normalizeTimelineStatus(job.status);
  const contactUnlocked = ["Accepted", "Quote Accepted", "On The Way", "In Progress", "Completed"].includes(job.status);
  const contactPhone = isWorkerMode ? job.customerPhone : job.workerPhone;
  const nextStatus = nextWorkerStatus(job.status);

  async function setStatus(status: MockJobRequest["status"]) {
    if (!job) return;
    const optimisticJob = { ...job, status };
    updateMockJob(job.id, { status });
    setJob(optimisticJob);
    const nextJob = await updateJobInSupabase(job.id, { status });
    if (nextJob) setJob({ ...optimisticJob, ...nextJob });
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_0.75fr]">
      <div className="space-y-5">
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-brand-600">Job ID: {job.id}</p>
              <h1 className="mt-1 text-2xl font-black">{job.service}</h1>
              <p className="mt-1 text-sm text-slate-500">{job.workerName}</p>
            </div>
            <span className="status-pill bg-blue-50 text-brand-600">{job.status}</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Problem", job.problem],
              ["Urgency", job.urgency],
              ["Location", job.area],
              ["Preferred time", `${job.preferredDate} ${job.preferredTime}`]
            ].map(([label, value]) => (
              <div className="rounded-2xl bg-slate-50 p-3" key={label}>
                <p className="text-xs font-bold text-slate-500">{label}</p>
                <p className="mt-1 font-black">{value}</p>
              </div>
            ))}
          </div>
          {job.photoPreview || job.photoPreview2 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[job.photoPreview, job.photoPreview2].filter(Boolean).map((photo, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={`Problem upload ${index + 1}`} className="h-44 w-full rounded-2xl object-cover" key={photo} src={photo} />
              ))}
            </div>
          ) : null}
        </div>

        <div className="card p-5">
          <h2 className="font-black">Status timeline</h2>
          <div className="relative ml-2 mt-5 space-y-5">
            {timeline.map((item) => {
              const active = item === timelineStatus;
              const done = timeline.indexOf(item) < timeline.indexOf(timelineStatus);
              return (
                <div className="flex gap-3" key={item}>
                  <span className={`mt-1 grid h-5 w-5 place-items-center rounded-full text-white ${active ? "bg-brand-600" : done ? "bg-emerald-600" : "bg-slate-300"}`}>
                    {done ? <Icon className="h-3 w-3" name="check" /> : null}
                  </span>
                  <span className="font-bold">{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        <JobChat jobId={job.id} />
      </div>

      <aside className="space-y-5">
        <ContactActions phone={contactPhone} unlocked={contactUnlocked} />
        {isWorkerMode ? (
          <div className="card p-4">
            <h2 className="font-black">Worker status controls</h2>
            <p className="mt-1 text-xs text-slate-500">Sirf next step ka action yahan dikhega.</p>
            <div className="mt-3 grid gap-2">
              {nextStatus ? (
                <button className="btn-primary h-10 text-sm" onClick={() => setStatus(nextStatus)} type="button">
                  Mark {nextStatus}
                </button>
              ) : (
                <p className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">
                  {job.status === "Completed" ? "Job completed. No more status action needed." : "No next action available."}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="card p-4">
            <h2 className="font-black">Request sent</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ye booking matching {job.service} workers ke New Job Requests mein jayegi. First worker jo accept karega, uske baad contact unlock hoga.
            </p>
            <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-black leading-5 text-amber-800">
              WhatsApp auto-send ke liye WhatsApp Cloud API connect karna hoga. Abhi website request flow active hai.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
