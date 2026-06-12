"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getWorkerRegistration } from "@/lib/mock-store";
import { Icon } from "./simple-icons";
import { useAccountState } from "./use-account-state";

const items = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Workers", href: "/workers", icon: "worker" },
  { label: "Book", href: "/book", icon: "plus", primary: true },
  { label: "Jobs", href: "/jobs", icon: "jobs" },
  { label: "Profile", href: "/dashboard/user", icon: "user" }
];

export function BottomNav() {
  const pathname = usePathname();
  const { account } = useAccountState();
  const workerProfile = account?.role === "worker" ? getWorkerRegistration() : null;
  const profilePhoto = workerProfile?.profilePhoto || "";
  const profileHref = account?.role === "worker" ? "/dashboard/worker" : account ? "/dashboard/user" : "/login";
  const profileLabel = account ? "Profile" : "Login";
  const navItems = items.map((item) => {
    if (item.label === "Profile") return { ...item, href: profileHref, label: profileLabel };
    if (item.label === "Book" && account?.role === "worker") return { ...item, label: "Mode" };
    return item;
  });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[74px] max-w-[430px] items-center justify-around border-t border-slate-200 bg-white px-3 md:hidden">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const isProfileItem = item.href === profileHref && (item.label === "Profile" || item.label === "Login");
        return (
          <Link
            className={`flex min-w-12 flex-col items-center gap-1 text-[11px] font-bold ${
              active ? "text-brand-600" : "text-slate-500"
            }`}
            href={item.href}
            key={item.href}
          >
            <span
              className={
                item.primary
                  ? "grid h-12 w-12 -translate-y-3 place-items-center rounded-full bg-brand-600 text-white shadow-card"
                  : "grid h-6 w-6 place-items-center"
              }
            >
              {account && isProfileItem ? (
                <span className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-brand-50 text-[11px] font-black text-brand-700 ring-2 ring-brand-200">
                  {profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="Profile" className="h-full w-full object-cover object-top" src={profilePhoto} />
                  ) : (
                    (account.name || account.email || account.phone || "U").slice(0, 1).toUpperCase()
                  )}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />
                </span>
              ) : (
                <Icon className={item.primary ? "h-6 w-6" : "h-5 w-5"} name={item.icon} />
              )}
            </span>
            <span className={item.primary ? "-mt-3" : ""}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
