// Synthetic user study: 200 simulated Wezigns prospects each experience Concept A (particle system) and
// Concept B (time loom). Deterministic (seeded). This is a structured *estimate* built from measured page
// performance plus explicit, reviewable assumptions — it is not a substitute for testing with real prospects.
//
//   node scripts/concept-sim.mjs            → prints the report as JSON
//   node scripts/concept-sim.mjs --md       → prints a markdown summary

const N_USERS = 200
const SEED = 2026
const ROBUSTNESS_RUNS = 500

// ---------------------------------------------------------------------------------------------------------
// 1. Concept attributes (0..1). Timings are MEASURED on the production build (Playwright, cache disabled):
//    desktop = 1440×900 no throttling; mobile = 375×812, 4× CPU slowdown, 6 Mbps / 100 ms 4G.
//    The rest are heuristic-review scores — each has a one-line justification. Edit and re-run to test them.
// ---------------------------------------------------------------------------------------------------------
const CONCEPTS = {
  A: {
    name: 'A · Particle system',
    readableMs: { desktop: 3713, mobile: 4039 }, // measured: 2.1 s branded preloader, then the headline settles
    clarity: 0.8, //         literal headline "Systems that grow with you" + labelled chaos chips; offer is explicit
    wow: 0.72, //            morphing particle story is impressive but a familiar genre for agency sites
    memorability: 0.66, //   abstract shapes; strong but less ownable image
    credibility: 0.86, //    systems explorer (5 live dashboards), AI approval demo, case studies, integrations
    brandFit: 0.82, //       "systems" metaphor maps 1:1 to a custom-software studio
    mobile: 0.74, //         pinned story + glass card work well at 375 px; explorer degrades to tabs
    gpuCost: 0.35, //        13.6k points, no post-processing; ~60 fps at 1440 px @2x
    derivativeRisk: 0, //    no recognisable external reference
  },
  B: {
    name: 'B · Time loom',
    readableMs: { desktop: 3716, mobile: 4035 }, // measured: same branded preloader added to B
    clarity: 0.63, //        "Every loose thread, woven into one system" is clear, but the visual is a metaphor to decode
    wow: 0.9, //             cinematic bloom, fly-through camera, 1000 live threads — highest visual impact
    memorability: 0.86, //   one ownable image: tangle → loom → timeline
    credibility: 0.78, //    before/after slider and timelines persuade; no live product screens or AI demo
    brandFit: 0.8, //        "untangle your spreadsheets" fits the target pain well
    mobile: 0.64, //         threads thin out on small screens; the loom reads smaller
    gpuCost: 0.7, //         bloom + 150k line vertices + 7.5k particles; ~51 fps at 1440 px @2x
    derivativeRisk: 1, //    look resembles a well-known TV-series "time loom" visual
  },
}

// ---------------------------------------------------------------------------------------------------------
// 2. Audience: Wezigns' likely buyers (from the current site: SMEs that outgrew spreadsheets, 11 countries).
//    w = how much each segment weights each attribute (sums to 1). mobile = share on phones.
//    patienceS = median seconds before abandoning a hero that has not shown its message yet.
//    spotRef = chance of recognising the TV-series reference in Concept B.
// ---------------------------------------------------------------------------------------------------------
const SEGMENTS = [
  { key: 'sme-owner', label: 'SME owner / founder', share: 0.3, mobile: 0.55, patienceS: 4.5, spotRef: 0.15, design: 0.4,
    w: { clarity: 0.3, credibility: 0.2, wow: 0.15, memorability: 0.1, speed: 0.15, device: 0.1 } },
  { key: 'ops', label: 'Operations manager', share: 0.2, mobile: 0.45, patienceS: 5, spotRef: 0.12, design: 0.35,
    w: { clarity: 0.3, credibility: 0.25, wow: 0.1, memorability: 0.1, speed: 0.15, device: 0.1 } },
  { key: 'cto', label: 'CTO / IT head', share: 0.15, mobile: 0.25, patienceS: 6, spotRef: 0.2, design: 0.45,
    w: { clarity: 0.2, credibility: 0.3, wow: 0.1, memorability: 0.05, speed: 0.2, device: 0.15 } },
  { key: 'finance', label: 'Finance / procurement', share: 0.1, mobile: 0.35, patienceS: 4, spotRef: 0.08, design: 0.25,
    w: { clarity: 0.35, credibility: 0.3, wow: 0.05, memorability: 0.05, speed: 0.2, device: 0.05 } },
  { key: 'gcc-sg', label: 'GCC / Singapore enterprise buyer', share: 0.15, mobile: 0.4, patienceS: 5.5, spotRef: 0.15, design: 0.55,
    w: { clarity: 0.2, credibility: 0.25, wow: 0.2, memorability: 0.15, speed: 0.1, device: 0.1 } },
  { key: 'design', label: 'Design-savvy partner / agency', share: 0.1, mobile: 0.3, patienceS: 7, spotRef: 0.5, design: 0.9,
    w: { clarity: 0.1, credibility: 0.1, wow: 0.3, memorability: 0.25, speed: 0.1, device: 0.15 } },
]

const NETWORK = {
  desktop: [ { p: 0.8, f: 1 }, { p: 0.18, f: 1.25 }, { p: 0.02, f: 1.9 } ],
  mobile: [ { p: 0.5, f: 1 }, { p: 0.35, f: 1.3 }, { p: 0.15, f: 1.9 } ],
}
const LOW_END_MOBILE = 0.3 // share of phones that stutter on heavy WebGL

// ---------------------------------------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const gauss = (rng) => Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng())
const pick = (rng, items, key = 'p') => {
  let r = rng()
  for (const it of items) if ((r -= it[key]) <= 0) return it
  return items[items.length - 1]
}
const mean = (a) => a.reduce((s, v) => s + v, 0) / (a.length || 1)
const pct = (a) => Math.round(mean(a.map(Number)) * 1000) / 10
const ci95 = (p, n) => 1.96 * Math.sqrt((p * (1 - p)) / n)

// ---------------------------------------------------------------------------------------------------------
// 3. One simulated person experiencing one concept
// ---------------------------------------------------------------------------------------------------------
function experience(rng, user, c) {
  const noise = () => gauss(rng) * 0.07 // perception noise per attribute
  const readable = (c.readableMs[user.device] / 1000) * user.netFactor * (user.lowEnd ? 1.25 : 1)
  const speed = clamp(1 - (readable - 1) / 5)

  // Device experience: mobile users judge the phone layout; heavy WebGL stutters on low-end phones.
  let device = user.device === 'mobile' ? c.mobile : 0.85
  if (user.lowEnd) device -= c.gpuCost * 0.35
  if (user.device === 'desktop' && user.oldLaptop) device -= c.gpuCost * 0.15

  const spotted = c.derivativeRisk > 0 && rng() < user.spotRef
  // Design-savvy viewers read a recognisable reference as derivative; casual viewers mostly enjoy it.
  const refEffect = spotted ? (user.design > 0.7 ? -0.14 : user.design > 0.5 ? -0.05 : 0.02) : 0

  const perceived = {
    clarity: clamp(c.clarity + noise()),
    credibility: clamp(c.credibility + noise() + refEffect * 0.6),
    wow: clamp(c.wow + noise() + (user.lowEnd ? -c.gpuCost * 0.2 : 0) + refEffect * 0.4),
    memorability: clamp(c.memorability + noise()),
    speed: clamp(speed + noise() * 0.5),
    device: clamp(device + noise()),
  }
  // Brand fit nudges credibility (a studio that "gets" its own story is more believable).
  perceived.credibility = clamp(perceived.credibility * 0.85 + c.brandFit * 0.15)

  let score = 0
  for (const [k, w] of Object.entries(user.w)) score += w * perceived[k]

  // Abandonment: if the message is not readable before patience runs out, some people leave.
  const bounceP = clamp(1 / (1 + Math.exp(-(readable - user.patience) * 1.6)) * 0.6)
  const bounced = rng() < bounceP

  // Understood the offer within ~5 s of landing.
  const understood = !bounced && rng() < perceived.clarity * (readable <= 5 ? 1 : 0.6)

  // Intent to get in touch (would click "Tell us what is not working").
  const contactP = bounced ? 0 : clamp(1 / (1 + Math.exp(-(score - 0.72) * 12)) * 0.55)
  const contact = rng() < contactP

  return { score, rating: Math.round(clamp(1 + 9 * score + gauss(rng) * 0.4, 1, 10)), bounced, understood, contact, spotted, perceived }
}

function makeUser(rng, id) {
  const seg = pick(rng, SEGMENTS, 'share')
  const device = rng() < seg.mobile ? 'mobile' : 'desktop'
  // Individual taste: jitter the segment weights, renormalise.
  const raw = Object.fromEntries(Object.entries(seg.w).map(([k, v]) => [k, v * Math.exp(gauss(rng) * 0.25)]))
  const tot = Object.values(raw).reduce((s, v) => s + v, 0)
  return {
    id,
    segment: seg.key,
    segmentLabel: seg.label,
    device,
    netFactor: pick(rng, NETWORK[device]).f,
    lowEnd: device === 'mobile' && rng() < LOW_END_MOBILE,
    oldLaptop: device === 'desktop' && rng() < 0.15,
    patience: seg.patienceS * Math.exp(gauss(rng) * 0.3),
    spotRef: seg.spotRef,
    design: clamp(seg.design + gauss(rng) * 0.1),
    w: Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v / tot])),
    firstSeen: rng() < 0.5 ? 'A' : 'B', // counterbalanced order
  }
}

function simulate(seed, n = N_USERS, concepts = CONCEPTS) {
  // Separate streams per person: the same seed yields the same 200 people in every scenario (paired comparison),
  // and each concept's draws cannot shift the other's.
  const people = mulberry32(seed)
  const users = []
  for (let i = 0; i < n; i++) {
    const u = makeUser(people, i + 1)
    const a = experience(mulberry32(seed * 31 + i * 2 + 1), u, concepts.A)
    const b = experience(mulberry32(seed * 31 + i * 2 + 2), u, concepts.B)
    // Small recency bias toward whichever was seen second.
    const bias = u.firstSeen === 'A' ? 0.008 : -0.008
    const prefers = a.score - b.score + (u.firstSeen === 'A' ? -bias : bias) >= 0 ? 'A' : 'B'
    users.push({ ...u, A: a, B: b, prefers })
  }
  return users
}

function summarise(users) {
  const by = (fn) => {
    const out = {}
    for (const u of users) (out[fn(u)] ??= []).push(u)
    return out
  }
  const block = (list) => {
    const n = list.length
    const prefA = list.filter((u) => u.prefers === 'A').length / n
    const stat = (k) => ({
      meanRating: Math.round(mean(list.map((u) => u[k].rating)) * 10) / 10,
      understoodPct: pct(list.map((u) => u[k].understood)),
      bouncePct: pct(list.map((u) => u[k].bounced)),
      contactPct: pct(list.map((u) => u[k].contact)),
    })
    return { n, preferA: Math.round(prefA * 1000) / 10, preferB: Math.round((1 - prefA) * 1000) / 10, ci95: Math.round(ci95(prefA, n) * 1000) / 10, A: stat('A'), B: stat('B') }
  }
  const segs = by((u) => u.segmentLabel)
  const devs = by((u) => u.device)
  return {
    overall: block(users),
    bySegment: Object.fromEntries(Object.entries(segs).map(([k, v]) => [k, block(v)])),
    byDevice: Object.fromEntries(Object.entries(devs).map(([k, v]) => [k, block(v)])),
    spottedReferencePctOfB: pct(users.map((u) => u.B.spotted)),
  }
}

// 4. Robustness: re-run the whole 200-person study with 500 different seeds, and stress the key assumptions.
function robustness() {
  const wins = (concepts) => {
    let aWins = 0
    let contactDiff = 0
    for (let s = 1; s <= ROBUSTNESS_RUNS; s++) {
      const sum = summarise(simulate(SEED + s * 7919, N_USERS, concepts)).overall
      if (sum.preferA > 50) aWins++
      contactDiff += sum.A.contactPct - sum.B.contactPct
    }
    return { aWinsPctOfRuns: Math.round((aWins / ROBUSTNESS_RUNS) * 1000) / 10, meanContactDiffPts: Math.round((contactDiff / ROBUSTNESS_RUNS) * 10) / 10 }
  }
  const tweak = (patch) => ({ A: { ...CONCEPTS.A, ...(patch.A || {}) }, B: { ...CONCEPTS.B, ...(patch.B || {}) } })
  return {
    baseline: wins(CONCEPTS),
    'B clarity +0.10 (headline tested clearer)': wins(tweak({ B: { clarity: 0.73 } })),
    'Both preloaders removed': wins(tweak({ A: { readableMs: { desktop: 1500, mobile: 1700 } }, B: { readableMs: { desktop: 1370, mobile: 1682 } } })),
    'Only A preloader removed (B keeps it)': wins(tweak({ A: { readableMs: { desktop: 1500, mobile: 1700 } } })),
    'B reference not recognisable (derivativeRisk 0)': wins(tweak({ B: { derivativeRisk: 0 } })),
    'A wow +0.10 / B wow −0.05 (taste swing)': wins(tweak({ A: { wow: 0.82 }, B: { wow: 0.85 } })),
    'Both preloaders removed AND B clarity +0.10': wins(tweak({ A: { readableMs: { desktop: 1500, mobile: 1700 } }, B: { clarity: 0.73, readableMs: { desktop: 1370, mobile: 1682 } } })),
  }
}

// --no-preloader: both concepts without the intro (A ≈ 1.5/1.7 s estimated, B 1.37/1.68 s measured earlier).
const concepts = process.argv.includes('--no-preloader')
  ? {
      A: { ...CONCEPTS.A, name: 'A · Particle system (no preloader)', readableMs: { desktop: 1500, mobile: 1700 } },
      B: { ...CONCEPTS.B, name: 'B · Time loom (no preloader)', readableMs: { desktop: 1370, mobile: 1682 } },
    }
  : CONCEPTS
const users = simulate(SEED, N_USERS, concepts)
const report = { method: { users: N_USERS, seed: SEED, design: 'within-subjects, counterbalanced order', robustnessRuns: ROBUSTNESS_RUNS }, summary: summarise(users), robustness: robustness() }

if (process.argv.includes('--md')) {
  const s = report.summary
  const row = (label, b) => `| ${label} | ${b.n} | **${b.preferA}%** | **${b.preferB}%** | ${b.A.meanRating} / ${b.B.meanRating} | ${b.A.understoodPct}% / ${b.B.understoodPct}% | ${b.A.contactPct}% / ${b.B.contactPct}% | ${b.A.bouncePct}% / ${b.B.bouncePct}% |`
  const lines = [
    '| Group | n | Prefer A | Prefer B | Rating A / B | Understood offer A / B | Would contact A / B | Bounced A / B |',
    '|---|---|---|---|---|---|---|---|',
    row('**All users**', s.overall),
    ...Object.entries(s.bySegment).map(([k, b]) => row(k, b)),
    ...Object.entries(s.byDevice).map(([k, b]) => row(k, b)),
    '',
    `Preference margin of error (95%): ±${s.overall.ci95} pts. Users recognising the TV-series reference in B: ${s.spottedReferencePctOfB}%.`,
    '',
    '| Robustness scenario (500 × 200-user studies) | A wins | Contact intent A − B |',
    '|---|---|---|',
    ...Object.entries(report.robustness).map(([k, r]) => `| ${k} | ${r.aWinsPctOfRuns}% of runs | ${r.meanContactDiffPts > 0 ? '+' : ''}${r.meanContactDiffPts} pts |`),
  ]
  console.log(lines.join('\n'))
} else {
  console.log(JSON.stringify(report, null, 2))
}
