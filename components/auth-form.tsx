"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("Vikas Kumar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit() {
    if (!supabase || !hasSupabaseConfig) {
      setMessage("Supabase env missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    if (!email || !password) {
      setMessage("Email aur password bharna zaroori hai.");
      return;
    }

    setLoading(true);
    setMessage("");
    const result = isRegister
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    router.push(isRegister ? "/worker" : "/dashboard");
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={(event) => event.preventDefault()}>
      {isRegister ? (
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Full Name</span>
          <input
            className="h-13 w-full rounded-xl border border-slate-200 px-4 py-4 outline-none focus:border-brand-500"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
      ) : null}
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Email</span>
        <input
          className="h-13 w-full rounded-xl border border-slate-200 px-4 py-4 outline-none focus:border-brand-500"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="worker@example.com"
          type="email"
          value={email}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Password</span>
        <input
          className="h-13 w-full rounded-xl border border-slate-200 px-4 py-4 outline-none focus:border-brand-500"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          type="password"
          value={password}
        />
      </label>
      {!isRegister ? (
        <div className="text-right">
          <Link className="text-sm font-bold text-brand-600" href="/login">
            Forgot Password?
          </Link>
        </div>
      ) : null}
      {message ? <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">{message}</p> : null}
      <button className="btn-primary w-full" disabled={loading} onClick={handleSubmit} type="button">
        {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
      </button>
    </form>
  );
}
