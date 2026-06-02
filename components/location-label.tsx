"use client";

import { useEffect, useState } from "react";

export const LOCATION_KEY = "mistrihub.locationLabel";
export const LOCATION_LOCK_KEY = "mistrihub.locationLocked";
export const LOCATION_SKIP_KEY = "mistrihub.locationSkipped";
export const DEFAULT_LOCATION = "Set your location";

export function saveLocationLabel(value: string, lockLocation = true) {
  const cleanValue = value.trim() || DEFAULT_LOCATION;
  localStorage.setItem(LOCATION_KEY, cleanValue);
  if (lockLocation) {
    localStorage.setItem(LOCATION_LOCK_KEY, "true");
    localStorage.removeItem(LOCATION_SKIP_KEY);
  }
  window.dispatchEvent(new CustomEvent("mistrihub-location-change", { detail: cleanValue }));
}

export function LocationLabel({ className }: { className?: string }) {
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

  return <span className={className}>{label}</span>;
}
