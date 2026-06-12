"use client";

import { useEffect, useState } from "react";
import { accountDisplayName } from "@/lib/display-name";
import { getMockAccount, saveMockAccount, type MockAccount } from "@/lib/mock-store";
import { saveProfileToSupabase } from "@/lib/supabase-flow";
import { FilePreviewInput } from "./file-preview-input";
import { DEFAULT_LOCATION, LOCATION_KEY, saveLocationLabel } from "./location-label";

export function UserProfileForm() {
  const [account, setAccount] = useState<MockAccount | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedAccount = getMockAccount();
    if (!savedAccount) {
      window.location.replace("/login");
      return;
    }
    setAccount(savedAccount);
    setName(accountDisplayName(savedAccount));
    setPhone(savedAccount.phone || "");
    setEmail(savedAccount.email || "");
    setProfilePhoto(savedAccount.profilePhoto || "");
    setLocation(localStorage.getItem(LOCATION_KEY) || DEFAULT_LOCATION);
  }, []);

  async function saveProfile() {
    if (!account || !name.trim()) {
      setMessage("Name zaroori hai.");
      return;
    }

    setSaving(true);
    const nextAccount: MockAccount = {
      ...account,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      profilePhoto
    };
    saveMockAccount(nextAccount);
    if (location.trim() && location !== DEFAULT_LOCATION) saveLocationLabel(location);
    const result = await saveProfileToSupabase(nextAccount);
    setSaving(false);
    setMessage(result.ok ? "Profile updated." : "Profile local update hua. Supabase profiles table check karo.");
  }

  return (
    <div className="card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Full name</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setName(event.target.value)} value={name} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Phone number</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setPhone(event.target.value)} value={phone} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Email (Optional)</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Saved area / city</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setLocation(event.target.value)} value={location} />
        </label>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[120px_1fr]">
        <div>
          <span className="mb-2 block text-sm font-bold">Current photo</span>
          <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-2xl bg-brand-50 ring-4 ring-blue-50">
            {profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={name || "Profile"} className="h-full w-full object-cover object-top" src={profilePhoto} />
            ) : (
              <span className="text-3xl font-black text-brand-700">{(name || "U").slice(0, 1).toUpperCase()}</span>
            )}
          </div>
        </div>
        <FilePreviewInput label="Profile photo (Optional)" onPreview={(preview) => setProfilePhoto(preview)} />
      </div>
      {message ? <p className="mt-4 rounded-2xl bg-brand-50 p-3 text-sm font-bold text-brand-700">{message}</p> : null}
      <button className="btn-primary mt-5 w-full" disabled={saving} onClick={saveProfile} type="button">
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
