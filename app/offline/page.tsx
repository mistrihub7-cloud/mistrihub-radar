import Link from "next/link";
import { Logo } from "@/components/logo";

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div className="max-w-md">
        <div className="mb-5 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-3xl font-black">You are offline</h1>
        <p className="mt-3 text-slate-600">
          MistriHub app shell is still available. Please reconnect to book or track a live job.
        </p>
        <Link className="btn-primary mt-6" href="/">
          Go Home
        </Link>
      </div>
    </main>
  );
}
