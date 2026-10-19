# Analytics (Google Analytics 4 + cookie consent)

GA4 runs behind **Google Consent Mode v2, basic mode**, with one opt-in banner for every visitor and every country.
Nothing from Google loads before the visitor clicks **Accept**: no script, no request, no cookie.

| File | What it does |
| --- | --- |
| `src/lib/consent.ts` | Stores the choice in `localStorage` (`wz-consent`, strictly necessary). Re-asks after 12 months or when the version changes. `openConsentSettings()` reopens the banner. |
| `src/lib/ga.ts` | `initAnalytics()` (called once in each entry file). Consent defaults, script loading, withdrawal, delegated click tracking. |
| `src/lib/analytics.ts` | `track(name, params)`. A no-op until consent is granted. |
| `src/components/CookieBanner.tsx` | The banner (home, contact and every inner page) and the footer "Cookie settings" button. |
| `src/content/consent.ts` | Banner copy. |

## Configure

1. In GA4: **Admin → Data streams → Web**, create a stream for `https://wezigns.com` and copy the measurement ID
   (`G-XXXXXXXXXX`).
2. In Vercel: **Project → Settings → Environment Variables**, add `VITE_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX`.
   - Tick **Production**. Tick **Preview** too only if you want preview traffic in the same property (or give
     Preview a separate test property's ID, so real reports stay clean).
   - It is a build-time variable (Vite inlines it), so **redeploy** after adding or changing it.
3. Locally: copy `.env.example` to `.env.local` and fill it in. Leave it empty and analytics is off completely:
   no banner, no "Cookie settings" button, no Google script, no cookies.

The ID must look like `G-` plus letters and digits; anything else is ignored.

## How consent works

- On load: `gtag('consent','default', { ad_storage, ad_user_data, ad_personalization, analytics_storage: 'denied',
  wait_for_update: 500 })`. Ads storage is never granted (the site runs no ads).
- **Accept**: `consent update { analytics_storage: 'granted' }`, then `gtag('js')`, `gtag('config', ID,
  { anonymize_ip: true })` and the `gtag/js` script is injected. The `config` call sends the page view. Every page
  load is a page view (multi-page site), and later pages load GA straight away from the stored choice.
- **Reject**, or withdrawal from "Cookie settings": events stop, `consent update { analytics_storage: 'denied' }`,
  Google's `ga-disable-<ID>` flag is set, and the `_ga` / `_ga_*` cookies are deleted on the current host and its
  parent domains (`.wezigns.com`).
- The banner waits for the home preloader to finish. Escape never counts as a choice.

## Events

Never send names, email addresses, phone numbers or message text. The parameters below are fixed labels only.

| Event | Parameters | Fired from |
| --- | --- | --- |
| `page_view` | GA defaults | Each page load, after consent (`config`) |
| `cta_click` | `label` (button text), `location`: `nav`, `hero`, `cta_strip`, `sticky_call` | Nav and mobile-menu contact button, hero primary button, mid-page CTA strips, phone call/email pill (`label`: `call` / `email`) |
| `click_to_call` | `location` | Any `tel:` link (delegated listener in `ga.ts`) |
| `click_to_email` | `location` | Any `mailto:` link (delegated listener) |
| `outbound_click` | `link_domain`, `link_url` (origin + path, no query), `outbound: true`, `location` | Any link to another site (delegated listener) |
| `ai_summary_click` | `engine`: `chatgpt`, `claude`, `perplexity`, … | Footer "summarise with AI" tiles |
| `generate_lead` | set by the form code | Enquiry forms on a successful send |

`location` values: `nav`, `hero`, `footer`, `sticky_call`, `cta_strip`, or the id of the enclosing section
(e.g. `pricing`), else `page`.

In GA4, register `location`, `label` and `engine` as **custom dimensions** (Admin → Custom definitions → Event
scope) to see them in reports. Mark `generate_lead` as a **key event**.

GA4's enhanced measurement also has its own "Outbound clicks" event (`click`). Turn that toggle off in the data
stream settings to avoid counting outbound links twice, or ignore `outbound_click`.

## Verify (GA4 DebugView)

1. Install the Google **Tag Assistant** extension or open <https://tagassistant.google.com> and connect the site;
   this puts the session in debug mode.
2. Open the site in a private window. DevTools → Network, filter `google`: nothing before the banner choice.
3. Click **Accept**: `gtag/js?id=G-…` loads, then `collect?v=2…` requests. GA4 → **Admin → DebugView** shows
   `page_view`, then `cta_click`, `click_to_call` and so on as you click.
4. Footer → **Cookie settings** → **Reject**: Application → Cookies shows no `_ga` cookies, and no further
   `collect` requests are sent.
5. Reload: the banner stays hidden until the choice is 12 months old (or `localStorage.removeItem('wz-consent')`).

## Privacy-friendly GA4 settings (set once in the GA4 property)

- **Admin → Data collection**: Google signals **off**. Leave "Granular location and device data collection" **off**
  for EU/UK regions (or everywhere).
- **Admin → Data retention**: event data **14 months** (the GA4 maximum for standard properties); leave "Reset user
  data on new activity" on.
- **Admin → Data streams → Configure tag settings → Define internal traffic**: add the office IP, then filter it.
- Do not link Google Ads or turn on ads personalisation; the consent setup keeps all ads storage denied anyway.
- GA4 does not log or store IP addresses; `anonymize_ip` is kept only as a harmless explicit setting.

Keep the cookie policy and privacy policy (`src/content/legal.ts`) in step: they must name Google Analytics, the
`_ga` / `_ga_*` cookies (up to 2 years), the `wz-consent` storage entry (12 months) and Google as a recipient.
