# Privacy, cookies and website terms: research notes

> **Not legal advice.** Prepared by an AI assistant on 19 October 2026 from public sources, for Wezigns Software
> Private Limited. Every conclusion below, and the drafts in `src/content/legal.ts`, must be reviewed by a qualified
> lawyer (Indian counsel at minimum) before publishing. Several sources are secondary commentary; where a point rests
> on commentary rather than the official text, it is marked **(verify)**.

## 1. What the site does (verified in code, 19 Oct 2026)

| Activity | Personal data | Who receives it |
| --- | --- | --- |
| Serving pages | IP address, user agent, requested URL, time (standard access logs) | Vercel Inc. (US), global edge network |
| Web fonts | Today: IP address and user agent sent to Google on every page (`index.html` links fonts.googleapis.com / fonts.gstatic.com). After self-hosting: none to Google | Google today; nobody after the change |
| Enquiry forms (contact page + short form on every page) | Name, email, optional company, optional phone, topics, message, page it was sent from (`source`), hidden honeypot (no personal data) | `POST /api/enquiry` on Vercel, emailed to contact@wezigns.com via Resend Inc. (US). Fallback: the visitor's own email app (`mailto:`) |
| Outbound links (Google Maps, tel:, mailto:, ChatGPT, Claude, Perplexity, Google AI Mode, Grok) | Nothing sent by Wezigns. The visitor's browser goes to the third party only when they click | The third party, under its own policy |
| Cookies, localStorage, sessionStorage, IndexedDB, analytics, ad pixels, accounts, payments | None (`grep` for `localStorage`, `sessionStorage`, `document.cookie` in `src/` and `api/`: no hits outside tests) | Nobody |

## 2. India

### 2.1 Digital Personal Data Protection Act 2023 (DPDP Act) and DPDP Rules 2025

- **Rules notified 13 November 2025** (G.S.R. 846(E)), published in the Gazette 14 November 2025. Commencement is
  phased ([AZB & Partners, 14 Nov 2025](https://www.azbpartners.com/bank/indias-digital-personal-data-protection-act-phased-rollout-and-key-compliance-milestones/);
  [SCC Online, 26 Dec 2025](https://www.scconline.com/blog/post/2025/12/26/digital-personal-data-protection-rules-2025-key-highlights/);
  [Cyril Amarchand Mangaldas client alert, Nov 2025](https://www.cyrilshroff.com/wp-content/uploads/2025/11/Client-Alert-DPDP-Rules-Nov-2025.pdf)):

| Phase | Date | What starts |
| --- | --- | --- |
| Immediate | 13 Nov 2025 | Definitions, Data Protection Board (Act ss. 18–26, 35, 38–43, 44(1),(3); Rules 1, 2, 17–21). No direct duties for businesses yet |
| 12 months | ~13 Nov 2026 (sources say 12 or 13 Nov) | Consent Manager registration (s. 6(9), Rule 4) |
| 18 months | ~13 May 2027 (sources say 12, 13 or 14 May; **verify** against the Gazette) | Everything that matters for this site: notice (s. 5, Rule 3), consent (s. 6), legitimate uses (s. 7), Data Fiduciary duties (s. 8), children (s. 9, Rule 10), rights (ss. 11–14, Rule 14), transfers (s. 16), penalties, and s. 44(2), which **omits s. 43A of the IT Act**, ending the SPDI Rules |

- **Applies to Wezigns:** yes. The Act covers digital personal data processed in India (s. 3). Wezigns decides why and
  how enquiry data is processed, so it is a **Data Fiduciary**; Vercel and Resend are **Data Processors**. It is very
  unlikely to be notified as a Significant Data Fiduciary.
- **Lawful ground for the enquiry form:** either consent (s. 6, with a notice under s. 5 / Rule 3) or the legitimate
  use in s. 7(a): data the person *voluntarily provides* for a specified purpose without indicating they do not consent.
  Commentary treats the "business card" case as the classic s. 7(a) example
  ([Mondaq, "Cracking the cookie code"](https://www.mondaq.com/cracking-the-cookie-code-digital-cookies-under-the-dpdp-act/1619518)).
  A contact form that a visitor fills in to get a reply fits s. 7(a) well. Recommended belt and braces: a one-line
  notice next to the submit button ("We use these details only to reply to you. Privacy policy.") so the purpose is
  stated at collection. **No checkbox is needed.**
- **Server logs (IP addresses):** the DPDP Act has no general "legitimate interests" ground. Security logging is
  arguably within s. 8(5) (duty to take reasonable security safeguards) and is processed by Vercel as a standard part
  of hosting. Lawyer to confirm the ground; the policy discloses it either way.
- **Notice (Rule 3, from May 2027):** must stand on its own, in clear and plain language, itemise the data and the
  purpose, and give a link to withdraw consent, exercise rights and complain to the Board
  ([dpdpa.com, Rule 3](https://dpdpa.com/dpdparules/rule3.html); [KPMG guidance, Nov 2025](https://assets.kpmg.com/content/dam/kpmgsites/in/pdf/2025/11/dpdp-rules-2025-guidance-to-dpdp-act-implementation.pdf)).
- **Data Fiduciary duties (s. 8):** accuracy where data is used to make decisions, reasonable security safeguards,
  breach notice to the Board and affected people, erase data when the purpose is served, a contract with processors,
  and **publish the business contact information of a person who can answer questions** about processing (s. 8(9)).
- **Rights and grievances (ss. 11–14, Rule 14):** access, correction, completion, erasure, grievance redressal,
  nomination. The fiduciary must publish how to make requests, and its grievance timeline; grievances must be
  answered within a reasonable period **not exceeding 90 days** (Rule 14(3))
  ([dpdpa.com, Rule 14](https://dpdpa.com/dpdparules/rule14.html); [Mondaq, Nov 2025](https://www.mondaq.com/regulatory-update-notification-of-the-digital-personal-data-protection-rules-2025/1713500)).
  A person must exhaust the fiduciary's grievance process before complaining to the Data Protection Board (s. 13(3)) **(verify)**.
- **Children:** a child is anyone under 18. Verifiable parental consent is needed before processing a child's data
  (s. 9, Rule 10), and tracking, behavioural monitoring and targeted advertising of children are prohibited
  ([KSK, child data](https://ksandk.com/md/data-protection-and-data-privacy/child-data-protection-under-dpdp-act-parental-consent-rules/)).
  This is a B2B site: say it is not meant for under-18s and that any such enquiry will be deleted.
- **Penalties:** up to ₹250 crore for failure to take reasonable security safeguards; up to ₹200 crore for breach
  notification and children's obligations **(verify Schedule figures)** ([EY, Nov 2025](https://www.ey.com/content/dam/ey-unified-site/ey-com/en-in/pdf/2025/11/dpdp-act-and-rules.pdf)).
- **Cookie banner under DPDP:** not required for this site. The Act has no cookie-specific rule; it regulates personal
  data processing. A site that sets no cookies and runs no trackers has nothing to ask consent for. If tracking or
  advertising cookies were added, commentary agrees opt-in consent with Accept / Reject / Customise would be needed,
  and s. 7 legitimate uses would not cover them
  ([CyberPeace](https://www.cyberpeace.org/resources/blogs/cookies-and-indian-law-understanding-consent-compliance-the-dpdp-framework);
  [Clickio](https://blog.clickio.com/what-is-dpdpa-india-data-protection-law-publishers/)).

### 2.2 IT Act 2000 and SPDI Rules 2011 (in force now, until s. 44(2) DPDP commences, ~May 2027)

- s. 43A IT Act and the SPDI Rules stay in force until s. 44(2) of the DPDP Act commences
  ([King Stubb & Kasiva](https://ksandk.com/data-protection-and-data-privacy/what-happens-spdi-rules-after-dpdp-enforcement/);
  [Acuity Law](https://acuitylaw.co.in/notification-of-digital-personal-data-protection-law-in-india-certain-key-timelines/)).
- **Rule 4:** a body corporate that collects personal information must publish a privacy policy on its website
  (types of data, purpose, disclosure, security practices). **Applies now.**
- **Rule 5(9):** appoint a **Grievance Officer**, publish their name and contact details on the website, and resolve
  grievances **within one month** ([CSIPR, NLIU](https://csipr.nliu.ac.in/miscellaneous/the-legal-landscape-of-grievance-officersrights-responsibilities-and-compliance/)).
- Note: the SPDI Rules' strict consent rules cover "sensitive" data (passwords, financial, health, biometrics). The
  enquiry form collects none of this.
- **IT (Intermediary Guidelines) Rules 2021:** not relevant. Wezigns' site does not host third-party content, so it is
  not an intermediary for this site. Its grievance-officer rule does not apply; the SPDI one does.

## 3. EU (Netherlands, Czech Republic) and UK

### 3.1 Cookie banner when nothing is stored

- **EU ePrivacy Art. 5(3)** (Dutch Telecommunicatiewet art. 11.7a; Czech Act 127/2005 s. 89(3)) requires consent for
  *storing or accessing information on the user's device*, unless strictly necessary. EDPB Guidelines 2/2023 (final
  Oct 2024) widen this to pixels, tracking links, fingerprinting and some IP-based tracking, but each case still needs
  storage of, or access to, information on the device
  ([Hunton, Oct 2024](https://www.hunton.com/privacy-and-cybersecurity-law-blog/edpb-adopts-guidelines-on-scope-of-eprivacy-directive)).
- **UK PECR reg. 6**, as amended by the Data (Use and Access) Act 2025 (new Schedule A1: exceptions for strictly
  necessary, statistical, appearance, communication and emergency purposes), and the ICO's storage and access
  technologies guidance ([Brodies](https://brodies.com/insights/ip-technology-and-data/storage-and-access-technologies-ico-publishes-updated-guidance-on-the-use-of-cookies-and-other-tracking-technologies/);
  [Lewis Silkin, Nov 2025](https://www.lewissilkin.com/insights/2025/11/11/ico-sets-the-record-straight-on-storage-and-access-technologies-102ltyf);
  [ICO slides, Sept 2025](https://ico.org.uk/media2/mufgyf25/mind-your-banners-the-icos-approach-to-sats.pdf)).
- **Conclusion:** this site sets no cookies and uses no local storage, pixels or fingerprinting. Fetching fonts, CSS
  and JS is normal page delivery, not storage on or reading from the device. **No consent banner is required.** A
  banner here would be misleading (it would ask consent for nothing) and is best avoided. Transparency still applies:
  the privacy policy should say plainly that no cookies are used.

### 3.2 Lawful bases (GDPR / UK GDPR Art. 6)

| Purpose | Basis |
| --- | --- |
| Reply to an enquiry, prepare a proposal | Art. 6(1)(b) steps at the person's request before a contract; otherwise 6(1)(f) legitimate interests in answering business enquiries |
| Keep enquiries for follow-up and record-keeping | 6(1)(f) |
| Access logs and security (Vercel) | 6(1)(f) security and reliable delivery |
| Defend legal claims | 6(1)(f) |

No consent checkbox is needed on the form under GDPR. Do not add marketing emails without separate opt-in (PECR /
ePrivacy rules on electronic marketing).

### 3.3 Google Fonts

- **LG München I, 20 Jan 2022, 3 O 17493/20:** embedding Google Fonts from Google's servers sent the visitor's dynamic
  IP address to Google without consent; legitimate interest failed because the fonts **can be self-hosted** without
  contacting Google; €100 damages ([Bavarian court database](https://www.gesetze-bayern.de/Content/Document/Y-300-Z-GRURRS-B-2022-N-612);
  [Otto Schmidt, Aug 2022](https://www.otto-schmidt.de/news/wirtschaftsrecht/dynamische-einbindung-von-google-fonts-in-internetseite-birgt-risiko-einer-datenschutzrechtlichen-abmahnung-2022-08-17.html)).
  First-instance German ruling, not binding elsewhere, but followed by a wave of warning letters.
- **Self-hosting removes the issue entirely:** font files served from wezigns.com (Vercel) send nothing to Google.
  The licences (SIL Open Font License for Inter, Inter Tight, Instrument Serif and JetBrains Mono) allow it.
- **Until self-hosted:** the policy would have to disclose Google as a recipient (US transfer). The draft policy is
  written for the self-hosted state, so **self-hosting must ship before the policy goes live**. Also remove the two
  `preconnect` tags in `index.html` (and every other HTML entry).

### 3.4 International transfers

- **Vercel:** certified under the EU-US Data Privacy Framework, covering EU, UK and Swiss transfers
  ([Vercel KB, updated 10 Nov 2025](https://vercel.com/kb/guide/is-vercel-certified-under-dpf)). Its DPA (effective
  31 Mar 2026) is part of its terms and uses the 2021 SCCs plus the UK Addendum ([Vercel DPA](https://vercel.com/legal/dpa)).
- **Resend:** DPA incorporated into its terms; primary processing in the US; uses EU SCCs, UK Addendum, and states DPF
  certification incl. the UK Extension ([Resend DPA, updated 31 Dec 2025](https://resend.com/legal/dpa)).
- **India to US / elsewhere under DPDP s. 16:** allowed unless the Government restricts a country by notification. No
  such list exists today **(verify at launch)**.
- **EU/UK to India:** Wezigns itself receives enquiries in India. India has no EU adequacy decision. For a visitor who
  chooses to write to an Indian company, Art. 49(1)(b) (transfer necessary for pre-contractual steps at the person's
  request) is the usual basis for the occasional enquiry. Name it in the policy.

### 3.5 EU / UK representative (Art. 27)

- GDPR applies to a non-EU business only if it **targets** people in the EU (offers goods or services) or monitors them
  (Art. 3(2)). Mere accessibility of a website, an email address or English-language content is not enough; signs of
  targeting include EU currencies, EU phone numbers, EU-specific marketing, delivery to the EU
  ([EDPB Guidelines 3/2018, via Inside Privacy](https://www.insideprivacy.com/data-privacy/edpb-adopts-final-version-of-guidelines-on-territorial-scope-of-the-gdpr/)).
- The site lists the Netherlands, Czech Republic and UK among countries served. That is evidence of serving clients
  there, so GDPR / UK GDPR may well apply to EU/UK enquirers. Treat it as applying and write the policy to GDPR standard.
- Even where Art. 3(2) applies, Art. 27(2)(a) exempts processing that is **occasional**, does not include large-scale
  special-category or criminal data, and is unlikely to risk people's rights. Business enquiries from a handful of
  EU/UK prospects fit this.
- **Check first:** `src/content/site.ts` notes Brisbane and Stoke-on-Trent offices that are "not shown until confirmed
  current". If Wezigns has a UK establishment (a UK office or entity), UK GDPR applies directly under Art. 3(1), no UK
  representative is needed, and the policy should name that office and the ICO registration (data protection fee).
  A Brisbane office would likewise give an "Australian link" under the Privacy Act. Confirm with the client.
- **Reasoned view:** no EU or UK representative is needed now. Revisit if Wezigns runs EU/UK-targeted marketing, adds
  analytics that monitor EU/UK visitors, or delivers ongoing services handling EU/UK personal data as a controller.
  (Client project work, where Wezigns is usually the *processor* for the client, is a separate contract question.)

## 4. Other countries served

| Country | Law | Likely to apply to this site? | What it changes |
| --- | --- | --- | --- |
| USA (California) | CCPA/CPRA | **No.** Applies only to for-profit businesses doing business in California that have annual gross revenue over **$26,625,000** (2025–26 figure), or handle data of 100,000+ California consumers/households, or earn 50%+ of revenue from selling/sharing data ([CPPA](https://www.cppa.ca.gov/regulations/cpi_adjustment.html)). Other state laws have similar or higher thresholds | Nothing now. State in the policy that no data is sold or shared for advertising (true, and reassuring) |
| Singapore | PDPA 2012 | Possibly, if collecting data in Singapore. Business contact information used for business purposes is largely excluded ([Mondaq](https://webiis10.mondaq.com/data-protection/1630706/singapore-pdpa-compliance-overview-and-checklist-for-businesses)) | Name a contact (DPO) for queries; the grievance officer can double up |
| UAE | Federal Decree-Law 45/2021 (PDPL) | In force since 2 Jan 2022 but Executive Regulations still not issued as of mid-2026 ([Morgan Lewis, Jun 2026](https://www.morganlewis.com/pubs/2026/06/uae-establishes-federal-authority-for-artificial-intelligence-and-data)). DIFC/ADGM have their own laws | Nothing site-specific now |
| Saudi Arabia | PDPL (Royal Decree M/19, enforced since Sept 2024) | Reaches processing of residents' data by entities abroad **(verify)** | Covered by the general rights and transfer sections |
| Australia | Privacy Act 1988 | Small business exemption (turnover under A$3m) still in place; reform tranche 2 pending ([LegalVision](https://legalvision.com.au/privacy-reforms-australia)) | Nothing now. Mention the OAIC as a complaint route |
| Thailand | PDPA B.E. 2562 | Extraterritorial for offering goods/services to people in Thailand ([Tilleke & Gibbins](https://www.tilleke.com/insights/multilaw-global-data-protection-guide-2025/4/)) | GDPR-style notice, which the policy already gives |
| Malaysia | PDPA 2010, amended 2024 (in force in stages Jan–Jun 2025: DPO, breach notice, new transfer rules) ([Mayer Brown, Jul 2025](https://www.mayerbrown.com/en/insights/publications/2025/07/from-legislative-reform-to-practical-guidance-key-amendments-to-malaysias-pdpa-and-the-launch-of-cross-border-transfer-guidelines)) | Mainly bites on organisations established or using equipment in Malaysia | Nothing site-specific |

None of these change the cookie answer: no country listed requires a banner when nothing is stored or tracked.

## 5. Recommendation on cookie consent

**No cookie banner, in India or anywhere else, for the site as it is today** (no cookies, no storage, no analytics,
fonts self-hosted). Show a short **Cookie statement** (drafted in `cookieStatement`) and a "Cookies" section in the
privacy policy instead. Link "Privacy", "Terms" and "Cookies" in the footer.

What would trigger a banner or a re-think:

| Change | EU (NL, CZ) | UK | India (DPDP, from ~May 2027) |
| --- | --- | --- | --- |
| Google Analytics, Meta/LinkedIn pixel, Hotjar, ad tags | Prior opt-in consent banner (Accept / Reject equally easy) | Consent banner (ad tags); GA possibly under the new statistical exception only with clear info and an easy opt-out, but GA's data sharing makes this risky | Opt-in consent with notice; not a s. 7 legitimate use |
| Cookieless analytics such as Vercel Web Analytics (no cookies; visitor hash from the request, discarded after 24 h, aggregated data) ([Vercel docs, updated 26 Jun 2026](https://vercel.com/docs/analytics/privacy-policy)) | Probably no banner, since nothing is stored on the device; some regulators still read Art. 5(3) widely. Disclose it, rely on legitimate interests | Fits the statistical exception; disclose and offer an opt-out | Disclose; aggregated statistics are low risk |
| Embedded YouTube/Maps iframes, chat widgets, reCAPTCHA | Usually consent (or click-to-load) | Same | Disclose; consent if tracking |
| A login area or language/theme preference cookie | Strictly necessary / appearance: no consent, but disclose | Same | Disclose |
| Remote Google Fonts (current state) | Not a cookie issue but a GDPR transfer issue (LG München): self-host | Same | Disclose Google as recipient |

## 6. Checklist for the client before launch

1. **Self-host the four fonts** and remove `fonts.googleapis.com` / `fonts.gstatic.com` from every HTML entry. The
   privacy policy text assumes this is done.
2. **Appoint a Grievance Officer** (SPDI Rule 5(9), and the DPDP s. 8(9) contact from ~May 2027). Fill in name,
   designation, email and phone. Decide whether to create **privacy@wezigns.com** or use contact@wezigns.com.
3. **Fill in CIN and GSTIN** (Companies Act s. 12(3)(c) requires the CIN on the website of every company, **verify**).
4. **Confirm the DPAs** are in place: Vercel and Resend DPAs are incorporated into their terms when the account is
   opened. Keep a copy of each with the date; check the Vercel account is the company's, not a personal one.
5. **Set a retention period** for enquiry emails (draft says 24 months unless the person becomes a client), and set up
   a calendar reminder or mailbox rule to delete old enquiries. Confirm how long Resend keeps sent-email logs and
   whether that can be shortened.
6. **Add a one-line notice** beside each form's submit button linking to the privacy policy.
7. **Write an internal process** for rights requests and grievances: who answers, within one month (meets SPDI,
   GDPR, and the 90-day DPDP cap).
8. **Breach plan:** who tells the Data Protection Board and affected people (DPDP, from ~May 2027), CERT-In (6-hour
   cyber incident reporting under the 2022 directions, **verify scope**), and EU/UK authorities if relevant.
9. **Keep the policies in step with the code.** Any new script, embed, analytics or cookie means updating the
   policy and checking section 5 first.
10. **Confirm the Brisbane and Stoke-on-Trent offices** (see 3.5). A live UK office changes the UK position (ICO fee,
    UK GDPR directly) and should be named in the policy.
11. **Lawyer review** of all three drafts, the governing law/jurisdiction clause and the liability cap. Re-review
    before ~13 May 2027 when the main DPDP duties start.

## 7. Placeholders in `src/content/legal.ts`

`[Grievance Officer name]`, `[Designation]`, `[CIN]`, `[GSTIN]`, `privacy@wezigns.com [confirm]`, `24 months [confirm]`,
and the `reviewNote`. Search the file for `[` to find them all.
