import Link from "next/link";
import { ContactActions } from "@/components/contact-actions";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";
import { jobRequest } from "@/lib/data";

export default function JobDetailsPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Job Details" />
      <section className="container-page pb-8 pt-2 md:grid md:grid-cols-[1fr_0.8fr] md:gap-6 md:py-10">
        <div className="card map-panel relative min-h-[230px] p-4">
          <span className="status-pill status-available absolute left-4 top-4">On The Way</span>
          <span className="absolute bottom-20 left-16 h-4 w-4 rounded-full bg-emerald-600 ring-4 ring-white" />
          <span className="absolute bottom-28 left-36 h-4 w-4 rounded-full bg-brand-600 ring-4 ring-white" />
          <span className="absolute right-24 top-20 h-5 w-5 rounded-full bg-orange-600 ring-4 ring-white" />
          <span className="absolute bottom-24 left-20 h-1 w-36 -rotate-12 rounded-full bg-brand-600" />
          <span className="absolute right-28 top-28 h-1 w-28 -rotate-12 rounded-full bg-brand-600" />
        </div>

        <div className="mt-4 space-y-5 md:mt-0">
          <div className="card p-5 text-center">
            <h2 className="font-black">Rajesh Kumar is on the way</h2>
            <p className="text-sm text-slate-500">Arriving in 10 mins</p>
          </div>
          <div>
            <ContactActions unlocked />
          </div>
          <div>
            <h3 className="mb-2 font-black">Job Details</h3>
            <p className="text-sm leading-6">{jobRequest.description}</p>
          </div>
          <div>
            <h3 className="mb-2 font-black">Address</h3>
            <p className="text-sm leading-6">{jobRequest.area}</p>
          </div>
          <Link className="btn-primary w-full" href="/jobs">
            View Full Details
          </Link>
        </div>
      </section>
    </main>
  );
}
