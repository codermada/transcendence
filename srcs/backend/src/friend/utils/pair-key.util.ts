// Builds a deterministic, order-independent key for a pair of user IDs
export function buildPairKey(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}