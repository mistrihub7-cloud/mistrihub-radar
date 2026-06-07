"use client";

import { useEffect, useState } from "react";

const INSTALL_DISMISSED_KEY = "mistrihub.installPromptDismissed";
const INSTALL_INSTALLED_KEY = "mistrihub.installPromptInstalled";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      navigatorWithStandalone.standalone === true;
    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY) === "true";
    const installed = localStorage.getItem(INSTALL_INSTALLED_KEY) === "true";

    if (isInstalled || installed) {
      localStorage.setItem(INSTALL_INSTALLED_KEY, "true");
      localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
      setHidden(true);
      return;
    }

    if (dismissed) {
      setHidden(true);
      return;
    }

    const relatedApps = (navigator as Navigator & {
      getInstalledRelatedApps?: () => Promise<Array<unknown>>;
    }).getInstalledRelatedApps;
    if (relatedApps) {
      relatedApps.call(navigator).then((apps) => {
        if (cancelled || !apps.length) return;
        localStorage.setItem(INSTALL_INSTALLED_KEY, "true");
        localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
        setHidden(true);
        setEvent(null);
      }).catch(() => null);
    }

    const onPrompt = (installEvent: Event) => {
      installEvent.preventDefault();
      if (localStorage.getItem(INSTALL_DISMISSED_KEY) === "true" || localStorage.getItem(INSTALL_INSTALLED_KEY) === "true") return;
      setEvent(installEvent as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      localStorage.setItem(INSTALL_INSTALLED_KEY, "true");
      localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
      setHidden(true);
      setEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!event || hidden) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[min(92%,390px)] -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-4 shadow-card md:bottom-6 md:left-auto md:right-6 md:w-80 md:translate-x-0">
      <p className="text-sm font-black text-slate-900">Install MistriHub.In app</p>
      <p className="mt-1 text-xs text-slate-500">Fast booking, offline support and home-screen access.</p>
      <div className="mt-3 flex gap-2">
        <button
          className="btn-primary h-10 flex-1 text-sm"
          onClick={async () => {
            await event.prompt();
            const choice = await event.userChoice;
            localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
            if (choice.outcome === "accepted") {
              localStorage.setItem(INSTALL_INSTALLED_KEY, "true");
              setEvent(null);
            }
            setHidden(true);
          }}
        >
          Install
        </button>
        <button
          className="btn-outline h-10 flex-1 text-sm"
          onClick={() => {
            localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
            setHidden(true);
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
