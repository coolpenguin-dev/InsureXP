/** Parse a non-negative decimal money string to a number (2 dp via cents). */
export function tryParseMoney(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return Math.round(n * 100) / 100;
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatMoney(n: number): string {
  return roundMoney(n).toFixed(2);
}

export function moneyEquals(a: string, b: string): boolean {
  return Math.round(parseFloat(a) * 100) === Math.round(parseFloat(b) * 100);
}
