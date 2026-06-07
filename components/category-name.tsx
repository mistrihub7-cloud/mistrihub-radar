import { categoryNameParts } from "@/lib/category-display";

export function CategoryName({ name, className = "" }: { name: string; className?: string }) {
  const parts = categoryNameParts(name);

  return (
    <span className={className}>
      {parts.map((part) => (
        <span className="block" key={part}>
          {part}
        </span>
      ))}
    </span>
  );
}
