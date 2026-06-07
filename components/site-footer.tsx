import Link from "next/link";
import { categories } from "@/lib/data";
import { slugify } from "@/lib/seo-pages";
import { Logo } from "./logo";

const companyLinks = [
  ["About", "/about"],
  ["Contact", "/contact"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"]
];

export function SiteFooter() {
  const topServices = categories.slice(0, 8);

  return (
    <footer className="border-t border-slate-200 bg-white pb-24 pt-8 md:pb-8">
      <div className="container-page grid gap-8 md:grid-cols-[1.1fr_0.8fr_0.8fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            MistriHub helps users find nearby trusted workers. Contact details unlock only after a worker accepts the job request.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-black text-slate-950">Services</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold text-slate-600">
            {topServices.map((category) => (
              <Link className="hover:text-brand-600" href={`/services/${slugify(category.name)}`} key={category.name}>
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black text-slate-950">MistriHub</h2>
          <div className="mt-4 grid gap-3 text-sm font-bold text-slate-600">
            <Link className="hover:text-brand-600" href="/categories">Categories</Link>
            <Link className="hover:text-brand-600" href="/#featured">Featured</Link>
            <Link className="hover:text-brand-600" href="/workers">Nearby Workers</Link>
            {companyLinks.map(([label, href]) => (
              <Link className="hover:text-brand-600" href={href} key={href}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page mt-8 border-t border-slate-100 pt-5 text-xs font-bold text-slate-500">
        © {new Date().getFullYear()} MistriHub. Nearby worker discovery platform.
      </div>
    </footer>
  );
}
