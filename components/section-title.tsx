import Link from "next/link";

type SectionTitleProps = {
  title: string;
  action?: string;
  actionHref?: string;
};

export function SectionTitle({ title, action = "View all", actionHref }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      {actionHref ? <ViewAllLink action={action} actionHref={actionHref} compact /> : null}
    </div>
  );
}

export function ViewAllLink({
  action = "View all",
  actionHref,
  compact = false
}: {
  action?: string;
  actionHref: string;
  compact?: boolean;
}) {
  return (
    <Link
      className={`shrink-0 rounded-full border border-brand-600 text-xs font-black text-brand-600 transition hover:bg-brand-50 ${
        compact ? "px-3 py-1.5" : "px-4 py-2"
      }`}
      href={actionHref}
    >
      {action}
    </Link>
  );
}
