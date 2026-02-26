export function isMultipleOf(value: number, target: number): boolean {
  if (target === 0) return false;
  return value % target === 0;
}

export function getMultiplesInRange(target: number, min: number, max: number): number[] {
  const multiples: number[] = [];
  const start = Math.ceil(min / target) * target;
  for (let i = start; i <= max; i += target) {
    multiples.push(i);
  }
  return multiples;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
