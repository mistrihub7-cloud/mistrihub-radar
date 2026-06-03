"use client";

import { useEffect, useState } from "react";
import { getMockAccount, getWorkerRegistration } from "@/lib/mock-store";
import { DEFAULT_LOCATION, LOCATION_KEY } from "./location-label";
import { Icon } from "./simple-icons";

export function AccountDashboardHeader({ type }: { type: "user" | "worker" }) {
  const [name, setName] = useState("Loading...");
  const [subtitle, setSubtitle] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccount() {
      const savedLocation = localStorage.getItem(LOCATION_KEY) || DEFAULT_LOCATION;
      const account = getMockAccount();
      const workerProfile = getWorkerRegistration();
      setName(workerProfile?.name || account?.name || "User");
      setSubtitle(type === "worker" ? workerProfile?.skill || "Worker profile" : savedLocation);
      setPhoto(workerProfile?.profilePhoto || null);
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
          <div className="worker-avatar" />
        )}
        <div>
          <h1 className="text-xl font-black">Hello, {name}</h1>
          <p className="text-sm text-slate-500">{subtitle || "Profile not completed"}</p>
        </div>
      </div>
      <button className="grid h-10 w-10 place-items-center rounded-full border border-slate-200" type="button">
        <Icon name="bell" />
      </button>
    </div>
  );
}
