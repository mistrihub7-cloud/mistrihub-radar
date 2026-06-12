"use client";

import { useEffect, useMemo, useState } from "react";
import { type Worker } from "@/lib/data";
import { LOCATION_KEY, LOCATION_LAT_KEY, LOCATION_LNG_KEY } from "./location-label";
import { WorkerCard } from "./worker-card";

type NearbyWorkerListProps = {
  workers: Worker[];
  compact?: boolean;
  emptyMessage?: string;
  layout?: "grid" | "stack";
  limit?: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(from: Coordinates, to: Coordinates) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isValidCoordinate(latitude: number, longitude: number) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function parseSavedCoordinates() {
  const rawLatitude = localStorage.getItem(LOCATION_LAT_KEY);
  const rawLongitude = localStorage.getItem(LOCATION_LNG_KEY);
  if (rawLatitude && rawLongitude) {
    const savedLatitude = Number(rawLatitude);
    const savedLongitude = Number(rawLongitude);
    if (!isValidCoordinate(savedLatitude, savedLongitude)) return null;
    return { latitude: savedLatitude, longitude: savedLongitude };
  }

  const label = localStorage.getItem(LOCATION_KEY) || "";
  const match = label.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  return isValidCoordinate(latitude, longitude) ? { latitude, longitude } : null;
}

function statusRank(worker: Worker) {
  if (worker.status === "Available Today") return 0;
  if (worker.status === "Busy") return 1;
  return 2;
}

function workerDistance(worker: Worker, userCoordinates: Coordinates | null) {
  if (!userCoordinates || worker.latitude == null || worker.longitude == null) return Number.POSITIVE_INFINITY;
  return distanceKm(userCoordinates, { latitude: worker.latitude, longitude: worker.longitude });
}

export function NearbyWorkerList({ workers, compact = false, emptyMessage, layout = "stack", limit }: NearbyWorkerListProps) {
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);

  useEffect(() => {
    const refreshCoordinates = () => setUserCoordinates(parseSavedCoordinates());
    refreshCoordinates();

    window.addEventListener("storage", refreshCoordinates);
    window.addEventListener("mistrihub-location-change", refreshCoordinates);
    return () => {
      window.removeEventListener("storage", refreshCoordinates);
      window.removeEventListener("mistrihub-location-change", refreshCoordinates);
    };
  }, []);

  const sortedWorkers = useMemo(() => {
    return [...workers]
      .sort((a, b) => {
        const statusDifference = statusRank(a) - statusRank(b);
        if (statusDifference) return statusDifference;

        const distanceDifference = workerDistance(a, userCoordinates) - workerDistance(b, userCoordinates);
        if (Number.isFinite(distanceDifference) && distanceDifference !== 0) return distanceDifference;

        return b.trust - a.trust || Number(b.rating) - Number(a.rating);
      })
      .slice(0, limit || workers.length);
  }, [limit, userCoordinates, workers]);

  if (!workers.length) {
    return (
      <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
        {emptyMessage || "No professionals registered yet. New Supabase service partners will appear here."}
      </div>
    );
  }

  return (
    <div className={layout === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-4" : "space-y-4"}>
      {sortedWorkers.map((worker) => (
        <WorkerCard compact={compact} key={worker.id} worker={worker} />
      ))}
    </div>
  );
}
