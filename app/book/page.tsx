import Link from "next/link";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";
import { WorkerCard } from "@/components/worker-card";
import { categories, jobRequest, workers } from "@/lib/data";

export default function BookPage() {
  const worker = workers[0];

  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Book Worker" />
      <section className="container-page pb-8 pt-2 md:grid md:grid-cols-[0.8fr_1.2fr] md:gap-6 md:py-10">
        <div className="space-y-4">
          <WorkerCard compact worker={worker} />
          <div className="card hidden p-5 md:block">
            <h2 className="text-xl font-black">Booking Safety</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Phone and WhatsApp are hidden until worker accepts. Every request gets a Job ID and status timeline.
            </p>
            <div className="mt-4 space-y-3">
              {["No direct contact before booking", "Track your job safely", "Verified worker checks"].map((item) => (
                <p className="flex items-center gap-3 text-sm font-bold" key={item}>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" name="check" />
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <form className="mt-5 space-y-5 md:mt-0">
          <label className="block">
            <span className="mb-2 block font-black">Service category</span>
            <span className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {categories.slice(0, 4).map((category) => (
                <button
                  className={`h-12 rounded-2xl border font-black ${
                    category.name === jobRequest.service
                      ? "border-brand-600 bg-brand-50 text-brand-600"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                  key={category.name}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block font-black">Describe your problem</span>
            <textarea
              className="h-32 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm outline-none focus:border-brand-500"
              defaultValue={jobRequest.description}
            />
          </label>

          <div>
            <span className="mb-2 block font-black">Urgency</span>
            <div className="grid grid-cols-2 gap-3">
              <button className="h-14 rounded-2xl border border-slate-200 bg-white font-bold" type="button">
                Normal
              </button>
              <button className="h-14 rounded-2xl border border-red-400 bg-red-50 font-black text-red-600" type="button">
                Urgent
              </button>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block font-black">Preferred Time</span>
            <span className="flex h-14 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 font-bold">
              {jobRequest.preferredTime}
              <Icon className="h-5 w-5 text-slate-500" name="calendar" />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block font-black">User location / area</span>
            <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold">
              <Icon className="h-5 w-5 text-brand-600" name="location" />
              {jobRequest.area}
            </span>
          </label>

          <div>
            <span className="mb-2 block font-black">Add Photos (Optional)</span>
            <div className="flex gap-3">
              {[1, 2].map((item) => (
                <span className="grid h-16 w-16 place-items-end rounded-xl bg-slate-200 p-1" key={item}>
                  <span className="h-4 w-4 rounded-full bg-brand-600" />
                </span>
              ))}
              <button className="grid h-16 w-16 place-items-center rounded-xl border border-dashed border-slate-400 text-3xl text-slate-500" type="button">
                +
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <b className="block">Review Before Accept enabled</b>
            Nearby workers will first see service, area, distance, urgency and problem summary. Call and WhatsApp stay locked until a worker accepts.
          </div>

          <Link className="btn-primary w-full" href="/jobs">
            <Icon name="location" />
            Send Request
          </Link>
        </form>
      </section>
    </main>
  );
}
