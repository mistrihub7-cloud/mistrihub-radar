import { type HTMLAttributes } from "react";

function initialsFromName(name?: string | null) {
  const parts = (name || "Professional")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "P";
}

export function ProfessionalAvatar({
  name,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  name?: string | null;
}) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-blue-100 text-lg font-black text-brand-700 shadow-sm ring-4 ring-blue-50 ${className}`}
      {...props}
    >
      <span>{initialsFromName(name)}</span>
      <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
    </div>
  );
}
