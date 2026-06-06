"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { categories } from "@/lib/data";
import { getMockAccount, getWorkerRegistration, saveWorkerRegistration, type WorkerRegistration } from "@/lib/mock-store";
import { saveWorkerRegistrationToSupabase } from "@/lib/supabase-flow";
import { FilePreviewInput } from "./file-preview-input";
import { SuccessPopup } from "./success-popup";

export function WorkerProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<WorkerRegistration | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [skill, setSkill] = useState(categories[0].name);
  const [experience, setExperience] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [serviceRadius, setServiceRadius] = useState("10 km");
  const [availability, setAvailability] = useState<"Available Today" | "Busy" | "Not Available">("Available Today");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const account = getMockAccount();
    const savedProfile = getWorkerRegistration();
    if (!account) {
      window.location.replace("/login");
      return;
    }

    if (savedProfile) {
      setProfile(savedProfile);
      setName(savedProfile.name);
      setPhone(savedProfile.phone);
      setEmail(savedProfile.email || "");
      setSkill(savedProfile.skill);
      setExperience(savedProfile.experience);
      setCity(savedProfile.city);
      setLocation(savedProfile.location);
      setLatitude(savedProfile.latitude);
      setLongitude(savedProfile.longitude);
      setServiceRadius(savedProfile.serviceRadius);
      setAvailability(savedProfile.availability);
      setProfilePhoto(savedProfile.profilePhoto || "");
      return;
    }

    setName(account.name || "");
    setPhone(account.phone || "");
    setEmail(account.email || "");
  }, []);

  function saveWorkerLocation() {
    if (!("geolocation" in navigator)) {
      setMessage("Is device/browser me location support nahi hai.");
      return;
    }

    setMessage("Location check ho raha hai...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLatitude = Number(position.coords.latitude.toFixed(6));
        const nextLongitude = Number(position.coords.longitude.toFixed(6));
        setLatitude(nextLatitude);
        setLongitude(nextLongitude);
        setLocation(`GPS saved`);
        setMessage("Location saved.");
      },
      () => setMessage("Location permission nahi mila. Browser se allow karke dobara try karo."),
      { enableHighAccuracy: true, maximumAge: 300000, timeout: 10000 }
    );
  }

  async function saveProfile() {
    if (!name.trim() || !phone.trim() || !experience.trim() || !city.trim()) {
      setMessage("Name, phone, experience aur city zaroori hai.");
      return;
    }

    setSaving(true);
    setMessage("");
    const account = getMockAccount();
    const nextProfile: WorkerRegistration = {
      id: profile?.id || account?.id || globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
      role: "worker",
      name,
      phone,
      email,
      skill,
      experience,
      city,
      location: location || `Location pending, ${city}`,
      latitude,
      longitude,
      serviceRadius,
      availability,
      profilePhoto,
      idVerificationFile: profile?.idVerificationFile || ""
    };

    saveWorkerRegistration(nextProfile);
    const result = await saveWorkerRegistrationToSupabase(nextProfile);
    setSaving(false);
    if (!result.ok) {
      setMessage(`Profile save nahi hua. ${result.error || "Supabase workers table columns/RLS policy check karo."}`);
      return;
    }

    const savedProfile = { ...nextProfile, id: result.workerId || nextProfile.id };
    setProfile(savedProfile);
    setShowSuccess(true);
    window.setTimeout(() => router.replace(`/workers/${savedProfile.id}`), 1200);
  }

  return (
    <div className="card p-5">
      {showSuccess ? <SuccessPopup message="Profile saved successfully" /> : null}
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
          <span className="mb-2 block text-sm font-bold">Email optional</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Skill / category</span>
          <select className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setSkill(event.target.value)} value={skill}>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Experience</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setExperience(event.target.value)} value={experience} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">City</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setCity(event.target.value)} value={city} />
        </label>
        <div className="rounded-xl border border-slate-200 p-4">
          <span className="mb-2 block text-sm font-bold">Worker location</span>
          <button className="btn-outline h-11 w-full text-sm" onClick={saveWorkerLocation} type="button">
            {latitude != null && longitude != null ? "Update Location" : "Save Location"}
          </button>
          <p className="mt-2 text-xs font-bold text-slate-500">{location || "GPS location save karo. Distance km isi se calculate hoga."}</p>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Service radius</span>
          <select className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setServiceRadius(event.target.value)} value={serviceRadius}>
            {["5 km", "10 km", "15 km", "20 km"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Availability status</span>
          <select className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setAvailability(event.target.value as typeof availability)} value={availability}>
            {["Available Today", "Busy", "Not Available"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <FilePreviewInput label="Profile photo" onPreview={(preview) => setProfilePhoto(preview)} />
      </div>
      {message ? <p className="mt-4 rounded-2xl bg-brand-50 p-3 text-sm font-bold text-brand-700">{message}</p> : null}
      <button className="btn-primary mt-5 w-full" disabled={saving} onClick={saveProfile} type="button">
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
