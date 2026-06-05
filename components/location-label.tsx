"use client";

import { useEffect, useState } from "react";

export const LOCATION_KEY = "mistrihub.locationLabel";
export const LOCATION_LAT_KEY = "mistrihub.locationLatitude";
export const LOCATION_LNG_KEY = "mistrihub.locationLongitude";
export const LOCATION_LOCK_KEY = "mistrihub.locationLocked";
export const LOCATION_SKIP_KEY = "mistrihub.locationSkipped";
export const OPEN_LOCATION_EVENT = "mistrihub-open-location-popup";
export const DEFAULT_LOCATION = "Set your location";

export function openLocationPopup() {
  window.dispatchEvent(new Event(OPEN_LOCATION_EVENT));
}

export function saveLocationLabel(value: string, lockLocation = true, coordinates?: { latitude: number; longitude: number }) {
  const cleanValue = value.trim() || DEFAULT_LOCATION;
  localStorage.setItem(LOCATION_KEY, cleanValue);
  if (coordinates) {
    localStorage.setItem(LOCATION_LAT_KEY, String(coordinates.latitude));
    localStorage.setItem(LOCATION_LNG_KEY, String(coordinates.longitude));
  } else {
    localStorage.removeItem(LOCATION_LAT_KEY);
    localStorage.removeItem(LOCATION_LNG_KEY);
  }
  if (lockLocation) {
    localStorage.setItem(LOCATION_LOCK_KEY, "true");
    localStorage.removeItem(LOCATION_SKIP_KEY);
  }
  window.dispatchEvent(new CustomEvent("mistrihub-location-change", { detail: cleanValue }));
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
