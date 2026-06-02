import Link from "next/link";

type SectionTitleProps = {
  title: string;
  action?: string;
  actionHref?: string;
};

export function SectionTitle({ title, action = "View All", actionHref = "/radar" }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <Link className="text-sm font-extrabold text-brand-600" href={actionHref}>
        {action}
      </Link>
    </div>
  );
}
