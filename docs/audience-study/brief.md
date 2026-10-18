# Audience study brief (shared by every simulation agent)

## What you are doing
You are simulating **40 realistic people** from one segment of Wezigns' target audience visiting the new website,
and recording each person's honest reaction. Another four agents simulate other segments (200 people in total).
This is a synthetic study: be realistic, varied and critical, not flattering. Include sceptics, people in a hurry,
people on slow phones, and people who leave. Base every reaction **only on what is actually on the site** (read the
files below). Quote or name the specific element that caused the reaction.

## The business
Wezigns Software Private Limited, Chennai, India. Custom software studio since 2012: business systems (HR, CRM,
operations, ecommerce, finance, industry systems), integrations, hosting and support, and AI inside systems.
Positioning: "the leading systems and custom software provider for SMEs and MSMEs". Systems run in 11 countries.

## Read these files to know exactly what the site says
- `src/content/site.ts` — home page copy: hero, story, services, systems explorer (`areas`, the numbers there are
  illustrative demo data), work (`work` 4 case studies with results, `pastWork` 5 earlier systems without results),
  process, pricing, integrations/tools, countries, FAQ, contact, footer.
- `src/content/pages.ts` — About page, six system pages, AI page.
- `src/App.tsx` — home page section order. `src/loom/sections.tsx` (`LoomContact`, `BeforeAfter`) and
  `src/components/*.tsx` if you need to see how a section works.

## Site facts a visitor would experience (not visible in the copy files)
- **Pages:** Home `/`; Contact `/contact`; About `/about`; AI `/ai`; six system pages `/systems/{people,revenue,operations,ecommerce,finance,industry}`.
  Nav shows home sections only (What we build, Before/after, Work, How we build, Pricing, Questions) plus a
  "Tell us what is not working" button. About, AI and system pages are reachable from the footer and from an
  "Explore {system}" link in the home systems explorer. There is no "About" or "Systems" item in the top nav.
- **Home experience:** a ~2 s branded preloader, then a cinematic 3D "time loom" hero (glowing threads pulled through
  a loom), copy in frosted glass panels, a white guiding light that travels with scroll (desktop), pinned scroll
  sections (story, services, systems explorer, Our Work cards scroll sideways on desktop; on phones Our Work is a
  vertical card deck). Heavy on motion. JavaScript ≈ 390 KB gzip; 3D needs a decent GPU.
- **Lite mode:** on slow networks, low-memory or 2-core phones, or if frame rate is low, the site swaps the 3D for
  simple code-drawn line art. Some users find that art weak.
- **Contact form:** currently opens the visitor's own email app with the message pre-filled (mailto). It does not
  submit to a server. Phone +91 44 2364 3252, email contact@wezigns.com, full Chennai address with a Google Maps link.
  "We reply within one working day."
- **Pricing section:** explains "priced on outcomes, not hours", one price agreed before building, what sets the
  price (scope, integrations, process change). **No numbers, ranges or packages.**
- **Proof:** 4 anonymised case studies (Dubai safety training −80% admin work, 100,000+ certifications a year;
  Singapore tourism zero downtime, 40,000 requests/min; Dubai engineering event; B2B marketplace sellers 300 → 4,500)
  and 5 earlier systems with no results. **No client names or logos, no testimonials, no named people, no team or
  founder page, no photos, no certifications/awards, no reviews, no blog/resources, no careers page, no pricing
  numbers, no live demo or trial, no booking calendar, no WhatsApp/chat button, no language other than English.**
- Stats: 20+ products shipped, 11 countries, since 2012. Tools listed: AWS, Google Cloud, Stripe, Razorpay, Solvable,
  Inscribe, Shopify, Magento, WordPress, WooCommerce, Twilio, Mailchimp, Klaviyo. No programming stack named.
- Copy style: plain, short sentences, user-voice pain points ("I find out we are out of stock when a customer calls").

## Build each person
For each of your 40 people, set: id (e.g. `OWN-07`), role, company type and size (employees), sector, country/city,
age band, tech comfort (low/med/high), device (phone/desktop/tablet) and network, why they are looking (trigger),
and how they arrived (Google search, referral, LinkedIn ad, old wezigns.com link…). Spread these realistically.

## Record for each person (one compact block each)
- **First 10 seconds:** what they think the company does, and whether they stay.
- **Path:** which sections/pages they look at, where they stop.
- **Reaction & opinion:** what impressed, what annoyed, overall 1–10 rating.
- **Black box:** what they could not see into or verify and it bothered them (e.g. "who are these people", "what
  will it cost me", "what happens after I send the form", "where is my data hosted").
- **Expected but missing:** what they looked for and did not find.
- **Outcome:** contact now / bookmark-later / leave, and the single thing that would have changed their decision.

## Output
1. Write all 40 person blocks to `docs/audience-study/raw-<segment-key>.md` (create it; only this file).
2. Return a report (≤ 700 words) with: counts (understood the offer in 10 s, would contact, bookmark, leave,
   average rating, phone vs desktop split), the top 5 positive reactions, top 5 negatives, top black boxes with
   counts, top "expected but missing" with counts, segment-specific insights, and 3 notable verbatim-style quotes.
Do not edit any other file. Do not run the dev server, use a browser, or touch git.
