"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cleanCategoryName } from "@/lib/category-display";
import { categories } from "@/lib/data";
import { clearMistriHubSession, findSavedAccount, findSavedWorkerRegistration, saveMockAccount, saveWorkerRegistration, type MockAccount, type MockRole, type WorkerRegistration } from "@/lib/mock-store";
import { findUserAccountByLogin, findWorkerRegistrationByLogin, saveProfileToSupabase, saveWorkerRegistrationToSupabase } from "@/lib/supabase-flow";
import { FilePreviewInput } from "./file-preview-input";
import { searchAreaSuggestions, type LocationSuggestion } from "./location-geocode";
import { SuccessPopup } from "./success-popup";

export function SignupForm({ defaultRole = "user" }: { defaultRole?: MockRole }) {
  const router = useRouter();
  const [role, setRole] = useState<Extract<MockRole, "user" | "worker">>(defaultRole === "worker" ? "worker" : "user");
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
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [locationSuggestionLoading, setLocationSuggestionLoading] = useState(false);
  const [selectedLocationSuggestion, setSelectedLocationSuggestion] = useState<LocationSuggestion | null>(null);
  const [serviceRadius, setServiceRadius] = useState("10 km");
  const [availability, setAvailability] = useState<"Available Today" | "Busy" | "Not Available">("Available Today");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [idFile, setIdFile] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (role !== "worker" || city.trim().length < 2 || selectedLocationSuggestion?.label === city.trim()) {
      setLocationSuggestions([]);
      setLocationSuggestionLoading(false);
      return;
    }

    let cancelled = false;
    setLocationSuggestionLoading(true);
    const timer = window.setTimeout(async () => {
      const suggestions = await searchAreaSuggestions(city);
      if (cancelled) return;
      setLocationSuggestions(suggestions);
      setLocationSuggestionLoading(false);
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [city, role, selectedLocationSuggestion?.label]);

  async function submit() {
    if (submitting) return;
    if (!name.trim() || !phone.trim()) {
      setMessage("Name aur mobile number zaroori hai.");
      return;
    }
    if (role === "worker" && (!experience.trim() || !city.trim())) {
      setMessage("Service partner ke liye experience aur city zaroori hai.");
      return;
    }
    if (role === "worker" && (latitude == null || longitude == null)) {
      setMessage("Professional location zaroori hai. Current location save karo ya manual city list se select karo.");
      return;
    }

    setMessage("");
    setSubmitting(true);
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`;
    const loginIdentity = { phone: phone.trim(), email: email.trim() || undefined };
    const existingWorker = findSavedWorkerRegistration(loginIdentity) || (await findWorkerRegistrationByLogin(loginIdentity));

    if (role === "user") {
      if (existingWorker) {
        clearMistriHubSession();
        saveWorkerRegistration(existingWorker);
        setShowSuccess(true);
        setSubmitting(false);
        window.setTimeout(() => router.replace("/dashboard/worker"), 700);
        return;
      }

      const savedAccount = findSavedAccount(loginIdentity) || (await findUserAccountByLogin(loginIdentity));
      if (savedAccount) {
        clearMistriHubSession();
        saveMockAccount(savedAccount);
        setShowSuccess(true);
        setSubmitting(false);
        window.setTimeout(() => router.replace(savedAccount.role === "worker" ? "/dashboard/worker" : "/dashboard/user"), 700);
        return;
      }

      const account: MockAccount = { id, role: "user", name, phone, email };
      try {
        clearMistriHubSession();
        saveMockAccount(account);
        await saveProfileToSupabase(account);
        setShowSuccess(true);
        setSubmitting(false);
        window.setTimeout(() => router.replace("/dashboard/user?created=1"), 1000);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "User account save nahi hua.");
        setSubmitting(false);
      }
      return;
    }

    if (existingWorker) {
      clearMistriHubSession();
      saveWorkerRegistration(existingWorker);
      setMessage("Ye mobile/email already registered hai. Existing service partner profile login kar diya.");
      setShowSuccess(true);
      setSubmitting(false);
      window.setTimeout(() => router.replace("/dashboard/worker"), 900);
      return;
    }

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
      clearMistriHubSession();
      saveWorkerRegistration(profile);
      const result = await saveWorkerRegistrationToSupabase(profile);
      if (!result.ok) {
        setMessage(`Profile save nahi hua. ${result.error || "Supabase service partner table columns/RLS policy check karo."}`);
        setSubmitting(false);
        return;
      }
      setShowSuccess(true);
      setSubmitting(false);
      window.setTimeout(() => router.replace(`/workers/${result.workerId || id}`), 1200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Professional profile save nahi hua.");
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
        setLocation("Worker location saved");
        setLocationStatus("Location saved.");
      },
      () => setLocationStatus("Location nahi mila. Mobile ka location/GPS on karke Allow dabao, ya city list se manual location select karo."),
      { enableHighAccuracy: true, maximumAge: 300000, timeout: 10000 }
    );
  }

  function selectWorkerLocation(suggestion: LocationSuggestion) {
    setCity(suggestion.label);
    setLocation(suggestion.label);
    setLatitude(suggestion.latitude);
    setLongitude(suggestion.longitude);
    setSelectedLocationSuggestion(suggestion);
    setLocationSuggestions([]);
    setLocationStatus("Manual location saved.");
  }

  return (
    <div className="card p-5">
        {showSuccess ? <SuccessPopup message={role === "worker" ? "Registration completed" : "Account created successfully"} /> : null}
      <div className="grid grid-cols-2 gap-3">
        {(["user", "worker"] as const).map((item) => (
          <button
            className={`h-12 rounded-2xl border font-black ${role === item ? "border-brand-600 bg-brand-50 text-brand-600" : "border-slate-200 bg-white"}`}
            key={item}
            onClick={() => setRole(item)}
            type="button"
          >
            {item === "user" ? "Continue as User" : "Join as Service Partner"}
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
          <span className="mb-2 block text-sm font-bold">Email (Optional)</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        </label>
      </div>

      {role === "worker" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Skill / category</span>
            <select className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setSkill(event.target.value)} value={skill}>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>{cleanCategoryName(category.name)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Experience</span>
            <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setExperience(event.target.value)} placeholder="Example: 5 years" value={experience} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">City</span>
            <input
              className="h-12 w-full rounded-xl border border-slate-200 px-4"
              onChange={(event) => {
                setCity(event.target.value);
                setSelectedLocationSuggestion(null);
              }}
              placeholder="Type area/city and select"
              value={city}
            />
            {locationSuggestionLoading || locationSuggestions.length ? (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                {locationSuggestionLoading ? <p className="px-4 py-3 text-sm font-bold text-slate-500">Searching city...</p> : null}
                {locationSuggestions.map((suggestion) => (
                  <button
                    className="flex w-full items-start gap-3 border-t border-slate-100 px-4 py-3 text-left first:border-t-0 hover:bg-brand-50"
                    key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                    onClick={() => selectWorkerLocation(suggestion)}
                    type="button"
                  >
                    <span className="text-sm font-bold leading-5 text-slate-800">{suggestion.label}</span>
                  </button>
                ))}
              </div>
            ) : city.trim().length >= 2 && latitude == null ? (
              <p className="mt-2 text-xs font-bold text-slate-500">Manual location ke liye list se area select karo.</p>
            ) : null}
          </label>
          <div className="rounded-xl border border-slate-200 p-4">
            <span className="mb-2 block text-sm font-bold">Professional location</span>
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
          <FilePreviewInput label="Profile photo (Optional)" onPreview={(preview) => setProfilePhoto(preview)} />
          <FilePreviewInput label="ID verification placeholder" onPreview={(_, fileName) => setIdFile(fileName)} />
        </div>
      ) : null}

      {message ? <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600">{message}</p> : null}
      <button className="btn-primary relative z-10 mt-5 w-full" disabled={submitting} onClick={submit} type="button">
        {submitting ? "Saving..." : role === "worker" ? "Create Professional Profile" : "Create Account"}
      </button>
      <p className="mt-3 text-xs leading-5 text-slate-500">Authentication is temporarily disabled. User profile saves locally; professional registration saves to service partner records.</p>
    </div>
  );
}
