import { firebaseAdminMessaging } from "./firebase-admin";
import { supabaseServer } from "./supabase-server";

export type PushTokenRow = {
  token: string;
  role?: string | null;
  phone?: string | null;
  service?: string | null;
  worker_id?: string | null;
  endpoint?: string | null;
  p256dh?: string | null;
  auth?: string | null;
};

export function normalizePhone(value?: string | null) {
  return (value || "").replace(/\D/g, "").slice(-10);
}

function absoluteSiteUrl(path?: string) {
  const url = path || "/jobs";
  if (/^https?:\/\//i.test(url)) return url;
  return `${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.mistrihub.in").replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function sendPushToTokens(input: {
  tokens: string[];
  title: string;
  body: string;
  url?: string;
  jobId?: string;
}) {
  const messaging = firebaseAdminMessaging();
  const tokens = Array.from(new Set(input.tokens.filter(Boolean)));
  if (!messaging || !tokens.length) return { ok: false, sent: 0, reason: "Firebase admin config or tokens missing." };

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: input.title,
      body: input.body
    },
    webpush: {
      headers: {
        TTL: "3600",
        Urgency: "high"
      },
      notification: {
        title: input.title,
        body: input.body,
        icon: "/icon.svg",
        badge: "/icon.svg",
        tag: input.jobId || "mistrihub-update",
        requireInteraction: true
      },
      fcmOptions: {
        link: absoluteSiteUrl(input.url)
      }
    },
    data: {
      title: input.title,
      body: input.body,
      url: input.url || "/jobs",
      click_action: input.url || "/jobs",
      jobId: input.jobId || ""
    }
  });

  const invalidTokens = response.responses
    .map((item, index) => (item.success ? "" : tokens[index]))
    .filter(Boolean);

  if (invalidTokens.length && supabaseServer) {
    await supabaseServer.from("push_tokens").delete().in("token", invalidTokens);
  }

  return { ok: true, sent: response.successCount, failed: response.failureCount };
}
