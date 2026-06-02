import Link from "next/link";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";

export default function JobsPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Jobs" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="card p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Icon name="jobs" />
            </span>
            <h1 className="mt-4 text-2xl font-black">No active jobs</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Real job tracking will appear here after a user submits a booking and a worker accepts it.
            </p>
            <Link className="btn-primary mx-auto mt-5 max-w-xs" href="/book">
              Book Worker
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
