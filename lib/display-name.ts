import { type MockAccount, type WorkerRegistration } from "./mock-store";

function titleCase(value: string) {
  return value
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function displayNameFromValue(value?: string) {
  if (!value) return "";
  const cleanValue = value.trim();
  if (!cleanValue) return "";
  if (/^\+?\d[\d\s-]{5,}$/.test(cleanValue)) return "";
  if (cleanValue.includes("@")) return titleCase(cleanValue.split("@")[0]);
  return titleCase(cleanValue);
}

export function accountDisplayName(account?: MockAccount | null, profile?: WorkerRegistration | null) {
  return (
    displayNameFromValue(profile?.name) ||
    displayNameFromValue(account?.name) ||
    (account?.role === "worker" ? "Worker" : "User")
  );
}
