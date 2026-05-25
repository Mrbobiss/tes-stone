export function slugify(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "volume";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function naturalCompare(a: string, b: string): number {
  return new Intl.Collator("fr", {
    numeric: true,
    sensitivity: "base",
  }).compare(a, b);
}

export function truncateMiddle(value: string, size = 22): string {
  if (value.length <= size) {
    return value;
  }

  const slice = Math.max(4, Math.floor((size - 3) / 2));
  return `${value.slice(0, slice)}...${value.slice(-slice)}`;
}
