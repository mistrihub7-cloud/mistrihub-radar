"use client";

import { useEffect, useState } from "react";
import { cleanCategoryName } from "@/lib/category-display";
import { getMockAccount, getWorkerRegistration } from "@/lib/mock-store";
import { DEFAULT_LOCATION, LOCATION_KEY } from "./location-label";
import { NotificationBell } from "./notification-bell";
import { ProfessionalAvatar } from "./professional-avatar";

export function AccountDashboardHeader({ type }: { type: "user" | "worker" }) {
  const [name, setName] = useState("Loading...");
  const [subtitle, setSubtitle] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccount() {
      const savedLocation = localStorage.getItem(LOCATION_KEY) || DEFAULT_LOCATION;
      const account = getMockAccount();
      const workerProfile = getWorkerRegistration();
      setName(type === "worker" ? workerProfile?.name || account?.name || "User" : account?.name || workerProfile?.name || "User");
      setSubtitle(type === "worker" ? cleanCategoryName(workerProfile?.skill || "Professional profile") : savedLocation);
      setPhoto(type === "worker" ? workerProfile?.profilePhoto || account?.profilePhoto || null : account?.profilePhoto || workerProfile?.profilePhoto || null);
    }

    loadAccount();
  }, [type]);

  return (
    <div className="mb-7 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={name} className="h-14 w-14 rounded-full object-cover ring-4 ring-blue-50" src={photo} />
        ) : (
          <ProfessionalAvatar className="h-14 w-14 rounded-full text-sm" name={name} />
        )}
        <div>
          <h1 className="text-xl font-black">Hello, {name}</h1>
          <p className="text-sm text-slate-500">{subtitle || "Profile not completed"}</p>
        </div>
      </div>
      <NotificationBell />
    </div>
  );
}
