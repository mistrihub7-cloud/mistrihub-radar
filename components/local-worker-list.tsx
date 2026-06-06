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
    whatsapp: profile.phone,
    profilePhoto: profile.profilePhoto
  };
}

export function LocalWorkerList() {
  const [, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const profile = getWorkerRegistration();
    setWorker(profile ? mapLocalWorker(profile) : null);
  }, []);

  return null;
}
