import { MobileTopbar } from "./mobile-topbar";

export function PublicPageShell({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title={title} />
      <section className="container-page pb-28 pt-2 md:py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black text-brand-600">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 md:text-5xl">{title}</h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700 md:text-base">{children}</div>
        </div>
      </section>
    </main>
  );
}
