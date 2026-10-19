// Sector filter for the project archive on /portfolio. Pure, so the page and the snapshot share it.

type Sectored<S extends string> = { sector: S }

/** One chip per sector that has at least one project, in the given order, with its count. */
export function sectorCounts<S extends string>(
  items: readonly Sectored<S>[],
  order: readonly S[],
): { sector: S; count: number }[] {
  return order
    .map((sector) => ({ sector, count: items.filter((i) => i.sector === sector).length }))
    .filter((c) => c.count > 0)
}

/** The projects in one sector, or all of them when `sector` is null. Keeps the original order. */
export function filterBySector<T extends { sector: string }>(items: readonly T[], sector: T['sector'] | null): T[] {
  return sector === null ? [...items] : items.filter((i) => i.sector === sector)
}

/** Fills `{n}` and `{total}` in a count label. */
export function countLabel(label: string, n: number, total: number): string {
  return label.replace('{n}', String(n)).replace('{total}', String(total))
}
