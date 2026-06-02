import Link from "next/link";
import { ContactActions } from "@/components/contact-actions";
import { JobRequestSummary } from "@/components/job-request-summary";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";
import { jobRequest, websiteNotifications, whatsappWorkerNotification } from "@/lib/data";

export default function WorkerRequestPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Request Details" />
      <section className="container-page pb-8 pt-2 md:grid md:grid-cols-[1.1fr_0.8fr] md:gap-6 md:py-10">
        <div className="space-y-5">
          <JobRequestSummary request={jobRequest} />

          <div className="card p-4 md:p-5">
            <h2 className="font-black">Worker action</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Read the request first. Contact stays locked until you accept the job.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link className="btn-primary" href="/jobs">
                <Icon name="check" />
                Accept Job
              </Link>
              <Link className="btn-outline border-red-500 text-red-600" href="/worker">
                Decline Job
              </Link>
              <button className="btn-outline" type="button">
                Need More Details
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-blue-50 p-4">
              <label className="text-sm font-black text-slate-900">One short question inside MistriHub</label>
              <div className="mt-2 flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm outline-none"
                  defaultValue="Is the main switch also affected?"
                />
                <button className="rounded-xl bg-brand-600 px-4 text-sm font-black text-white">Send</button>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-500">Phone and WhatsApp remain locked while asking.</p>
            </div>
          </div>
        </div>

        <aside className="mt-5 space-y-5 md:mt-0">
          <ContactActions unlocked={false} />

          <div className="card p-4 md:p-5">
            <h2 className="font-black">Website notifications</h2>
            <div className="mt-4 space-y-3">
              {websiteNotifications.map((item) => (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold" key={item}>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" name="bell" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="card border-emerald-200 bg-emerald-50 p-4 md:p-5">
            <h2 className="font-black text-emerald-900">WhatsApp notification to worker</h2>
            <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700">
              {whatsappWorkerNotification.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-3 text-xs font-bold text-emerald-800">SMS notification is not added yet.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
