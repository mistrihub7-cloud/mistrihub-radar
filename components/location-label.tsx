"use client";

import { useEffect, useState } from "react";

const LOCATION_KEY = "mistrihub.locationLabel";
const DEFAULT_LOCATION = "Ranchi, Jharkhand";

export function saveLocationLabel(value: string) {
  const cleanValue = value.trim() || DEFAULT_LOCATION;
  localStorage.setItem(LOCATION_KEY, cleanValue);
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
