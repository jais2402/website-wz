# Concept study: A (particle system) vs B (time loom)

> **What this is:** a *synthetic* study of 200 simulated Wezigns prospects, each shown both concepts in
> counterbalanced order (the same 200 people in every scenario). It combines **measured** performance of the
> production build with **explicit, editable assumptions** about how each buyer type weighs clarity,
> credibility, visual impact, speed and mobile experience. It is a structured estimate for making a decision,
> **not** a replacement for testing with 5–8 real prospects. Re-run with `node scripts/concept-sim.mjs --md`
> (add `--no-preloader` for scenario 2).

## Measured (production build, Playwright, cache disabled, median of 3 runs)

Both concepts now use the same branded preloader (counter 000 → 100, panel wipe).

| | A · Particle system | B · Time loom |
|---|---|---|
| Headline readable, desktop 1440×900 | 3.71 s | 3.72 s |
| Headline readable, mobile 375×812, 4× CPU, 4G | 4.04 s | 4.04 s |
| Without the preloader (earlier measurement / estimate) | ≈ 1.5 s / 1.7 s | 1.37 s / 1.68 s |
| 3D visible, desktop | 0.4 s | 0.5 s, then a 1.6 s fade |
| JavaScript (gzip) | 369 KB | 391 KB |
| Frame rate, 1440 px on a 2× display (real GPU) | ~60 fps | ~51 fps |

## Personas (200, seeded)

SME owner/founder 30% · Operations manager 20% · CTO/IT head 15% · GCC/Singapore enterprise buyer 15% ·
Finance/procurement 10% · Design-savvy partner/agency 10%. Each segment has a phone share (25–55%), a network
mix, a share of low-end phones (30%), patience before abandoning a slow hero, and attribute weights; every
individual's weights are jittered. All values live in `scripts/concept-sim.mjs`.

## Scenario 1: both concepts with the preloader (as built now)

| Group | n | Prefer A | Prefer B | Rating A / B | Understood offer A / B | Would contact A / B | Bounced A / B |
|---|---|---|---|---|---|---|---|
| **All users** | 200 | **62.5%** | **37.5%** | 7.4 / 7.2 | 58% / 48% | 20% / 19.5% | 23.5% / 18% |
| Operations manager | 44 | **68.2%** | **31.8%** | 7.4 / 7 | 56.8% / 54.5% | 18.2% / 25% | 22.7% / 18.2% |
| SME owner / founder | 52 | **73.1%** | **26.9%** | 7.4 / 7 | 53.8% / 42.3% | 26.9% / 17.3% | 28.8% / 26.9% |
| CTO / IT head | 40 | **67.5%** | **32.5%** | 7.3 / 7.1 | 72.5% / 52.5% | 20% / 17.5% | 10% / 7.5% |
| Design-savvy partner / agency | 21 | **14.3%** | **85.7%** | 7.4 / 7.9 | 71.4% / 47.6% | 28.6% / 19% | 14.3% / 4.8% |
| GCC / Singapore enterprise buyer | 24 | **37.5%** | **62.5%** | 7.7 / 7.7 | 54.2% / 41.7% | 4.2% / 25% | 20.8% / 20.8% |
| Finance / procurement | 19 | **94.7%** | **5.3%** | 7.4 / 6.8 | 31.6% / 47.4% | 15.8% / 10.5% | 52.6% / 26.3% |
| mobile | 81 | **72.8%** | **27.2%** | 7.2 / 6.7 | 34.6% / 35.8% | 14.8% / 13.6% | 35.8% / 25.9% |
| desktop | 119 | **55.5%** | **44.5%** | 7.6 / 7.5 | 73.9% / 56.3% | 23.5% / 23.5% | 15.1% / 12.6% |

Preference margin of error (95%): ±6.7 pts. Users recognising the TV-series reference in B: 16%.

| Robustness scenario (500 × 200-user studies) | A wins | Contact intent A − B |
|---|---|---|
| baseline | 100% of runs | +1.9 pts |
| B clarity +0.10 (headline tested clearer) | 0.4% of runs | -0.9 pts |
| Both preloaders removed | 99.8% of runs | +2.5 pts |
| Only A preloader removed (B keeps it) | 100% of runs | +17.6 pts |
| B reference not recognisable (derivativeRisk 0) | 99.8% of runs | +1.8 pts |
| A wow +0.10 / B wow −0.05 (taste swing) | 100% of runs | +4.6 pts |
| Both preloaders removed AND B clarity +0.10 | 0% of runs | -1 pts |

## Scenario 2: same 200 people, both concepts without the preloader

| Group | n | Prefer A | Prefer B | Rating A / B | Understood offer A / B | Would contact A / B | Bounced A / B |
|---|---|---|---|---|---|---|---|
| **All users** | 200 | **61.5%** | **38.5%** | 8 / 7.9 | 82.5% / 66% | 36.5% / 35.5% | 1% / 1% |
| Operations manager | 44 | **65.9%** | **34.1%** | 8 / 7.7 | 72.7% / 75% | 31.8% / 38.6% | 4.5% / 0% |
| SME owner / founder | 52 | **73.1%** | **26.9%** | 8 / 7.7 | 84.6% / 67.3% | 42.3% / 28.8% | 0% / 1.9% |
| CTO / IT head | 40 | **65%** | **35%** | 8.2 / 8.1 | 87.5% / 62.5% | 32.5% / 50% | 0% / 0% |
| Design-savvy partner / agency | 21 | **14.3%** | **85.7%** | 7.7 / 8.2 | 81% / 57.1% | 38.1% / 33.3% | 0% / 0% |
| GCC / Singapore enterprise buyer | 24 | **37.5%** | **62.5%** | 8.1 / 8.1 | 87.5% / 66.7% | 25% / 33.3% | 0% / 0% |
| Finance / procurement | 19 | **94.7%** | **5.3%** | 8.3 / 7.7 | 84.2% / 57.9% | 52.6% / 21.1% | 0% / 5.3% |
| mobile | 81 | **72.8%** | **27.2%** | 7.9 / 7.5 | 72.8% / 67.9% | 33.3% / 30.9% | 2.5% / 1.2% |
| desktop | 119 | **53.8%** | **46.2%** | 8.2 / 8.2 | 89.1% / 64.7% | 38.7% / 38.7% | 0% / 0.8% |

Preference margin of error (95%): ±6.7 pts. Users recognising the TV-series reference in B: 16%.

## Reading the results

1. **On equal footing, A wins:** 62.5% vs 37.5% preference, and A wins in 100% of 500 repeat studies. It is
   understood more often (58% vs 48% with the preloader; 82.5% vs 66% without).
2. **A wins the buyers:** SME owners (73%), operations (68%), CTOs (68%), finance (95%) and phone users (73%).
   **B wins** design-savvy partners (86%) and GCC/Singapore enterprise buyers (63%), who weight visual impact
   and memorability.
3. **The preloader costs more than the concept choice.** With it, about a quarter of visitors (36% on phones)
   leave before the headline appears, and intent to get in touch is about 20% for either concept. Without it,
   bounce is about 1% and intent is about 36%.
4. **B has a reference risk:** about 16% recognise the TV-series "time loom" look; design-literate viewers read
   it as derivative.
5. **Sensitivity:** if B's message were made about 10 points clearer, B would edge ahead on preference
   (A wins 0.4% of runs), with contact intent level (within 1 point). This is the assumption to validate with
   real prospects.

## Decision

**Concept A (particle system)** is the Wezigns site.

- **Preloader:** remove it, or cut it to under 0.6 s and show it only on a visitor's first session. This is the
  biggest lever for either concept.
- **Bring B's strongest persuasion pieces into A:** the before/after slider and the case-study timelines.
- **Keep `loom.html` as an internal or pitch piece only:** don't publish it, because of the reference risk.

## Hero copy test (simulated 5-second test, 6 personas × 4 variants)

A separate agent role-played the six buyer personas and judged four hero copy sets blind (eyebrow, headline,
subline, then the three scroll messages). It is a simulated panel, not real users.

| Variant | Guessed what we do | Clarity (1–5) | Appeal (1–5) | Kept scrolling | Scroll clarity |
|---|---|---|---|---|---|
| K · previous ("The Wezigns loom", abstract scroll phases) | 0% (4 partial) | 2.2 | 2.8 | 50% | 3.3 |
| **R · chosen** (category eyebrow + "we design, build and run" subline) | **100%** | **4.3** | **3.5** | **100%** | **4.3** |
| M · "Outgrown your spreadsheets? We'll build the system." | 100% | 4.3 | 3.3 | 83% | 3.7 |
| T · "Custom software that ties your whole business together." | 83% | 4.0 | 2.3 | 67% | 3.0 |

Why R: it keeps the distinctive headline (the design-savvy persona's favourite) and fixes clarity with the eyebrow
("Custom business software · Since 2012") and subline, which also signals cost certainty ("Priced on outcomes,
agreed before we build"). "Loom" was removed from the hero because personas confused it with the video product.
"Chennai" stays out of the hero (one persona read it as low-cost offshore) and appears with the 11-country proof.
The scroll phases became "We map it / We build it / We run it" so ownership of the work is explicit.
