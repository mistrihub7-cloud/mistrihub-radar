import Link from "next/link";
import { CategoryName } from "@/components/category-name";
import { MobileTopbar } from "@/components/mobile-topbar";
import { Icon } from "@/components/simple-icons";
import { categories } from "@/lib/data";
import { slugify } from "@/lib/seo-pages";

export default function CategoriesPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="All Services" />
      <section className="container-page pb-28 pt-2 md:py-10">
        <div className="mb-5">
          <p className="text-sm font-black text-brand-600">MistriHub Services</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">What service do you need?</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Choose a category to see nearby workers serving your area.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              className="group min-h-[128px] rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
              href={`/services/${slugify(category.name)}`}
              key={category.name}
            >
              <span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${category.bg} ${category.tone} transition group-hover:scale-105`}>
                <Icon className="h-7 w-7" name={category.icon} />
              </span>
              <CategoryName className="mt-3 block text-sm font-black leading-5 text-slate-950" name={category.name} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
