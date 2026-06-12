"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { markJobAlertsRead } from "@/lib/alert-state";
import { cleanCategoryName } from "@/lib/category-display";
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

function displayStatus(status: MockJobRequest["status"]) {
  if (status === "Accepted") return "Accepted - Waiting User";
  if (status === "Quote Accepted") return "User Confirmed";
  if (status === "Quote Rejected") return "Declined";
  if (status === "Quote Sent") return "Accepted";
  return status;
}

function nextWorkerStatus(status: MockJobRequest["status"]): MockJobRequest["status"] | null {
  if (status === "Requested" || status === "Need More Details") return "Accepted";
  if (status === "Quote Accepted") return "On The Way";
  if (status === "On The Way") return "In Progress";
  if (status === "In Progress") return "Completed";
  return null;
}

function formatCompletedDate(value?: string) {
  if (!value) return "Date not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not recorded";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
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
      if (!cancelled) {
        setJob(nextJob);
        if (nextJob) markJobAlertsRead(getMockAccount(), [nextJob], getWorkerRegistration());
      }
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
  const serviceLabel = cleanCategoryName(job.service);
  const contactStatusUnlocked = ["Quote Accepted", "On The Way", "In Progress"].includes(job.status);
  const currentWorkerProfile = isWorkerMode ? getWorkerRegistration() : null;
  const acceptedByAnotherWorker = Boolean(isWorkerMode && job.workerId && currentWorkerProfile?.id && job.workerId !== currentWorkerProfile.id);
  const acceptedByThisWorker = Boolean(isWorkerMode && currentWorkerProfile?.id && job.workerId === currentWorkerProfile.id);
  const canWorkerControl = Boolean(isWorkerMode && currentWorkerProfile?.id && !acceptedByAnotherWorker && (!job.workerId || acceptedByThisWorker));
  const canSeeTimeline = !acceptedByAnotherWorker;
  const contactUnlocked = contactStatusUnlocked && (isWorkerMode ? acceptedByThisWorker : Boolean(job.workerId));
  const contactPhone = contactUnlocked ? (isWorkerMode ? job.customerPhone : job.workerPhone) : undefined;
  const nextStatus = nextWorkerStatus(job.status);
  const lockedWorkerId = job.workerId || undefined;
  const userNeedsToConfirmWorker = !isWorkerMode && job.status === "Accepted" && Boolean(job.workerId);
  const chatDisabledReason =
    job.status === "Completed"
      ? "Job completed ho chuka hai. Chat aur contact ab locked hai."
      : job.status === "Cancelled"
        ? "Job cancelled ho chuka hai. Chat aur contact ab locked hai."
        : job.status === "Declined" || job.status === "Quote Rejected"
          ? "Job declined ho chuka hai. Chat aur contact ab locked hai."
          : acceptedByAnotherWorker
            ? contactStatusUnlocked
              ? "User ne is job ke liye dusre professional ko hire kar liya hai. Is job par ab chat/status action band hai."
              : "Dusre professional ne request accept kiya hai. User confirmation pending hai, isliye aapka action abhi locked hai."
            : undefined;

  async function setStatus(status: MockJobRequest["status"]) {
    if (!job) return;
    const workerProfile = isWorkerMode ? getWorkerRegistration() : null;
    const update: Partial<MockJobRequest> = {
      status,
      ...(status === "Completed" ? { completedAt: new Date().toISOString() } : {}),
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
        workerName: nextJob.workerName && nextJob.workerName !== "Nearby matching professionals" ? nextJob.workerName : optimisticJob.workerName,
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
              <p className="text-sm font-black text-brand-600">Job Request ID: {job.id}</p>
              <h1 className="mt-1 text-2xl font-black">{serviceLabel} Request</h1>
              <p className="mt-1 text-sm text-slate-500">{job.workerName}</p>
            </div>
            <span className="status-pill bg-blue-50 text-brand-600">{displayStatus(job.status)}</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Problem", job.problem],
              ["Urgency", job.urgency],
              ["Location", job.area],
              ["Preferred date", job.preferredDate || "Not selected"],
              ...(job.status === "Completed" ? [["Completed on", formatCompletedDate(job.completedAt)]] : [])
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

        {userNeedsToConfirmWorker ? (
          <div className="sticky top-3 z-30 rounded-2xl border-2 border-brand-200 bg-white p-4 shadow-card">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <Icon className="h-6 w-6" name="check" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-wide text-brand-600">Action needed</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">{job.workerName} accepted your request</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Chat mein price, timing aur work details confirm karke booking final karo. Contact number confirmation ke baad unlock hoga.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button className="btn-primary h-11 text-sm" onClick={() => setStatus("Quote Accepted")} type="button">
                    Confirm This Professional
                  </button>
                  <button className="btn-outline h-11 border-red-500 text-sm text-red-600" onClick={() => setStatus("Cancelled")} type="button">
                    Cancel Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <JobChat disabledReason={chatDisabledReason} jobId={job.id} lockedWorkerId={lockedWorkerId} worker={{ id: job.workerId, name: job.workerName }} />
        <JobReviewForm job={job} />
      </div>

      <aside className="space-y-5">
        <ContactActions phone={contactPhone} unlocked={contactUnlocked} />
        {isWorkerMode && acceptedByAnotherWorker ? (
          <div className="card p-4">
            <h2 className="font-black">{contactStatusUnlocked ? "Job already hired" : "User confirmation pending"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {contactStatusUnlocked
                ? "User ne is job ke liye dusre professional ko hire kar liya hai. Aapka contact locked rahega aur status control yahan nahi dikhega."
                : "Ek professional ne request accept kiya hai. User confirm karega tabhi booking final hogi."}
            </p>
          </div>
        ) : isWorkerMode ? (
          <div className="card p-4">
            <h2 className="font-black">Professional status controls</h2>
            <p className="mt-1 text-xs text-slate-500">Sirf next step ka action yahan dikhega.</p>
            <div className="mt-3 grid gap-2">
              {canWorkerControl && nextStatus ? (
                <button className="btn-primary h-10 text-sm" onClick={() => setStatus(nextStatus)} type="button">
                  Mark {nextStatus}
                </button>
              ) : (
                <p className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">
                  {job.status === "Completed"
                    ? "Job completed. No more status action needed."
                    : job.status === "Accepted"
                      ? "Aapne job accept kar liya hai. User confirmation ke baad contact unlock hoga aur next step active hoga."
                      : "No next action available."}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="card p-4">
            {job.status === "Accepted" && job.workerId ? (
              <>
                <h2 className="font-black">Professional accepted your request</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {job.workerName} ne request accept kiya hai. Price, timing aur work details chat mein discuss karke confirm karo.
                </p>
                <div className="mt-3 grid gap-2">
                  <button className="btn-primary h-11 text-sm" onClick={() => setStatus("Quote Accepted")} type="button">
                    Confirm This Professional
                  </button>
                  <button className="btn-outline h-11 border-red-500 text-sm text-red-600" onClick={() => setStatus("Cancelled")} type="button">
                    Cancel Request
                  </button>
                </div>
                <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-black leading-5 text-amber-800">
                  Contact number confirmation ke baad hi unlock hoga.
                </p>
              </>
            ) : contactStatusUnlocked ? (
              <>
                <h2 className="font-black">Booking confirmed</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Aapne professional confirm kar diya hai. Contact unlock ho chuka hai aur job tracking active hai.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-black">Nearby workers notified successfully</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Searching nearby matching {serviceLabel} professionals. Active professionals ko category aur distance ke hisab se alert bheja gaya hai.
                </p>
                <p className="mt-3 rounded-2xl bg-blue-50 p-3 text-xs font-black leading-5 text-brand-700">
                  Waiting for response. Agar 5 minutes mein response nahi milta, MistriHub.In additional nearby professionals ko retry alert bhejega.
                </p>
              </>
            )}
          </div>
        )}

        {canSeeTimeline ? (
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
        ) : null}
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
