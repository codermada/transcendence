/**
 * Builds a deterministic, order-independent key for a pair of user IDs.
 * Guarantees a single Friendship row can exist per unordered pair.
 */
export function buildPairKey(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}