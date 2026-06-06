"use client";

export const JOB_ALERTS_ENABLED_KEY = "mistrihub.jobAlertsEnabled";

export function getJobAlertsEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(JOB_ALERTS_ENABLED_KEY) === "true";
}

export function saveJobAlertsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(JOB_ALERTS_ENABLED_KEY, enabled ? "true" : "false");
}

export async function requestJobAlertPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported" as const;
  if (Notification.permission === "granted") {
    saveJobAlertsEnabled(true);
    return Notification.permission;
  }

  const permission = await Notification.requestPermission();
  saveJobAlertsEnabled(permission === "granted");
  return permission;
}

export async function showJobNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return;

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: "/icon.svg",
        badge: "/icon.svg",
        ...options
      });
      return;
    }
  } catch {
    // Fall back to normal browser notification below.
  }

  new Notification(title, options);
}
