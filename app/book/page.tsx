import { BookingForm } from "@/components/booking-form";
import { MobileTopbar } from "@/components/mobile-topbar";

type BookPageProps = {
  searchParams?: {
    service?: string;
  };
};

export default function BookPage({ searchParams }: BookPageProps) {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Book Worker" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <BookingForm initialService={searchParams?.service} />
        </div>
      </section>
    </main>
  );
}
