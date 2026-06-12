import { MobileTopbar } from "@/components/mobile-topbar";
import { WorkerProfileForm } from "@/components/worker-profile-form";

export default function WorkerProfilePage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Edit Profile" />
      <section className="container-page pb-28 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-5 text-3xl font-black">Professional profile</h1>
          <WorkerProfileForm />
        </div>
      </section>
    </main>
  );
}
