const scoopableStarClasses = new Set(["K", "G", "B", "F", "O", "A", "M"]);

export type Scoopability = "scoopable" | "notScoopable" | "unknown";

export function classifyScoopability(starClass: string | null): Scoopability {
  const normalized = starClass?.trim().toUpperCase();
  if (!normalized) return "unknown";
  return scoopableStarClasses.has(normalized) ? "scoopable" : "notScoopable";
}
