"use client";

import Link from "next/link";
import { NotificationBell } from "./notification-bell";
import { Icon } from "./simple-icons";
import { useAccountState } from "./use-account-state";

export function MobileTopbar({ title, back = false }: { title?: string; back?: boolean }) {
  const { account } = useAccountState();
  const menuHref = account?.role === "worker" ? "/dashboard/worker" : account ? "/dashboard/user" : "/login";

  return (
    <div className="flex h-16 items-center justify-between px-4 md:hidden">
      <div className="flex items-center gap-2">
        {back ? (
          <Link className="grid h-9 w-9 place-items-center rounded-full text-slate-900" href="/">
            <span className="text-2xl">&lt;</span>
          </Link>
        ) : (
          <Link aria-label="Open dashboard" className="grid h-9 w-9 place-items-center rounded-full text-slate-900" href={menuHref}>
            <Icon name="menu" />
          </Link>
        )}
        {title ? <h1 className="text-lg font-black">{title}</h1> : null}
      </div>
      <NotificationBell className="grid h-10 w-10 place-items-center rounded-full text-slate-900" />
    </div>
  );
}
