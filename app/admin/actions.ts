"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, isAdminAuthed, setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";
import { sendBookingAlerts, sendWhatsAppTestMessage, type BookingAlertInput } from "@/lib/booking-alerts";
import { normalizePhone, sendPushToTokens } from "@/lib/push-server";
import { supabaseServer } from "@/lib/supabase-server";

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  if (!validateAdminCredentials(username, password)) {
    redirect("/admin?error=1");
  }
  setAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  clearAdminSession();
  redirect("/admin");
}

export async function escalateJobFromAdmin(formData: FormData) {
  if (!isAdminAuthed()) redirect("/admin");
  if (!supabaseServer) return;

  const jobId = String(formData.get("jobId") || "");
  const { data: job } = await supabaseServer
    .from("job_requests")
    .select("id,service,problem_description,urgency,area,user_latitude,user_longitude,status")
    .eq("id", jobId)
    .maybeSingle();

  if (!job) return;
  const input: BookingAlertInput = {
    jobId: job.id,
    service: job.service || "",
    problem: job.problem_description || "",
    urgency: job.urgency || "Normal",
    area: job.area || "",
    userLatitude: job.user_latitude ?? null,
    userLongitude: job.user_longitude ?? null
  };
  await sendBookingAlerts(input, {
    radiusKm: 20,
    maxWorkers: 25,
    waveKey: `Admin manual 20km alert ${Date.now()}`,
    excludeAlreadyNotified: true,
    adminAlert: true
  });
  revalidatePath("/admin");
}

export async function testWhatsAppFromAdmin(formData: FormData) {
  if (!isAdminAuthed()) redirect("/admin");
  const phone = String(formData.get("phone") || "").trim();
  if (!phone) redirect("/admin?wa=missing");

  const result = await sendWhatsAppTestMessage(phone);
  if (supabaseServer) {
    await supabaseServer.from("notifications").insert({
      user_id: null,
      title: result.ok ? "WhatsApp test sent" : "WhatsApp test failed",
      message: `Admin WhatsApp test to ${phone}: ${result.ok ? "Sent" : result.reason || "Failed"}`,
      type: "whatsapp_job_alert"
    });
    await supabaseServer.from("notification_logs").insert({
      request_id: "admin-test",
      worker_id: null,
      phone,
      channel: "whatsapp",
      status: result.ok ? "sent" : result.skipped ? "skipped" : "failed",
      twilio_sid: "sid" in result ? result.sid : null,
      error_message: result.ok ? null : result.reason || "WhatsApp test failed"
    });
  }
  revalidatePath("/admin");
  redirect(result.ok ? "/admin?wa=sent" : "/admin?wa=failed");
}

export async function testPushFromAdmin(formData: FormData) {
  if (!isAdminAuthed()) redirect("/admin");
  if (!supabaseServer) redirect("/admin?push=failed");

  const target = String(formData.get("target") || "").trim();
  if (!target) redirect("/admin?push=missing");

  const cleanPhone = normalizePhone(target);
  const { data, error } = await supabaseServer
    .from("push_tokens")
    .select("token,worker_id,phone,role,name,service")
    .or(cleanPhone ? `phone.ilike.%${cleanPhone}%,worker_id.eq.${target},account_id.eq.${target}` : `worker_id.eq.${target},account_id.eq.${target}`)
    .range(0, 20);

  if (error || !data?.length) {
    await supabaseServer.from("notification_logs").insert({
      request_id: "admin-push-test",
      worker_id: target,
      phone: cleanPhone || target,
      channel: "web_push",
      status: "failed",
      error_message: error?.message || "No saved FCM token found for this phone/worker."
    });
    revalidatePath("/admin");
    redirect("/admin?push=notoken");
  }

  const result = await sendPushToTokens({
    tokens: data.map((row: any) => row.token).filter(Boolean),
    title: "MistriHub.In test notification",
    body: "Agar ye notification dikha, background push token connected hai.",
    url: "/worker-request",
    jobId: "admin-push-test"
  });

  await supabaseServer.from("notification_logs").insert({
    request_id: "admin-push-test",
    worker_id: data[0]?.worker_id || target,
    phone: data[0]?.phone || cleanPhone || target,
    channel: "web_push",
    status: result.sent > 0 ? "sent" : "failed",
    error_message: result.sent > 0 ? null : result.reason || "Firebase push test failed"
  });

  revalidatePath("/admin");
  redirect(result.sent > 0 ? "/admin?push=sent" : "/admin?push=failed");
}
