import Link from "next/link";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";

const menu = [
  ["My Bookings", "calendar", "/jobs"],
  ["Job History", "jobs", "/jobs"],
  ["My Reviews", "star", "/dashboard"],
  ["Saved Workers", "shield", "/workers"],
  ["Help & Support", "bell", "/dashboard"],
  ["Settings", "settings", "/dashboard"]
];

export default function UserDashboardPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar />
      <section className="container-page pb-8 pt-1 md:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="worker-avatar" />
              <div>
                <h1 className="text-xl font-black">Hello, Vikas</h1>
                <p className="text-sm text-slate-500">Ranchi, Jharkhand</p>
              </div>
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-slate-200">
              <Icon name="bell" />
            </button>
          </div>
          <div className="mb-7 flex items-center justify-between">
            <h2 className="font-black">My Jobs</h2>
            <Link className="text-sm font-black text-brand-600" href="/jobs">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Active Jobs", "2", "bg-blue-50 text-brand-600"],
              ["Completed", "12", "bg-emerald-50 text-slate-950"],
              ["Cancelled", "1", "bg-red-50 text-red-600"]
            ].map(([label, value, tone]) => (
              <div className={`rounded-2xl p-4 ${tone}`} key={label}>
                <p className="text-xs font-bold">{label}</p>
                <p className="mt-1 text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 divide-y divide-slate-100 border-y border-slate-100">
            {menu.map(([label, icon, href]) => (
              <Link className="flex h-16 items-center justify-between font-bold" href={href} key={label}>
                <span className="flex items-center gap-4">
                  <Icon className="h-5 w-5 text-brand-600" name={icon} />
                  {label}
                </span>
                <span className="text-slate-400">&gt;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
