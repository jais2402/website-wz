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

## Plan

### 1. Content updates (src/content/site.ts)
1. Contact: add the full Chennai address; use one email address across the site (decision needed).
2. Offices: if confirmed current, show Brisbane and Stoke-on-Trent alongside Chennai (contact page + country list).
3. Services: add "Web and customer portals", "Open-source integration and customisation" and "Mobile-first web
   apps" to the existing service lists; add a "Security reviews and penetration testing" line under
   *Keep it running* only if still offered.
4. Work: no changes (old portfolio has no usable results).

### 2. New Contact Us page (`/contact`)
- New Vite page `contact.html` sharing the nav, footer, fonts and lite mode; clean URL `/contact` via vercel.json.
- Layout: headline + short promise ("reply within one working day"), office cards (address, `tel:` phone,
  `mailto:` email, "Open in Google Maps" link; no embedded map, to avoid third-party cookies), and the enquiry form.
- Form fields: name, company (optional), email, phone (optional), what you need (topic chips), message. Inline
  validation, accessible labels and errors, a clear success state.
- Submission (decision needed): keep today's "opens your email app", or send through a form service / a Vercel
  serverless function so it works for everyone.
- Nav gets a **Contact** link; header CTA goes to `/contact`. The contact block at the bottom of the home page stays.
- Page title/description, mobile and lite-mode checks.

### 3. Keep old links working
Add redirects in vercel.json so old URLs land on the right new page: `/contact-us` → `/contact`,
`/our-services` → `/#build`, `/portfolio` and `/portfolio-item-*` → `/#work`, `/about-us` and `/index` → `/`,
`/careers` → `/` (or a careers page later).

### 4. Verify
Tests for any new logic (form validation), lint, typecheck, build, desktop and mobile checks, lite mode, then push.
