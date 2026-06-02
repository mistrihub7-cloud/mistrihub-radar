"use client";

import { useState } from "react";
import { Icon } from "./simple-icons";

type LocationState = "idle" | "allowed" | "denied" | "unsupported" | "loading";

export function LocationPermission() {
  const [state, setState] = useState<LocationState>("idle");
  const [area, setArea] = useState("Ranchi, Jharkhand");

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setState("unsupported");
      return;
    }

    setState("loading");
    navigator.geolocation.getCurrentPosition(
      () => {
        setState("allowed");
        setArea("Current location detected");
      },
      () => setState("denied"),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 }
    );
  };

  const helperText =
    state === "allowed"
      ? "Location allowed. Nearby workers can be sorted by distance."
      : state === "denied"
        ? "Location denied. Type your area manually to continue."
        : state === "unsupported"
          ? "Location is not supported here. Type your area manually."
          : "We use your location to show nearest available workers.";

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon name="location" />
        </span>
        <div>
          <p className="font-black">
            {state === "allowed" ? "Location ready" : "Allow location to see nearby workers"}
          </p>
          <p className="text-sm text-slate-500">{helperText}</p>
          {state === "denied" || state === "unsupported" ? (
            <input
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-brand-500"
              onChange={(event) => setArea(event.target.value)}
              value={area}
            />
          ) : null}
        </div>
      </div>
      <button className="btn-outline h-10 shrink-0 text-sm" onClick={requestLocation} type="button">
        {state === "loading" ? "Checking..." : state === "allowed" ? "Allowed" : "Allow Location"}
      </button>
    </div>
  );
}
