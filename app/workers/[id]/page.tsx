import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactActions } from "@/components/contact-actions";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";
import { WorkerDistance } from "@/components/worker-distance";
import { cleanCategoryName } from "@/lib/category-display";
import { loadWorkerFromSupabase, loadWorkerReviews } from "@/lib/supabase-flow";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WorkerProfilePage({ params }: { params: { id: string } }) {
  const worker = await loadWorkerFromSupabase(params.id);
  if (!worker) notFound();
  const reviews = await loadWorkerReviews(worker.id);
  const skillLabel = cleanCategoryName(worker.skill);
  const hasReviews = worker.reviews > 0 && Number(worker.rating) > 0;
  const statusClass =
    worker.status === "Available Today"
      ? "status-available"
      : worker.status === "Busy"
        ? "status-busy"
        : "status-offline";

  const services = [
    `${skillLabel} inspection`,
    `${skillLabel} repair service`,
    "Home visit after request acceptance",
    "Problem review before contact unlock"
  ];

  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Worker Profile" />
      <section className="container-page pb-8 pt-2 md:grid md:grid-cols-[1fr_0.75fr] md:gap-6 md:py-10">
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-start gap-4">
              {worker.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={worker.name} className="h-32 w-24 rounded-2xl border border-slate-200 object-cover object-top shadow-sm ring-4 ring-blue-50" src={worker.profilePhoto} />
              ) : (
                <div className="worker-avatar !h-32 !w-24 !rounded-2xl shadow-sm ring-4 ring-blue-50" />
              )}
              <div className="min-w-0 flex-1">
                <span className={`status-pill ${statusClass}`}>{worker.status}</span>
                <h1 className="mt-3 text-3xl font-black">{worker.name}</h1>
                <p className="text-sm font-bold text-slate-600">{skillLabel}</p>
                <p className="mt-1 text-sm text-slate-500">{worker.city || "City not saved"}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Link className="rounded-2xl bg-slate-50 p-3 text-center transition hover:bg-brand-50" href="#reviews">
                <p className="text-xs font-bold text-slate-500">Reviews</p>
                <p className="mt-1 font-black">{hasReviews ? `${worker.rating} (${worker.reviews})` : "New worker"}</p>
                <p className="mt-1 text-[11px] font-black text-brand-600">View</p>
              </Link>
              {[
                { label: "Trust Score", value: worker.trust.toString() },
                { label: "Distance", value: <WorkerDistance workerLatitude={worker.latitude} workerLongitude={worker.longitude} /> },
                { label: "Service Radius", value: `${worker.serviceRadius} km` }
              ].map((item) => (
                <div className="rounded-2xl bg-slate-50 p-3 text-center" key={item.label}>
                  <p className="text-xs font-bold text-slate-500">{item.label}</p>
                  <p className="mt-1 font-black">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-xl font-black">About worker</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {worker.name} provides {skillLabel.toLowerCase()} services in {worker.city || "saved service city"}. Contact details stay locked until a job is accepted.
            </p>
          </div>

          <div className="card p-5">
            <h2 className="text-xl font-black">Services offered</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold" key={service}>
                  <Icon className="h-4 w-4 text-brand-600" name="check" />
                  {service}
                </p>
              ))}
            </div>
          </div>

          <div className="card p-5" id="reviews">
            <h2 className="text-xl font-black">Reviews</h2>
            {reviews.length ? (
              <div className="mt-4 grid gap-3">
                {reviews.map((review) => (
                  <div className="rounded-2xl bg-slate-50 p-4" key={review.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black text-slate-950">{review.customer_name || "MistriHub.In user"}</p>
                      <p className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">{review.rating}/5</p>
                    </div>
                    {review.comment ? <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-bold text-slate-600">No reviews yet. Job complete hone ke baad user review de sakta hai.</p>
            )}
          </div>
        </div>

        <aside className="mt-5 space-y-4 md:mt-0">
          <Link className="btn-primary w-full" href={`/book/${worker.id}`}>
            Send Request
          </Link>
          <Link className="btn-outline w-full" href={`/book/${worker.id}`}>
            Book Now
          </Link>
          <ContactActions unlocked={false} />
        </aside>
      </section>
    </main>
  );
}
