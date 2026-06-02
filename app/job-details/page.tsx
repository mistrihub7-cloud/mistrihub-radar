import Link from "next/link";
import { ContactActions } from "@/components/contact-actions";
import { MobileTopbar } from "@/components/mobile-topbar";
import { jobRequest } from "@/lib/data";

export default function JobDetailsPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Job Details" />
      <section className="container-page pb-8 pt-2 md:grid md:grid-cols-[1fr_0.8fr] md:gap-6 md:py-10">
        <div className="card min-h-[230px] p-5">
          <span className="status-pill status-available">On The Way</span>
          <h1 className="mt-5 text-2xl font-black">Job tracking active</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            MistriHub shows simple job status updates after the worker accepts. Contact stays secure and unlocks only after acceptance.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
            {["Accepted", "On The Way", "Contact Unlocked"].map((item) => (
              <div className="rounded-2xl bg-brand-50 p-3 font-black text-brand-700" key={item}>
                {item}
              </div>
            ))}
          </div>
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
