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

  try {
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

    const errors = response.responses
      .map((item, index) => (item.success ? null : {
        token: tokens[index],
        code: item.error?.code || "unknown",
        message: item.error?.message || "Firebase push failed"
      }))
      .filter(Boolean) as Array<{ token: string; code: string; message: string }>;

    const invalidTokens = errors
      .filter((item) => item.code.includes("registration-token-not-registered") || item.code.includes("invalid-registration-token"))
      .map((item) => item.token);

    if (errors.length) {
      console.error("FCM push failed for some tokens", {
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: errors.map((item) => ({ code: item.code, message: item.message.slice(0, 240) }))
      });
    }

    if (invalidTokens.length && supabaseServer) {
      await supabaseServer.from("push_tokens").delete().in("token", invalidTokens);
    }

    return {
      ok: response.successCount > 0,
      sent: response.successCount,
      failed: response.failureCount,
      reason: errors[0]?.message,
      errors: errors.map((item) => ({ code: item.code, message: item.message }))
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Firebase push send crashed.";
    console.error("FCM push send crashed", { message });
    return { ok: false, sent: 0, failed: tokens.length, reason: message };
  }
}
