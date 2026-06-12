"use client";

import { useEffect } from "react";

export function HashScroll() {
  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
