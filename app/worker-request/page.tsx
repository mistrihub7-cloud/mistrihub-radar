import Link from "next/link";
import { ContactActions } from "@/components/contact-actions";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";

const contactUnlocked = Boolean(0);

export default function WorkerRequestPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Request Details" />
      <section className="container-page pb-8 pt-2 md:grid md:grid-cols-[1.1fr_0.8fr] md:gap-6 md:py-10">
        <div className="card p-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-600">
            <Icon name="bell" />
          </span>
          <h1 className="mt-4 text-2xl font-black">No pending request</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Real job requests will appear here with service, area, urgency and problem details before acceptance. Exact distance will show only after GPS data is saved.
          </p>
          <Link className="btn-outline mx-auto mt-5 max-w-xs" href="/worker">
            Back to Dashboard
          </Link>
        </div>

        <aside className="mt-5 space-y-5 md:mt-0">
          <ContactActions unlocked={contactUnlocked} />

          <div className="card p-4 md:p-5">
            <h2 className="font-black">Review Before Accept</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Phone and WhatsApp remain locked until the worker accepts a real job request.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
