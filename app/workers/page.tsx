import Link from "next/link";
import { LocalWorkerList } from "@/components/local-worker-list";
import { MobileTopbar } from "@/components/mobile-topbar";
import { NearbyWorkerList } from "@/components/nearby-worker-list";
import { loadWorkersFromSupabase } from "@/lib/supabase-flow";

const tabs = ["All", "Available Today", "Busy", "Not Available"];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WorkersPage({ searchParams }: { searchParams?: { status?: string; service?: string } }) {
  const workers = await loadWorkersFromSupabase();
  const selectedStatus = searchParams?.status || "All";
  const selectedService = searchParams?.service || "";
  const matchingWorkers = workers
    .filter((worker) => selectedStatus === "All" || worker.status === selectedStatus)
    .filter((worker) => !selectedService || worker.skill === selectedService);
  const availableCount = matchingWorkers.filter((worker) => worker.status === "Available Today").length;
  const reviewedWorkers = matchingWorkers.filter((worker) => worker.reviews > 0 && Number(worker.rating) > 0);
  const topRating = reviewedWorkers.length ? reviewedWorkers.reduce((max, worker) => Math.max(max, Number(worker.rating) || 0), 0).toFixed(1) : "New";

  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar title="Nearby Workers" />
      <section className="container-page pb-28 pt-2 md:py-10">
        <div className="mb-5 rounded-2xl bg-brand-50 p-4 text-sm font-bold text-brand-700 md:hidden">
          Nearby workers serving your area
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="card p-5">
            <p className="text-sm font-black text-brand-600">Nearby Worker Discovery</p>
            <h1 className="mt-1 break-words text-2xl font-black text-slate-950 md:text-3xl">Workers serving your area</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Nearby trusted workers available for booking requests.</p>

            <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              <b className="block">Emergency requests</b>
              Matching workers in the saved service area receive website and WhatsApp notifications first. Other added workers stay visible for discovery.
            </div>
          </aside>

          <section>
            <div className="mb-4 flex max-w-full gap-2 overflow-x-auto pb-2">
              {tabs.map((tab, index) => (
                <Link
                  className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-black sm:text-sm ${
                    selectedStatus === tab
                      ? "border-b-2 border-brand-600 bg-brand-50 text-brand-600"
                      : tab === "Available Today"
                        ? "bg-emerald-50 text-emerald-700"
                        : tab === "Busy"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-red-50 text-red-700"
                  }`}
                  href={`/workers${tab === "All" ? "" : `?status=${encodeURIComponent(tab)}`}`}
                  key={tab}
                >
                  {tab}
                </Link>
              ))}
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Workers found", matchingWorkers.length.toString()],
                ["Available today", availableCount.toString()],
                ["Reviews", topRating]
              ].map(([label, value]) => (
                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 text-center" key={label}>
                  <p className="text-xl font-black text-brand-600">{value}</p>
                  <p className="break-words text-xs font-bold leading-4 text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <LocalWorkerList />
              <NearbyWorkerList workers={matchingWorkers} />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
