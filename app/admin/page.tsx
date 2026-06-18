import type { Metadata } from "next";
import Link from "next/link";
import { AdminPushSetup } from "@/components/admin-push-setup";
import { cleanCategoryName } from "@/lib/category-display";
import { isAdminAuthed, isAdminConfigured } from "@/lib/admin-auth";
import { supabaseServer } from "@/lib/supabase-server";
import { escalateJobFromAdmin, loginAdmin, logoutAdmin } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false }
};

type JobRow = {
  id: string;
  service?: string | null;
  problem_description?: string | null;
  urgency?: string | null;
  area?: string | null;
  status?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  worker_id?: string | null;
  created_at?: string | null;
};

type WorkerRow = {
  id: string;
  name?: string | null;
  category?: string | null;
  city?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  availability_status?: string | null;
  service_radius?: number | null;
};

type ProfileRow = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  role?: string | null;
};

function minutesSince(value?: string | null) {
  if (!value) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
}

function phoneLink(phone?: string | null) {
  const clean = (phone || "").replace(/\D/g, "").slice(-10);
  return clean ? `tel:${clean}` : "";
}

function whatsappLink(phone?: string | null) {
  const clean = (phone || "").replace(/\D/g, "").slice(-10);
  return clean ? `https://wa.me/91${clean}` : "";
}

async function loadAdminData() {
  if (!supabaseServer) {
    return {
      jobs: [] as JobRow[],
      workers: [] as WorkerRow[],
      users: [] as ProfileRow[],
      alerts: [] as any[],
      failedLogs: [] as any[],
      pushLogs: [] as any[],
      pushTokens: [] as any[]
    };
  }
  const [jobs, workers, users, alerts, failedLogs, pushLogs, pushTokens] = await Promise.all([
    supabaseServer.from("job_requests").select("*").order("created_at", { ascending: false }).range(0, 49),
    supabaseServer.from("workers").select("id,name,category,city,phone,whatsapp,availability_status,service_radius").order("created_at", { ascending: false }).range(0, 199),
    supabaseServer.from("profiles").select("id,full_name,phone,email,role").order("full_name", { ascending: true }).range(0, 199),
    supabaseServer.from("notifications").select("*").eq("type", "admin_alert").order("created_at", { ascending: false }).range(0, 20),
    supabaseServer.from("notification_logs").select("*").eq("status", "failed").order("created_at", { ascending: false }).range(0, 10),
    supabaseServer.from("notification_logs").select("*").eq("channel", "web_push").order("created_at", { ascending: false }).range(0, 20),
    supabaseServer.from("push_tokens").select("id,role,name,phone,service,worker_id,endpoint,last_seen,updated_at,created_at").order("updated_at", { ascending: false }).range(0, 30)
  ]);
  return {
    jobs: (jobs.data || []) as JobRow[],
    workers: (workers.data || []) as WorkerRow[],
    users: (users.data || []) as ProfileRow[],
    alerts: alerts.data || [],
    failedLogs: failedLogs.data || [],
    pushLogs: pushLogs.data || [],
    pushTokens: pushTokens.data || []
  };
}

function LoginPanel({ error }: { error?: string }) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <p className="text-sm font-black text-blue-300">MistriHub.In Hidden Admin</p>
        <h1 className="mt-2 text-3xl font-black">Admin Login</h1>
        {!isAdminConfigured() ? (
          <div className="mt-5 rounded-2xl bg-red-950 p-4 text-sm font-bold text-red-100">
            Vercel env missing: MISTRIHUB_ADMIN_PASSWORD set karo. Password ke bina admin panel locked hai.
          </div>
        ) : null}
        {error ? <p className="mt-4 rounded-xl bg-red-950 p-3 text-sm font-bold text-red-100">Wrong admin user/password.</p> : null}
        <form action={loginAdmin} className="mt-6 grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-300">Username</span>
            <input className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white" name="username" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-300">Password</span>
            <input className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white" name="password" required type="password" />
          </label>
          <button className="btn-primary mt-2" type="submit">Open Admin Panel</button>
        </form>
      </div>
    </main>
  );
}

export default async function AdminPage({ searchParams }: { searchParams?: { error?: string } }) {
  if (!isAdminAuthed()) return <LoginPanel error={searchParams?.error} />;

  const { jobs, workers, users, alerts, failedLogs, pushLogs, pushTokens } = await loadAdminData();
  const workerPushTokens = pushTokens.filter((token: any) => token.role === "worker");
  const adminPushTokens = pushTokens.filter((token: any) => token.role === "admin");
  const openJobs = jobs.filter((job) => job.status === "Requested");
  const noResponseJobs = openJobs.filter((job) => minutesSince(job.created_at) >= 5);
  const adminDueJobs = openJobs.filter((job) => minutesSince(job.created_at) >= (job.urgency === "Emergency" ? 2 : 10));
  const availableWorkers = workers.filter((worker) => (worker.availability_status || "Available Today") !== "Not Available");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-blue-300">MistriHub.In Hidden Admin</p>
            <h1 className="text-3xl font-black">No User Left Without Response</h1>
          </div>
          <form action={logoutAdmin}>
            <button className="rounded-xl border border-red-500 px-4 py-2 text-sm font-black text-red-200" type="submit">Logout</button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Open requests", openJobs.length],
            ["No response 5m+", noResponseJobs.length],
            ["Active professionals", availableWorkers.length],
            ["Admin devices", adminPushTokens.length || 0]
          ].map(([label, value]) => (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4" key={label}>
              <p className="text-3xl font-black text-blue-300">{value}</p>
              <p className="mt-1 text-sm font-bold text-slate-300">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <AdminPushSetup />
        </div>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Notification Health</h2>
              <p className="mt-1 text-sm font-bold text-slate-300">
                Admin alert normal/direct jobs me 10 minute par aur emergency jobs me 2 minute par background push karega.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${adminPushTokens.length ? "bg-emerald-900 text-emerald-100" : "bg-red-950 text-red-100"}`}>
              {adminPushTokens.length ? "Admin push active" : "Admin push not active"}
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ["Admin devices", adminPushTokens.length],
              ["Worker devices", workerPushTokens.length],
              ["Admin alert due", adminDueJobs.length],
              ["Recent push logs", pushLogs.length]
            ].map(([label, value]) => (
              <div className="rounded-xl bg-slate-950 p-3" key={label}>
                <p className="text-xs font-bold text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>

          {!adminPushTokens.length ? (
            <p className="mt-4 rounded-xl bg-amber-950/50 p-3 text-sm font-black leading-6 text-amber-100">
              Is browser/PWA me admin background alert enable nahi hai. Upar “Enable Admin Background Alerts” button press karke Allow karo.
            </p>
          ) : null}

          {pushLogs.length ? (
            <div className="mt-4 grid gap-2">
              <h3 className="font-black text-slate-100">Recent Push Logs</h3>
              {pushLogs.slice(0, 5).map((log: any) => (
                <p className={`rounded-xl bg-slate-950 p-3 text-xs font-bold leading-5 ${log.status === "sent" ? "text-emerald-100" : "text-red-100"}`} key={log.id}>
                  {log.status} | Job {log.request_id || "n/a"} | {log.worker_id ? `Professional ${log.worker_id}` : "Admin alert"} | {log.error_message || "No error"}
                </p>
              ))}
            </div>
          ) : null}
        </section>

        {alerts.length ? (
          <div className="mt-6 rounded-2xl border border-amber-900 bg-amber-950/40 p-4">
            <h2 className="font-black text-amber-100">Admin Alerts</h2>
            <div className="mt-3 grid gap-2">
              {alerts.slice(0, 5).map((alert: any) => (
                <p className="rounded-xl bg-slate-950 p-3 text-sm font-bold text-amber-100" key={alert.id}>{alert.message}</p>
              ))}
            </div>
          </div>
        ) : null}

        {failedLogs.length ? (
          <section className="mt-6 rounded-2xl border border-red-900 bg-red-950/30 p-4">
            <h2 className="text-xl font-black text-red-100">Failed Notification Logs</h2>
            <div className="mt-3 grid gap-2">
              {failedLogs.map((log: any) => (
                <p className="rounded-xl bg-slate-950 p-3 text-xs font-bold leading-5 text-red-100" key={log.id}>
                  {log.channel} | Job {log.request_id} | Worker {log.worker_id || "n/a"} | {log.phone || "phone missing"} | {log.error_message || "Failed"}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-xl font-black">Pending Jobs & Escalation</h2>
            <div className="mt-4 grid gap-3">
              {openJobs.length ? openJobs.map((job) => (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4" key={job.id}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-blue-300">Job {job.id} - {minutesSince(job.created_at)} min old</p>
                      <h3 className="text-lg font-black">{cleanCategoryName(job.service || "")} - {job.area || "Area missing"}</h3>
                      <p className="mt-1 text-sm text-slate-300">{job.problem_description || "No problem description"}</p>
                      <p className="mt-2 text-sm font-bold text-slate-400">User: {job.customer_name || "Name missing"} | {job.customer_phone || "Phone missing"}</p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2">
                      {phoneLink(job.customer_phone) ? <a className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black" href={phoneLink(job.customer_phone)}>Call User</a> : null}
                      {whatsappLink(job.customer_phone) ? <a className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black" href={whatsappLink(job.customer_phone)} rel="noreferrer" target="_blank">WhatsApp User</a> : null}
                      <Link className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-black" href={`/jobs/${job.id}`}>Open Job</Link>
                    </div>
                  </div>
                  <form action={escalateJobFromAdmin} className="mt-3">
                    <input name="jobId" type="hidden" value={job.id} />
                    <button className="rounded-xl border border-amber-500 px-4 py-2 text-sm font-black text-amber-100" type="submit">
                      Manual 20km Alert + Admin Record
                    </button>
                  </form>
                </div>
              )) : <p className="rounded-xl bg-slate-950 p-4 text-sm font-bold text-slate-300">No pending jobs right now.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-xl font-black">Professionals Phone Directory</h2>
            <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-1">
              {workers.map((worker) => (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3" key={worker.id}>
                  <p className="font-black">{worker.name || "Professional"}</p>
                  <p className="text-sm font-bold text-slate-300">{cleanCategoryName(worker.category || "")} - {worker.city || "City missing"}</p>
                  <p className="text-sm text-slate-400">Phone: {worker.phone || "Missing"} | WhatsApp: {worker.whatsapp || "Missing"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {phoneLink(worker.phone || worker.whatsapp) ? <a className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black" href={phoneLink(worker.phone || worker.whatsapp)}>Call</a> : null}
                    {whatsappLink(worker.whatsapp || worker.phone) ? <a className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black" href={whatsappLink(worker.whatsapp || worker.phone)} rel="noreferrer" target="_blank">WhatsApp</a> : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-xl font-black">Users</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3" key={user.id}>
                <p className="font-black">{user.full_name || "User"}</p>
                <p className="text-sm text-slate-300">{user.phone || "Phone missing"}</p>
                <p className="text-sm text-slate-400">{user.email || "Email missing"} - {user.role || "user"}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
