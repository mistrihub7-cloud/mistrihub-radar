"use client";

import { useEffect, useState } from "react";
import { resolveAreaName, searchAreaSuggestions, type LocationSuggestion } from "./location-geocode";
import { DEFAULT_LOCATION, LOCATION_KEY, LOCATION_LOCK_KEY, LOCATION_SKIP_KEY, OPEN_LOCATION_EVENT, saveLocationLabel } from "./location-label";
import { Icon } from "./simple-icons";

type LocationState = "idle" | "loading" | "saved" | "denied" | "unsupported";

export function LocationPopup() {
  const [area, setArea] = useState("");
  const [state, setState] = useState<LocationState>("idle");
  const [visible, setVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<LocationSuggestion | null>(null);

  function closeAndReload() {
    setVisible(false);
    window.setTimeout(() => window.location.reload(), 120);
  }

  useEffect(() => {
    const openPopup = () => {
      setArea(localStorage.getItem(LOCATION_KEY) || "");
      setState("idle");
      setVisible(true);
    };
    window.addEventListener(OPEN_LOCATION_EVENT, openPopup);

    const alreadyLocked = localStorage.getItem(LOCATION_LOCK_KEY) === "true";
    const alreadySkipped = localStorage.getItem(LOCATION_SKIP_KEY) === "true";
    const savedLocation = localStorage.getItem(LOCATION_KEY);
    const hasSavedLocation = Boolean(savedLocation && savedLocation !== DEFAULT_LOCATION);

    if (hasSavedLocation) {
      localStorage.setItem(LOCATION_LOCK_KEY, "true");
      localStorage.removeItem(LOCATION_SKIP_KEY);
      return () => window.removeEventListener(OPEN_LOCATION_EVENT, openPopup);
    }

    if (!alreadyLocked && !alreadySkipped) {
      const timer = window.setTimeout(() => setVisible(true), 700);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener(OPEN_LOCATION_EVENT, openPopup);
      };
    }

    return () => window.removeEventListener(OPEN_LOCATION_EVENT, openPopup);
  }, []);

  useEffect(() => {
    if (!visible || area.trim().length < 2 || selectedSuggestion?.label === area.trim()) {
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }

    let cancelled = false;
    setSuggestionLoading(true);
    const timer = window.setTimeout(async () => {
      const nextSuggestions = await searchAreaSuggestions(area);
      if (cancelled) return;
      setSuggestions(nextSuggestions);
      setSuggestionLoading(false);
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [area, selectedSuggestion?.label, visible]);

  const closeForLater = () => {
    localStorage.setItem(LOCATION_SKIP_KEY, "true");
    setVisible(false);
  };

  const saveManualArea = () => {
    if (!area.trim()) {
      setState("denied");
      return;
    }
    if (selectedSuggestion && selectedSuggestion.label === area.trim()) {
      saveLocationLabel(selectedSuggestion.label, true, {
        latitude: selectedSuggestion.latitude,
        longitude: selectedSuggestion.longitude
      });
    } else {
      saveLocationLabel(area);
    }
    setState("saved");
    closeAndReload();
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    setArea(suggestion.label);
    setSelectedSuggestion(suggestion);
    setSuggestions([]);
    saveLocationLabel(suggestion.label, true, {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
    setState("saved");
    closeAndReload();
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
        closeAndReload();
      },
      () => setState("denied"),
      { enableHighAccuracy: true, maximumAge: 300000, timeout: 12000 }
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
          onChange={(event) => {
            setArea(event.target.value);
            setSelectedSuggestion(null);
          }}
          placeholder="Area, city"
          value={area}
        />
        {suggestionLoading || suggestions.length ? (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            {suggestionLoading ? <p className="px-4 py-3 text-sm font-bold text-slate-500">Searching area...</p> : null}
            {suggestions.map((suggestion) => (
              <button
                className="flex w-full items-start gap-3 border-t border-slate-100 px-4 py-3 text-left first:border-t-0 hover:bg-brand-50"
                key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                onClick={() => selectSuggestion(suggestion)}
                type="button"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" name="location" />
                <span className="text-sm font-bold leading-5 text-slate-800">{suggestion.label}</span>
              </button>
            ))}
          </div>
        ) : area.trim().length >= 2 && !selectedSuggestion ? (
          <p className="mt-2 text-xs font-bold text-slate-500">Related area list type karte hi yahan aayegi.</p>
        ) : null}

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
