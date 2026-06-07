import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MobileTopbar } from "@/components/mobile-topbar";
import { NearbyWorkerList } from "@/components/nearby-worker-list";
import { Icon } from "@/components/simple-icons";
import { cleanCategoryName } from "@/lib/category-display";
import { cityBySlug, seoCities, seoServices, serviceBySlug, serviceSearchTitle, siteUrl } from "@/lib/seo-pages";
import { loadWorkersFromSupabase } from "@/lib/supabase-flow";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return seoServices.flatMap((service) => seoCities.map((city) => ({ service: service.slug, city: city.slug })));
}

export function generateMetadata({ params }: { params: { service: string; city: string } }): Metadata {
  const service = serviceBySlug(params.service);
  const city = cityBySlug(params.city);
  if (!service || !city) return {};

  const serviceLabel = cleanCategoryName(service.name);
  const title = `${serviceSearchTitle(service.name)} in ${city.name} - Nearby Trusted Workers`;
  const description = `Find trusted ${serviceLabel.toLowerCase()} workers in ${city.name}, ${city.state}. Send a job request and unlock contact after worker acceptance.`;

  return {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}/${city.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl()}/services/${service.slug}/${city.slug}`,
      type: "website"
    }
  };
}

function StructuredData({ serviceName, cityName, stateName }: { serviceName: string; cityName: string; stateName: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${serviceName} in ${cityName}`,
    provider: {
      "@type": "Organization",
      name: "MistriHub",
      url: siteUrl()
    },
    areaServed: {
      "@type": "City",
      name: cityName,
      containedInPlace: stateName
    },
    serviceType: serviceName
  };

  return <script dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} type="application/ld+json" />;
}

export default async function CityServiceLandingPage({ params }: { params: { service: string; city: string } }) {
  const service = serviceBySlug(params.service);
  const city = cityBySlug(params.city);
  if (!service || !city) notFound();
  const serviceLabel = cleanCategoryName(service.name);

  const workers = (await loadWorkersFromSupabase()).filter((worker) => {
    const workerCity = worker.city.toLowerCase();
    return worker.skill === service.name && workerCity.includes(city.name.toLowerCase());
  });

  return (
    <main className="mobile-shell min-h-screen">
      <StructuredData cityName={city.name} serviceName={serviceLabel} stateName={city.state} />
      <MobileTopbar back title={`${serviceLabel} in ${city.name}`} />
      <section className="container-page pb-28 pt-2 md:py-10">
        <div className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-sm font-black text-brand-600">{city.name}, {city.state}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                {serviceSearchTitle(service.name)} in {city.name}
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
                Book nearby {serviceLabel.toLowerCase()} workers serving {city.name}. MistriHub keeps contact locked until the worker accepts your job request.
              </p>
            </div>
            <span className={`grid h-14 w-14 place-items-center rounded-2xl ${service.bg} ${service.tone}`}>
              <Icon className="h-7 w-7" name={service.icon} />
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:max-w-xl">
            <Link className="btn-primary" href={`/book?service=${encodeURIComponent(service.name)}`}>
              Send {serviceLabel} Request
            </Link>
            <Link className="btn-outline" href={`/services/${service.slug}`}>
              View All {serviceLabel} Workers
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.75fr]">
          <section className="card p-5">
            <h2 className="text-xl font-black">Registered workers in {city.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Agar city-specific worker nahi dikhe, request nearby service area workers tak dispatch ho sakti hai after location save.
            </p>
            <div className="mt-4">
              <NearbyWorkerList emptyMessage={`No ${serviceLabel.toLowerCase()} workers registered in ${city.name} yet.`} layout="grid" workers={workers} />
            </div>
          </section>

          <aside className="card p-5">
            <h2 className="text-xl font-black">Why MistriHub?</h2>
            <ul className="mt-4 space-y-3 text-sm font-bold text-slate-700">
              {["Nearby worker discovery", "Review before accepting", "Contact locked before acceptance", "Job tracking and review record"].map((item) => (
                <li className="flex gap-3" key={item}>
                  <Icon className="h-5 w-5 text-brand-600" name="check" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
