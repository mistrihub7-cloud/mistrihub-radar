import Link from "next/link";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";

export default function JobDetailsPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Job Details" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="card p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-600">
              <Icon name="shield" />
            </span>
            <h1 className="mt-4 text-2xl font-black">No job selected</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Tracking, contact unlock and worker status will show only for real accepted jobs.
            </p>
            <Link className="btn-outline mx-auto mt-5 max-w-xs" href="/jobs">
              Back to Jobs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
