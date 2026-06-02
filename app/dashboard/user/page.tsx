import { MobileTopbar } from "@/components/mobile-topbar";
import { UserDashboardClient } from "@/components/user-dashboard-client";

export default function UserDashboardPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <MobileTopbar title="User Dashboard" />
      <section className="container-page pb-8 pt-2 md:py-10">
        <div className="mx-auto max-w-3xl">
          <UserDashboardClient />
        </div>
      </section>
    </main>
  );
}
