import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  const isRegister = false;

  return (
    <main className="mobile-shell min-h-screen">
      <section className="container-page flex min-h-screen flex-col justify-center py-10 md:min-h-[calc(100vh-74px)]">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto max-h-[360px] w-full max-w-sm overflow-hidden rounded-[2rem] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Welcome to MistriHub"
                className="block h-auto w-full"
                src="/login-workers.png?v=3"
              />
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 border-b border-slate-200">
            <Link
              className={`pb-3 text-center font-black ${
                !isRegister ? "border-b-2 border-brand-600 text-brand-600" : "text-slate-600"
              }`}
              href="/login"
            >
              Login
            </Link>
            <Link
              className={`pb-3 text-center font-black ${
                isRegister ? "border-b-2 border-brand-600 text-brand-600" : "text-slate-600"
              }`}
              href="/signup"
            >
              Register
            </Link>
          </div>

          <AuthForm mode={isRegister ? "register" : "login"} />

          <div className="my-5 text-center text-sm text-slate-500">or</div>
          <button className="flex h-13 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 py-4 font-black text-slate-400" disabled type="button">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-600">G</span>
            Google login not connected yet
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
