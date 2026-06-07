import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "MistriHub.In privacy policy for location, contact, booking, photo, chat, notification and worker profile data."
};

export default function PrivacyPage() {
  return (
    <PublicPageShell eyebrow="Privacy" title="Privacy Policy">
      <p>
        MistriHub.In uses only the information needed to run nearby worker discovery, booking requests, job tracking and notifications.
      </p>
      <h2 className="text-xl font-black text-slate-950">Information we may collect</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Name, phone number, optional email and account mode.</li>
        <li>Worker profile details such as service category, city, service radius, availability and profile photo.</li>
        <li>User location or selected area to calculate nearby workers and distance.</li>
        <li>Booking details including service category, problem description, urgency, preferred time and optional photos.</li>
        <li>Job chat, status updates, reviews and notification tokens.</li>
      </ul>
      <h2 className="text-xl font-black text-slate-950">How we use data</h2>
      <p>
        We use this data to show nearby workers, send job alerts, keep contact locked until acceptance, track jobs, calculate trust score and improve service quality.
      </p>
      <h2 className="text-xl font-black text-slate-950">Contact privacy</h2>
      <p>
        User and worker phone/WhatsApp details are locked before job acceptance. Contact unlocks only for the selected worker and the user after the job is accepted.
      </p>
      <h2 className="text-xl font-black text-slate-950">Data safety</h2>
      <p>
        We recommend keeping regular Supabase backups. Sensitive server keys should never be shared publicly or committed to GitHub.
      </p>
    </PublicPageShell>
  );
}
