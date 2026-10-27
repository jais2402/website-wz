# Go-live decisions (client answers, 20 Oct 2026)

| Topic | Decision | Done in code |
|---|---|---|
| Legal pages | Remove the visible draft notice; placeholders ([CIN], Grievance Officer name and designation) stay until the details arrive | yes |
| GA4 | Client adds `VITE_GA_MEASUREMENT_ID` in Vercel later; policies stay as written | nothing to do |
| Client names in the portfolio archive | Keep all 100 names; intro and Terms explain they were published on the old site, removal on request | yes |
| Counts | 20+ business systems (stat) vs over a hundred projects including websites (home tile) | yes |
| Case-study figures | All confirmed | nothing to do |
| About opener | Facts instead of "the leading": small to medium businesses, since 2012, 20+ systems, 11 countries | yes |
| Wording | Visible copy says "small to medium businesses"; SEO titles and descriptions keep "SMEs" | yes |
| Solvable, Inscribe | Removed from the tools strip, Technology stack and system pages (2026-10-28) | yes |
| Integrations on system pages | Keep all; Azure offered; GST e-invoice and e-way bill direct to the government portals | yes |
| Gulf gateways | Add Telr, PayTabs, Tamara | yes |
| Team section | Not added; About description no longer mentions a team | yes |
| Marketplace case | Sector only ("B2B marketplace"), no place | yes |
| Archive name typos | Keep as written on the old site | nothing to do |
| Archive sectors | 73 stay under Other | nothing to do |
| Archive links to systems | All seven correct | nothing to do |
| Wezads | Keep | nothing to do |
| Social profiles | LinkedIn, Instagram and Facebook (`socials` in `src/content/site.ts`): footer links and `sameAs`; no X handle yet | yes |
| AI crawlers | Search only: AI answer bots allowed, training crawlers blocked in `public/robots.txt` | yes |
| Accent colour | Keep green to violet on card outlines and progress bars | nothing to do |
| Our Work charts | Keep | nothing to do |
| Explorer "Explore {system}" link | Keep | nothing to do |
| Offices | Chennai only | nothing to do |
| WhatsApp | +91 81244 22205 (`brand.whatsapp`): phone call pill, contact page card, footer | yes |
| Cookie banner bug | Not seen now; re-test once the GA ID is set | later |
| Pricing after-launch line | Approved | nothing to do |
| Price signal, testimonials, security facts | None for now | later |

## Still with the client
- Grievance Officer name and designation, CIN; lawyer review of the legal pages (incl. the EU-US Data Privacy Framework line).
- `VITE_GA_MEASUREMENT_ID` in Vercel, then redeploy; GA4 settings (Google signals off, 14-month retention).
- X / Twitter handle, if there is one.
- Vercel Domains: http and the bare domain 301 to https://www.wezigns.com; optional HSTS; promote the deployment.
