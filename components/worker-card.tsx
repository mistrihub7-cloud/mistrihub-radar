import Link from "next/link";
import { Worker } from "@/lib/data";
import { Icon } from "./simple-icons";
import { WorkerDistance } from "./worker-distance";

export function WorkerCard({ worker, compact = false }: { worker: Worker; compact?: boolean }) {
  const hasReviews = worker.reviews > 0 && Number(worker.rating) > 0;
  const statusClass =
    worker.status === "Available Today"
      ? "status-available"
      : worker.status === "Busy"
        ? "status-busy"
        : "status-offline";
  const avatarClass =
    worker.status === "Available Today"
      ? "worker-avatar"
      : worker.status === "Busy"
        ? "worker-avatar busy"
        : "worker-avatar offline";

  return (
    <article className={`card p-4 transition hover:-translate-y-0.5 hover:shadow-card ${compact ? "" : "h-full"}`}>
      <div className="flex items-start gap-3">
        {worker.profilePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={worker.name} className="h-16 w-16 shrink-0 rounded-full border border-slate-200 object-cover shadow-sm" src={worker.profilePhoto} />
        ) : (
          <div className={`${avatarClass} !rounded-full border border-slate-200 shadow-sm`} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="break-words font-black leading-5 text-slate-950">{worker.name}</h3>
              <p className="text-sm font-semibold text-slate-700">
                {worker.skill}{worker.city ? ` - ${worker.city}` : ""}
              </p>
              <p className="break-words text-sm leading-5 text-slate-500">Serving your area</p>
            </div>
            <span className={`status-pill shrink-0 ${statusClass}`}>{worker.status}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
            {hasReviews ? (
              <span className="flex items-center gap-1 font-bold">
                <Icon className="h-4 w-4 fill-amber-400 text-amber-400" name="star" />
                {worker.rating} ({worker.reviews})
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">New worker</span>
            )}
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">Trust Score {worker.trust}</span>
          </div>
        </div>
      </div>
      {!compact && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
            <span className="min-w-0">
              <b className="block break-words text-slate-950">
                <WorkerDistance missingWorkerText="Unavailable" workerLatitude={worker.latitude} workerLongitude={worker.longitude} />
              </b>
              Distance
            </span>
            <span>
              <b className="block text-slate-950">{worker.jobs || "New"}</b>Jobs
            </span>
            <span>
              <b className="block text-slate-950">{hasReviews ? worker.reviews : "No"}</b>Reviews
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link className="btn-primary h-10 text-sm" href={`/book/${worker.id}`}>
              Send Request
            </Link>
            <Link className="btn-outline h-10 text-sm" href={`/workers/${worker.id}`}>
              View Details
            </Link>
          </div>
        </>
      )}
    </article>
  );
}
