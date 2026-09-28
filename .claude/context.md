# context.md — why this site exists and who it is for

> Read this before changing any copy, any CTA, or the order of any section.
> Everything here is evidence from the 200-user simulation study (three rounds,
> four cohorts) run on the prototype. Numbers are directional, not census data.

---

## 1. The business

Wezigns builds custom software for businesses that have outgrown spreadsheets,
message threads and manual steps. Operating since 2012. Clients in India,
Singapore and the UAE. Work arrives referral-led.

The company sells **systems that run an operation**, not websites — even though
90+ websites is the larger number in its history. Every layout decision has to
protect that distinction, because the audience reaches for "web agency" the
moment it is given the chance.

**Offer, in one line:** custom software built around how your business already
works — understood first, priced second, built in working pieces, then run.

---

## 2. Audiences

| Cohort | Who | Weight | What they decide on | Where they fail us |
|---|---|---|---|---|
| **A — Primary** | Owner / MD, Indian mid-size business, 50–500 staff. Not technical. | Highest volume | Trust, referral, "did they understand my business", certainty of price | No price band, no phone number, no client names, no sector proof |
| **B — Primary** | COO / Head of Ops, Singapore & UAE, 100–1000 staff. Budget approved, board watching. | Highest value | Delivery risk, timeline, data residency, who does the work | No price band, no named reference, no certification, no delivery-team facts |
| **C — Gatekeeper** | CTO / IT manager vetting the vendor | Veto power | Stack, IP and hand-over terms, SLA, security artefacts, callable references | Everything above plus no named stack, no SLA numbers |
| **D — Influencer** | Transformation leads, consultants, referrers, partners, potential hires | Multiplier | Positioning, who is behind it, is it repeatable by name | No people, no clients, and a brand name they cannot spell |

~45% of every cohort arrives on a phone. Median attention budget: 2–4 minutes.

---

## 3. What the study proved

Measured identically in each round (n=80 / 60 / 60):

| Measure | Round 1 | Round 3 |
|---|---|---|
| Understands what we sell in 5 seconds | 26% | **80%** |
| Clarity (1–7) | 4.4 | **5.5** |
| Intent = would contact | 12% | **21%** |
| Names us unprompted on the category trigger | 20% | **30%** |
| Memory is about value, not visuals | 36% | **48%** |

**Four changes did most of that work.** Repeat them, do not undo them.

1. **The hero names the category and the trigger in the first line.** "We deliver
   systems that make the business feel simpler" read as a design studio to 49 of
   80 users. Naming custom software + spreadsheets tripled comprehension.
2. **Nothing placeholder ships.** Visible `[Client name]` brackets were named by
   56 of 80 users and poisoned belief in the real case-study numbers. The
   testimonial block now renders only when `content/site.json → testimonials.enabled`
   is true. Same rule for every future block.
3. **Proof arrives early.** The hook screen carries the three hardest numbers, so
   the first proof beat is at screen 5 instead of screen 12.
4. **Nothing is gated on a phone.** Scroll-revealed lists and hover-to-open
   panels were the top abandonment cause on mobile. Below `lg`, everything is open.

---

## 4. What the brand owns in memory

Two phrases carry the proposition, and they were the most-recalled lines in every
round. Treat them as assets, not as copy to refresh:

- **"Tell us what is not working."** The primary CTA everywhere. Recalled by more
  users than any other string on the site. Never soften it to "Get in touch".
- **"…the moment when the business outgrows the workaround."** The hook. It is
  the only sentence users reproduced verbatim a week later.

Supporting, in order of measured strength:

- "replace the spreadsheets, message threads and manual steps"
- "No build starts before that number is agreed."
- "A senior person from our team replies within one working day."
- "Sometimes it is not, and we will say so." (the FAQ candour line — the single
  highest trust-per-word sentence on the site)

**What the brand does NOT own:** a person, a client, a number. Half of users
misspell "Wezigns" as "Wedesigns" ten minutes later, which re-files the company
as a design shop at the moment of recommendation.

---

## 5. CTA strategy

One primary action, one phrase, three placements. Everything else is a route to it.

| Tier | Action | Where | Why |
|---|---|---|---|
| Primary | **Tell us what is not working** | Header (persistent), hero, evidence section, contact heading, footer | Highest-recall string we own; frames the conversation as diagnosis, not sales |
| Secondary | **Show us your process** / **Discuss a similar system** / **Talk to us about your stack** | AI, work, architecture sections | Same destination, worded for the reader who got that far |
| Tertiary | **Open all four case studies** → `/work` · **See all capabilities** → `/capabilities` | Under work and build | Gives influencers and gatekeepers a URL they can send |
| Support | **hello@wezigns.com** (copy-to-clipboard) | Footer | For people who will not fill a form |

**Form rules.** Topic chips pre-set the subject. Three fields only. The reply
promise sits under the submit button, never above it. Never add a phone field
until we can answer a phone.

---

## 6. Open decisions — the whole remaining gap

These are facts the business must supply. Each has a null slot in
`content/site.json → meta.TODO_business_facts`; fill the slot and the component
appears. Ordered by measured intent lift across 200 users:

| # | Fact | Flips (of 200) | Blocks |
|---|---|---|---|
| 1 | A price band, plus whether the Shape stage is paid | ~45 | A, B, C, D |
| 2 | Two named clients, or one reference willing to take a call | ~40 | all four |
| 3 | A team page — founders and leads, faces, tenure, headcount | ~35 | A, C, D |
| 4 | A phone number (and WhatsApp for India) | ~20 | A especially |
| 5 | Security posture — ISO 27001 / SOC 2 status *or* an honest "not certified, here is what we do", DPA, data residency | ~18 | B, C |

Until they exist: **do not invent them, and do not stage them.** A placeholder
costs more than an absence — that is the single most expensive thing the study
found.

---

## 7. Success metrics for the build

| Metric | Target | How measured |
|---|---|---|
| 5-second comprehension | ≥ 80% | Repeat the T1 test on any hero change |
| Time to first proof point | ≤ screen 5 | Manual scroll audit |
| Mobile abandonment before `#work` | < 20% | Analytics, once live |
| Contact-form starts / sessions | Baseline in month 1, then +20% | Analytics |
| `/work` and `/capabilities` deep-link shares | Tracked | Referrer + UTM |
| Core Web Vitals | All three green at p75 | CrUX / RUM |

---

## 8. Tone rules (non-negotiable)

- Plain words. No "leverage", "solutions", "seamless", "cutting-edge", "journey".
- Short declaratives. If a sentence needs a comma to survive, split it.
- Never claim a capability the company cannot evidence on request.
- Say the honest thing: "Sometimes it is not, and we will say so" outperformed
  every persuasive line tested.
- One idea per screen. If a section carries two, it is two sections.
