"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMockAccount, getWorkerRegistration, updateMockJob, type MockJobRequest } from "@/lib/mock-store";
import { loadJobFromSupabase, updateJobInSupabase } from "@/lib/supabase-flow";
import { ContactActions } from "./contact-actions";
import { JobChat } from "./job-chat";
import { JobReviewForm } from "./job-review-form";
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
  const [selectedPhoto, setSelectedPhoto] = useState("");

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
  const contactStatusUnlocked = ["Accepted", "Quote Accepted", "On The Way", "In Progress"].includes(job.status);
  const currentWorkerProfile = isWorkerMode ? getWorkerRegistration() : null;
  const acceptedByAnotherWorker = Boolean(isWorkerMode && job.workerId && currentWorkerProfile?.id && job.workerId !== currentWorkerProfile.id);
  const acceptedByThisWorker = Boolean(isWorkerMode && currentWorkerProfile?.id && job.workerId === currentWorkerProfile.id);
  const canWorkerControl = Boolean(isWorkerMode && currentWorkerProfile?.id && !acceptedByAnotherWorker && (!job.workerId || acceptedByThisWorker));
  const contactUnlocked = contactStatusUnlocked && (isWorkerMode ? acceptedByThisWorker : Boolean(job.workerId));
  const contactPhone = contactUnlocked ? (isWorkerMode ? job.customerPhone : job.workerPhone) : undefined;
  const nextStatus = nextWorkerStatus(job.status);
  const lockedWorkerId = contactStatusUnlocked && job.workerId ? job.workerId : undefined;
  const chatDisabledReason =
    job.status === "Completed"
      ? "Job completed ho chuka hai. Chat aur contact ab locked hai."
      : acceptedByAnotherWorker
        ? "User ne is job ke liye dusre worker ko hire kar liya hai. Is job par ab chat/status action band hai."
        : undefined;

  async function setStatus(status: MockJobRequest["status"]) {
    if (!job) return;
    const workerProfile = isWorkerMode ? getWorkerRegistration() : null;
    const update: Partial<MockJobRequest> = {
      status,
      ...(workerProfile && (!job.workerId || job.workerId === workerProfile.id)
        ? { workerId: workerProfile.id, workerName: workerProfile.name, workerPhone: workerProfile.phone }
        : {})
    };
    const optimisticJob = { ...job, ...update };
    updateMockJob(job.id, update);
    setJob(optimisticJob);
    const nextJob = await updateJobInSupabase(job.id, update);
    if (nextJob) {
      setJob({
        ...nextJob,
        workerName: nextJob.workerName && nextJob.workerName !== "Nearby matching workers" ? nextJob.workerName : optimisticJob.workerName,
        workerPhone: nextJob.workerPhone || optimisticJob.workerPhone
      });
    }
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
              ["Preferred date", job.preferredDate || "Not selected"]
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
                <button className="block text-left" key={photo} onClick={() => setSelectedPhoto(photo || "")} type="button">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={`Problem upload ${index + 1}`} className="h-44 w-full rounded-2xl object-cover transition hover:scale-[1.01]" src={photo} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <JobChat disabledReason={chatDisabledReason} jobId={job.id} lockedWorkerId={lockedWorkerId} worker={{ id: job.workerId, name: job.workerName }} />
        <JobReviewForm job={job} />
      </div>

      <aside className="space-y-5">
        <ContactActions phone={contactPhone} unlocked={contactUnlocked} />
        {isWorkerMode && acceptedByAnotherWorker ? (
          <div className="card p-4">
            <h2 className="font-black">Job already hired</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              User ne is job ke liye dusre worker ko hire kar liya hai. Aapka contact locked rahega aur status control yahan nahi dikhega.
            </p>
          </div>
        ) : isWorkerMode ? (
          <div className="card p-4">
            <h2 className="font-black">Worker status controls</h2>
            <p className="mt-1 text-xs text-slate-500">Sirf next step ka action yahan dikhega.</p>
            <div className="mt-3 grid gap-2">
              {canWorkerControl && nextStatus ? (
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
      </aside>
      {selectedPhoto ? (
        <button className="fixed inset-0 z-[80] grid bg-slate-950/80 p-4" onClick={() => setSelectedPhoto("")} type="button">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Problem upload preview" className="m-auto max-h-[86vh] max-w-full rounded-2xl object-contain shadow-card" src={selectedPhoto} />
          <span className="mt-3 text-center text-sm font-black text-white">Tap anywhere to close</span>
        </button>
      ) : null}
    </div>
  );
}
