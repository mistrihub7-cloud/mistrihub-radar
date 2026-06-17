import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Contact MistriHub.In",
  description: "Contact MistriHub.In for support, worker registration help, booking issues and platform questions."
};

export default function ContactPage() {
  return (
    <PublicPageShell eyebrow="Support & Help" title="MistriHub.In Support">
      <p>
        Booking se related baat job chat aur job tracking me rakhein, taki request ka record clear rahe. Profile ya account help ke liye neeche official support option use karein.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <a className="rounded-2xl border border-slate-200 p-4 text-slate-900 hover:border-brand-300 hover:text-brand-600" href="mailto:Mistrihub75@gmail.com">
          <span className="block text-lg font-black">Booking / Job Support</span>
          <span className="mt-2 block text-sm font-bold text-slate-500">Email us</span>
          <span className="mt-1 block break-words text-base font-black">Mistrihub75@gmail.com</span>
        </a>
        <a className="rounded-2xl border border-slate-200 p-4 text-slate-900 hover:border-brand-300 hover:text-brand-600" href="https://wa.me/916206964990" rel="noreferrer" target="_blank">
          <span className="block text-lg font-black">Professional Profile Support</span>
          <span className="mt-2 block text-sm font-bold text-slate-500">Call / WhatsApp</span>
          <span className="mt-1 block text-base font-black">+91 6206964990</span>
        </a>
      </div>
      <div className="rounded-2xl bg-blue-50 p-4 text-sm font-bold leading-6 text-slate-700">
        Future official contact email aur WhatsApp support number launch ke baad yahin update hoga. Tab tak booking-related communication ke liye job chat aur job tracking ka use karein.
      </div>
      <div className="flex flex-wrap gap-3">
        <Link className="btn-primary" href="/jobs">Open Job Tracking</Link>
        <Link className="btn-outline" href="/worker/profile">Professional Profile</Link>
      </div>
    </PublicPageShell>
  );
}
