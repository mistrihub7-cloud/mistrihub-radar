"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories, workers, type Worker } from "@/lib/data";
import { createMockJob, getMockAccount, saveMockAccount } from "@/lib/mock-store";
import { hasSupabaseConfig } from "@/lib/supabase-client";
import { createJobInSupabase, saveProfileToSupabase } from "@/lib/supabase-flow";
import { DEFAULT_LOCATION, LOCATION_KEY, LOCATION_LAT_KEY, LOCATION_LNG_KEY } from "./location-label";
import { FilePreviewInput } from "./file-preview-input";
import { Icon } from "./simple-icons";

type BookingFormProps = {
  worker?: Worker;
  initialService?: string;
};

export function BookingForm({ worker, initialService }: BookingFormProps) {
  const router = useRouter();
  const matchedWorker = worker || workers.find((item) => item.skill === initialService);
  const loggedInAccount = typeof window !== "undefined" ? getMockAccount() : null;
  const savedContact =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("mistrihub.bookingContact") || "{}") as { name?: string; phone?: string }
      : {};
  const [customerName, setCustomerName] = useState(loggedInAccount?.name || savedContact.name || "");
  const [customerPhone, setCustomerPhone] = useState(loggedInAccount?.phone || savedContact.phone || "");
  const [service, setService] = useState(initialService || matchedWorker?.skill || categories[0].name);
  const [problem, setProblem] = useState("");
  const [urgency, setUrgency] = useState<"Normal" | "Urgent" | "Emergency">("Normal");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [area, setArea] = useState(() => (typeof window !== "undefined" ? localStorage.getItem(LOCATION_KEY) || "" : ""));
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoPreview2, setPhotoPreview2] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const noticeName = loggedInAccount?.name || customerName.trim() || "User";

  function switchToUserMode() {
    if (!loggedInAccount) return;
    saveMockAccount({ ...loggedInAccount, role: "user" });
    window.location.reload();
  }

  async function submitRequest() {
    const currentAccount = getMockAccount();
    const bookingName = currentAccount?.name || customerName.trim();
    const bookingPhone = currentAccount?.phone || customerPhone.trim();

    if (!bookingName || !bookingPhone) {
      setError("Booking ke liye naam aur phone/WhatsApp number zaroori hai.");
      return;
    }
    if (!problem.trim()) {
      setError("Problem description zaroori hai.");
      return;
    }
    if (!area.trim() || area === DEFAULT_LOCATION) {
      setError("Location / area bharna zaroori hai.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const rawLatitude = localStorage.getItem(LOCATION_LAT_KEY);
      const rawLongitude = localStorage.getItem(LOCATION_LNG_KEY);
      const userLatitude = rawLatitude ? Number(rawLatitude) : undefined;
      const userLongitude = rawLongitude ? Number(rawLongitude) : undefined;
      localStorage.setItem("mistrihub.bookingContact", JSON.stringify({ name: bookingName, phone: bookingPhone }));
      if (!currentAccount || currentAccount.role === "user") {
        const account = {
          id: currentAccount?.id || globalThis.crypto?.randomUUID?.() || `local-${Date.now()}`,
          role: "user" as const,
          name: bookingName,
          phone: bookingPhone,
          email: currentAccount?.email
        };
        saveMockAccount(account);
        await saveProfileToSupabase(account);
      }
      const input = {
        workerId: matchedWorker?.id || "",
        service,
        problem,
        urgency,
        preferredDate,
        preferredTime,
        area,
        customerName: bookingName,
        customerPhone: bookingPhone,
        userLatitude: Number.isFinite(userLatitude) ? userLatitude : undefined,
        userLongitude: Number.isFinite(userLongitude) ? userLongitude : undefined,
        photoPreview,
        photoPreview2
      };
      const supabaseJob = await createJobInSupabase(input);
      if (!supabaseJob && hasSupabaseConfig) {
        setError("Request server par save nahi hua. job_requests table policy/columns check karo, phir dobara try karo.");
        return;
      }
      const job = supabaseJob || createMockJob(input);
      router.push(`/jobs/${job.id}`);
    } catch {
      setError("Request create nahi hua. Please dobara try karo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {loggedInAccount?.role === "worker" ? (
        <div className="card p-5 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <Icon name="user" />
          </span>
          <h1 className="mt-4 text-2xl font-black">Switch to User Mode</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Aap abhi worker mode mein ho. Service book karne ke liye pehle user mode par switch karo.
          </p>
          <button className="btn-primary mx-auto mt-5 max-w-xs" onClick={switchToUserMode} type="button">
            Switch and Continue Booking
          </button>
        </div>
      ) : null}

      {loggedInAccount?.role === "worker" ? null : (
        <>
      {matchedWorker ? (
        <div className="card p-4">
          <p className="text-sm font-black text-brand-600">Selected worker</p>
          <div className="mt-3 flex items-center gap-3">
            {matchedWorker.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={matchedWorker.name} className="h-14 w-14 rounded-2xl object-cover" src={matchedWorker.profilePhoto} />
            ) : (
              <div className="worker-avatar" />
            )}
            <div>
              <h2 className="font-black">{matchedWorker.name}</h2>
              <p className="text-sm text-slate-500">{matchedWorker.skill} - {matchedWorker.city || "City not saved"}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-4">
          <p className="text-sm font-black text-brand-600">Open job request</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Fast Nearby Dispatch: matching nearby workers will review the job. First worker who accepts gets the booking.
          </p>
        </div>
      )}

      {loggedInAccount ? (
        <div className="card p-4">
          <p className="text-sm font-black text-brand-600">Booking as</p>
          <p className="mt-1 font-black text-slate-950">{loggedInAccount.name || "Logged in user"}</p>
          <p className="text-sm font-bold text-slate-500">{loggedInAccount.phone || loggedInAccount.email}</p>
        </div>
      ) : (
        <div className="card p-4">
          <p className="text-sm font-black text-brand-600">Your booking details</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-black">Your name</span>
              <input className="h-13 w-full rounded-2xl border border-slate-200 px-4 font-bold" onChange={(event) => setCustomerName(event.target.value)} placeholder="Full name" value={customerName} />
            </label>
            <label className="block">
              <span className="mb-2 block font-black">Phone / WhatsApp</span>
              <input className="h-13 w-full rounded-2xl border border-slate-200 px-4 font-bold" inputMode="tel" onChange={(event) => setCustomerPhone(event.target.value)} placeholder="+91 mobile number" value={customerPhone} />
            </label>
          </div>
        </div>
      )}

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
          <span className="mb-2 block font-black">Preferred time (optional)</span>
          <input className="h-13 w-full rounded-2xl border border-slate-200 px-4 font-bold" onChange={(event) => setPreferredTime(event.target.value)} type="time" value={preferredTime} />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block font-black">Location / area</span>
        <input className="h-13 w-full rounded-2xl border border-slate-200 px-4 font-bold" onChange={(event) => setArea(event.target.value)} placeholder="Area, city" value={area} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <FilePreviewInput label="Problem photo 1 (optional)" onPreview={(preview) => setPhotoPreview(preview)} />
        <FilePreviewInput label="Problem photo 2 (optional)" onPreview={(preview) => setPhotoPreview2(preview)} />
      </div>

      <div className="rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
        <p className="font-black">⚠ Important Notice</p>
        <p className="mt-1">
          Dear {noticeName}, worker ko hire karne se pehle price, work details aur timing achhe se discuss kar lein. Multiple workers aapse contact kar sakte hain. Aapko jo trusted aur sahi lage, usi worker ko hire karein.
        </p>
        <p className="mt-2">
          MistriHub sirf nearby workers se connect karwata hai. Final deal, price aur payment user aur worker ke beech hoga.
        </p>
      </div>

      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p> : null}
      <button className="btn-primary w-full" disabled={submitting} onClick={submitRequest} type="button">
        <Icon name="jobs" />
        {submitting ? "Creating request..." : "Submit Request"}
      </button>
      <p className="text-xs leading-5 text-slate-500">
        Contact stays locked until a worker accepts. Alerts use website and WhatsApp notification flow.
      </p>
        </>
      )}
    </div>
  );
}
