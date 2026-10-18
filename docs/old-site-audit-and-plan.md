# wezigns.com audit and plan (for approval)

Source: https://www.wezigns.com/ (16 pages crawled: home, about-us, our-services, portfolio, careers, contact-us and
8 portfolio-item pages). The old site is a 2018 theme build titled "WEZIGNS | The Design Crew".

## What the old site contains

| Area | What is there | Usable? |
|---|---|---|
| Contact details | Chennai HQ: #4 / 25B, 1st Floor, Block 1, Boopathy Street, Arcot Road, Virugambakkam, Chennai 600092 · +91 44 2364 3252 · contact@wezigns.com | **Yes.** Full street address is new to us. Phone matches. Email differs (new site uses hello@wezigns.com). |
| Other offices | Australia: 75 Meredith Street, Banyo, Brisbane QLD 4014 · +61 415 450 480. United Kingdom: 40 Boughey Road, Stoke on Trent, Staffordshire ST4 2BQ · +44 75702 84748 | **Only if still current.** These date from 2018. |
| Services: Development | Custom web development, web portal development, eCommerce solutions, open-source integration and customisation, mobile-first websites | **Yes.** Matches "Build a system" and "Connect & automate". |
| Services: Security assessment | Penetration testing, social engineering assessment, advanced simulated attack | **Maybe.** Fits the "Secure" story, but only if Wezigns still sells it. |
| Services: Consulting | Analytics audit, site architecture planning, sales funnel design, CRO | Partly. Architecture planning fits the "Shape" stage. |
| Services: Design, branding, marketing | Logo, packaging, editorial, brand naming, SEO, SEM, social media, lead generation | **No.** The new positioning is custom software. |
| Portfolio | ~100 project names (mostly 2018 websites: "3week diet formula", "Datalogic", "Rajkumaran builders", …). The 8 detail pages are template placeholders (Lorem Ipsum, "AN AWESOME PROJECT"). | **No case data.** Names only; publishing client names conflicts with the current policy of not naming clients. |
| About / Careers | Generic theme copy ("We've designed gorgeous templates", Kallyas theme text on the careers page) | No. |
| Template debris | "HOW TO SHOP", "SHOWROOM HOURS", support@website.com, login/sign-up modals | No. Confirms nothing should be migrated wholesale. |

**Conclusion:** the useful parts are the **contact details** (full address, possibly the AU and UK offices) and **a few
service lines** that match today's offer. There are **no new case studies** to take: the four real ones are already on the site.

## Decisions so far

- Email: **contact@wezigns.com** everywhere. ✅ done
- Offices: **Chennai only** until Brisbane / Stoke-on-Trent are confirmed. ✅ done
- Content update (address, service lines): ✅ done in commit `6f3aa7a`
- Form submission method: **to be decided later.** The page is built so the method can be swapped without UI changes.

## Detailed plan: Contact Us page (awaiting approval)

### Goal
A dedicated page at `/contact` that gives anyone, including people arriving from a search or an old wezigns.com
link, every way to reach Wezigns, plus the enquiry form, in one place. It works in full and lite mode.

### Page structure (top to bottom)
1. **Nav** (same as home). Adds a **Contact** link; the blue header button goes to `/contact`.
2. **Header block**
   - Label: "Contact"
   - Headline: "Tell us what is not working."
   - Lead: "We reply within one working day. You get scope, price and timeline in writing before anything is built."
     (the second sentence is from the original site's work page)
3. **Two-column body** (stacks on mobile: details first, then form)
   - **Left: ways to reach us**
     - Head office card: address (4 lines), "Open in Google Maps ↗" (plain link, no embedded map, so no Google cookies).
     - Phone card: +91 44 2364 3252 (tap to call), office hours (**needs your input**, or I leave it out).
     - Email card: contact@wezigns.com (tap to email), "Reply within one working day".
     - Small "Working with teams in 11 countries" line linking back to the countries section on the home page.
   - **Right: enquiry form (glass card)**
     - Fields: Name*, Email*, Company, Phone, "I need help with" topic chips (existing six), Message*.
     - Inline validation on blur and submit: required fields, email format, message min 10 characters, max lengths.
       Errors are announced to screen readers and focus moves to the first error.
     - Honeypot field (hidden) to filter basic spam bots.
     - States: idle → sending → success ("Thanks, {name}. We'll reply within one working day.") → error with retry.
4. **Short FAQ strip** (3 questions reused from the home FAQ: cost, taking over software, small businesses).
5. **Footer** (same as home).

### Form submission (pluggable, decided later)
- One `submitEnquiry(data)` function in `src/lib/enquiry.ts` with a single setting choosing the method:
  - `mailto` (default today): opens the visitor's email app with everything pre-filled.
  - `endpoint`: POSTs JSON to a URL (Vercel function, Formspree or Web3Forms) and shows the success state.
- Switching later is one config change; the page and validation do not change.

### Technical
- New Vite entry `contact.html` + `src/contact/main.tsx` + `ContactPage.tsx`, reusing Nav, Footer, EnquiryForm
  (extended), LiteProvider, fonts and tokens. No three.js on this page (it stays light by design).
- `vercel.json`: `cleanUrls` so `/contact` serves `contact.html`.
- Page meta: title "Contact | Wezigns", description, Open Graph tags.
- Nav links on the contact page point back to home sections (`/#build`, `/#work`, …).

### Redirects from the old site (same release)
`/contact-us` → `/contact` · `/our-services` → `/#build` · `/portfolio`, `/portfolio-item-*` → `/#work` ·
`/about-us`, `/index` → `/` · `/careers` → `/` (until a careers page exists). All permanent (301).

### Tests and checks
- Unit tests: validation rules, mailto builder, endpoint payload, honeypot.
- Lint, typecheck, build; desktop 1440 and mobile 375 checks; keyboard-only and screen-reader labels; lite mode.
- Then commit and push to `immersive-redesign` (with your go-ahead).

### Open questions for you
1. Office hours to show (e.g. Mon–Fri 9:30–18:30 IST), or leave them out?
2. Keep the 3-question FAQ strip on the contact page, or keep the page minimal?
