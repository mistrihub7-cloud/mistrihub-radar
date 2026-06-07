"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import { getMockAccount, getWorkerRegistration } from "./mock-store";
import { showJobNotification } from "./notifications";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let foregroundListenerReady = false;

export function hasFirebaseMessagingConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  );
}

function firebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

async function ensureFirebaseWorker() {
  if (!("serviceWorker" in navigator)) return undefined;
  return navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/firebase-cloud-messaging-push-scope"
  });
}

function setupForegroundMessages() {
  if (foregroundListenerReady || !hasFirebaseMessagingConfig()) return;
  foregroundListenerReady = true;
  const messaging = getMessaging(firebaseApp());
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || payload.data?.title || "MistriHub.In update";
    const body = payload.notification?.body || payload.data?.body || "New job update received.";
    showJobNotification(title, {
      body,
      tag: payload.data?.jobId || "mistrihub-update",
      data: { url: payload.data?.url || "/jobs" }
    }).catch(() => undefined);
  });
}

export async function registerFcmToken() {
  if (typeof window === "undefined" || !hasFirebaseMessagingConfig()) {
    return { ok: false, reason: "Firebase web config missing." };
  }
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return { ok: false, reason: "Notification permission not granted." };
  }
  if (!(await isSupported())) {
    return { ok: false, reason: "FCM is not supported in this browser." };
  }

  const account = getMockAccount();
  const workerProfile = getWorkerRegistration();
  const registration = await ensureFirebaseWorker();
  const messaging = getMessaging(firebaseApp());
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration
  });

  if (!token) return { ok: false, reason: "FCM token not created." };

  setupForegroundMessages();
  const response = await fetch("/api/push/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      accountId: account?.id || workerProfile?.id || "",
      role: account?.role || workerProfile?.role || "user",
      name: workerProfile?.name || account?.name || "",
      phone: workerProfile?.phone || account?.phone || "",
      service: workerProfile?.skill || "",
      workerId: workerProfile?.id || ""
    })
  });

  if (!response.ok) return { ok: false, reason: "Push token server save failed." };
  return { ok: true, token };
}
