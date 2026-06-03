"use client";

import { useEffect, useState } from "react";
import { type Worker } from "@/lib/data";
import { getWorkerRegistration, type WorkerRegistration } from "@/lib/mock-store";

function mapLocalWorker(profile: WorkerRegistration): Worker {
  return {
    id: profile.id,
    name: profile.name,
    skill: profile.skill,
    location: profile.location || `Location pending, ${profile.city}`,
    city: profile.city,
    distance: "Saved on this device",
    rating: "0.0",
    reviews: 0,
    trust: 70,
    jobs: 0,
    response: "After request",
    status: profile.availability,
    serviceRadius: Number.parseInt(profile.serviceRadius, 10) as 5 | 10 | 15 | 20,
    distanceKm: 0,
    latitude: profile.latitude,
    longitude: profile.longitude,
    phone: profile.phone,
    whatsapp: profile.phone
  };
}

export function LocalWorkerList() {
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const profile = getWorkerRegistration();
    setWorker(profile ? mapLocalWorker(profile) : null);
  }, []);

  if (!worker) return null;

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-black text-brand-600">Recently added on this device</p>
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div className="worker-avatar" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="truncate font-black text-slate-950">{worker.name}</h3>
                <p className="text-sm font-semibold text-slate-600">{worker.skill}</p>
                <p className="text-sm text-slate-600">{worker.location}, {worker.city}</p>
              </div>
              <span className="status-pill status-available">{worker.status}</span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">Newly added worker profile.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
