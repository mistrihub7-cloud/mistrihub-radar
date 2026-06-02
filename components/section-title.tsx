type SectionTitleProps = {
  title: string;
  action?: string;
};

export function SectionTitle({ title, action = "View All" }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <button className="text-sm font-extrabold text-brand-600">{action}</button>
    </div>
  );
}
