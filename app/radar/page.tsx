import Link from "next/link";
import { MobileTopbar } from "@/components/mobile-topbar";
import { RadarMap } from "@/components/radar-map";
import { Icon } from "@/components/simple-icons";
import { WorkerCard } from "@/components/worker-card";
import { workers } from "@/lib/data";

const tabs = ["All", "Available", "Busy", "Offline"];

export default function RadarPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar title="Worker Radar" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-brand-600 md:hidden">
          <Icon className="h-4 w-4" name="location" />
          Using your location
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card hidden p-5 md:block">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black">Worker Radar</h1>
                <p className="mt-1 text-slate-600">Nearest trusted workers first, list view first.</p>
              </div>
              <button className="btn-outline">
                <Icon name="filter" />
                Sort
              </button>
            </div>
            <RadarMap />
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[
                ["Distance", "1.2 km"],
                ["Available", "3 now"],
                ["Avg Trust", "85+"],
                ["Rating", "4.7+"]
              ].map(([label, value]) => (
                <div className="rounded-2xl bg-slate-50 p-4 text-center" key={label}>
                  <p className="text-lg font-black text-brand-600">{value}</p>
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex gap-3 overflow-x-auto pb-1">
              {tabs.map((tab, index) => (
                <button
                  className={`rounded-full px-5 py-2 text-sm font-black ${
                    index === 0
                      ? "border-b-2 border-brand-600 bg-brand-50 text-brand-600"
                      : tab === "Available"
                        ? "bg-emerald-50 text-emerald-700"
                        : tab === "Busy"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-red-50 text-red-700"
                  }`}
                  key={tab}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {workers.map((worker) => (
                <WorkerCard compact key={worker.name} worker={worker} />
              ))}
            </div>
            <Link className="btn-primary mt-5 w-full md:hidden" href="/book">
              Book trusted worker
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
