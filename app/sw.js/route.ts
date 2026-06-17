export const dynamic = "force-dynamic";

function jsString(value?: string) {
  return JSON.stringify(value || "");
}

export async function GET() {
  const version = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_APP_VERSION || String(Date.now());
  const script = `
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const CACHE_NAME = "mistrihub-cache-${version.slice(0, 12)}";
const APP_SHELL = ["/offline", "/manifest.json", "/icon.svg"];
let firebaseMessaging = null;

try {
  firebase.initializeApp({
    apiKey: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)},
    authDomain: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)},
    projectId: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)},
    storageBucket: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)},
    messagingSenderId: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)},
    appId: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)}
  });
  firebaseMessaging = firebase.messaging();
} catch (error) {
  console.warn("MistriHub Firebase messaging not initialized", error);
}

function showMistriHubNotification(payload) {
  const data = payload.data || payload || {};
  const title = payload.notification?.title || data.title || "MistriHub.In update";
  const body = payload.notification?.body || data.body || "New job update received.";
  const url = data.url || data.click_action || "/jobs";
  return self.registration.showNotification(title, {
    body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: data.jobId || data.requestId || "mistrihub-job",
    data: { url },
    requireInteraction: true
  });
}

if (firebaseMessaging) {
  firebaseMessaging.onBackgroundMessage((payload) => {
    return showMistriHubNotification(payload);
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("mistrihub-cache-") && key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_OLD_CACHES") {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
  }
});

async function networkFirst(request, fallbackPath) {
  try {
    const response = await fetch(new Request(request, { cache: "no-store" }));
    return response;
  } catch {
    return caches.match(fallbackPath || request).then((cached) => cached || Response.error());
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone()).catch(() => undefined);
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, "/offline"));
    return;
  }

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin") || url.pathname.startsWith("/jobs")) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || /\\.(?:png|jpg|jpeg|webp|svg|ico|css|js|woff2?)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "MistriHub.In update", body: event.data?.text() || "New update received.", url: "/jobs" };
  }
  event.waitUntil(showMistriHubNotification(payload));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  const absoluteUrl = new URL(targetUrl, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(absoluteUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(absoluteUrl);
    })
  );
});

console.info("MistriHub service worker active", ${jsString(version.slice(0, 12))});
`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Service-Worker-Allowed": "/"
    }
  });
}
