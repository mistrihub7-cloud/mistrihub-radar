"use client";

import { useState } from "react";

export function ShareProfileButton({ workerId, workerName }: { workerId: string; workerName: string }) {
  const [message, setMessage] = useState("");

  async function shareProfile() {
    const url = `${window.location.origin}/workers/${workerId}`;
    const title = `${workerName} - MistriHub.In`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${workerName} ka MistriHub.In professional profile`, url });
        setMessage("Profile link ready to share.");
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage("Profile link copied.");
    } catch {
      setMessage("Share cancel hua. Link copy karke share kar sakte ho.");
    }
  }

  return (
    <div>
      <button className="btn-outline w-full" onClick={shareProfile} type="button">
        Share Profile
      </button>
      {message ? <p className="mt-2 text-center text-xs font-black text-brand-600">{message}</p> : null}
    </div>
  );
}
