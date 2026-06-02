import Link from "next/link";
import { LocationLabel } from "./location-label";
import { Icon } from "./simple-icons";
import { Logo } from "./logo";

const links = [
  ["Home", "/"],
  ["Workers", "/workers"],
  ["Book Worker", "/book"],
  ["Jobs", "/jobs"],
  ["How It Works", "/#how-it-works"],
  ["Become a Worker", "/worker"]
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-slate-200 bg-white/90 backdrop-blur md:block">
      <div className="container-page flex h-[74px] items-center justify-between gap-7">
        <div className="flex items-center gap-7">
          <Logo />
          <Link className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800" href="/#location">
            <Icon className="h-4 w-4 text-brand-600" name="location" />
            <LocationLabel />
            <span className="text-slate-400">v</span>
          </Link>
        </div>
        <nav className="flex items-center gap-8 text-sm font-extrabold text-slate-900">
          {links.map(([label, href], index) => (
            <Link
              className={index === 0 ? "border-b-4 border-brand-600 py-7 text-brand-600" : "py-7"}
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-4">
          <Link className="btn-outline w-24" href="/login">
            Login
          </Link>
          <Link className="btn-primary w-24" href="/login?mode=register">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
