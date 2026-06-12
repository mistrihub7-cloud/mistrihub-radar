import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "About MistriHub.In",
  description: "Learn how MistriHub.In helps users find nearby trusted professionals with review-before-accept and contact unlock after acceptance."
};

export default function AboutPage() {
  return (
    <PublicPageShell eyebrow="About" title="About MistriHub.In">
      <p>
        MistriHub.In is a nearby professional discovery platform for home and local services such as electrical experts, plumbing experts, auto mechanics, painting professionals, AC service experts, woodwork experts and driver services.
      </p>
      <p>
        The platform is built for a practical Indian service flow. Professionals are not shown as taxi-style live radar. Instead, users discover service partners by service area, availability, distance, rating, completed jobs and trust score.
      </p>
      <p>
        Contact details stay locked before acceptance. A professional first reviews the request, then accepts or declines. After acceptance, the user and selected service partner can talk directly and track the job.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Nearby discovery", "Review before accept", "Contact unlock after hire"].map((item) => (
          <div className="rounded-2xl bg-brand-50 p-4 font-black text-brand-700" key={item}>{item}</div>
        ))}
      </div>
    </PublicPageShell>
  );
}
