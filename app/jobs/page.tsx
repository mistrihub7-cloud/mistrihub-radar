import { JobsListClient } from "@/components/jobs-list-client";
import { MobileTopbar } from "@/components/mobile-topbar";

export default function JobsPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Job Records" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 hidden md:block">
            <p className="text-sm font-black text-brand-600">Job Records / Requests</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Your job request records</h1>
          </div>
          <JobsListClient owner="user" />
        </div>
      </section>
    </main>
  );
}
