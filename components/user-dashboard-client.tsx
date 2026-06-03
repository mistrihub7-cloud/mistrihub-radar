"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearMistriHubSession, getMockAccount, type MockJobRequest } from "@/lib/mock-store";
import { loadJobsFromSupabase } from "@/lib/supabase-flow";
import { DEFAULT_LOCATION, LOCATION_KEY } from "./location-label";
import { Icon } from "./simple-icons";

function MenuRow({ href, icon, label, value }: { href: string; icon: string; label: string; value?: string }) {
  return (
    <Link className="flex items-center gap-4 border-b border-slate-100 py-4" href={href}>
      <span className="grid h-10 w-10 place-items-center rounded-xl text-brand-600">
        <Icon className="h-7 w-7" name={icon} />
      </span>
      <span className="flex-1 text-lg font-black text-slate-950">{label}</span>
      {value ? <span className="text-sm font-black text-slate-700">{value}</span> : null}
      <span className="text-2xl font-bold text-slate-400">&gt;</span>
    </Link>
  );
}

export function UserDashboardClient() {
  const [jobs, setJobs] = useState<MockJobRequest[]>([]);
  const [accountName, setAccountName] = useState("User");
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  useEffect(() => {
    async function loadDashboard() {
      const account = getMockAccount();
      if (!account) {
        window.location.replace("/login");
        return;
      }
      setAccountName(account?.name || "User");
      setLocation(localStorage.getItem(LOCATION_KEY) || DEFAULT_LOCATION);
      setJobs(await loadJobsFromSupabase("user"));
    }

    loadDashboard();
  }, []);

  const activeJobs = jobs.filter((job) => !["Completed", "Cancelled", "Declined"].includes(job.status)).length;
  const completedJobs = jobs.filter((job) => job.status === "Completed").length;
  const cancelledJobs = jobs.filter((job) => job.status === "Cancelled").length;

  function logout() {
    clearMistriHubSession();
    window.location.replace("/login");
  }

  return (
    <div className="space-y-7 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="worker-avatar !h-20 !w-20" />
          <div>
            <h1 className="text-3xl font-black leading-tight text-slate-950">Hello, {accountName}</h1>
            <p className="text-lg font-bold text-slate-500">{location}</p>
          </div>
        </div>
        <button className="grid h-12 w-12 place-items-center rounded-full text-slate-900" type="button">
          <Icon className="h-8 w-8" name="bell" />
        </button>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black">My Jobs</h2>
          <Link className="font-black text-brand-600" href="/jobs">View all</Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            ["Active Jobs", activeJobs.toString(), "bg-blue-50 text-brand-600"],
            ["Completed", completedJobs.toString(), "bg-emerald-50 text-emerald-700"],
            ["Cancelled", cancelledJobs.toString(), "bg-red-50 text-red-600"]
          ].map(([label, value, tone]) => (
            <div className={`rounded-2xl p-4 ${tone}`} key={label}>
              <p className="text-sm font-black">{label}</p>
              <p className="mt-3 text-4xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card px-5 py-2">
        <MenuRow href="/jobs" icon="calendar" label="My Bookings" />
        <MenuRow href="/jobs" icon="jobs" label="Job History" />
        <MenuRow href="/jobs" icon="star" label="My Reviews" />
        <MenuRow href="/workers" icon="bell" label="Saved Workers" />
        <MenuRow href="/login" icon="phone" label="Help & Support" />
        <MenuRow href="/dashboard/user" icon="settings" label="Settings" />
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
