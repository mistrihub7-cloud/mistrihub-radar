type SectionTitleProps = {
  title: string;
  action?: string;
  actionHref?: string;
};

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
    </div>
  );
}
