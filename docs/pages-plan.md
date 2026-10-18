# Plan: system pages, AI pages and About Us (for approval)

Nine new pages, all built the same way as `/contact`: their own URL, title and description (good for search),
the site's nav and footer, lite-mode safe, checked at 1440 and 375. All copy lives in `src/content/site.ts`.

| Page | URL |
|---|---|
| People & workforce | `/systems/people` |
| Revenue & customers | `/systems/revenue` |
| Operations & supply chain | `/systems/operations` |
| Ecommerce | `/systems/ecommerce` |
| Finance & governance | `/systems/finance` |
| Industry systems | `/systems/industry` |
| AI in your systems ("AI in the solution") | `/ai/in-your-systems` |
| AI solutions ("AI as the solution") | `/ai/solutions` |
| About us | `/about` |

## 1. System pages (one template, six pages)

Each page answers three questions from the visitor's side: *is this my problem? what would I get? what changes for me?*

1. **Hero**: system name, one-line promise, and the live mini-dashboard from the home explorer (same animated
   module cards), so the page opens on something moving.
2. **Sound familiar?** Pain points written in the user's own words, tagged by who says them
   (owner, manager, team member). For example, Operations: "I find out we're out of stock when a customer calls."
   Four to six per system.
3. **What we build**: the six modules for that system (already in the explorer) with one plain sentence each on
   what it does.
4. **What changes for you**: business impact as before → after pairs, again in user voice, per role.
   For example: "Before: I chase three people for today's numbers. After: they're on my phone at 9am."
   **No invented statistics.** Where a real case study fits (e.g. −80% admin work, sellers 300 → 4,500), it's quoted
   and linked to Our Work.
5. **Tools we use**: grouped chips, *Built on* (cloud, stack) and *Connects to* (payments, messaging, commerce,
   accounting). Taken from the existing tools list, mapped per system (needs your check, see questions).
6. **Close**: a matching Our Work card, links to the other five systems, and the contact CTA.

Links in: the home explorer gets an "Explore {system} →" link on each system; footer gets a Systems column.

## 2. AI pages (4–5 sections each)

**AI in your systems** (AI added to the software you run):
1. Hero: "Put AI to work inside your systems." (existing line), with a small animated record being read, flagged
   and drafted.
2. What it does inside a system: reads documents, flags exceptions, drafts the next step, answers questions
   about your records, forecasts. One card each, with the system it lives in.
3. Examples per system: Finance (invoice matching), Operations (reorder suggestions), People (CV screening),
   Revenue (reply drafts for support), Ecommerce (product copy and search).
4. Guardrails: a person signs off, data stays in your systems, every AI action is logged (from the existing copy).
5. How we add it: start with one workflow, measure it, then extend. Then the CTA.

**AI solutions** (AI as the product itself):
1. Hero: AI built as its own tool around your work.
2. What we build: assistants that answer from your company documents, document processing (read, extract, check),
   back-office agents that carry out routine steps, customer chat on web or WhatsApp.
3. How it works: connect your data, choose the model, test it on your real cases, people approve, then go live.
4. Where it fits by industry (from the Industry systems list).
5. Pricing on outcomes, agreed before building (same promise as the home page), then the CTA.

## 3. About us (simple and clean)

Positioning line: *the systems and custom software partner for SMEs and MSMEs* (see question on "leading").

1. Hero: the positioning line plus one paragraph: Chennai, since 2012, building the systems growing businesses
   run on.
2. Why SMEs and MSMEs: three short points. Software sized to how you work, priced on outcomes, grows in stages.
3. Twelve years in one line: a thread timeline from 2012 to today (websites, then portals and stores, then
   business systems and AI), using the facts we already publish.
4. Numbers: 20+ products shipped, 11 countries, since 2012 (existing stats).
5. How we work: Understand → Shape → Build → Run (existing process), then the contact CTA.

No team photos (the site has no raster images, by client decision). Text-only and light; no 3D on this page.

## Build order

1. Shared page shell + About (smallest, sets the pattern).
2. System page template, then the six pages, plus the explorer and footer links.
3. The two AI pages.
4. Tests for any new logic, `npm run validate`, `npm run build`, browser checks, then commit.
