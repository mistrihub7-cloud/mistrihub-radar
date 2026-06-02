"use client";

import { useEffect, useState } from "react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase-client";
import { DEFAULT_LOCATION, LOCATION_KEY } from "./location-label";
import { Icon } from "./simple-icons";

type WorkerProfile = {
  name: string;
  category: string;
  location: string;
  city: string;
  profile_photo: string | null;
};

function getDisplayName(email?: string, phone?: string) {
  if (email) {
    return email.split("@")[0].replace(/[._-]+/g, " ");
  }
  if (phone) {
    return phone;
  }
  return "User";
}

export function AccountDashboardHeader({ type }: { type: "user" | "worker" }) {
  const [name, setName] = useState("Loading...");
  const [subtitle, setSubtitle] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccount() {
      const savedLocation = localStorage.getItem(LOCATION_KEY) || DEFAULT_LOCATION;

      if (!hasSupabaseConfig || !supabase) {
        setName("Login required");
        setSubtitle(savedLocation);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        setName("Login required");
        setSubtitle(savedLocation);
        return;
      }

      const fallbackName =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        getDisplayName(user.email, user.phone);

      const { data } = await supabase
        .from("workers")
        .select("name,category,location,city,profile_photo")
        .eq("user_id", user.id)
        .maybeSingle();

      const profile = data as WorkerProfile | null;
      setName(profile?.name || fallbackName);
      setSubtitle(
        type === "worker"
          ? profile?.category || "Worker profile"
          : profile
            ? [profile.location, profile.city].filter(Boolean).join(", ")
            : savedLocation
      );
      setPhoto(profile?.profile_photo || null);
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
