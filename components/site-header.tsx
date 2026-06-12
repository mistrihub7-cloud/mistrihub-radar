"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { accountDisplayName } from "@/lib/display-name";
import { clearMistriHubSession } from "@/lib/mock-store";
import { LocationLabel, openLocationPopup } from "./location-label";
import { Icon } from "./simple-icons";
import { Logo } from "./logo";
import { useAccountState } from "./use-account-state";

const links = [
  ["Home", "/"],
  ["Professionals", "/workers"],
  ["Services", "/categories"],
  ["Featured", "/#featured"],
  ["Book Expert", "/book"],
  ["Jobs", "/jobs"],
  ["How It Works", "/#how-it-works"]
];

export function SiteHeader() {
  const pathname = usePathname();
  const { account, ready } = useAccountState();
  const dashboardHref = account?.role === "worker" ? "/dashboard/worker" : "/dashboard/user";
  const displayName = accountDisplayName(account);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 hidden border-b border-slate-200 bg-white/90 backdrop-blur md:block">
      <div className="container-page flex h-[74px] items-center justify-between gap-7">
        <div className="flex items-center gap-7">
          <Logo />
          <button className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800" onClick={openLocationPopup} type="button">
            <Icon className="h-4 w-4 text-brand-600" name="location" />
            <LocationLabel />
            <span className="text-slate-400">v</span>
          </button>
        </div>
        <nav className="flex items-center gap-6 text-sm font-extrabold text-slate-900">
          {links.map(([label, href]) => (
            <Link
              className={isActive(href) ? "border-b-4 border-brand-600 py-7 text-brand-600" : "py-7"}
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        {ready && account ? (
          <div className="flex items-center gap-3">
            <Link className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-black text-brand-700" href={dashboardHref}>
              Hi, {displayName}
            </Link>
            <button
              className="btn-outline w-24"
              onClick={() => {
                clearMistriHubSession();
                window.location.replace("/login");
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link className="btn-outline w-24" href="/login">
              Login
            </Link>
            <Link className="btn-primary w-24" href="/signup">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
