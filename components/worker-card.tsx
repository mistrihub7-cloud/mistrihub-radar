import Link from "next/link";
import { cleanCategoryName } from "@/lib/category-display";
import { Worker } from "@/lib/data";
import { BookWorkerLink } from "./book-worker-link";
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
      <div className="flex items-start gap-4">
        {worker.profilePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={worker.name}
            className="h-24 w-20 shrink-0 rounded-2xl border border-slate-200 object-cover object-top shadow-sm ring-4 ring-blue-50"
            src={worker.profilePhoto}
          />
        ) : (
          <div className={`${avatarClass} !h-24 !w-20 !rounded-2xl border border-slate-200 shadow-sm ring-4 ring-blue-50`} />
        )}
        <div className="min-w-0 flex-1">
          <div className="min-w-0">
            <h3 className="break-words text-lg font-black leading-5 text-slate-950">{worker.name}</h3>
            <p className="mt-1 text-sm font-black text-slate-700">{cleanCategoryName(worker.skill)}</p>
            {worker.city ? <p className="text-sm font-semibold text-slate-600">{worker.city}</p> : null}
            <p className="text-sm leading-5 text-slate-500">Serving your area</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <span className={`status-pill flex items-center justify-center text-center ${statusClass}`}>{worker.status}</span>
            {hasReviews ? (
              <span className="flex items-center justify-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                <Icon className="h-4 w-4 fill-amber-400 text-amber-400" name="star" />
                {worker.rating} ({worker.reviews})
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-black text-slate-600">Newly Joined</span>
            )}
            <span className="col-span-2 rounded-full bg-brand-50 px-3 py-1.5 text-center text-xs font-black text-brand-700">Trust Score {worker.trust}</span>
          </div>
        </div>
      </div>
      {!compact && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
            <span className="min-w-0 rounded-xl bg-slate-50 px-2 py-2">
              <b className="block break-words text-slate-950">
                <WorkerDistance workerLatitude={worker.latitude} workerLongitude={worker.longitude} />
              </b>
              Distance
            </span>
            <span className="rounded-xl bg-slate-50 px-2 py-2">
              <b className="block text-slate-950">{worker.jobs}</b>Jobs
            </span>
            <span className="rounded-xl bg-slate-50 px-2 py-2">
              <b className="block text-slate-950">{hasReviews ? worker.reviews : "No"}</b>Reviews
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <BookWorkerLink className="btn-primary h-10 text-sm" workerId={worker.id}>
              Send Request
            </BookWorkerLink>
            <Link className="btn-outline h-10 text-sm" href={`/workers/${worker.id}`}>
              View Details
            </Link>
          </div>
        </>
      )}
    </article>
  );
}
