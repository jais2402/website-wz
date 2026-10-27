import type { ReactNode } from 'react'

/**
 * A small code-drawn scene for each system card on the home page (Areas.tsx), in `areas` order.
 * The same thread language as the rest of the site: shapes joined by threads, with a flow running along them.
 */
const SCENES: Record<string, ReactNode> = {
  // People & workforce: a small org chart, one manager threaded to three teams.
  people: (
    <>
      <path className="sa-thread" d="M160 46 C160 72 70 64 70 86" />
      <path className="sa-thread" d="M160 46 L160 86" />
      <path className="sa-thread" d="M160 46 C160 72 250 64 250 86" />
      <Person x={160} y={30} r={16} lead />
      <Person x={70} y={100} r={14} />
      <Person x={160} y={100} r={14} />
      <Person x={250} y={100} r={14} />
      <circle className="sa-dot sa-blink" cx="262" cy="88" r="4" />
    </>
  ),
  // Revenue & customers: a pipeline, lead → quote → invoice → paid.
  revenue: (
    <>
      <path className="sa-thread" d="M18 124 H302" />
      {['Lead', 'Quote', 'Invoice', 'Paid'].map((label, i) => {
        const x = 14 + i * 76
        const rows = 4 - i
        return (
          <g key={label}>
            <rect className={i === 3 ? 'sa-card is-on' : 'sa-card'} x={x} y={14} width={64} height={92} rx={9} />
            <text className="sa-label" x={x + 10} y={30}>
              {label}
            </text>
            {Array.from({ length: rows }, (_, r) => (
              <rect key={r} className="sa-row" x={x + 10} y={40 + r * 14} width={44 - r * 4} height={7} rx={3.5} />
            ))}
            {i === 3 && (
              <>
                <circle className="sa-coin" cx={x + 32} cy={66} r={15} />
                <text className="sa-coin-mark" x={x + 32} y={71} textAnchor="middle">
                  ₹
                </text>
              </>
            )}
            <circle className={i === 3 ? 'sa-dot' : 'sa-node'} cx={x + 32} cy={124} r={4} />
          </g>
        )
      })}
    </>
  ),
  // Operations & supply chain: stocked shelves, one low bin, and a route out to a truck.
  operations: (
    <>
      {[44, 80, 116].map((y) => (
        <path key={y} className="sa-line" d={`M16 ${y} H178`} />
      ))}
      {/* [x, top, width, height]: every box stands on a shelf (bottom at 44, 80 or 116). */}
      {[
        [22, 22, 26, 22],
        [52, 26, 34, 18],
        [90, 30, 20, 14],
        [124, 20, 40, 24],
        [22, 58, 40, 22],
        [66, 62, 22, 18],
        [134, 56, 38, 24],
        [22, 98, 30, 18],
        [58, 94, 44, 22],
        [108, 100, 24, 16],
        [138, 96, 32, 20],
      ].map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} className="sa-box" x={x} y={y} width={w} height={h} rx={4} />
      ))}
      <rect className="sa-box is-low" x="96" y="66" width="30" height="14" rx={4} />
      <path className="sa-thread" d="M178 80 C206 80 206 104 236 104" />
      <g className="sa-truck">
        <rect className="sa-card is-on" x="236" y="86" width="44" height="28" rx={5} />
        <path className="sa-card" d="M280 94 H294 L304 104 V114 H280 Z" />
        <circle className="sa-wheel" cx="250" cy="118" r="6" />
        <circle className="sa-wheel" cx="292" cy="118" r="6" />
      </g>
      <circle className="sa-dot sa-blink" cx="111" cy="73" r="3" />
    </>
  ),
  // Ecommerce: a storefront with products, the cart, and an order shipping out.
  ecommerce: (
    <>
      <rect className="sa-card" x="14" y="12" width="182" height="116" rx={10} />
      <path className="sa-line" d="M14 30 H196" />
      {[24, 33, 42].map((x) => (
        <circle key={x} className="sa-pip" cx={x} cy={21} r={2.5} />
      ))}
      {[
        [26, 40],
        [110, 40],
        [26, 84],
        [110, 84],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect className={i === 1 ? 'sa-tile is-on' : 'sa-tile'} x={x} y={y} width={74} height={36} rx={6} />
          <circle className="sa-pic" cx={x + 16} cy={y + 18} r={9} />
          <rect className="sa-row" x={x + 32} y={y + 11} width={32} height={5} rx={2.5} />
          <rect className="sa-row" x={x + 32} y={y + 21} width={20} height={5} rx={2.5} />
        </g>
      ))}
      <path className="sa-thread" d="M184 58 C214 58 220 40 238 40" />
      <path className="sa-cart" d="M232 30 H240 L248 58 H280 L288 38 H244" />
      <circle className="sa-wheel" cx="254" cy="66" r="4" />
      <circle className="sa-wheel" cx="276" cy="66" r="4" />
      <circle className="sa-badge" cx="290" cy="26" r="9" />
      <text className="sa-badge-mark" x="290" y="29.5" textAnchor="middle">
        1
      </text>
      <path className="sa-thread" d="M265 74 C265 92 265 92 265 96" />
      <rect className="sa-box is-on" x="244" y="96" width="42" height="30" rx={4} />
      <path className="sa-line" d="M244 106 H286 M265 96 V106" />
    </>
  ),
  // Finance & governance: a ledger, the budget split, and an approval stamp.
  finance: (
    <>
      <rect className="sa-card" x="14" y="12" width="136" height="116" rx={10} />
      <rect className="sa-row is-strong" x="26" y="24" width="56" height="7" rx={3.5} />
      {[0, 1, 2, 3, 4].map((r) => (
        <g key={r}>
          <rect className={r === 2 ? 'sa-band' : 'sa-hidden'} x="20" y={40 + r * 16} width="124" height="14" rx={4} />
          <rect className="sa-row" x="26" y={44 + r * 16} width={44 - (r % 3) * 8} height={6} rx={3} />
          <rect className={r === 2 ? 'sa-row is-on' : 'sa-row'} x={112 - (r % 2) * 8} y={44 + r * 16} width={26 + (r % 2) * 8} height={6} rx={3} />
        </g>
      ))}
      <path className="sa-thread" d="M150 70 C170 70 168 62 186 62" />
      <circle className="sa-ring" cx="220" cy="62" r="30" />
      <circle className="sa-ring is-on" cx="220" cy="62" r="30" pathLength={100} strokeDasharray="64 100" transform="rotate(-90 220 62)" />
      <circle className="sa-ring is-alt" cx="220" cy="62" r="30" pathLength={100} strokeDasharray="20 100" strokeDashoffset={-66} transform="rotate(-90 220 62)" />
      <circle className="sa-stamp" cx="286" cy="108" r="17" />
      <path className="sa-check" d="M278 108 L284 114 L295 101" />
    </>
  ),
  // Industry systems: one core threaded out to the sectors it is shaped for.
  industry: (
    <>
      {[
        'M160 70 C120 70 112 40 82 40',
        'M160 70 C200 70 208 40 238 40',
        'M160 70 C120 70 112 104 82 104',
        'M160 70 C200 70 208 104 238 104',
      ].map((d) => (
        <path key={d} className="sa-thread" d={d} />
      ))}
      <circle className="sa-halo" cx="160" cy="70" r="24" />
      <circle className="sa-coin" cx="160" cy="70" r="13" />
      <circle className="sa-dot" cx="160" cy="70" r="5" />
      {/* Healthcare */}
      <rect className="sa-tile" x="36" y="22" width="46" height="36" rx={8} />
      <path className="sa-icon" d="M59 32 V48 M51 40 H67" />
      {/* Education */}
      <rect className="sa-tile" x="238" y="22" width="46" height="36" rx={8} />
      <path className="sa-icon" d="M249 37 L261 31 L273 37 L261 43 Z M254 40 V46 C258 49 264 49 268 46 V40" />
      {/* Property & hotels */}
      <rect className="sa-tile is-on" x="36" y="86" width="46" height="36" rx={8} />
      <path className="sa-icon" d="M50 114 V96 H68 V114 M46 114 H72 M55 101 H57 M61 101 H63 M55 107 H57 M61 107 H63" />
      {/* Logistics */}
      <rect className="sa-tile" x="238" y="86" width="46" height="36" rx={8} />
      <path className="sa-icon" d="M248 98 H264 V110 H248 Z M264 102 H270 L274 106 V110 H264" />
    </>
  ),
}

function Person({ x, y, r, lead }: { x: number; y: number; r: number; lead?: boolean }) {
  return (
    <g>
      <circle className={lead ? 'sa-coin' : 'sa-tile'} cx={x} cy={y} r={r} />
      <circle className="sa-head" cx={x} cy={y - r * 0.22} r={r * 0.3} />
      <path className="sa-head" d={`M${x - r * 0.55} ${y + r * 0.62} a${r * 0.55} ${r * 0.5} 0 0 1 ${r * 1.1} 0`} />
    </g>
  )
}

export function SysArt({ system }: { system: string }) {
  return (
    <svg className={`sys-art sys-art-${system}`} viewBox="0 0 320 140" aria-hidden="true" focusable="false">
      {SCENES[system]}
    </svg>
  )
}
