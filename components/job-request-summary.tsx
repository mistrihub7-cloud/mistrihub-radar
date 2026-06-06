import { JobRequest } from "@/lib/data";
import { Icon } from "./simple-icons";

export function JobRequestSummary({ request }: { request: JobRequest }) {
  const items = [
    ["Job ID", request.id],
    ["Service type", request.service],
    ["Distance", request.distance],
    ["Area", request.area],
    ["Urgency", request.urgency],
    ["Preferred date", request.preferredTime]
  ];

  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-brand-600">Review Before Accept</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 md:text-3xl">New {request.service} job request</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{request.summary}</p>
        </div>
        <span className={request.urgency === "Urgent" ? "status-pill bg-red-50 text-red-600" : "status-pill bg-blue-50 text-brand-600"}>
          {request.urgency}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div className="rounded-2xl border border-slate-200 bg-white p-3" key={label}>
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-1 font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <h2 className="font-black">Problem description</h2>
        <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{request.description}</p>
      </div>

      {request.photoAvailable ? (
        <div className="mt-5">
          <h2 className="mb-2 font-black">Uploaded photo</h2>
          <div className="flex h-28 items-end rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-200 to-slate-100 p-3">
            <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
              <Icon className="h-4 w-4 text-brand-600" name="jobs" />
              Optional photo attached
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
