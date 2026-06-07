"use client";

import { useState } from "react";

export function ImportantNotice({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
      <p className="font-black">⚠ Important Notice</p>
      <p
        className={
          expanded
            ? "mt-1"
            : "mt-1 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] md:[-webkit-line-clamp:2]"
        }
      >
        {message}
      </p>
      <button
        className="mt-2 text-xs font-black text-amber-700 underline underline-offset-4"
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
