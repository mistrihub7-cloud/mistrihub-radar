export const dynamic = "force-dynamic";

function jsString(value?: string) {
  return JSON.stringify(value || "");
}

export async function GET() {
  const script = `
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)},
  authDomain: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)},
  projectId: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)},
  storageBucket: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)},
  messagingSenderId: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)},
  appId: ${jsString(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)}
});

const messaging = firebase.messaging();

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
    data: { url }
  });
}

messaging.onBackgroundMessage((payload) => {
  return showMistriHubNotification(payload);
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
  const targetUrl = event.notification.data?.url || "/jobs";
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
`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": "/"
    }
  });
}
