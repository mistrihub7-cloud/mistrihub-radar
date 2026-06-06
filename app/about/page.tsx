import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "About MistriHub",
  description: "Learn how MistriHub helps users find nearby trusted workers with review-before-accept and contact unlock after acceptance."
};

export default function AboutPage() {
  return (
    <PublicPageShell eyebrow="About" title="About MistriHub">
      <p>
        MistriHub is a nearby worker discovery platform for home and local services such as electrician, plumber, mechanic, painter, AC repair, carpenter, driver and helper work.
      </p>
      <p>
        The platform is built for a practical Indian service flow. Workers are not shown as taxi-style live radar. Instead, users discover workers by service area, availability, distance, rating, completed jobs and trust score.
      </p>
      <p>
        Contact details stay locked before acceptance. A worker first reviews the request, then accepts or declines. After acceptance, the user and selected worker can talk directly and track the job.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Nearby discovery", "Review before accept", "Contact unlock after hire"].map((item) => (
          <div className="rounded-2xl bg-brand-50 p-4 font-black text-brand-700" key={item}>{item}</div>
        ))}
      </div>
    </PublicPageShell>
  );
}
