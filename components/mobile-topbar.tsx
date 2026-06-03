import Link from "next/link";
import { Icon } from "./simple-icons";

export function MobileTopbar({ title, back = false }: { title?: string; back?: boolean }) {
  return (
    <div className="flex h-16 items-center justify-between px-4 md:hidden">
      <div className="flex items-center gap-2">
        {back ? (
          <Link className="grid h-9 w-9 place-items-center rounded-full text-slate-900" href="/">
            <span className="text-2xl">&lt;</span>
          </Link>
        ) : (
          <button className="grid h-9 w-9 place-items-center rounded-full text-slate-900">
            <Icon name="menu" />
          </button>
        )}
        {title ? <h1 className="text-lg font-black">{title}</h1> : null}
      </div>
      <button className="grid h-10 w-10 place-items-center rounded-full text-slate-900">
        <Icon name="bell" />
      </button>
    </div>
  );
}
