"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMockAccount, getMockJobs, type MockJobRequest } from "@/lib/mock-store";
import { loadAccountFromSupabase, loadJobsFromSupabase } from "@/lib/supabase-flow";
import { JobsListClient } from "./jobs-list-client";

export function UserDashboardClient() {
  const [jobs, setJobs] = useState<MockJobRequest[]>([]);
  const [accountName, setAccountName] = useState("User");

  useEffect(() => {
    async function loadDashboard() {
      const account = await loadAccountFromSupabase();
      setAccountName(account?.name || getMockAccount()?.name || "User");
      setJobs(await loadJobsFromSupabase("user"));
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h1 className="text-2xl font-black">Hello, {accountName}</h1>
        <p className="mt-1 text-sm text-slate-500">User Dashboard</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Active", jobs.filter((job) => !["Completed", "Cancelled", "Declined"].includes(job.status)).length.toString()],
          ["Completed", jobs.filter((job) => job.status === "Completed").length.toString()],
          ["History", jobs.length.toString()]
        ].map(([label, value]) => (
          <div className="rounded-2xl bg-slate-50 p-4 text-center" key={label}>
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <JobsListClient owner="user" />
      <Link className="btn-outline w-full" href="/workers">Saved Workers / Find More</Link>
    </div>
  );
}
