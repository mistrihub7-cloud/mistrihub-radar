import { JobTrackingClient } from "@/components/job-tracking-client";
import { MobileTopbar } from "@/components/mobile-topbar";

export default function JobTrackingPage({ params }: { params: { jobId: string } }) {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Job Tracking" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <JobTrackingClient jobId={params.jobId} />
      </section>
    </main>
  );
}
