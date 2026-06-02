import Link from "next/link";
import { ContactActions } from "@/components/contact-actions";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";
import { jobRequest, reviewTimeline, timeline, workers } from "@/lib/data";

export default function JobsPage() {
  const worker = workers[0];

  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Job Tracking" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="card mb-4 flex items-center justify-between p-4">
            <div>
              <b>Job ID: {jobRequest.id}</b>
              <p className="mt-1 text-xs font-bold text-slate-500">Review Before Accept flow</p>
            </div>
            <span className="status-pill status-available">Accepted</span>
          </div>
          <div className="card mb-5 flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="worker-avatar" />
              <div>
                <h2 className="font-black">{worker.name}</h2>
                <p className="text-sm text-slate-500">{worker.skill}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Icon name="phone" />
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Icon name="jobs" />
              </span>
            </div>
          </div>

          <div className="card mb-5 p-4">
            <h2 className="font-black">User notified</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Rajesh accepted the job. Call, WhatsApp and tracking timeline are now unlocked for the user.
            </p>
          </div>

          <div className="relative ml-4 space-y-7">
            <span className="timeline-line absolute bottom-4 left-[11px] top-3 w-1 rounded-full" />
            {timeline.map((item) => (
              <div className="relative flex gap-5" key={item.label}>
                <span
                  className={`z-10 grid h-6 w-6 place-items-center rounded-full border-2 border-white text-white ${
                    item.active ? "bg-brand-600" : item.done ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  {item.done ? <Icon className="h-3 w-3" name="check" /> : null}
                </span>
                <div>
                  <h3 className="font-black">{item.label}</h3>
                  <p className="text-sm text-slate-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <ContactActions unlocked />
          </div>

          <div className="card mt-5 p-4">
            <h2 className="font-black">Before acceptance state</h2>
            <div className="relative ml-2 mt-4 space-y-4">
              {reviewTimeline.map((item) => (
                <div className="flex gap-3 text-sm" key={item.label}>
                  <span
                    className={`mt-1 h-3 w-3 rounded-full ${
                      item.active ? "bg-brand-600" : item.done ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  />
                  <span>
                    <b>{item.label}</b>
                    <span className="block text-slate-500">{item.time}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link className="btn-outline mt-9 w-full border-red-500 text-red-600" href="/">
            Cancel Job
          </Link>
        </div>
      </section>
    </main>
  );
}
