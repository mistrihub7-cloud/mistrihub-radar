"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMockJobs, getWorkerRegistration, getWorkerSettings, saveWorkerSettings, updateMockJob, type MockJobRequest } from "@/lib/mock-store";
import { Icon } from "./simple-icons";

export function WorkerDashboardClient() {
  const [jobs, setJobs] = useState<MockJobRequest[]>([]);
  const [availability, setAvailability] = useState("Available Today");
  const [serviceRadius, setServiceRadius] = useState("10 km");
  const [question, setQuestion] = useState("");
  const profile = typeof window !== "undefined" ? getWorkerRegistration() : null;

  useEffect(() => {
    const settings = getWorkerSettings();
    setAvailability(settings.availability);
    setServiceRadius(settings.serviceRadius);
    setJobs(getMockJobs());
  }, []);

  function saveAvailability(nextAvailability: string) {
    setAvailability(nextAvailability);
    saveWorkerSettings({ availability: nextAvailability, serviceRadius });
  }

  function saveRadius(nextRadius: string) {
    setServiceRadius(nextRadius);
    saveWorkerSettings({ availability, serviceRadius: nextRadius });
  }

  function updateRequest(jobId: string, status: MockJobRequest["status"], extra?: Partial<MockJobRequest>) {
    updateMockJob(jobId, { status, ...extra });
    setJobs(getMockJobs());
  }

  return (
    <div className="space-y-5">
      {profile ? (
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Worker profile created successfully.</div>
      ) : null}

      <div className="card p-4">
        <h2 className="font-black">Availability</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["Available Today", "Busy", "Not Available"].map((item) => (
            <button className={`rounded-xl border px-2 py-3 text-xs font-black ${availability === item ? "border-brand-600 bg-brand-50 text-brand-600" : "border-slate-200 bg-white"}`} key={item} onClick={() => saveAvailability(item)} type="button">
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-black">Service radius</h2>
        <p className="mt-1 text-sm text-slate-500">TODO: save this value to workers.service_radius in Supabase.</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {["5 km", "10 km", "15 km", "20 km"].map((item) => (
            <button className={`rounded-xl border px-2 py-3 text-sm font-black ${serviceRadius === item ? "border-brand-600 bg-brand-50 text-brand-600" : "border-slate-200 bg-white"}`} key={item} onClick={() => saveRadius(item)} type="button">
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black">New job requests</h2>
          <Link className="text-sm font-black text-brand-600" href="/worker-request">Open request page</Link>
        </div>
        <div className="mt-4 space-y-3">
          {!jobs.length ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No pending requests.</p> : null}
          {jobs.map((job) => (
            <div className="rounded-2xl border border-slate-200 p-4" key={job.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-brand-600">{job.id}</p>
                  <h3 className="font-black">{job.service} - {job.urgency}</h3>
                  <p className="text-sm text-slate-600">{job.area}</p>
                </div>
                <span className="status-pill bg-blue-50 text-brand-600">{job.status}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{job.problem}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-primary h-10 px-4 text-sm" onClick={() => updateRequest(job.id, "Accepted")} type="button">Accept Job</button>
                <button className="btn-outline h-10 border-red-500 px-4 text-sm text-red-600" onClick={() => updateRequest(job.id, "Declined")} type="button">Decline Job</button>
                <Link className="btn-outline h-10 px-4 text-sm" href={`/jobs/${job.id}`}>Details</Link>
              </div>
              <div className="mt-3 flex gap-2">
                <input className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" onChange={(event) => setQuestion(event.target.value)} placeholder="Ask one short question" value={question} />
                <button className="rounded-xl bg-brand-600 px-3 text-sm font-black text-white" onClick={() => updateRequest(job.id, "Need More Details", { workerQuestion: question })} type="button">Send</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Active", jobs.filter((job) => !["Completed", "Cancelled", "Declined"].includes(job.status)).length.toString()],
          ["Completed", jobs.filter((job) => job.status === "Completed").length.toString()],
          ["Requests", jobs.length.toString()]
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center" key={label}>
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <Link className="btn-outline w-full" href="/worker/register">
        <Icon name="user" />
        Edit profile
      </Link>
    </div>
  );
}
