// packages/core/src/utils/string-helpers.ts

export function stringToBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;

  const val = value.trim().toLowerCase();
  if (["true", "1", "yes"].includes(val)) return true;
  if (["false", "0", "no"].includes(val)) return false;

  return undefined;
}

export const stringToNumber = (val: unknown): number | undefined => {
  if (typeof val === "string") {
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }
  if (typeof val === "number") {
    return val;
  }
  return undefined;
};
