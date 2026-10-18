import { useId } from 'react'
import type { Chart, Kpi, Module } from '@/content/site'
import { areaPath, formatNumber, heatCells, linePath } from '@/lib/charts'
import { useCountUp } from '@/hooks/useCountUp'

// Mini dashboard charts for the systems explorer. Every chart animates in with CSS on mount, so remounting a
// screen (keyed by the active system) replays the whole build-up. Purely decorative: aria-hidden.

const W = 200
const H = 64

function LineChart({ series, fill }: { series: number[]; fill: boolean }) {
  const id = useId()
  const last = series[series.length - 1]
  const min = Math.min(...series)
  const max = Math.max(...series)
  const lastY = (4 + (1 - (last - min) / (max - min || 1)) * (H - 8)) / H
  return (
    // The reveal is a clip-path wipe on the wrapper: dash tricks break with non-scaling strokes in Chrome.
    <div className="ch-line-wrap">
      <svg className="ch-line" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} className="ch-grid" />
        ))}
        {fill && <path d={areaPath(series, W, H)} fill={`url(#${id})`} className="ch-area" />}
        <path d={linePath(series, W, H)} className="ch-stroke" />
      </svg>
      <i className="ch-dot" style={{ top: `${lastY * 100}%` }} />
    </div>
  )
}

function Bars({ series }: { series: number[] }) {
  const max = Math.max(...series)
  return (
    <div className="ch-bars">
      {series.map((v, i) => (
        <i
          key={i}
          className={i === series.length - 1 ? 'is-now' : undefined}
          style={{ height: `${(v / max) * 100}%`, animationDelay: `${0.15 + i * 0.06}s` }}
        />
      ))}
    </div>
  )
}

function Ring({ percent }: { percent: number }) {
  return (
    <div className="ch-ring" style={{ ['--p' as string]: percent }}>
      <span className="mono">{percent}%</span>
    </div>
  )
}

function Gauge({ percent }: { percent: number }) {
  // Half-circle arc; pathLength=1 lets the dash animate from 0 to `percent` regardless of size.
  const arc = 'M10 60 A50 50 0 0 1 110 60'
  return (
    <svg className="ch-gauge" viewBox="0 0 120 66">
      <path d={arc} pathLength={1} className="ch-gauge-track" />
      <path d={arc} pathLength={1} className="ch-gauge-fill" style={{ ['--p' as string]: percent / 100 }} />
      {Array.from({ length: 11 }, (_, i) => {
        const a = Math.PI - (i / 10) * Math.PI
        return (
          <line
            key={i}
            x1={60 + Math.cos(a) * 40}
            y1={60 - Math.sin(a) * 40}
            x2={60 + Math.cos(a) * 44}
            y2={60 - Math.sin(a) * 44}
            className="ch-tick"
          />
        )
      })}
    </svg>
  )
}

function Heatmap({ cells, seed }: { cells: number; seed: number }) {
  return (
    <div className="ch-heat">
      {heatCells(cells, seed).map((v, i) => (
        <i key={i} style={{ opacity: v, animationDelay: `${0.1 + i * 0.018}s` }} />
      ))}
    </div>
  )
}

function Funnel({ items }: { items: [string, number][] }) {
  const max = items[0][1]
  return (
    <div className="ch-funnel">
      {items.map(([label, v], i) => (
        <div key={label} className="ch-funnel-row">
          <span className="mono">{label}</span>
          <span className="ch-funnel-track">
            <i style={{ width: `${Math.max(6, (v / max) * 100)}%`, animationDelay: `${0.15 + i * 0.1}s` }} />
          </span>
          <b>{formatNumber(v)}</b>
        </div>
      ))}
    </div>
  )
}

function Stack({ items }: { items: [string, number][] }) {
  return (
    <div className="ch-stack">
      {items.map(([label, v], i) => (
        <div key={label} className="ch-stack-row">
          <span>{label}</span>
          <span className="ch-stack-track">
            <i style={{ width: `${v}%`, animationDelay: `${0.15 + i * 0.12}s` }} />
          </span>
          <b className="mono">{v}%</b>
        </div>
      ))}
    </div>
  )
}

function List({ rows }: { rows: [string, string][] }) {
  return (
    <ul className="ch-list">
      {rows.map(([text, tag], i) => (
        <li key={text} style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
          <span>{text}</span>
          <em className={`tag-${tag.toLowerCase()}`}>{tag}</em>
        </li>
      ))}
    </ul>
  )
}

function Dots({ total, on }: { total: number; on: number }) {
  return (
    <div className="ch-dots">
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < on ? 'is-on' : undefined} style={{ animationDelay: `${0.1 + i * 0.015}s` }} />
      ))}
    </div>
  )
}

export function ChartView({ chart }: { chart: Chart }) {
  switch (chart.kind) {
    case 'line':
    case 'area':
      return <LineChart series={chart.series} fill={chart.kind === 'area'} />
    case 'bars':
      return <Bars series={chart.series} />
    case 'ring':
      return <Ring percent={chart.percent} />
    case 'gauge':
      return <Gauge percent={chart.percent} />
    case 'heatmap':
      return <Heatmap cells={chart.cells} seed={chart.seed} />
    case 'funnel':
      return <Funnel items={chart.items} />
    case 'stack':
      return <Stack items={chart.items} />
    case 'list':
      return <List rows={chart.rows} />
    case 'dots':
      return <Dots total={chart.total} on={chart.on} />
  }
}

/** A number that counts up from zero, formatted with prefix/suffix and Indian grouping. */
export function CountUp({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  delay = 0,
  group = true,
}: Omit<Kpi, 'label'> & { delay?: number; group?: boolean }) {
  const v = useCountUp(value, 1400, delay)
  // Years and IDs must not get digit grouping ("2012", not "2,012").
  const fmt = (n: number) => (group ? formatNumber(n, decimals) : n.toFixed(decimals))
  return (
    <span className="count" aria-label={`${prefix}${fmt(value)}${suffix}`}>
      {prefix}
      {fmt(v)}
      {suffix}
    </span>
  )
}

export function ModuleCard({ m, wide, index }: { m: Module; wide: boolean; index: number }) {
  return (
    <div className={`mod mod-${m.chart.kind}${wide ? ' is-wide' : ''}`}>
      <div className="mod-head">
        <span className="mod-name">{m.name}</span>
        {m.delta && <span className={`mod-delta${m.down ? ' is-down' : ''}`}>{m.delta}</span>}
      </div>
      <div className="mod-value">
        <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} delay={120 + index * 70} />
      </div>
      <span className="mod-caption">{m.caption}</span>
      <div className="mod-viz" aria-hidden="true">
        <ChartView chart={m.chart} />
      </div>
    </div>
  )
}
