import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Contact MistriHub.In",
  description: "Contact MistriHub.In for support, worker registration help, booking issues and platform questions."
};

export default function ContactPage() {
  return (
    <PublicPageShell eyebrow="Support" title="Contact MistriHub.In">
      <p>
        For booking support, worker profile help, job request issues or platform questions, use the MistriHub.In app pages first. We keep support simple and record-based so job details stay clear.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link className="rounded-2xl border border-slate-200 p-4 font-black text-slate-900 hover:border-brand-300 hover:text-brand-600" href="/jobs">
          Booking / job support
        </Link>
        <Link className="rounded-2xl border border-slate-200 p-4 font-black text-slate-900 hover:border-brand-300 hover:text-brand-600" href="/worker/profile">
          Worker profile support
        </Link>
      </div>
      <p>
        Future official contact email and WhatsApp support number will be added here after launch. Until then, job chat and job tracking should be used for booking-related communication.
      </p>
    </PublicPageShell>
  );
}
