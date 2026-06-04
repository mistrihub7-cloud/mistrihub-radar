"use client";

import { useEffect, useState } from "react";
import { LOCATION_KEY, LOCATION_LAT_KEY, LOCATION_LNG_KEY } from "./location-label";

type WorkerDistanceProps = {
  workerLatitude?: number;
  workerLongitude?: number;
  missingWorkerText?: string;
  missingUserText?: string;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) {
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

function parseSavedCoordinates() {
  const savedLatitude = Number(localStorage.getItem(LOCATION_LAT_KEY));
  const savedLongitude = Number(localStorage.getItem(LOCATION_LNG_KEY));
  if (Number.isFinite(savedLatitude) && Number.isFinite(savedLongitude)) {
    return { latitude: savedLatitude, longitude: savedLongitude };
  }

  const label = localStorage.getItem(LOCATION_KEY) || "";
  const match = label.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}

export function WorkerDistance({ workerLatitude, workerLongitude, missingWorkerText = "Unavailable", missingUserText = "Set location" }: WorkerDistanceProps) {
  const [label, setLabel] = useState(missingUserText);

  useEffect(() => {
    if (workerLatitude == null || workerLongitude == null) {
      setLabel(missingWorkerText);
      return;
    }

    const userCoordinates = parseSavedCoordinates();
    if (!userCoordinates) {
      setLabel(missingUserText);
      return;
    }

    const kilometers = distanceKm(userCoordinates, { latitude: workerLatitude, longitude: workerLongitude });
    setLabel(kilometers < 1 ? `${Math.max(0.1, kilometers).toFixed(1)} km` : `${kilometers.toFixed(1)} km`);
  }, [missingUserText, missingWorkerText, workerLatitude, workerLongitude]);

  return <>{label}</>;
}
