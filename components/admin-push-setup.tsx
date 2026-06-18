"use client";

import { useEffect, useState } from "react";

type PushState = "checking" | "ready" | "needs-permission" | "blocked" | "unsupported" | "error";

export function AdminPushSetup() {
  const [state, setState] = useState<PushState>("checking");
  const [message, setMessage] = useState("Admin notification check ho raha hai...");

  async function enableAdminPush() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setState("unsupported");
      setMessage("Is browser me push notification support nahi hai.");
      return;
    }

    try {
      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (permission === "denied") {
        setState("blocked");
        setMessage("Admin notification blocked hai. Chrome Site Settings > Notifications > Allow karo.");
        return;
      }
      if (permission !== "granted") {
        setState("needs-permission");
        setMessage("Admin background alert ke liye notification Allow karo.");
        return;
      }

      const { registerAdminFcmToken } = await import("@/lib/fcm-client");
      const result = await registerAdminFcmToken();
      if (!result.ok) {
        setState("error");
        setMessage(result.reason || "Admin push token save nahi hua.");
        return;
      }

      setState("ready");
      setMessage("Admin background alerts ready hain.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Admin notification setup failed.");
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setState("unsupported");
      setMessage("Is browser me push notification support nahi hai.");
      return;
    }

    if (Notification.permission === "granted") {
      enableAdminPush();
      return;
    }

    setState(Notification.permission === "denied" ? "blocked" : "needs-permission");
    setMessage(
      Notification.permission === "denied"
        ? "Admin notification blocked hai. Chrome Site Settings > Notifications > Allow karo."
        : "Admin background alert ke liye notification Allow karo."
    );
  }, []);

  const ok = state === "ready";
  return (
    <div className={`rounded-2xl border p-4 ${ok ? "border-emerald-800 bg-emerald-950/40" : "border-amber-800 bg-amber-950/30"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`text-sm font-black ${ok ? "text-emerald-100" : "text-amber-100"}`}>Admin Background Alerts</p>
          <p className="mt-1 text-xs font-bold text-slate-300">{message}</p>
        </div>
        {ok ? (
          <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-black text-emerald-100">Ready</span>
        ) : (
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white" onClick={enableAdminPush} type="button">
            Enable Admin Alerts
          </button>
        )}
      </div>
    </div>
  );
}
