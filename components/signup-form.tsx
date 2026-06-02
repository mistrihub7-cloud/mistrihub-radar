"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/data";
import { saveMockAccount, saveWorkerRegistration, type MockRole } from "@/lib/mock-store";
import { FilePreviewInput } from "./file-preview-input";

export function SignupForm({ defaultRole = "user" }: { defaultRole?: MockRole }) {
  const router = useRouter();
  const [role, setRole] = useState<MockRole>(defaultRole);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [skill, setSkill] = useState(categories[0].name);
  const [experience, setExperience] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [serviceRadius, setServiceRadius] = useState("10 km");
  const [availability, setAvailability] = useState<"Available Today" | "Busy" | "Not Available">("Available Today");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [idFile, setIdFile] = useState("");
  const [message, setMessage] = useState("");

  function submit() {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      setMessage("Name, phone number aur password zaroori hai.");
      return;
    }
    if (role === "worker" && (!experience.trim() || !city.trim() || !area.trim())) {
      setMessage("Worker ke liye experience, city aur area zaroori hai.");
      return;
    }

    const id = `mock-${Date.now()}`;
    if (role === "worker") {
      saveWorkerRegistration({
        id,
        role: "worker",
        name,
        phone,
        email,
        skill,
        experience,
        city,
        area,
        serviceRadius,
        availability,
        profilePhoto,
        idVerificationFile: idFile
      });
      router.push("/dashboard/worker?created=1");
      return;
    }

    saveMockAccount({ id, role, name, phone, email });
    router.push(role === "admin" ? "/admin" : "/dashboard/user?created=1");
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
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Password</span>
          <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
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
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Area</span>
            <input className="h-12 w-full rounded-xl border border-slate-200 px-4" onChange={(event) => setArea(event.target.value)} value={area} />
          </label>
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
      <button className="btn-primary mt-5 w-full" onClick={submit} type="button">
        {role === "worker" ? "Create Worker Profile" : "Create Account"}
      </button>
      <p className="mt-3 text-xs leading-5 text-slate-500">TODO: replace mock signup with Supabase Auth and workers table insert.</p>
    </div>
  );
}
