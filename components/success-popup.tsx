"use client";

import { Icon } from "./simple-icons";

export function SuccessPopup({ message = "Registration completed" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-card">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon className="h-8 w-8" name="check" />
        </span>
        <h2 className="mt-4 text-2xl font-black text-slate-950">{message}</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">Profile page open ho raha hai...</p>
      </div>
    </div>
  );
}
