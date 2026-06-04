import { MobileTopbar } from "@/components/mobile-topbar";
import { UserProfileForm } from "@/components/user-profile-form";

export default function UserProfilePage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar back title="Edit Profile" />
      <section className="container-page pb-28 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-5 text-3xl font-black">User profile</h1>
          <UserProfileForm />
        </div>
      </section>
    </main>
  );
}
