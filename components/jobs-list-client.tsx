"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getWorkerDeclinedJobs,
  getWorkerRegistration,
  markWorkerDeclinedJob,
  updateMockJob,
  type MockJobRequest,
  type WorkerRegistration
} from "@/lib/mock-store";
import { loadJobsFromSupabase, updateJobInSupabase } from "@/lib/supabase-flow";
import { Icon } from "./simple-icons";

export function JobsListClient({ owner = "user" }: { owner?: "user" | "worker" }) {
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
        setWorkerProfile(profile);
        setJobs(
          nextJobs.filter((job) => {
            if (declinedJobs.includes(job.id)) return false;
            if (profile && job.service !== profile.skill) return false;
            if (job.workerId && profile && job.workerId !== profile.id) return false;
            return ["Requested", "Need More Details", "Quote Sent", "Quote Accepted", "On The Way", "In Progress", "Completed"].includes(job.status);
          })
        );
      } else {
        setJobs(nextJobs);
      }
      setLoading(false);
    }

    loadJobs();
    const onChange = () => loadJobs();
    window.addEventListener("mistrihub-mock-change", onChange);
    return () => window.removeEventListener("mistrihub-mock-change", onChange);
  }, [owner]);

  if (loading) {
    return <div className="card p-6 text-center text-sm font-bold text-slate-500">Loading jobs...</div>;
  }

  if (!jobs.length) {
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon name="jobs" />
        </span>
        <h1 className="mt-4 text-2xl font-black">{owner === "worker" ? "No job requests" : "No active jobs"}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          {owner === "worker" ? "New booking requests will appear here." : "Book a worker to create your first request."}
        </p>
        <Link className="btn-primary mx-auto mt-5 max-w-xs" href={owner === "worker" ? "/dashboard/worker" : "/workers"}>
          {owner === "worker" ? "Back to Dashboard" : "Find Worker"}
        </Link>
      </div>
    );
  }

  async function refreshJobs() {
    const nextJobs = await loadJobsFromSupabase(owner);
    if (owner !== "worker") {
      setJobs(nextJobs);
      return;
    }

    const profile = getWorkerRegistration();
    const declinedJobs = getWorkerDeclinedJobs();
    setWorkerProfile(profile);
    setJobs(
      nextJobs.filter((job) => {
        if (declinedJobs.includes(job.id)) return false;
        if (profile && job.service !== profile.skill) return false;
        if (job.workerId && profile && job.workerId !== profile.id) return false;
        return ["Requested", "Need More Details", "Quote Sent", "Quote Accepted", "On The Way", "In Progress", "Completed"].includes(job.status);
      })
    );
  }

  async function sendQuote(job: MockJobRequest) {
    if (!workerProfile) return;
    const quoteAmount = window.prompt("Price quote amount likho (Rs):");
    if (!quoteAmount?.trim()) return;
    const quoteEta = window.prompt("ETA / kab aa sakte ho? (optional)") || "";
    const quoteNote = window.prompt("Short note / price detail (optional)") || "";
    const update = {
      status: "Quote Sent" as const,
      workerId: workerProfile.id,
      workerName: workerProfile.name,
      quoteAmount: quoteAmount.trim(),
      quoteEta: quoteEta.trim(),
      quoteNote: quoteNote.trim()
    };
    updateMockJob(job.id, update);
    const nextJob = await updateJobInSupabase(job.id, update);
    if (nextJob?.status === "Quote Sent" && nextJob.workerId && nextJob.workerId !== workerProfile.id) {
      markWorkerDeclinedJob(job.id);
    }
    await refreshJobs();
  }

  async function declineJob(job: MockJobRequest) {
    if (job.workerId && workerProfile?.id === job.workerId) {
      updateMockJob(job.id, { status: "Declined" });
      await updateJobInSupabase(job.id, { status: "Declined" });
    } else {
      markWorkerDeclinedJob(job.id);
    }
    await refreshJobs();
  }

  async function askDetails(job: MockJobRequest) {
    const question = window.prompt("User se ek short question poochho:");
    if (!question?.trim()) return;
    updateMockJob(job.id, { status: "Need More Details", workerQuestion: question.trim() });
    await updateJobInSupabase(job.id, { status: "Need More Details", workerQuestion: question.trim() });
    await refreshJobs();
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div className="card p-4" key={job.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-brand-600">Job ID: {job.id}</p>
              <h2 className="mt-1 text-xl font-black">{job.service}</h2>
              <p className="mt-1 text-sm text-slate-600">{job.workerName} - {job.area}</p>
            </div>
            <span className="status-pill bg-blue-50 text-brand-600">{job.status}</span>
          </div>
          {owner === "worker" && !job.workerId ? (
            <p className="mt-3 rounded-2xl bg-brand-50 p-3 text-xs font-black text-brand-700">
              Fast Nearby Dispatch: send your price quote first. Contact unlocks only after user accepts the quote.
            </p>
          ) : null}
          {job.quoteAmount ? (
            <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-black text-emerald-800">
              Quote sent: Rs {job.quoteAmount}{job.quoteEta ? ` - ETA ${job.quoteEta}` : ""}
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-slate-600">{job.problem}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn-primary h-10 px-4 text-sm" href={`/jobs/${job.id}`}>
              Track
            </Link>
            {owner === "worker" && ["Requested", "Need More Details"].includes(job.status) ? (
              <>
                <button className="btn-primary h-10 px-4 text-sm" disabled={!workerProfile} onClick={() => sendQuote(job)} type="button">
                  Send Quote
                </button>
                <button className="btn-outline h-10 px-4 text-sm" onClick={() => askDetails(job)} type="button">
                  Need More Details
                </button>
                <button className="btn-outline h-10 border-red-500 px-4 text-sm text-red-600" onClick={() => declineJob(job)} type="button">
                  Decline
                </button>
              </>
            ) : null}
            {owner === "user" && job.status !== "Cancelled" ? (
              <button
                className="btn-outline h-10 border-red-500 px-4 text-sm text-red-600"
                onClick={async () => {
                  updateMockJob(job.id, { status: "Cancelled" });
                  await updateJobInSupabase(job.id, { status: "Cancelled" });
                  setJobs(await loadJobsFromSupabase(owner));
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
