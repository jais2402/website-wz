# Audience study: 200 simulated prospects on the new Wezigns site

> **Read this first.** These are 200 *AI-simulated* buyers, not real people. Five agents each built 40 realistic
> personas for one segment and walked them through the site's actual copy and behaviour (see `brief.md`). Use the
> findings to spot gaps and set priorities; confirm the big ones with 5–8 real prospects before spending heavily.
> Per-person notes: `raw-owners.md`, `raw-managers.md`, `raw-finance.md`, `raw-tech.md`, `raw-international.md`.
> Site state tested: branch `immersive-redesign` at commit `a2b420d` (18 Oct 2026).

## Headline numbers

| Segment (n = 40 each) | Got the offer in 10 s | Contact | Bookmark | Leave | Avg rating |
|---|---|---|---|---|---|
| Indian SME / MSME owners | 32 | 12 | 12 | 16 | 5.2 |
| Operations & HR managers | 34 | 10 | 18 | 12 | 5.8 |
| Finance & procurement | 35 | 12 | 11 | 17 | 5.2 |
| IT heads & CTOs | 30 (+8 partly) | 10 | 15 | 15 | 5.1 |
| International & sector buyers | 28 | 11 | 16 | 13 | 5.3 |
| **All 200** | **159 (80%)** | **55 (28%)** | **72 (36%)** | **73 (37%)** | **5.3 / 10** |

- **Devices:** 79 phone, 118 desktop, 3 tablet. Phones lose people: among owners, 13 of the 16 who left were on a
  phone; among managers, 8 of 12. Most phone leavers left before reaching the services section.
- **Referrals convert, cold traffic does not:** 7 of 9 referred international visitors and all 3 referred owners
  contacted. Cold visitors mostly bookmarked or left.
- **Sceptics (about a third of each segment) averaged roughly 3–4 / 10** and almost all left. Everyone who contacted
  came from the non-sceptical two-thirds.
- **The system pages are the best converters.** Every manager who reached a system page matching their pain rated it
  6 or higher. The problem is getting there (see "Not working" below).

## What people liked (all segments)

1. **The pain quotes on the system pages read like their own week.** Named in every segment, the single strongest
   hook. "Purchase orders get approved on WhatsApp and nobody can find them later", "I find out we are out of stock
   when a customer calls", "When the auditor asks who approved a payment, nobody is sure".
2. **"One price and one timeline, agreed before any building starts"** and "Four stages. No surprises." Valued by
   CFOs, consultants and overseas buyers burned by cost blow-outs.
3. **The honest FAQ answers.** "Can you take over software another company built?" was the strongest single converter
   for technical buyers; "If an off-the-shelf tool will do the job, we will say so" built trust with owners and CAs.
4. **Case studies in the visitor's own market.** Dubai safety training (−80% admin) for the Gulf, Singapore tourism
   for South-East Asia. "Data stays in-country" was the most reassuring sentence on the whole site.
5. **AI with guardrails.** "A person signs off" and "Everything is logged" made AI feel safe and practical.
6. **The Chennai address and landline** (Indian owners and managers), and a premium, modern feel on good devices.

## What did not work

1. **"Pricing" with no price** (≈ 60 people). Clicking "Pricing" and finding no number read as "this will be
   lakhs" or "priced on what you can pay". Managers can't raise a budget request without a range.
2. **Everyone is anonymous** (≈ 45). No people, founder, team, client names, testimonials, reviews or certifications.
   "The leading … provider" on About, with nothing behind it, irritated sceptics.
3. **Heavy on phones and slow networks.** The ~2 s preloader, abstract 3D hero and long pinned scrolls lost busy
   people before the offer was clear; several read it as a design or VFX agency. **Lite-mode art looked
   "unfinished" or "cheap"** wherever it appeared.
4. **The contact form opens the visitor's email app** (11 hit friction). "I pressed the button and nothing came."
   Most people who contacted phoned instead.
5. **Results are all overseas and in few sectors.** Indian owners: "they work for foreign companies, not people like
   us". Healthcare, manufacturing, logistics, hotels and lending have no case with results. System pages link to
   loosely related cases.
6. **Security is one sentence** (≈ 35). Nothing a vendor-risk check, InfoSec questionnaire or regulated buyer can use.
7. **System pages are hard to find.** They are not in the top nav, so many never reached the page that matched them.
8. **Demo dashboards show ₹, GST and UPI**, which made overseas buyers wonder if they are served, and two auditors
   mistook demo figures for proof.

## Black boxes: what people could not see into

| What they could not see | People | Mostly |
|---|---|---|
| What it will cost (build, yearly maintenance, change requests, whether discovery is paid) | ~76 | everyone |
| Security, hosting region, data residency, regulations (DPDP, GDPR, PDPA, PDPL, HIPAA, RBI/MAS) | ~57 | finance, tech, international |
| Who the people are, who my contact would be, how big and stable the company is | ~44 | everyone |
| Whether the clients and results are real (no names, no one to call) | ~43 | owners, managers, tech |
| Contract law, IP and code ownership, exit terms, SLA | ~22 | finance, tech, international |
| Time-zone overlap, local support, on-site visits | ~19 | international, managers, owners |
| What happens after I send the form | ~11 | owners, managers |
| How long until go-live | ~13 | managers |
| Programming stack and code quality | ~7 | tech |
| GST / VAT / e-invoicing capability; invoicing currency | ~13 | finance, international |

## Expected but not there (ranked)

| Missing | People | Notes |
|---|---|---|
| A price range, "starts from", or a worked example | ~64 | the biggest single gap |
| Named clients, references, testimonials, Google reviews | ~52 | "references on request" would already help |
| A case with results in *their* sector or country (esp. India) | ~43 | manufacturing, clinics, distribution, hotels, lending |
| Security / compliance page, certifications (ISO 27001, VAPT, SOC 2), privacy policy | ~35 | needed for any regulated buyer |
| Team or founder page with names and faces | ~30 | "in Saudi we buy from people, not animations" |
| Local presence: local office, phone in the header, call button | ~27 | AU and UK offices from the old site were asked for |
| Their own tools named: **Tally**, Zoho, GST e-invoicing / e-way bill, PF/ESI, biometrics, SAP | ~26 | "Tally" was the single most-missed word for Indian buyers |
| WhatsApp / chat | ~13+ | strongest in the Gulf, South-East Asia and Indian owners |
| Stack, architecture, GitHub or engineering writing | ~11 | technical buyers |
| Engagement models, IP clause, SLA tiers | ~12 | tech, finance |
| Something to forward: one-page PDF / vendor pack (CIN, GSTIN, team size, hosting, security, SLA, payment terms) | ~10+ | managers and procurement shortlist for someone else |
| Real screens, a short video or demo | ~9 | the demo dashboards were seen as mock-ups |
| Typical timelines per stage | ~17 | managers |
| A working form, or a booking calendar | ~9 | |
| Training, rollout and data-migration plan | ~3 | managers carry the adoption risk |
| Other languages (Tamil, Arabic, Thai, Hindi) | ~8 | lower priority |

## Recommendations

**Need your input (content only you can supply), in order of impact:**
1. **A price signal.** Even "most projects start from ₹X (about $Y)" and one worked example. Estimated to recover
   the largest group of leavers.
2. **Proof people can check.** Client names or logos you are allowed to show, 2–3 testimonials with names, "references
   on request", and **one Indian case with results**.
3. **A team or founder section** on About: names, roles, faces (or illustrations, if photos stay off the site).
4. **Security and trust facts:** hosting regions, data-residency options, practices (access control, backups, VAPT),
   any certifications, NDA, IP and code ownership, SLA tiers, payment terms. Also CIN and GSTIN.
5. **Confirm the Brisbane and Stoke-on-Trent offices**, a WhatsApp number, and the integrations you really support
   (Tally, Zoho, GST e-invoicing, biometrics, SAP…).
6. **Typical timelines** per stage and per project size, and a rollout and training line.
7. **The programming stack** you work in.

**I can build now:**
1. **Put "Systems" (and About, AI) in the top nav**, plus a plain line under the hero listing HR · CRM · Inventory ·
   Ecommerce · Finance, so people land on the pages that convert best.
2. **Fix the form:** send to a real endpoint (Formspree, Web3Forms or a Vercel function; your choice) and show a
   clear "Sent" confirmation. Keep phone and email beside it.
3. **A sticky call button on phones** (and WhatsApp once you give the number).
4. **Lighter first view on phones:** skip or shorten the preloader and get the offer line on screen at once.
5. **Label demo data as sample data**, and show a neutral currency for visitors outside India.
6. **Better case pairings** on system pages, or "Similar work on request" where no case fits.
7. **Trust and "For technical teams" page skeletons** ready for your facts, plus a printable one-page summary per
   system that managers can forward.
8. **Rename "Pricing"** to something like "How pricing works" until there's a number, so it stops promising one.
9. **Replace the lite-mode art** with the images you're generating (prompts in `docs/lite-image-prompts.md`).

## Quotes

- "Pricing, and no price. Means expensive." (Tiruppur exporter)
- "Priced on outcomes means you price on what you think I can pay." (retail CFO, UAE)
- "That quote line is literally my Monday complaint. Now show me the screen my reps would use." (sales manager, Coimbatore)
- "In Saudi we buy from people, not from animations." (serviced apartments, Riyadh)
- "Security built into the first version is a sentence, not a practice." (NBFC architect, Pune)
- "I can't send my client a link that says trust us." (freelance consultant, Bengaluru)
- "I pressed the button and nothing came." (Erode distributor, after the email hand-off failed)
