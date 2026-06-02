import Link from "next/link";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";

const rows = [
  ["New Job Requests", "2", "calendar", "/worker-request"],
  ["My Jobs", "", "jobs", "/jobs"],
  ["Earnings", "Rs 5,240", "shield", "/worker"],
  ["Reviews", "4.8 (120)", "star", "/worker"],
  ["My Profile", "", "user", "/worker"],
  ["Documents", "Verification", "jobs", "/worker"],
  ["Settings", "", "settings", "/worker"]
];

export default function WorkerDashboardPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar />
      <section className="container-page pb-8 pt-1 md:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="worker-avatar" />
            <div>
              <h1 className="text-xl font-black">Hello, Rajesh</h1>
              <p className="text-sm text-slate-500">Electrician</p>
            </div>
          </div>
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
            <span className="flex items-center gap-3 font-black text-emerald-700">
              <Icon name="shield" />
              Available Today
            </span>
            <span className="flex h-8 w-14 items-center rounded-full bg-emerald-500 p-1">
              <span className="ml-auto h-6 w-6 rounded-full bg-white" />
            </span>
          </div>
          <div className="card mb-5 p-4">
            <h2 className="font-black">Worker availability</h2>
            <p className="mt-1 text-sm text-slate-500">Set how far you can serve today.</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {["5 km", "10 km", "15 km", "20 km"].map((radius) => (
                <button
                  className={`rounded-xl border px-2 py-3 text-sm font-black ${
                    radius === "10 km" ? "border-brand-600 bg-brand-50 text-brand-600" : "border-slate-200 bg-white"
                  }`}
                  key={radius}
                  type="button"
                >
                  {radius}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["Available Today", "bg-emerald-50 text-emerald-700 border-emerald-200"],
                ["Busy", "bg-orange-50 text-orange-700 border-orange-200"],
                ["Not Available", "bg-red-50 text-red-700 border-red-200"]
              ].map(([label, tone]) => (
                <button className={`rounded-xl border px-2 py-3 text-xs font-black ${tone}`} key={label} type="button">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Today's Jobs", "3"],
              ["Completed", "120"],
              ["Rating", "4.8"]
            ].map(([label, value]) => (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center" key={label}>
                <p className="text-xs font-bold text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>
          <Link className="card mt-5 block border-amber-200 bg-amber-50 p-4" href="/worker-request">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-amber-700">New job request</p>
                <h2 className="mt-1 font-black">Electrician needed in Harmu</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Your service radius covers this user. Review details first.
                </p>
              </div>
              <span className="status-pill bg-red-50 text-red-600">Urgent</span>
            </div>
          </Link>
          <div className="mt-7 divide-y divide-slate-100 border-y border-slate-100">
            {rows.map(([label, value, icon, href]) => (
              <Link className="flex h-16 items-center justify-between font-bold" href={href} key={label}>
                <span className="flex items-center gap-4">
                  <Icon className="h-5 w-5 text-brand-600" name={icon} />
                  {label}
                </span>
                <span className={label === "New Job Requests" ? "rounded-full bg-red-500 px-2 py-1 text-xs text-white" : "text-slate-700"}>
                  {value || ">"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
