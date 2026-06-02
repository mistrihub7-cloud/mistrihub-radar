import { JobsListClient } from "@/components/jobs-list-client";
import { MobileTopbar } from "@/components/mobile-topbar";

export default function JobsPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Jobs" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <JobsListClient owner="user" />
        </div>
      </section>
    </main>
  );
}
