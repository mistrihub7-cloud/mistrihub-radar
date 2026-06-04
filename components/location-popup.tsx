"use client";

import { useEffect, useState } from "react";
import { resolveAreaName } from "./location-geocode";
import { DEFAULT_LOCATION, LOCATION_KEY, LOCATION_LOCK_KEY, LOCATION_SKIP_KEY, saveLocationLabel } from "./location-label";
import { Icon } from "./simple-icons";

type LocationState = "idle" | "loading" | "saved" | "denied" | "unsupported";

export function LocationPopup() {
  const [area, setArea] = useState("");
  const [state, setState] = useState<LocationState>("idle");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyLocked = localStorage.getItem(LOCATION_LOCK_KEY) === "true";
    const alreadySkipped = localStorage.getItem(LOCATION_SKIP_KEY) === "true";
    const savedLocation = localStorage.getItem(LOCATION_KEY);
    const hasSavedLocation = Boolean(savedLocation && savedLocation !== DEFAULT_LOCATION);

    if (hasSavedLocation) {
      localStorage.setItem(LOCATION_LOCK_KEY, "true");
      localStorage.removeItem(LOCATION_SKIP_KEY);
      return;
    }

    if (!alreadyLocked && !alreadySkipped) {
      const timer = window.setTimeout(() => setVisible(true), 700);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const closeForLater = () => {
    localStorage.setItem(LOCATION_SKIP_KEY, "true");
    setVisible(false);
  };

  const saveManualArea = () => {
    if (!area.trim()) {
      setState("denied");
      return;
    }
    saveLocationLabel(area);
    setState("saved");
    setVisible(false);
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setState("unsupported");
      return;
    }

    setState("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const areaName = await resolveAreaName(latitude, longitude);
        saveLocationLabel(areaName, true, { latitude, longitude });
        setState("saved");
        setVisible(false);
      },
      () => setState("denied"),
      { enableHighAccuracy: false, maximumAge: 86400000, timeout: 10000 }
    );
  };

  if (!visible) {
    return null;
  }

  const helperText =
    state === "denied"
      ? "Location permission blocked. Area manually save kar sakte ho."
      : state === "unsupported"
        ? "Is browser mein auto location support nahi hai. Area manually save karo."
        : "Ek baar save hone ke baad location is device par lock rahegi.";

  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-slate-950/35 px-4 pb-5 backdrop-blur-sm sm:place-items-center sm:pb-0">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <Icon name="location" />
          </span>
          <div>
            <p className="text-lg font-black text-slate-950">Allow location</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{helperText}</p>
          </div>
        </div>

        <label className="mt-4 block text-sm font-black text-slate-900" htmlFor="saved-area">
          Area / City
        </label>
        <input
          className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-brand-500"
          id="saved-area"
          onChange={(event) => setArea(event.target.value)}
          placeholder="Area, city"
          value={area}
        />

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button className="btn-primary h-11 text-sm" disabled={state === "loading"} onClick={requestLocation} type="button">
            {state === "loading" ? "Checking..." : "Use Current Location"}
          </button>
          <button className="btn-outline h-11 text-sm" onClick={saveManualArea} type="button">
            Save Area
          </button>
        </div>

        <button className="mt-3 w-full text-sm font-black text-slate-500" onClick={closeForLater} type="button">
          Later
        </button>
      </div>
    </div>
  );
}
