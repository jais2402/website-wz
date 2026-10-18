import { mulberry32 } from './shapes'

/** SVG path for a series scaled into a w×h box (y grows downward), with `pad` px of headroom top and bottom. */
export function linePath(series: number[], w: number, h: number, pad = 4): string {
  if (series.length === 0) return ''
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const step = series.length > 1 ? w / (series.length - 1) : 0
  return series
    .map((v, i) => {
      const x = i * step
      const y = pad + (1 - (v - min) / span) * (h - pad * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

/** Same line, closed down to the baseline so it can be filled as an area. */
export function areaPath(series: number[], w: number, h: number, pad = 4): string {
  const line = linePath(series, w, h, pad)
  return line ? `${line} L${w} ${h} L0 ${h} Z` : ''
}

/** Indian-style digit grouping (1,284 · 3,200 · 1,00,000) with fixed decimals. */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

/** Deterministic 0..1 intensities for heatmap cells, so the mock never flickers between renders. */
export function heatCells(count: number, seed: number): number[] {
  const rng = mulberry32(seed)
  return Array.from({ length: count }, () => 0.25 + rng() * 0.75)
}

/** Which system (0..count-1) a pinned scroll progress shows; each system gets an equal slice. */
export function activeIndex(progress: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)))
}

/** How full the progress bar of tab `i` is (0..1) at a given scroll progress. */
export function tabFill(progress: number, count: number, i: number): number {
  return Math.min(1, Math.max(0, progress * count - i))
}
