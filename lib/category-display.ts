export function categoryNameParts(name?: string | null) {
  return (name || "Worker")
    .split(/\s*\/\s*/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function cleanCategoryName(name?: string | null) {
  return categoryNameParts(name).join(" ");
}
