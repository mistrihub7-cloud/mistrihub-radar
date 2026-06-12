import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "MistriHub.In terms for users, professionals, booking requests, contact unlock, payments, cancellations and platform responsibility."
};

export default function TermsPage() {
  return (
    <PublicPageShell eyebrow="Terms" title="Terms and Conditions">
      <p>
        MistriHub.In connects users with nearby professionals. MistriHub.In is not the employer of service partners and does not directly provide electrical, plumbing, auto repair, driver or support services.
      </p>
      <h2 className="text-xl font-black text-slate-950">User responsibility</h2>
      <p>
        Users should discuss price, work details, timing, materials and payment clearly before hiring a worker. Final deal and payment are between user and worker.
      </p>
      <h2 className="text-xl font-black text-slate-950">Professional responsibility</h2>
      <p>
        Service partners should accept a job only after understanding the user problem, price, timing and work details. Unnecessary cancellation after acceptance may affect professional trust score.
      </p>
      <h2 className="text-xl font-black text-slate-950">Contact unlock</h2>
      <p>
        Contact details unlock only after job acceptance for the selected professional and user. Other service partners should not receive unlocked contact details for the same job.
      </p>
      <h2 className="text-xl font-black text-slate-950">Payment and disputes</h2>
      <p>
        MistriHub.In currently only connects users and professionals. Payment, final price, work quality and work agreement are handled directly between user and service partner.
      </p>
      <h2 className="text-xl font-black text-slate-950">Misuse</h2>
      <p>
        Fake profiles, spam, abusive behavior, wrong job details or misuse of contact information may lead to account restriction or removal from the platform.
      </p>
    </PublicPageShell>
  );
}
