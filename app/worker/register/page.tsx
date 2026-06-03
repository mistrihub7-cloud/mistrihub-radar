import { MobileTopbar } from "@/components/mobile-topbar";
import { SignupForm } from "@/components/signup-form";

export default function WorkerRegisterPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Join as Worker" />
      <section className="container-page pb-28 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-5 text-3xl font-black">Worker registration</h1>
          <SignupForm defaultRole="worker" />
        </div>
      </section>
    </main>
  );
}
