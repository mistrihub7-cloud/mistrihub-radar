import Link from "next/link";
import { Worker } from "@/lib/data";
import { Icon } from "./simple-icons";

export function WorkerCard({ worker, compact = false }: { worker: Worker; compact?: boolean }) {
  const statusClass =
    worker.status === "Available"
      ? "status-available"
      : worker.status === "Busy"
        ? "status-busy"
        : "status-offline";
  const avatarClass =
    worker.status === "Available"
      ? "worker-avatar"
      : worker.status === "Busy"
        ? "worker-avatar busy"
        : "worker-avatar offline";

  return (
    <article className={`card p-4 ${compact ? "" : "h-full"}`}>
      <div className="flex items-start gap-3">
        <div className={avatarClass} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="truncate font-black text-slate-950">{worker.name}</h3>
              <p className="text-sm font-semibold text-slate-600">{worker.skill}</p>
              <p className="text-sm text-slate-600">{worker.distance}</p>
            </div>
            <span className={`status-pill ${statusClass}`}>{worker.status}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-1 font-bold">
              <Icon className="h-4 w-4 fill-amber-400 text-amber-400" name="star" />
              {worker.rating} ({worker.reviews})
            </span>
            <span className="font-bold text-slate-700">Trust {worker.trust}</span>
          </div>
        </div>
      </div>
      {!compact && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
            <span>
              <b className="block text-slate-950">{worker.distance.split(" ")[0]} km</b>away
            </span>
            <span>
              <b className="block text-slate-950">{worker.jobs}</b>Jobs
            </span>
            <span>
              <b className="block text-slate-950">{worker.response}</b>Response
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link className="btn-primary h-10 text-sm" href="/book">
              Book Now
            </Link>
            <Link className="btn-outline h-10 text-sm" href="/book">
              Send Request
            </Link>
          </div>
        </>
      )}
    </article>
  );
}
