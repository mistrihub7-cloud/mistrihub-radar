import Link from "next/link";
import { LocationLabel } from "@/components/location-label";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";
import { WorkerCard } from "@/components/worker-card";
import { discoveryRules, workers } from "@/lib/data";

const tabs = ["All", "Available Today", "Busy", "Not Available"];

export default function WorkersPage() {
  const matchingWorkers = [...workers].sort((a, b) => a.distanceKm - b.distanceKm || b.trust - a.trust);

  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar title="Nearby Workers" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mb-5 rounded-2xl bg-brand-50 p-4 text-sm font-bold text-brand-700 md:hidden">
          Nearby workers serving your area
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="card p-5">
            <p className="text-sm font-black text-brand-600">Nearby Worker Discovery</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Workers serving your area</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Showing real added workers based on user location, service area, service radius, distance, trust score,
              rating and jobs completed.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">Your area</p>
                <p className="mt-1 font-black">
                  <LocationLabel />
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">Default radius</p>
                <p className="mt-1 font-black">City {discoveryRules.cityRadius} / Town {discoveryRules.townRadius}</p>
              </div>
            </div>

            <div className="mt-5">
              <h2 className="font-black">Search priority</h2>
              <div className="mt-3 space-y-2">
                {discoveryRules.priority.map((item, index) => (
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm font-bold shadow-sm" key={item}>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-600">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              <b className="block">Emergency requests</b>
              Matching workers inside service radius receive website and WhatsApp notifications first. Other added workers stay visible for discovery.
            </div>
          </aside>

          <section>
            <div className="mb-4 flex gap-3 overflow-x-auto pb-1">
              {tabs.map((tab, index) => (
                <Link
                  className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-black ${
                    index === 0
                      ? "border-b-2 border-brand-600 bg-brand-50 text-brand-600"
                      : tab === "Available Today"
                        ? "bg-emerald-50 text-emerald-700"
                        : tab === "Busy"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-red-50 text-red-700"
                  }`}
                  href="/workers"
                  key={tab}
                >
                  {tab}
                </Link>
              ))}
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3">
              {[
                ["Workers found", matchingWorkers.length.toString()],
                ["Best distance", "1.2 km"],
                ["Top trust", "92"]
              ].map(([label, value]) => (
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center" key={label}>
                  <p className="text-xl font-black text-brand-600">{value}</p>
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {matchingWorkers.map((worker) => (
                <WorkerCard key={worker.name} worker={worker} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
