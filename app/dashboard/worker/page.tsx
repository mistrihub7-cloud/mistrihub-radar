import { MobileTopbar } from "@/components/mobile-topbar";
import { WorkerDashboardClient } from "@/components/worker-dashboard-client";

export default function WorkerDashboardPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar title="Worker Dashboard" />
      <section className="container-page pb-28 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <WorkerDashboardClient />
        </div>
      </section>
    </main>
  );
}
