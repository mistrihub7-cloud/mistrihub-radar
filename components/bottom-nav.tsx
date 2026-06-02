"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./simple-icons";

const items = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Workers", href: "/workers", icon: "worker" },
  { label: "Book", href: "/book", icon: "plus", primary: true },
  { label: "Jobs", href: "/jobs", icon: "jobs" },
  { label: "Profile", href: "/dashboard/user", icon: "user" }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[74px] max-w-[430px] items-center justify-around border-t border-slate-200 bg-white px-3 md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
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
              <Icon className={item.primary ? "h-6 w-6" : "h-5 w-5"} name={item.icon} />
            </span>
            <span className={item.primary ? "-mt-3" : ""}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
