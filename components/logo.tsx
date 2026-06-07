import Link from "next/link";
import { Icon } from "./simple-icons";

export function Logo() {
  return (
    <Link className="flex items-center gap-2" href="/">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-7 w-7" name="logo" />
      </span>
      <span>
        <span className="block text-2xl font-black leading-5 text-brand-600">
          MistriHub.In
        </span>
        <span className="text-xs font-semibold text-slate-500">
          Trusted Workers Near You
        </span>
      </span>
    </Link>
  );
}
