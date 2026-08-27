export function insertRowKey(
  keys: string[],
  atIndex: number,
  newKey: string,
): string[] {
  const next = [...keys];
  next.splice(atIndex, 0, newKey);
  return next;
}

export function moveRowKey(keys: string[], from: number, to: number): string[] {
  const next = [...keys];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function removeRowKey(keys: string[], atIndex: number): string[] {
  return keys.filter((_, idx) => idx !== atIndex);
}
