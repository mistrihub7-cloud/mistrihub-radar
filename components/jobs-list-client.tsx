"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMockJobs, updateMockJob, type MockJobRequest } from "@/lib/mock-store";
import { Icon } from "./simple-icons";

export function JobsListClient({ owner = "user" }: { owner?: "user" | "worker" }) {
  const [jobs, setJobs] = useState<MockJobRequest[]>([]);

  useEffect(() => {
    setJobs(getMockJobs());
    const onChange = () => setJobs(getMockJobs());
    window.addEventListener("mistrihub-mock-change", onChange);
    return () => window.removeEventListener("mistrihub-mock-change", onChange);
  }, []);

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
          <p className="mt-3 text-sm leading-6 text-slate-600">{job.problem}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn-primary h-10 px-4 text-sm" href={`/jobs/${job.id}`}>
              Track
            </Link>
            {owner === "user" && job.status !== "Cancelled" ? (
              <button
                className="btn-outline h-10 border-red-500 px-4 text-sm text-red-600"
                onClick={() => {
                  updateMockJob(job.id, { status: "Cancelled" });
                  setJobs(getMockJobs());
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
