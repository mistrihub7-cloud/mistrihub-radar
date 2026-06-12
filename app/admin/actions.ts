"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, isAdminAuthed, setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";
import { sendBookingAlerts, sendWhatsAppTestMessage, type BookingAlertInput } from "@/lib/booking-alerts";
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
  }
  revalidatePath("/admin");
  redirect(result.ok ? "/admin?wa=sent" : "/admin?wa=failed");
}
