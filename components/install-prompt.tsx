"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onPrompt = (installEvent: Event) => {
      installEvent.preventDefault();
      setEvent(installEvent as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!event || hidden) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[min(92%,390px)] -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-4 shadow-card md:bottom-6 md:left-auto md:right-6 md:w-80 md:translate-x-0">
      <p className="text-sm font-black text-slate-900">Install MistriHub app</p>
      <p className="mt-1 text-xs text-slate-500">Fast booking, offline fallback and home-screen access.</p>
      <div className="mt-3 flex gap-2">
        <button
          className="btn-primary h-10 flex-1 text-sm"
          onClick={async () => {
            await event.prompt();
            setHidden(true);
          }}
        >
          Install
        </button>
        <button className="btn-outline h-10 flex-1 text-sm" onClick={() => setHidden(true)}>
          Later
        </button>
      </div>
    </div>
  );
}
