import { Icon } from "@/components/simple-icons";
import { loadWorkersFromSupabase } from "@/lib/supabase-flow";

const sections = ["Workers", "Users", "Job Requests", "Reports", "Reviews", "Verification Status"];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const workers = await loadWorkersFromSupabase();
  const cards = [
    ["Users", "Auth", "user"],
    ["Workers", String(workers.length), "worker"],
    ["Active Jobs", "0", "jobs"],
    ["Reports", "0", "bell"]
  ];

  return (
    <main className="container-page py-8">
      <div className="mb-7">
        <p className="text-sm font-black text-brand-600">Admin Panel</p>
        <h1 className="text-3xl font-black md:text-5xl">Manage MistriHub safely</h1>
        <p className="mt-2 text-slate-600">Users, workers, jobs, reviews, reports, categories and verification.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value, icon]) => (
          <div className="card p-5" key={label}>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Icon name={icon} />
            </span>
            <p className="mt-4 text-3xl font-black">{value}</p>
            <p className="font-bold text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-black">Recent Job Requests</h2>
          </div>
          <div className="p-5 text-sm font-bold text-slate-500">No real job requests connected yet.</div>
        </div>
        <div className="card p-5">
          <h2 className="text-xl font-black">Verification Queue</h2>
          <div className="mt-4 space-y-3">
            {workers.length ? workers.slice(0, 3).map((worker) => (
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4" key={worker.id}>
                <span className="font-bold">{worker.name}</span>
                <span className="status-pill status-available">Review</span>
              </div>
            )) : <p className="text-sm font-bold text-slate-500">No worker registrations yet.</p>}
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <div className="card p-5" key={section}>
            <h2 className="font-black">{section}</h2>
            <p className="mt-2 text-sm text-slate-500">Backend table connection pending.</p>
          </div>
        ))}
      </div>
    </main>
  );
}
