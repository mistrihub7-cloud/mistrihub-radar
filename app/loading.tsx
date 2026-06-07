export default function Loading() {
  return (
    <main className="mobile-shell min-h-screen">
      <section className="container-page py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
          <p className="mt-4 text-sm font-black text-slate-700">Opening MistriHub.In...</p>
        </div>
      </section>
    </main>
  );
}
