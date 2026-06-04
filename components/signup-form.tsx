"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/data";
import { saveMockAccount, saveWorkerRegistration, type MockAccount, type MockRole, type WorkerRegistration } from "@/lib/mock-store";
import { saveProfileToSupabase, saveWorkerRegistrationToSupabase } from "@/lib/supabase-flow";
import { FilePreviewInput } from "./file-preview-input";

export function SignupForm({ defaultRole = "user" }: { defaultRole?: MockRole }) {
  const router = useRouter();
  const [role, setRole] = useState<MockRole>(defaultRole);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [skill, setSkill] = useState(categories[0].name);
  const [experience, setExperience] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [locationStatus, setLocationStatus] = useState("");
  const [serviceRadius, setServiceRadius] = useState("10 km");
  const [availability, setAvailability] = useState<"Available Today" | "Busy" | "Not Available">("Available Today");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [idFile, setIdFile] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (submitting) return;
    if (!name.trim() || !phone.trim()) {
      setMessage("Name aur phone number zaroori hai.");
      return;
    }
    if (role === "worker" && (!experience.trim() || !city.trim())) {
      setMessage("Worker ke liye experience aur city zaroori hai.");
      return;
    }

    setMessage("");
    setSubmitting(true);
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`;

    if (role === "worker") {
      const profile: WorkerRegistration = {
        id,
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
        idVerificationFile: idFile ? "Selected" : ""
      };
      try {
        saveWorkerRegistration(profile);
        const result = await saveWorkerRegistrationToSupabase(profile);
        if (!result.ok) {
          setMessage("Profile save nahi hua. Supabase workers table columns, RLS policy, aur Vercel env ek baar check karo.");
          setSubmitting(false);
          return;
        }
        window.location.href = "/workers?created=1";
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Worker profile save nahi hua.");
        setSubmitting(false);
      }
      return;
    }

    const account: MockAccount = { id, role, name, phone, email };
    try {
      saveMockAccount(account);
      await saveProfileToSupabase(account);
      window.location.href = role === "admin" ? "/admin" : "/dashboard/user?created=1";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Account save nahi hua.");
      setSubmitting(false);
    }
  }

  function saveWorkerLocation() {
    if (!("geolocation" in navigator)) {
      setLocationStatus("Is device/browser me location support nahi hai.");
      return;
    }

    setLocationStatus("Location check ho raha hai...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLatitude = Number(position.coords.latitude.toFixed(6));
        const nextLongitude = Number(position.coords.longitude.toFixed(6));
        setLatitude(nextLatitude);
        setLongitude(nextLongitude);
        setLocation(`GPS: ${nextLatitude}, ${nextLongitude}`);
        setLocationStatus("Location saved.");
      },
      () => setLocationStatus("Location permission nahi mila. Browser se allow karke dobara try karo."),
      { enableHighAccuracy: true, maximumAge: 300000, timeout: 10000 }
    );
  }

  return (
    <div className="card p-5">
      <div className="grid grid-cols-2 gap-3">
        {(["user", "worker"] as const).map((item) => (
          <button
            className={`h-12 rounded-2xl border font-black ${role === item ? "border-brand-600 bg-brand-50 text-brand-600" : "border-slate-200 bg-white"}`}
            key={item}
            onClick={() => setRole(item)}
            type="button"
          >
            {item === "user" ? "Continue as User" : "Join as Worker"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
      </div>

      {role === "worker" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
            <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setExperience(event.target.value)} placeholder="Example: 5 years" value={experience} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">City</span>
            <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setCity(event.target.value)} value={city} />
          </label>
          <div className="rounded-xl border border-slate-200 p-4">
            <span className="mb-2 block text-sm font-bold">Worker location</span>
            <button className="btn-outline h-11 w-full text-sm" onClick={saveWorkerLocation} type="button">
              {latitude != null && longitude != null ? "Location Saved" : "Save Location"}
            </button>
            <p className="mt-2 text-xs font-bold text-slate-500">
              {location || "GPS location save karo. Distance km isi se calculate hoga."}
            </p>
            {locationStatus ? <p className="mt-1 text-xs font-bold text-brand-600">{locationStatus}</p> : null}
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
          <FilePreviewInput label="Profile photo upload" onPreview={(preview) => setProfilePhoto(preview)} />
          <FilePreviewInput label="ID verification placeholder" onPreview={(_, fileName) => setIdFile(fileName)} />
        </div>
      ) : null}

      {message ? <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600">{message}</p> : null}
      <button className="btn-primary relative z-10 mt-5 w-full" disabled={submitting} onClick={submit} type="button">
        {submitting ? "Saving..." : role === "worker" ? "Create Worker Profile" : "Create Account"}
      </button>
      <p className="mt-3 text-xs leading-5 text-slate-500">Authentication is temporarily disabled. Worker registration saves directly to the workers table.</p>
    </div>
  );
}
