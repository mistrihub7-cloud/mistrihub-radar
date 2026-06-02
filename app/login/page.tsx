import Link from "next/link";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/simple-icons";

export default function LoginPage() {
  return (
    <main className="mobile-shell min-h-screen">
      <section className="container-page flex min-h-screen flex-col justify-center py-10 md:min-h-[calc(100vh-74px)]">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <Logo />
            </div>
            <p className="font-semibold text-slate-500">Kaam ke liye trusted worker, nearby.</p>
            <div className="mx-auto mt-5 flex max-w-xs justify-center gap-3">
              <div className="worker-avatar !h-20 !w-20" />
              <div className="worker-avatar busy !h-20 !w-20" />
              <div className="worker-avatar !h-20 !w-20" />
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 border-b border-slate-200">
            <button className="border-b-2 border-brand-600 pb-3 font-black text-brand-600">Login</button>
            <button className="pb-3 font-bold text-slate-600">Register</button>
          </div>

          <form className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Mobile Number</span>
              <input className="h-13 w-full rounded-xl border border-slate-200 px-4 py-4 outline-none focus:border-brand-500" defaultValue="+91 9876543210" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Password</span>
              <span className="flex rounded-xl border border-slate-200 bg-white px-4">
                <input className="h-13 flex-1 py-4 outline-none" defaultValue="password" type="password" />
                <span className="grid place-items-center text-slate-500">o</span>
              </span>
            </label>
            <div className="text-right">
              <Link className="text-sm font-bold text-brand-600" href="/login">
                Forgot Password?
              </Link>
            </div>
            <Link className="btn-primary w-full" href="/dashboard">
              Login
            </Link>
          </form>

          <div className="my-5 text-center text-sm text-slate-500">or</div>
          <button className="flex h-13 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-4 font-black">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-600">G</span>
            Continue with Google
          </button>
          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            By continuing, you agree to our <span className="font-bold text-brand-600">Terms & Conditions</span> and{" "}
            <span className="font-bold text-brand-600">Privacy Policy</span>.
          </p>
        </div>
      </section>
    </main>
  );
}
