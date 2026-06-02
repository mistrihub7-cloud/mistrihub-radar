import { Icon } from "@/components/simple-icons";

const cards = [
  ["Users", "10,240", "user"],
  ["Workers", "540", "worker"],
  ["Active Jobs", "82", "jobs"],
  ["Reports", "12", "bell"]
];

export default function AdminPage() {
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
          {["MH1256 - Electrician - Accepted", "MH1257 - Plumber - Requested", "MH1258 - AC Repair - On The Way", "MH1259 - Painter - Completed"].map((row) => (
            <div className="flex items-center justify-between border-b border-slate-100 p-5 text-sm font-bold" key={row}>
              {row}
              <button className="text-brand-600">View</button>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <h2 className="text-xl font-black">Verification Queue</h2>
          <div className="mt-4 space-y-3">
            {["Rajesh Kumar", "Yogesh Kumar", "Pawan Kumar"].map((name) => (
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4" key={name}>
                <span className="font-bold">{name}</span>
                <span className="status-pill status-available">Review</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
