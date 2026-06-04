"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearMistriHubSession, getMockAccount, getWorkerRegistration, getWorkerSettings, saveWorkerSettings, type MockJobRequest, type WorkerRegistration } from "@/lib/mock-store";
import { loadJobsFromSupabase, saveWorkerSettingsToSupabase } from "@/lib/supabase-flow";
import { Icon } from "./simple-icons";

function MenuRow({ href, icon, label, value, badge }: { href: string; icon: string; label: string; value?: string; badge?: string }) {
  return (
    <Link className="flex items-center gap-4 border-b border-slate-100 py-4" href={href}>
      <span className="grid h-10 w-10 place-items-center rounded-xl text-brand-600">
        <Icon className="h-7 w-7" name={icon} />
      </span>
      <span className="flex-1 text-lg font-black text-slate-950">{label}</span>
      {badge ? <span className="grid h-8 w-8 place-items-center rounded-full bg-red-500 text-sm font-black text-white">{badge}</span> : null}
      {value ? <span className="text-sm font-black text-slate-700">{value}</span> : null}
      <span className="text-2xl font-bold text-slate-400">&gt;</span>
    </Link>
  );
}

export function WorkerDashboardClient() {
  const [jobs, setJobs] = useState<MockJobRequest[]>([]);
  const [availability, setAvailability] = useState("Available Today");
  const [serviceRadius, setServiceRadius] = useState("10 km");
  const [profile, setProfile] = useState<WorkerRegistration | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const account = getMockAccount();
      if (!account) {
        window.location.replace("/login");
        return;
      }
      const settings = getWorkerSettings();
      setAvailability(settings.availability);
      setServiceRadius(settings.serviceRadius);
      setProfile(getWorkerRegistration());
      setJobs(await loadJobsFromSupabase("worker"));
    }

    loadDashboard();
  }, []);

  async function saveAvailability(nextAvailability: string) {
    setAvailability(nextAvailability);
    saveWorkerSettings({ availability: nextAvailability, serviceRadius });
    await saveWorkerSettingsToSupabase({ availability: nextAvailability, serviceRadius });
  }

  function logout() {
    clearMistriHubSession();
    window.location.replace("/login");
  }

  const activeRequests = jobs.filter((job) => job.status === "Requested" || job.status === "Need More Details").length;
  const completedJobs = jobs.filter((job) => job.status === "Completed").length;

  return (
    <div className="space-y-7 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {profile?.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={profile.name} className="h-20 w-20 rounded-full object-cover shadow-sm" src={profile.profilePhoto} />
          ) : (
            <div className="worker-avatar !h-20 !w-20" />
          )}
          <div>
            <h1 className="text-3xl font-black leading-tight text-slate-950">Hello, {profile?.name || "Worker"}</h1>
            <p className="text-lg font-bold text-slate-500">{profile?.skill || "Worker profile"}</p>
          </div>
        </div>
        <button className="relative grid h-12 w-12 place-items-center rounded-full text-slate-900" type="button">
          <Icon className="h-8 w-8" name="bell" />
          {activeRequests ? <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-red-500" /> : null}
        </button>
      </div>

      <button
        className={`flex w-full items-center justify-between rounded-2xl p-5 text-left ${
          availability === "Available Today" ? "bg-emerald-50 text-emerald-900" : "bg-slate-100 text-slate-700"
        }`}
        onClick={() => saveAvailability(availability === "Available Today" ? "Not Available" : "Available Today")}
        type="button"
      >
        <span className="flex items-center gap-3 text-2xl font-black">
          <Icon className="h-7 w-7 text-emerald-600" name="shield" />
          {availability === "Available Today" ? "Available Now" : "Not Available"}
        </span>
        <span className={`h-12 w-20 rounded-full p-1 ${availability === "Available Today" ? "bg-emerald-500" : "bg-slate-400"}`}>
          <span className={`block h-10 w-10 rounded-full bg-white transition ${availability === "Available Today" ? "translate-x-8" : ""}`} />
        </span>
      </button>

      <div className="grid grid-cols-3 gap-4">
        {[
          ["Today's Jobs", activeRequests.toString()],
          ["Completed", completedJobs.toString()],
          ["Rating", "0.0"]
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm" key={label}>
            <p className="text-sm font-black text-slate-600">{label}</p>
            <p className="mt-3 text-4xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <section className="card px-5 py-2">
        <MenuRow badge={activeRequests ? activeRequests.toString() : undefined} href="/worker-request" icon="jobs" label="New Job Requests" />
        <MenuRow href="/jobs" icon="calendar" label="My Jobs" />
        <MenuRow href="/dashboard/worker" icon="calendar" label="Earnings" value="Rs 0" />
        <MenuRow href="/jobs" icon="star" label="Reviews" value="0.0 (0)" />
        <MenuRow href="/worker/register" icon="user" label="My Profile" />
        <MenuRow href="/worker/register" icon="jobs" label="Documents Verification" />
        <MenuRow href="/dashboard/worker" icon="settings" label="Settings" />
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
