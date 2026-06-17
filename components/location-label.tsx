"use client";

import { useEffect, useState } from "react";

export const LOCATION_KEY = "mistrihub.locationLabel";
export const LOCATION_LAT_KEY = "mistrihub.locationLatitude";
export const LOCATION_LNG_KEY = "mistrihub.locationLongitude";
export const LOCATION_ACCURACY_KEY = "mistrihub.locationAccuracy";
export const LOCATION_UPDATED_AT_KEY = "mistrihub.locationUpdatedAt";
export const LOCATION_LOCK_KEY = "mistrihub.locationLocked";
export const LOCATION_SKIP_KEY = "mistrihub.locationSkipped";
export const OPEN_LOCATION_EVENT = "mistrihub-open-location-popup";
export const DEFAULT_LOCATION = "Set your location";

export function openLocationPopup() {
  window.dispatchEvent(new Event(OPEN_LOCATION_EVENT));
}

function readStoredAccount() {
  try {
    return JSON.parse(localStorage.getItem("mistrihub.mock.account") || "null") as { id?: string; role?: string; phone?: string } | null;
  } catch {
    return null;
  }
}

export function saveLocationLabel(value: string, lockLocation = true, coordinates?: { latitude: number; longitude: number; accuracy?: number }) {
  const cleanValue = value.trim() || DEFAULT_LOCATION;
  localStorage.setItem(LOCATION_KEY, cleanValue);
  if (coordinates) {
    localStorage.setItem(LOCATION_LAT_KEY, String(coordinates.latitude));
    localStorage.setItem(LOCATION_LNG_KEY, String(coordinates.longitude));
    if (coordinates.accuracy != null) localStorage.setItem(LOCATION_ACCURACY_KEY, String(Math.round(coordinates.accuracy)));
    localStorage.setItem(LOCATION_UPDATED_AT_KEY, new Date().toISOString());
    const account = readStoredAccount();
    fetch("/api/location/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: account?.id || null,
        role: account?.role || "user",
        phone: account?.phone || null,
        label: cleanValue,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        accuracy: coordinates.accuracy ?? null
      })
    }).catch(() => undefined);
  } else {
    localStorage.removeItem(LOCATION_LAT_KEY);
    localStorage.removeItem(LOCATION_LNG_KEY);
    localStorage.removeItem(LOCATION_ACCURACY_KEY);
  }
  if (lockLocation) {
    localStorage.setItem(LOCATION_LOCK_KEY, "true");
    localStorage.removeItem(LOCATION_SKIP_KEY);
  }
  window.dispatchEvent(new CustomEvent("mistrihub-location-change", { detail: cleanValue }));
}

function getPosition(options: PositionOptions) {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export async function getCurrentPositionWithFallback() {
  try {
    return await getPosition({ enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 });
  } catch {
    return getPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
  }
}

export function LocationLabel({ className, clickable = false }: { className?: string; clickable?: boolean }) {
  const [label, setLabel] = useState(DEFAULT_LOCATION);

  useEffect(() => {
    setLabel(localStorage.getItem(LOCATION_KEY) || DEFAULT_LOCATION);

    const onChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setLabel(customEvent.detail || localStorage.getItem(LOCATION_KEY) || DEFAULT_LOCATION);
    };

    window.addEventListener("mistrihub-location-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("mistrihub-location-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  if (clickable) {
    return (
      <button className={className} onClick={openLocationPopup} type="button">
        {label}
      </button>
    );
  }

  return <span className={className}>{label}</span>;
}
