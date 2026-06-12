"use client";

import { useEffect, useState } from "react";
import { getMockAccount, type MockJobRequest } from "@/lib/mock-store";
import { loadReviewForJob, saveWorkerReview } from "@/lib/supabase-flow";
import { Icon } from "./simple-icons";

export function JobReviewForm({ job }: { job: MockJobRequest }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const account = typeof window !== "undefined" ? getMockAccount() : null;

  useEffect(() => {
    let cancelled = false;
    async function loadExistingReview() {
      const existing = await loadReviewForJob(job.id);
      if (!existing || cancelled) return;
      setRating(existing.rating);
      setComment(existing.comment || "");
      setSaved(true);
      setMessage("Review saved.");
    }

    loadExistingReview();
    return () => {
      cancelled = true;
    };
  }, [job.id]);

  if (job.status !== "Completed" || !job.workerId || account?.role === "worker") return null;

  async function submitReview() {
    if (saved) {
      setMessage("Is job ke liye review already submit ho chuka hai.");
      return;
    }
    if (!rating) {
      setMessage("Rating select karo.");
      return;
    }

    setSaving(true);
    setMessage("");
    const result = await saveWorkerReview({
      jobId: job.id,
      workerId: job.workerId,
      customerName: job.customerName || account?.name,
      rating,
      comment: comment.trim()
    });
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setMessage(result.fallback ? "Review saved on this device. Public sync ke liye latest SQL run karo." : "Review saved. Professional rating update ho jayegi.");
      return;
    }
    setMessage(`Review save nahi hua. ${result.error || "worker_reviews table/policy check karo."}`);
  }

  return (
    <div className="card p-5">
      <h2 className="text-xl font-black">Rate this professional</h2>
      <p className="mt-1 text-sm text-slate-500">Job complete hone ke baad rating se professional ka trust score improve hota hai.</p>
      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <button
            className={`grid h-11 w-11 place-items-center rounded-xl border ${rating >= item ? "border-amber-300 bg-amber-50 text-amber-500" : "border-slate-200 bg-white text-slate-300"}`}
            key={item}
            disabled={saved}
            onClick={() => setRating(item)}
            type="button"
          >
            <Icon className="h-5 w-5 fill-current" name="star" />
          </button>
        ))}
      </div>
      <textarea
        className="mt-4 h-24 w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold outline-none focus:border-brand-500"
        disabled={saved}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Short review (Optional)"
        value={comment}
      />
      {message ? <p className="mt-3 rounded-2xl bg-brand-50 p-3 text-xs font-black text-brand-700">{message}</p> : null}
      <button className="btn-primary mt-4 w-full" disabled={saving || saved} onClick={submitReview} type="button">
        {saved ? "Review Submitted" : saving ? "Saving..." : "Save Review"}
      </button>
    </div>
  );
}
