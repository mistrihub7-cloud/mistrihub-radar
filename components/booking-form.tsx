"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories, workers, type Worker } from "@/lib/data";
import { createMockJob } from "@/lib/mock-store";
import { DEFAULT_LOCATION, LOCATION_KEY } from "./location-label";
import { FilePreviewInput } from "./file-preview-input";
import { Icon } from "./simple-icons";

type BookingFormProps = {
  worker?: Worker;
  initialService?: string;
};

export function BookingForm({ worker, initialService }: BookingFormProps) {
  const router = useRouter();
  const matchedWorker = worker || workers.find((item) => item.skill === initialService) || workers[0];
  const [service, setService] = useState(initialService || matchedWorker.skill || categories[0].name);
  const [problem, setProblem] = useState("");
  const [urgency, setUrgency] = useState<"Normal" | "Urgent" | "Emergency">("Normal");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [area, setArea] = useState(() => (typeof window !== "undefined" ? localStorage.getItem(LOCATION_KEY) || "" : ""));
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function submitRequest() {
    if (!problem.trim()) {
      setError("Problem description zaroori hai.");
      return;
    }
    if (!preferredDate || !preferredTime) {
      setError("Preferred date aur time select karo.");
      return;
    }
    if (!area.trim() || area === DEFAULT_LOCATION) {
      setError("Location / area bharna zaroori hai.");
      return;
    }

    setError("");
    setSubmitting(true);
    const job = createMockJob({
      workerId: matchedWorker.id,
      service,
      problem,
      urgency,
      preferredDate,
      preferredTime,
      area,
      photoPreview
    });
    router.push(`/jobs/${job.id}`);
  }

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <p className="text-sm font-black text-brand-600">Selected worker</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="worker-avatar" />
          <div>
            <h2 className="font-black">{matchedWorker.name}</h2>
            <p className="text-sm text-slate-500">{matchedWorker.skill} - {matchedWorker.location}, {matchedWorker.city}</p>
          </div>
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block font-black">Service category</span>
        <select className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold" onChange={(event) => setService(event.target.value)} value={service}>
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block font-black">Describe your problem</span>
        <textarea
          className="h-32 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm outline-none focus:border-brand-500"
          onChange={(event) => setProblem(event.target.value)}
          placeholder="Example: switch board repair, tap leakage, AC cooling issue"
          value={problem}
        />
      </label>

      <div>
        <span className="mb-2 block font-black">Urgency level</span>
        <div className="grid grid-cols-3 gap-2">
          {(["Normal", "Urgent", "Emergency"] as const).map((item) => (
            <button
              className={`h-12 rounded-2xl border text-sm font-black ${
                urgency === item ? "border-brand-600 bg-brand-50 text-brand-600" : "border-slate-200 bg-white text-slate-700"
              }`}
              key={item}
              onClick={() => setUrgency(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-black">Preferred date</span>
          <input className="h-13 w-full rounded-2xl border border-slate-200 px-4 font-bold" onChange={(event) => setPreferredDate(event.target.value)} type="date" value={preferredDate} />
        </label>
        <label className="block">
          <span className="mb-2 block font-black">Preferred time</span>
          <input className="h-13 w-full rounded-2xl border border-slate-200 px-4 font-bold" onChange={(event) => setPreferredTime(event.target.value)} type="time" value={preferredTime} />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block font-black">Location / area</span>
        <input className="h-13 w-full rounded-2xl border border-slate-200 px-4 font-bold" onChange={(event) => setArea(event.target.value)} placeholder="Area, city" value={area} />
      </label>

      <FilePreviewInput label="Problem photo (optional)" onPreview={(preview) => setPhotoPreview(preview)} />

      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p> : null}
      <button className="btn-primary w-full" disabled={submitting} onClick={submitRequest} type="button">
        <Icon name="jobs" />
        {submitting ? "Creating request..." : "Submit Request"}
      </button>
      <p className="text-xs leading-5 text-slate-500">TODO: save this request to Supabase Database and notify worker by website/WhatsApp.</p>
    </div>
  );
}
