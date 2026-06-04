"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { displayNameFromValue } from "@/lib/display-name";
import { saveMockAccount, type MockRole } from "@/lib/mock-store";
import { useAccountState } from "./use-account-state";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Extract<MockRole, "user" | "worker">>("user");
  const isRegister = mode === "register";
  const { account } = useAccountState();
  const dashboardHref = account?.role === "worker" ? "/dashboard/worker" : account?.role === "admin" ? "/admin" : "/dashboard/user";
  const loggedInName = displayNameFromValue(account?.name) || displayNameFromValue(account?.email) || account?.role;

  async function handleSubmit() {
    if (!identifier) {
      setMessage("Email ya phone bharna zaroori hai.");
      return;
    }

    setLoading(true);
    setMessage("");
    const cleanIdentifier = identifier.trim();
    const account = {
      id: `local-${Date.now()}`,
      role,
      name: name.trim() || displayNameFromValue(cleanIdentifier),
      phone: cleanIdentifier.includes("@") ? "" : cleanIdentifier,
      email: cleanIdentifier.includes("@") ? cleanIdentifier : undefined
    };
    saveMockAccount(account);
    setLoading(false);

    router.push(role === "worker" ? "/dashboard/worker" : "/dashboard/user");
  }

  if (account) {
    return (
      <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-center">
        <p className="font-black text-brand-700">Aap already login hain.</p>
        <p className="mt-1 text-sm font-bold text-slate-600">{loggedInName}</p>
        <Link className="btn-primary mt-4 w-full" href={dashboardHref}>
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={(event) => event.preventDefault()}>
      <div>
        <span className="mb-2 block text-sm font-bold">Login role</span>
        <div className="grid grid-cols-2 gap-2">
          {(["user", "worker"] as const).map((item) => (
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
        <span className="mb-2 block text-sm font-bold">Email / phone</span>
        <input
          className="h-13 w-full rounded-xl border border-slate-200 px-4 py-4 outline-none focus:border-brand-500"
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="worker@example.com or 9876543210"
          type="text"
          value={identifier}
        />
      </label>
      {!isRegister ? <p className="text-xs font-bold text-slate-500">Authentication is temporarily disabled.</p> : null}
      {message ? <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">{message}</p> : null}
      <button className="btn-primary w-full" disabled={loading} onClick={handleSubmit} type="button">
        {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
      </button>
    </form>
  );
}
