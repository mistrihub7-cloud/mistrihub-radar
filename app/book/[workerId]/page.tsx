import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { MobileTopbar } from "@/components/mobile-topbar";
import { workers } from "@/lib/data";

export function generateStaticParams() {
  return workers.map((worker) => ({ workerId: worker.id }));
}

export default function WorkerBookingPage({ params }: { params: { workerId: string } }) {
  const worker = workers.find((item) => item.id === params.workerId);
  if (!worker) notFound();

  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Book Worker" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <BookingForm initialService={worker.skill} worker={worker} />
        </div>
      </section>
    </main>
  );
}
