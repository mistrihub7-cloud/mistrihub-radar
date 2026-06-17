"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    const registerWorker = async () => {
      const registration = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
      registration.update().catch(() => undefined);
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
            installingWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });

      const update = () => registration.update().catch(() => undefined);
      const updateWhenVisible = () => {
        if (document.visibilityState === "visible") update();
      };
      const intervalId = window.setInterval(update, 10 * 60 * 1000);
      window.addEventListener("focus", update);
      document.addEventListener("visibilitychange", updateWhenVisible);

      return () => {
        window.clearInterval(intervalId);
        window.removeEventListener("focus", update);
        document.removeEventListener("visibilitychange", updateWhenVisible);
      };
    };

    let cleanupRegistration: (() => void) | undefined;
    const onLoad = () => {
      registerWorker()
        .then((cleanup) => {
          cleanupRegistration = cleanup;
          navigator.serviceWorker.controller?.postMessage({ type: "CLEAR_OLD_CACHES" });
        })
        .catch(() => undefined);
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    window.addEventListener("load", onLoad);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("load", onLoad);
      cleanupRegistration?.();
    };
  }, []);

  return null;
}
