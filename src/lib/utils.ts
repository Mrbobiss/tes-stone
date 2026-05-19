export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function hashString(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickDeterministic<T>(items: T[], seed: string | number, offset = 0) {
  if (!items.length) {
    throw new Error("Cannot pick from an empty list.");
  }

  const value = typeof seed === "number" ? Math.abs(seed) : hashString(seed);
  return items[(value + offset) % items.length];
}

export function cleanJsonPayload(raw: string) {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}
