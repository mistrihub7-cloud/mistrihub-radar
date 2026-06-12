"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { accountDisplayName } from "@/lib/display-name";
import { clearMistriHubSession, getMockAccount, getWorkerRegistration, saveMockAccount, type MockAccount, type MockJobRequest, type WorkerRegistration } from "@/lib/mock-store";
import { loadJobsFromSupabase } from "@/lib/supabase-flow";
import { DEFAULT_LOCATION, LOCATION_KEY } from "./location-label";
import { NotificationBell } from "./notification-bell";
import { ProfessionalAvatar } from "./professional-avatar";
import { Icon } from "./simple-icons";

function MenuRow({ href, icon, label, value }: { href: string; icon: string; label: string; value?: string }) {
  return (
    <Link className="flex items-center gap-4 border-b border-slate-100 py-4" href={href}>
      <span className="grid h-10 w-10 place-items-center rounded-xl text-brand-600">
        <Icon className="h-6 w-6" name={icon} />
      </span>
      <span className="flex-1 text-base font-black text-slate-950">{label}</span>
      {value ? <span className="text-sm font-black text-slate-700">{value}</span> : null}
      <span className="text-2xl font-bold text-slate-400">&gt;</span>
    </Link>
  );
}

export function UserDashboardClient() {
  const [jobs, setJobs] = useState<MockJobRequest[]>([]);
  const [account, setAccount] = useState<MockAccount | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerRegistration | null>(null);
  const [accountName, setAccountName] = useState("User");
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  useEffect(() => {
    async function loadDashboard() {
      const account = getMockAccount();
      if (!account) {
        window.location.replace("/login");
        return;
      }
      setAccount(account);
      setWorkerProfile(getWorkerRegistration());
      setAccountName(accountDisplayName(account));
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

  function switchToWorker() {
    if (!account) return;
    const worker = getWorkerRegistration();
    if (!worker) {
      window.location.href = "/worker/register";
      return;
    }
    saveMockAccount({ ...account, role: "worker", name: worker.name || account.name, phone: worker.phone || account.phone, email: worker.email || account.email });
    window.location.href = "/dashboard/worker";
  }

  return (
    <div className="space-y-7 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ProfessionalAvatar className="h-20 w-20 rounded-full text-xl" name={accountName} />
          <div>
            <h1 className="text-2xl font-black leading-tight text-slate-950 md:text-3xl">Hello, {accountName}</h1>
            <p className="text-base font-bold text-slate-500">{location}</p>
          </div>
        </div>
        <NotificationBell className="grid h-12 w-12 place-items-center rounded-full text-slate-900" />
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
              <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="font-black text-slate-950">Account mode</h2>
        <p className="mt-1 text-sm font-bold text-slate-500">
          {workerProfile ? "Professional profile found. Aap user aur service partner dono mode use kar sakte ho." : "Service partner banne ke liye professional profile complete karo."}
        </p>
        <button className="btn-outline mt-4 w-full" onClick={switchToWorker} type="button">
          {workerProfile ? "Switch to Service Partner Mode" : "Join as Service Partner"}
        </button>
      </section>

      <section className="card px-5 py-2">
        <MenuRow href="/user/profile" icon="user" label="My Profile" />
        <MenuRow href="/jobs" icon="calendar" label="My Bookings" />
        <MenuRow href="/jobs" icon="jobs" label="Job History" />
        <MenuRow href="/jobs" icon="star" label="My Reviews" />
        <MenuRow href="/workers" icon="bell" label="Saved Professionals" />
        <MenuRow href="/login" icon="phone" label="Help & Support" />
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
