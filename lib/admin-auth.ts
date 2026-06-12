import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "mistrihub.admin";

function adminUser() {
  return process.env.MISTRIHUB_ADMIN_USER || "admin";
}

function adminPassword() {
  return process.env.MISTRIHUB_ADMIN_PASSWORD || "";
}

function adminSecret() {
  return process.env.MISTRIHUB_ADMIN_SECRET || adminPassword();
}

function sign(value: string) {
  return createHmac("sha256", adminSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminConfigured() {
  return Boolean(adminPassword());
}

export function validateAdminCredentials(username: string, password: string) {
  return isAdminConfigured() && username === adminUser() && password === adminPassword();
}

export function setAdminSession() {
  const expires = Date.now() + 12 * 60 * 60 * 1000;
  const payload = `${adminUser()}.${expires}`;
  cookies().set(ADMIN_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 12 * 60 * 60
  });
}

export function clearAdminSession() {
  cookies().delete(ADMIN_COOKIE);
}

export function isAdminAuthed() {
  if (!isAdminConfigured()) return false;
  const token = cookies().get(ADMIN_COOKIE)?.value || "";
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [user, expires, signature] = parts;
  if (user !== adminUser() || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(`${user}.${expires}`));
}
