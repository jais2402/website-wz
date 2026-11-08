# Wezigns website: handover

Status on 7 November 2026: the site is built, reviewed and live on the preview address
**https://website-wz.vercel.app** (search engines are kept out). It is ready to go live at
**https://www.wezigns.com** once the settings below are in place.

- Code: GitHub `jais2402/website-wz`. `main` is what Vercel deploys to production; `testing` is the working branch.
- Hosting: Vercel project `website-wz`. Every push to `main` deploys automatically.
- How the code is organised: [`CLAUDE.md`](../CLAUDE.md) in the project root. The go-live checklist with every
  check is in [`docs/go-live/criteria.md`](go-live/criteria.md); the client's decisions are in
  [`docs/go-live/decisions.md`](go-live/decisions.md).

---

## 1. Environment variables (Vercel → Settings → Environment Variables)

Add them for **Production**. Settings only take effect on a new deployment, so **redeploy after adding them**
(Deployments → latest → ⋯ → Redeploy). None of them are secrets in the code: the values live only in Vercel.

### Needed to receive enquiries (at least one of the two routes)

| Name | Value | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | API key from resend.com (_Sending access_) | Emails each enquiry. The free plan (3,000 emails a month) is plenty. Verify the `wezigns.com` domain in Resend first (DNS records). |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | The service account's email | Adds each enquiry as a row in a Google Sheet. |
| `GOOGLE_SHEETS_PRIVATE_KEY` | `private_key` from the service account's JSON key, in double quotes, `\n` kept as they are | |
| `GOOGLE_SHEET_ID` | The id in the Sheet's URL (`/spreadsheets/d/<id>/edit`) | Share the Sheet with the service account as an Editor. |

With neither set, the forms still work: they open the visitor's email app with the message filled in. With both,
the visitor sees success when either one took the enquiry. Step-by-step: [`docs/enquiry-setup.md`](enquiry-setup.md).

### Optional

| Name | Default | Notes |
| --- | --- | --- |
| `ENQUIRY_TO` | `contact@wezigns.com` | Where enquiry emails go; several addresses separated by commas. |
| `ENQUIRY_FROM` | `Wezigns website <website@wezigns.com>` | Must be on the domain verified in Resend. |
| `GOOGLE_SHEET_TAB_NAME` | `Contact_Form` | The tab must exist. |
| `VITE_FESTIVE` | off | `diwali` turns on the Diwali loader on the home page. |
| `VITE_FESTIVE_UNTIL` | `2026-11-16T00:00:00+05:30` | The Diwali loader switches itself off at this time, no redeploy needed. |
| `VITE_FESTIVE_FROM` | straight away | Start time, if it should begin later. |
| `VITE_GA_MEASUREMENT_ID` | `G-J9S3WBWTLN` (built in) | Only to point Google Analytics at a different property. |
| `VITE_CLARITY_ID` | `z80jzy0skf` (built in) | Only to point Microsoft Clarity at a different project. |

`VERCEL_ENV` is set by Vercel itself; do not add it.

---

## 2. Going live

Do these in order, at a quiet time of day.

1. **Settings.** Add the environment variables above and redeploy.
2. **Turn indexing on (a code change).** In `src/content/seo.ts`, set `site.indexing` to `true`, then run
   `npm run validate && npm run build` and push to `main`. Until then every page tells search engines not to index
   it. The `*.vercel.app` address stays hidden from search engines either way.
3. **Domain.** Vercel → Settings → Domains: add `www.wezigns.com` as the main domain and `wezigns.com` redirecting
   to it (301). At the domain registrar, change the DNS records to the values Vercel shows. HTTPS is issued
   automatically once DNS points to Vercel. If the old site is hosted elsewhere, this is the moment it is replaced;
   the old page addresses (`/contact-us`, `/about-us`, `/our-services`, the old portfolio item URLs) already
   redirect or exist on the new site (`vercel.json`).
4. **Check the live site** at https://www.wezigns.com:
   - `http://`, `wezigns.com` and `http://www.wezigns.com` all land on `https://www.wezigns.com`.
   - Send one test enquiry from `/contact-us` and one from the home page's contact block: the email arrives (and/or
     the Sheet row appears), and _Reply_ answers the sender.
   - Accept the cookie banner, then check Google Analytics (Realtime) and Microsoft Clarity record the visit.
   - View the page source of the home page: no `noindex` in the robots meta tag.
5. **Vercel Firewall.** Make sure _Attack Challenge Mode_ is **off** (it shows visitors a "Security Checkpoint"
   page). Recommended: a rate-limit rule for `/api/enquiry` (5 requests per 10 minutes per IP), see
   `docs/enquiry-setup.md` step 4.

---

## 3. After going live

**First day**
- Google Search Console: add `wezigns.com` as a Domain property (DNS verification), submit
  `https://www.wezigns.com/sitemap.xml`, and run URL Inspection on the home page and one inner page.
- Bing Webmaster Tools: import from Search Console.
- Google Analytics: set data retention to 14 months and turn Google signals off (the privacy policy says so).
- Google Business Profile and LinkedIn: name, address, phone and services exactly as on the site.

**First four weeks**
- Watch Search Console (Pages, Core Web Vitals) and fix anything it reports.
- Check that enquiries keep arriving; Vercel → Logs shows lines starting with `enquiry:` if a send fails.
- After 16 November, nothing to do for the Diwali loader: it switches itself off. Remove `VITE_FESTIVE` whenever
  convenient.

**When ready**
- Security: the Content-Security-Policy is report-only. After a clean run on the live domain, switch it to
  enforcing (`vercel.json`; `api/_vercel.test.ts` checks the script hash). Optionally add HSTS with
  `includeSubDomains` once every subdomain serves HTTPS.

---

## 4. Still open with the client

- **Legal review** of the privacy policy, terms and cookie policy (`src/content/legal.ts`). Points for the lawyer:
  a fixed liability cap; whether an EU representative is needed (GDPR Art. 27); offering the notice in Tamil or
  Hindi (DPDP Act s. 5(3)); the legal basis for server logs under the DPDP Act; written permission from the clients
  named in the portfolio; the Grievance Officer's full name (now "Sivaraj").
- **Car Rental case study** has no result figure (the others do). Needs a real number from the client.
- **Portfolio archive names** "Os Tickests" and "Tec Guy" are kept as written on the old site (client decision);
  worth confirming they are the real names.
- **X / Twitter handle**, if Wezigns has one (`socials` in `src/content/site.ts`).

---

## 5. Working on the site

- Node and npm; `npm install`, then `npm run dev` (http://localhost:5173). Secrets for local testing go in
  `.env.local` (copy `.env.example`); never commit it.
- Before every commit: `npm run validate` (tests, lint, typecheck) and `npm run build`.
- All copy lives in `src/content/` (`site.ts`, `pages.ts`, `legal.ts`, `seo.ts`), not in components.
- Brand files are in `docs/brand/` (wordmark, W icon, favicon, app icon). After changing one, or a page's hero, run
  `npm run og` to redraw the social cards and icons.
- Preview any change on the `testing` branch's Vercel preview before merging to `main`.
- Useful address switches: `?festive=diwali|off` (Diwali loader), `?gfx=live|poster` (3D or 2D hero),
  `?badge=1` (shows which version a device gets).
