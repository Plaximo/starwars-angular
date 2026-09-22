export type SortDirection = 'asc' | 'desc';

/**
 * Compares two strings alphabetically with ascending/descending order.
 */
export function compareStrings(
  a: string | null | undefined,
  b: string | null | undefined,
  dir: SortDirection = 'asc'
): number {
  const multiplier = dir === 'asc' ? 1 : -1;
  const strA = a ?? '';
  const strB = b ?? '';
  return multiplier * strA.localeCompare(strB);
}

/**
 * Compares numbers placing null/undefined/NaN at the bottom regardless of direction.
 */
export function compareNullableNumbers(
  a: number | null | undefined,
  b: number | null | undefined,
  dir: SortDirection = 'asc'
): number {
  const isANull = a === null || a === undefined || !Number.isFinite(a);
  const isBNull = b === null || b === undefined || !Number.isFinite(b);

  if (isANull && isBNull) return 0;
  if (isANull) return 1; // Always send nulls to the bottom
  if (isBNull) return -1;

  const multiplier = dir === 'asc' ? 1 : -1;
  return multiplier * ((a as number) - (b as number));
}

/**
 * Compares alphanumeric strings like birth years (e.g. "19BBY", "unknown").
 * Unknowns are always sent to the bottom.
 */
export function compareAlphanumeric(
  a: string | null | undefined,
  b: string | null | undefined,
  dir: SortDirection = 'asc'
): number {
  const isAUnknown = !a || a === 'unknown';
  const isBUnknown = !b || b === 'unknown';

  if (isAUnknown && isBUnknown) return 0;
  if (isAUnknown) return 1;
  if (isBUnknown) return -1;

  const multiplier = dir === 'asc' ? 1 : -1;
  return multiplier * (a as string).localeCompare(b as string, undefined, { numeric: true });
}
