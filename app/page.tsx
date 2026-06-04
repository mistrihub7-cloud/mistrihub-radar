import Link from "next/link";
import { categories } from "@/lib/data";
import { Icon } from "@/components/simple-icons";
import { LocationLabel } from "@/components/location-label";
import { Logo } from "@/components/logo";
import { NearbyWorkerList } from "@/components/nearby-worker-list";
import { SectionTitle } from "@/components/section-title";
import { LocalWorkerList } from "@/components/local-worker-list";
import { loadWorkersFromSupabase } from "@/lib/supabase-flow";

export const dynamic = "force-dynamic";

function HeroWorker({ className = "h-auto w-full object-contain" }: { className?: string }) {
  return (
    // Use a direct public image so the hero appears immediately after deploy/cache refresh.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="MistriHub trusted worker"
      className={className}
      src="/hero-worker.png?v=3"
    />
  );
}

function CategoryGrid() {
  return (
    <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
      {categories.map((category) => (
        <Link
          className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
          href={`/workers?service=${encodeURIComponent(category.name)}`}
          key={category.name}
        >
          <span className={`mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-50 ${category.tone}`}>
            <Icon name={category.icon} />
          </span>
          <span className="mt-2 block text-xs font-black text-slate-950">{category.name}</span>
        </Link>
      ))}
    </div>
  );
}

function EmergencyBox() {
  const items = [
    ["Need Electrician Now", "Electrician", "bolt", "text-orange-600", "bg-orange-50"],
    ["Need Plumber Now", "Plumber", "tap", "text-blue-600", "bg-blue-50"],
    ["Need Mechanic Now", "Mechanic", "tool", "text-emerald-600", "bg-emerald-50"],
    ["Other Emergency", "Emergency", "bell", "text-violet-600", "bg-violet-50"]
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map(([label, service, icon, tone, bg]) => (
        <Link
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black ${tone} ${bg}`}
          href={`/book?service=${encodeURIComponent(service)}&urgency=urgent`}
          key={label}
        >
          <Icon name={icon} />
          {label}
        </Link>
      ))}
    </div>
  );
}

function NearbyWorkersPanel({ workers }: { workers: Awaited<ReturnType<typeof loadWorkersFromSupabase>> }) {
  return (
    <aside className="hidden space-y-4 xl:block">
      <div className="card p-5">
        <SectionTitle actionHref="/workers" title="Nearby Workers" />
        <p className="mb-4 rounded-2xl bg-brand-50 p-3 text-sm font-bold text-brand-700">
          Nearby workers serving your area. Km updates after user location is allowed.
        </p>
        <NearbyWorkerList compact emptyMessage="No workers registered yet." limit={3} workers={workers} />
        <Link className="btn-outline mt-4 w-full" href="/workers">
          View Nearby Workers
        </Link>
      </div>
    </aside>
  );
}

function TrustStatsSection({ workers }: { workers: Awaited<ReturnType<typeof loadWorkersFromSupabase>> }) {
  return (
    <section className="container-page mt-5 grid gap-5 md:grid-cols-[1fr_0.85fr]">
      <div className="card grid gap-5 p-5 md:grid-cols-[1fr_150px] md:items-center">
        <div>
          <h3 className="text-xl font-black">Trust & Safety</h3>
          <ul className="mt-4 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
            {["Verified Workers", "No Direct Contact Before Booking", "Secure Job Tracking", "Customer Support 24/7"].map((item) => (
              <li className="flex items-center gap-3" key={item}>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Icon className="h-3 w-3" name="check" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <span className="hidden h-28 w-28 place-items-center rounded-[2rem] bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-card md:grid">
          <Icon className="h-16 w-16" name="shield" />
        </span>
      </div>
      <div className="card grid grid-cols-2 gap-5 bg-gradient-to-br from-white to-blue-50 p-5">
        {[
          [workers.length.toString(), "Workers Added"],
          [categories.length.toString(), "Service Categories"],
          ["Locked", "Contact Before Accept"],
          ["PWA", "Install Ready"]
        ].map(([value, label]) => (
          <div key={label}>
            <p className="text-2xl font-black text-brand-600">{value}</p>
            <p className="text-sm font-semibold text-slate-600">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const workers = await loadWorkersFromSupabase();
  const topWorkers = workers.filter((worker) => worker.trust >= 92).slice(0, 4);

  return (
    <main className="mobile-shell min-h-screen md:min-h-0 md:bg-transparent">
      <section className="container-page grid gap-7 py-4 md:grid-cols-[1fr_0.9fr] md:py-10 xl:grid-cols-[1.25fr_0.9fr_0.95fr]">
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Icon className="h-4 w-4 text-brand-600" name="location" />
                <LocationLabel />
              </p>
              <Logo />
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-slate-200">
              <Icon name="bell" />
            </button>
          </div>
        </div>

        <div className="space-y-5 md:pt-16">
          <div className="hidden w-fit rounded-lg bg-emerald-50 px-4 py-2 text-sm font-black text-slate-800 md:flex md:items-center md:gap-2">
            <Icon className="h-4 w-4 text-emerald-600" name="shield" />
            Real added workers
          </div>
          <div className="grid grid-cols-[1.1fr_0.9fr] items-center gap-3 md:block">
            <div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
                Find Trusted <span className="text-brand-600">Workers Near You</span>
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-600 md:text-xl">
                Electrician, Plumber, Mechanic, Painter, AC Repair, Carpenter, Labour and more.
              </p>
            </div>
            <div className="md:hidden">
              <HeroWorker className="h-[155px] w-full rounded-2xl object-cover object-center" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link className="btn-primary" href="/workers">
              <Icon name="location" />
              Find Worker Now
            </Link>
            <Link className="btn-outline" href="/worker/register">
              <Icon name="user" />
              Join as Worker
            </Link>
          </div>
        </div>

        <div className="hidden min-w-0 md:block md:pt-4">
          <div className="mx-auto w-full max-w-[640px]">
            <HeroWorker />
          </div>
        </div>

        <NearbyWorkersPanel workers={workers} />
      </section>

      <section className="container-page grid gap-5 md:grid-cols-[1.55fr_0.75fr]">
        <div className="card p-4 md:p-5">
          <SectionTitle actionHref="/book" title="What service do you need?" />
          <CategoryGrid />
          <Link className="btn-outline mt-4 w-full" href="/book">
            View All
          </Link>
        </div>
        <div className="card p-4 md:p-5">
          <SectionTitle action="View All" actionHref="/book?urgency=urgent" title="Need Help Now? (Emergency)" />
          <EmergencyBox />
          <Link className="btn-outline mt-4 w-full" href="/book?urgency=urgent">
            View All
          </Link>
        </div>
      </section>

      <section className="container-page mt-5">
        <div className="card p-4 md:p-5">
          <SectionTitle actionHref="/workers" title="Nearby Workers" />
          <NearbyWorkerList layout="grid" limit={4} workers={workers} />
          <div className="mt-4">
            <LocalWorkerList />
          </div>
          <Link className="btn-outline mt-4 w-full" href="/workers">
            View All
          </Link>
        </div>
      </section>

      <TrustStatsSection workers={workers} />

      <section className="container-page mt-5 grid gap-5 pb-8 md:grid-cols-[0.85fr_1.15fr]" id="how-it-works">
        <div className="card p-5">
          <SectionTitle action="Book Now" actionHref="/workers" title="How It Works" />
          <div className="grid grid-cols-4 gap-2 text-center">
            {["Choose Service", "Send Request", "Worker Accepts", "Track & Review"].map((step, index) => (
              <div key={step}>
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-brand-50 font-black text-brand-600">
                  {index + 1}
                </span>
                <p className="mt-2 text-xs font-bold text-slate-700">{step}</p>
              </div>
            ))}
          </div>
          <Link className="btn-outline mt-4 w-full" href="/workers">
            Book Now
          </Link>
        </div>
        <div className="card p-5">
          <SectionTitle actionHref="/workers" title="Top Rated Workers" />
          {topWorkers.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topWorkers.map((worker) => (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3" key={worker.id}>
                  <div className="worker-avatar !h-12 !w-12 !rounded-xl" />
                  <div>
                    <p className="font-black">{worker.name}</p>
                    <p className="text-xs text-slate-500">{worker.skill}</p>
                    <p className="text-xs font-bold text-slate-700">
                      {worker.rating} ({worker.reviews}) Trust {worker.trust}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
              Top rated workers will appear after worker registrations and reviews.
            </div>
          )}
          <Link className="btn-outline mt-4 w-full" href="/workers">
            View All
          </Link>
        </div>
      </section>
    </main>
  );
}
