"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase-client";
import { saveMockAccount, type MockRole } from "@/lib/mock-store";
import { saveProfileToSupabase } from "@/lib/supabase-flow";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<MockRole>("user");
  const isRegister = mode === "register";

  async function handleSubmit() {
    if (!supabase || !hasSupabaseConfig) {
      setMessage("Supabase env missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    if (!identifier || !password) {
      setMessage("Email aur password bharna zaroori hai.");
      return;
    }

    setLoading(true);
    setMessage("");
    const result = isRegister
      ? await supabase.auth.signUp({
          email: identifier.trim(),
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/login`
          }
        })
      : await supabase.auth.signInWithPassword({ email: identifier.trim(), password });
    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    const user = result.data.user;
    const account = {
      id: user?.id || `mock-${Date.now()}`,
      role,
      name: (user?.user_metadata?.full_name as string | undefined) || identifier,
      phone: user?.phone || "",
      email: user?.email
    };
    saveMockAccount(account);
    await saveProfileToSupabase(account);

    if (role === "admin") {
      router.push("/admin");
      return;
    }
    router.push(role === "worker" ? "/dashboard/worker" : "/dashboard/user");
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={(event) => event.preventDefault()}>
      <div>
        <span className="mb-2 block text-sm font-bold">Login role</span>
        <div className="grid grid-cols-3 gap-2">
          {(["user", "worker", "admin"] as const).map((item) => (
            <button
              className={`h-11 rounded-xl border text-sm font-black ${role === item ? "border-brand-600 bg-brand-50 text-brand-600" : "border-slate-200 bg-white"}`}
              key={item}
              onClick={() => setRole(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {isRegister ? (
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Full Name</span>
          <input
            className="h-13 w-full rounded-xl border border-slate-200 px-4 py-4 outline-none focus:border-brand-500"
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter full name"
            value={name}
          />
        </label>
      ) : null}
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Email</span>
        <input
          className="h-13 w-full rounded-xl border border-slate-200 px-4 py-4 outline-none focus:border-brand-500"
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="worker@example.com"
          type="email"
          value={identifier}
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
