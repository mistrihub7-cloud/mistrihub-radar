"use client";

import { useState } from "react";
import { DEFAULT_LOCATION, getCurrentPositionWithFallback, saveLocationLabel } from "./location-label";
import { resolveAreaName } from "./location-geocode";
import { Icon } from "./simple-icons";

type LocationState = "idle" | "allowed" | "denied" | "unsupported" | "loading";

export function LocationPermission() {
  const [state, setState] = useState<LocationState>("idle");
  const [area, setArea] = useState(DEFAULT_LOCATION);

  const saveManualArea = (value: string) => {
    setArea(value);
    saveLocationLabel(value);
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setState("unsupported");
      return;
    }

    setState("loading");
    getCurrentPositionWithFallback()
      .then(async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const detectedArea = await resolveAreaName(latitude, longitude);
        setState("allowed");
        setArea(detectedArea);
        saveLocationLabel(detectedArea, true, { latitude, longitude, accuracy });
      })
      .catch(() => setState("denied"));
  };

  const helperText =
    state === "allowed"
      ? "Location allowed. Nearby professionals can be sorted by distance."
      : state === "denied"
        ? "Location बंद है। Nearby experts देखने के लिए location ON करें. Chrome > Site Settings > Location > Allow."
        : state === "unsupported"
          ? "Location is not supported here. Type your area manually."
          : "We use your location to show nearest available professionals.";

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon name="location" />
        </span>
        <div>
          <p className="font-black">
            {state === "allowed" ? "Location ready" : "Allow location to see nearby professionals"}
          </p>
          <p className="text-sm text-slate-500">{helperText}</p>
          <input
            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-brand-500"
            onChange={(event) => saveManualArea(event.target.value)}
            placeholder="Type area, city"
            value={area}
          />
        </div>
      </div>
      <button className="btn-outline h-10 shrink-0 text-sm" onClick={requestLocation} type="button">
        {state === "loading" ? "Checking..." : state === "allowed" ? "Allowed" : state === "denied" ? "Location On / Try Again" : "Allow Location"}
      </button>
    </div>
  );
}
