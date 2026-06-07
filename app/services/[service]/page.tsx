import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MobileTopbar } from "@/components/mobile-topbar";
import { NearbyWorkerList } from "@/components/nearby-worker-list";
import { Icon } from "@/components/simple-icons";
import { cleanCategoryName } from "@/lib/category-display";
import { seoCities, seoServices, serviceBySlug, serviceSearchTitle, siteUrl } from "@/lib/seo-pages";
import { loadWorkersFromSupabase } from "@/lib/supabase-flow";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return seoServices.map((service) => ({ service: service.slug }));
}

export function generateMetadata({ params }: { params: { service: string } }): Metadata {
  const service = serviceBySlug(params.service);
  if (!service) return {};
  const serviceLabel = cleanCategoryName(service.name);
  const title = `${serviceSearchTitle(service.name)} Near Me - Trusted Local Workers`;
  const description = `Find nearby ${serviceLabel.toLowerCase()} workers on MistriHub.In. Send a request, review job details, and unlock contact only after worker acceptance.`;

  return {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl()}/services/${service.slug}`,
      type: "website"
    }
  };
}

function StructuredData({ serviceName }: { serviceName: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${serviceName} near me`,
    provider: {
      "@type": "Organization",
      name: "MistriHub.In",
      url: siteUrl()
    },
    areaServed: "India",
    serviceType: serviceName,
    description: `Nearby trusted ${serviceName.toLowerCase()} workers available through MistriHub.In.`
  };

  return <script dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} type="application/ld+json" />;
}

export default async function ServiceLandingPage({ params }: { params: { service: string } }) {
  const service = serviceBySlug(params.service);
  if (!service) notFound();
  const serviceLabel = cleanCategoryName(service.name);
  const workers = (await loadWorkersFromSupabase()).filter((worker) => worker.skill === service.name);

  return (
    <main className="mobile-shell min-h-screen">
      <StructuredData serviceName={serviceLabel} />
      <MobileTopbar back title={serviceLabel} />
      <section className="container-page pb-28 pt-2 md:py-10">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="card p-5">
            <span className={`grid h-14 w-14 place-items-center rounded-2xl ${service.bg} ${service.tone}`}>
              <Icon className="h-7 w-7" name={service.icon} />
            </span>
            <p className="mt-5 text-sm font-black text-brand-600">MistriHub.In Service</p>
            <h1 className="mt-1 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
              {serviceSearchTitle(service.name)} near you
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
              Nearby trusted {serviceLabel.toLowerCase()} workers can review your request first. Contact stays locked until a worker accepts the job.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link className="btn-primary" href={`/workers?service=${encodeURIComponent(service.name)}`}>
                View Nearby Workers
              </Link>
              <Link className="btn-outline" href={`/book?service=${encodeURIComponent(service.name)}`}>
                Send Request
              </Link>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="card p-5">
              <h2 className="text-xl font-black">Available {serviceLabel} workers</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Workers are sorted by availability, distance after location save, trust score and response quality.
              </p>
              <div className="mt-4">
                <NearbyWorkerList emptyMessage={`No ${serviceLabel.toLowerCase()} workers registered yet.`} layout="grid" workers={workers} />
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-xl font-black">{serviceLabel} by city</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {seoCities.map((city) => (
                  <Link className="rounded-2xl border border-slate-200 p-3 text-sm font-black text-slate-800 hover:border-brand-300 hover:text-brand-600" href={`/services/${service.slug}/${city.slug}`} key={city.slug}>
                    {serviceLabel} in {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
