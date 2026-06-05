"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { accountDisplayName } from "@/lib/display-name";
import { clearMistriHubSession, findSavedAccount, findSavedWorkerRegistration, restoreWorkerRegistrationForAccount, saveMockAccount, saveWorkerRegistration } from "@/lib/mock-store";
import { findWorkerRegistrationByLogin } from "@/lib/supabase-flow";
import { useAccountState } from "./use-account-state";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";
  const { account } = useAccountState();
  const dashboardHref = account?.role === "worker" ? "/dashboard/worker" : "/dashboard/user";
  const loggedInName = accountDisplayName(account);

  async function handleSubmit() {
    if (!identifier) {
      setMessage("Email ya phone bharna zaroori hai.");
      return;
    }

    setLoading(true);
    setMessage("");
    const cleanIdentifier = identifier.trim();
    const loginAccount = {
      id: `local-${Date.now()}`,
      role: "user" as const,
      name: name.trim() || "User",
      phone: cleanIdentifier.includes("@") ? "" : cleanIdentifier,
      email: cleanIdentifier.includes("@") ? cleanIdentifier : undefined
    };
    const savedAccount = findSavedAccount(loginAccount);
    const account = savedAccount || loginAccount;
    const workerProfile = findSavedWorkerRegistration(account) || (await findWorkerRegistrationByLogin(account));
    clearMistriHubSession();
    if (workerProfile) {
      saveWorkerRegistration(workerProfile);
      setLoading(false);
      router.push("/dashboard/worker");
      return;
    }
    restoreWorkerRegistrationForAccount(account);
    saveMockAccount(account);
    setLoading(false);

    router.push("/dashboard/user");
  }

  if (account) {
    return (
      <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-center">
        <p className="font-black text-brand-700">Aap already login hain.</p>
        <p className="mt-1 text-sm font-bold text-slate-600">{loggedInName}</p>
        <Link className="btn-primary mt-4 w-full" href={dashboardHref}>
          Go to Dashboard
        </Link>
        <button
          className="btn-outline mt-3 w-full border-red-500 text-red-600"
          onClick={() => {
            clearMistriHubSession();
            window.location.reload();
          }}
          type="button"
        >
          Logout and use another account
        </button>
      </div>
    );
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={(event) => event.preventDefault()}>
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
