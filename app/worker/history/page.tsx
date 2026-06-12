import { JobsListClient } from "@/components/jobs-list-client";
import { MobileTopbar } from "@/components/mobile-topbar";

export default function WorkerJobHistoryPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Job History" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 hidden md:block">
            <p className="text-sm font-black text-brand-600">Professional Job Records</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">My job history</h1>
          </div>
          <JobsListClient owner="worker" view="worker-history" />
        </div>
      </section>
    </main>
  );
}
