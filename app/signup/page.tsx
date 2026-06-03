import { MobileTopbar } from "@/components/mobile-topbar";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Signup" />
      <section className="container-page pb-28 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-5 text-3xl font-black">Create MistriHub account</h1>
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
