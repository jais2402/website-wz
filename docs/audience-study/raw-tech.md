# Raw responses: technical evaluators (`tech`), 40 people

Segment: IT heads and IT managers at SMEs, CTOs of small product companies, technical co-founders, solution
architects evaluating an outsourced build partner, and freelance consultants shortlisting vendors for clients.
Tech comfort is high for everyone. "Sceptic" marks the people who arrived doubtful (14 of 40).
Every reaction is based on what the site actually says (`src/content/site.ts`, `src/content/pages.ts`) and the
site facts in `brief.md`.

---

## India (20)

### TECH-01: IT Head, auto-components manufacturer
- **Profile:** 600 employees · manufacturing · Chennai (Ambattur) · 45–54 · tech high · desktop, office fibre · Sceptic: no
- **Trigger / arrival:** production and stock tracked in Excel across two plants; Google "custom ERP company Chennai".
- **First 10 seconds:** "Custom software for businesses that have outgrown spreadsheets." Clear. Understood: yes. Stays, though he waits out the preloader with mild impatience.
- **Path:** hero → story → services → systems explorer (Operations tab, OEE gauge) → "Explore Operations & supply chain" page → Pricing → FAQ → contact.
- **Reaction & opinion:** The Operations page pains ("We bought a machine part we already had in the other warehouse") are his plant word for word. Likes "Can you take over software another company built?" and that the office is 20 minutes away. Finds the 3D pretty but irrelevant. Rating **7/10**.
- **Black box:** what stack they build in (will it be something his two in-house developers can maintain?); team size; what the support contract looks like after launch.
- **Expected but missing:** tech stack; support/SLA terms; a manufacturing case study (Production module is demo data only).
- **Outcome:** **contact** (phones the Chennai number). Would have been faster with a stated stack and a sample AMC/support scope.

### TECH-02: CTO, HR-tech SaaS startup
- **Profile:** 35 employees · B2B SaaS · Bengaluru · 30–34 · tech high · desktop MacBook Pro, office Wi-Fi · Sceptic: yes
- **Trigger / arrival:** needs extra build capacity for a payroll module; a LinkedIn post shared by an ex-colleague.
- **First 10 seconds:** "An agency with a fancy WebGL hero." Understood: yes (custom software). Stays to check depth.
- **Path:** hero → opens DevTools (network tab, notices a few hundred KB of JS plus three.js chunk) → services → People & workforce page → FAQ → leaves.
- **Reaction & opinion:** The loom is well made and he respects the craft, but "Payroll: salaries, deductions and payslips worked out from attendance" is sales copy, not engineering. Nothing on languages, frameworks, testing, CI, code review. Rating **4/10**.
- **Black box:** who writes the code and how senior they are; whether code and repos are his from day one.
- **Expected but missing:** stack, GitHub org, engineering blog, team page, IP/code ownership statement.
- **Outcome:** **leave.** "One paragraph on how you build, with the actual stack, would have kept me."

### TECH-03: IT Manager, regional logistics company
- **Profile:** 220 employees · logistics · Mumbai · 35–44 · tech high · phone (mid-range Android, 4G Jio, patchy) · Sceptic: no
- **Trigger / arrival:** wants driver proof-of-delivery app tied to their dispatch sheet; Google "logistics software development company India".
- **First 10 seconds:** preloader, then the site drops to lite mode; line art instead of 3D. Reads the sub-line and gets "custom software". Understood: partly (unsure if they do mobile apps).
- **Path:** hero → story (line art) → services ("Mobile-first web apps and websites") → Work card deck → FAQ → bookmarks.
- **Reaction & opinion:** Copy is clear and short; the line-art story looks "unfinished, like a wireframe". "Mobile-first web apps" makes him unsure whether they build native Android apps. Industry page Logistics module ("proof of delivery and live tracking") he never reaches. Rating **5/10**.
- **Black box:** native vs web app; offline support for drivers.
- **Expected but missing:** a logistics case study with an app screenshot; a WhatsApp button.
- **Outcome:** **bookmark-later.** A plain "Android / iOS apps: yes" line under services.

### TECH-04: Solution Architect, NBFC (lending)
- **Profile:** 800 employees · financial services · Pune · 35–44 · tech high · desktop, corporate network · Sceptic: yes
- **Trigger / arrival:** evaluating partners for a loan-origination portal; name came from a vendor list compiled by procurement.
- **First 10 seconds:** "Generic SME software shop with good motion design." Understood: yes. Stays only to check security.
- **Path:** hero → Story "Secure" step → FAQ "How do you handle security?" → footer → Industry systems page (Lending) → leaves.
- **Reaction & opinion:** "Security is built into the first version, then reviewed and maintained after launch" is, in his words, "a sentence, not a practice". The Lending module line ("KYC, approvals and disbursal with a full audit trail") is fine but there is no evidence of any regulated-sector work. Rating **3/10**.
- **Black box:** VAPT, ISO 27001, RBI data-localisation, encryption, access control; who audits the code.
- **Expected but missing:** certifications, security page, a BFSI case study, sample DPA/NDA.
- **Outcome:** **leave.** An ISO 27001 badge or a published security practices page would have put them on the RFP list.

### TECH-05: Technical co-founder, D2C apparel brand
- **Profile:** 40 employees · D2C ecommerce · Gurugram · 25–29 · tech high · desktop, home broadband · Sceptic: no
- **Trigger / arrival:** Shopify store plus warehouse sheets; wants custom order/stock sync; Google "Shopify custom integration agency India".
- **First 10 seconds:** "Custom systems, they mention spreadsheets, that is us." Understood: yes.
- **Path:** hero → Before/after slider → Ecommerce page (Shopify, Razorpay, Klaviyo listed) → Work (marketplace 300 → 4,500 sellers) → Pricing → contact form.
- **Reaction & opinion:** Loves the before/after slider and "We sold an item online that was already sold in the shop". The Ecommerce tools list matches his stack exactly. Notes the form opened Gmail rather than submitting; fine for him. Rating **7/10**.
- **Black box:** price band; whether they build on top of Shopify or replace it.
- **Expected but missing:** a rough price range; Shopify app / API integration detail.
- **Outcome:** **contact** (sends the pre-filled email). A ballpark ("ecommerce integrations usually start from X") would have saved a call.

### TECH-06: IT Head, multi-specialty hospital chain
- **Profile:** 900 employees · healthcare · Hyderabad · 45–54 · tech high · desktop, older office PC with integrated graphics behind a proxy · Sceptic: no
- **Trigger / arrival:** looking at replacing a patchwork appointment/billing setup; Google "hospital management custom software".
- **First 10 seconds:** the hero stutters, then the frame-rate watchdog switches to lite mode. Understood: partly ("software for... businesses?"). Stays because of the healthcare search.
- **Path:** hero → services → systems explorer (Industry tab, "Patients / day 420") → Industry systems page → leaves to bookmark.
- **Reaction & opinion:** Healthcare gets one line ("Appointments, patient records and billing for clinics and diagnostic centres"). The demo numbers look like real dashboards until he spots they are illustrative. No mention of ABDM, HL7/FHIR, or patient-data handling. Rating **4/10**.
- **Black box:** health-data security; where patient data is hosted; any hospital they have actually served.
- **Expected but missing:** healthcare case study, interoperability standards, compliance statement.
- **Outcome:** **bookmark-later.** One real healthcare deployment, even anonymised.

### TECH-07: Freelance IT consultant (shortlisting for a textile exporter)
- **Profile:** solo consultant · client is a 250-person exporter in Tiruppur · Coimbatore · 35–44 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** client wants an export-order and production-tracking system; Google "custom software Chennai SME".
- **First 10 seconds:** "Chennai custom software studio since 2012." Understood: yes.
- **Path:** hero → Proof stats → Work (all 4 cards, then earlier systems) → Process → Pricing → About (via footer) → bookmarks.
- **Reaction & opinion:** Process "Four stages. No surprises." is something he can paste into his vendor comparison. But he has to give his client references, and every case study is anonymous; earlier systems have no results at all. Rating **6/10**.
- **Black box:** who the clients are; can he call one; team size for a 6-month build.
- **Expected but missing:** client names or a reference-on-request line; team page; a downloadable capability deck.
- **Outcome:** **bookmark-later** (adds to shortlist with "references TBC"). A "references available on request" line plus a PDF one-pager.

### TECH-08: CTO, edtech product company
- **Profile:** 120 employees · edtech · Bengaluru · 35–44 · tech high · desktop, office fibre · Sceptic: yes
- **Trigger / arrival:** considering outsourcing an admin portal; saw a Wezigns mention in a Slack community.
- **First 10 seconds:** two seconds of "Untangling the threads" preloader, then a heavy hero. "Frontend showpiece." Understood: yes.
- **Path:** hero → runs a quick Lighthouse pass in DevTools (performance hurt by the preloader and JS weight; he notes reduced-motion is respected) → services → Education module → leaves.
- **Reaction & opinion:** Credits the reduced-motion handling and lite mode. But for a back-office portal he wants to see backend and data work, and the site only proves they can do WebGL. "A studio that ships a 400 KB marketing site is telling me what it optimises for." Rating **4/10**.
- **Black box:** backend stack, database choices, testing culture.
- **Expected but missing:** architecture write-ups, technical blog, GitHub.
- **Outcome:** **leave.** A short technical case study (architecture diagram, stack, load numbers) on the Singapore project.

### TECH-09: IT Manager, FMCG distributor
- **Profile:** 150 employees · distribution · Chennai · 35–44 · tech high · phone (Pixel, home Wi-Fi) · Sceptic: no
- **Trigger / arrival:** Wezigns built their old dealer portal around 2016; clicked an old wezigns.com link saved in his notes.
- **First 10 seconds:** "They redesigned, looks expensive now." Understood: yes. Recognises the company name and phone number.
- **Path:** hero (3D runs on the Pixel) → Revenue & customers via explorer → "Partner portals" module → contact page → taps the phone number.
- **Reaction & opinion:** Reassured the address and phone are unchanged. Partner portals module is exactly his need. The pinned scrolling on the phone feels long. Rating **7/10**.
- **Black box:** whether the same people still work there.
- **Expected but missing:** team names; WhatsApp contact.
- **Outcome:** **contact** (calls). Nothing would have changed it; the existing relationship decided it.

### TECH-10: Solution Architect, mid-size IT services firm
- **Profile:** 1,000 employees · IT services · Noida · 35–44 · tech high · desktop · Sceptic: yes
- **Trigger / arrival:** looking for a subcontractor for a portal workload; Google "custom software subcontractor India".
- **First 10 seconds:** "Small studio selling to business owners, not to us." Understood: yes.
- **Path:** hero → Proof ("20+ products shipped") → services → FAQ → footer looking for Careers / Team → leaves.
- **Reaction & opinion:** 20+ products in 12 years reads small. No team size, no seniority mix, no stack, no careers page to infer headcount. Rating **3/10**.
- **Black box:** headcount, how many engineers are senior, bench strength.
- **Expected but missing:** team page, careers, stack, partner programme.
- **Outcome:** **leave.** A "team: N engineers, X senior" line.

### TECH-11: IT Head, group of CBSE schools
- **Profile:** 300 employees · education · Kochi · 45–54 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** fee collection and admissions are on three different tools; Google "school ERP custom development Kerala".
- **First 10 seconds:** "Business systems company." Understood: yes.
- **Path:** hero → explorer (Industry tab: "Students 3200") → Industry page Education module → earlier systems (Education portal) → Pricing → bookmarks.
- **Reaction & opinion:** "I enter the same patient, student or guest details in three systems" lands. Earlier Education portal is reassuring but has no results. Wants to know if Razorpay fee collection with UPI is standard. Rating **6/10**.
- **Black box:** cost; whether parents' data is hosted in India.
- **Expected but missing:** education case study with numbers; hosting region.
- **Outcome:** **bookmark-later** (to bring to the trust board). A price range for a school system.

### TECH-12: Technical co-founder, proptech startup
- **Profile:** 15 employees · property · Ahmedabad · 25–29 · tech high · phone (iPhone 13, 4G) · Sceptic: yes
- **Trigger / arrival:** wants an MVP partner; LinkedIn sponsored post.
- **First 10 seconds:** preloader, then a dark 3D scene with small glass text. Understood: partly ("design agency? software?").
- **Path:** hero → story → stops at the About page headline after the footer link: "The leading systems and custom software provider for SMEs and MSMEs." → leaves.
- **Reaction & opinion:** "Leading according to whom?" No awards, no reviews, no client logos to back the claim. Thinks the claim hurts more than helps. Rating **3/10**.
- **Black box:** proof behind "leading"; who the founders are.
- **Expected but missing:** Clutch/GoodFirms reviews, founder page, MVP pricing.
- **Outcome:** **leave.** Drop "leading" or back it with independent reviews.

### TECH-13: IT Manager, pump manufacturer
- **Profile:** 400 employees · manufacturing · Coimbatore · 35–44 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** previous vendor left a half-documented PHP system; Google "take over existing software maintenance company".
- **First 10 seconds:** "Custom software, they host and maintain." Understood: yes.
- **Path:** hero → services ("Keep it running: hosting, monitoring, support, maintenance") → FAQ → "Can you take over software another company built? … starts with a code and hosting review" → contact form ("A vendor review" topic).
- **Reaction & opinion:** That FAQ answer and the "A vendor review" enquiry topic are exactly his problem. Plain, honest tone. Rating **8/10**.
- **Black box:** what the code review costs and produces; response times once they maintain it.
- **Expected but missing:** a sample review report; support SLA tiers.
- **Outcome:** **contact** (email via mailto). A fixed-fee "code and hosting review" offer would have made it instant.

### TECH-14: CTO, invoice-financing fintech
- **Profile:** 60 employees · fintech · Chennai · 35–44 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** wants AI document extraction for invoices; Google "AI document processing company Chennai".
- **First 10 seconds:** "Custom systems, now AI." Understood: yes.
- **Path:** hero → AI demo section (cream panel) → AI page (Document processing, "Every AI action is logged") → Finance page (Inscribe listed) → bookmarks.
- **Reaction & opinion:** The guardrails ("A person signs off", "Everything is logged") are the right instincts. But nothing on which models, whether inference runs in their VPC, evaluation metrics, or accuracy on real documents. Rating **6/10**.
- **Black box:** model providers, where documents go, retention.
- **Expected but missing:** an AI case study with accuracy numbers; data-flow diagram.
- **Outcome:** **bookmark-later.** One AI project with measured results.

### TECH-15: IT Head, boutique hotel group
- **Profile:** 250 employees · hospitality · Goa · 45–54 · tech high · tablet (iPad, hotel Wi-Fi) · Sceptic: no
- **Trigger / arrival:** wants channel-manager + PMS integration; referral from a hotelier friend.
- **First 10 seconds:** 3D loads slowly on hotel Wi-Fi. Understood: yes after the sub-line.
- **Path:** hero → explorer (Industry tab, "Rooms occupied 86%") → Industry page → Integrations ("Maps", "Payments") → bookmarks.
- **Reaction & opinion:** Property & hotels module is one line. No mention of channel managers, OTAs or PMS integrations; "the legacy database nobody wants to touch" makes him smile. Rating **5/10**.
- **Black box:** hospitality integrations they have actually built.
- **Expected but missing:** named integrations beyond the 13 tools; hotel case study.
- **Outcome:** **bookmark-later.** A list of real integrations built (by system name).

### TECH-16: Solution Architect, pharma distributor
- **Profile:** 700 employees · pharma distribution · Mumbai · 35–44 · tech high · desktop · Sceptic: yes
- **Trigger / arrival:** needs a dealer portal integrated with SAP; vendor shortlist from a peer.
- **First 10 seconds:** "Custom software, pretty site." Understood: yes.
- **Path:** hero → Integrations ("Finance tools, Sales & CRM, Operations systems… Legacy databases") → tools strip → FAQ → leaves.
- **Reaction & opinion:** Integrations are categories, not systems. SAP, Salesforce, Tally, Zoho are not named; the tools strip is Shopify, Mailchimp and the like. Concludes they are SME-scale, not enterprise-integration. Rating **4/10**.
- **Black box:** whether they have ever integrated an ERP.
- **Expected but missing:** named ERP/CRM integrations, API approach (REST, middleware, queues).
- **Outcome:** **leave.** "SAP" in the integrations list with one example.

### TECH-17: IT Manager, chartered accountancy and advisory firm
- **Profile:** 80 employees · professional services · Chennai · 35–44 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** client-document portal tied to Tally; Google "client portal development Chennai".
- **First 10 seconds:** "Business portals and systems." Understood: yes.
- **Path:** hero → services ("Customer & partner portals") → Finance & governance page ("Audit: every change and approval logged") → FAQ → contact page.
- **Reaction & opinion:** Finance page speaks his clients' language ("GST reconciliation" in the demo list). Tally not named, which he notes, but being local he'd rather ask. Rating **6/10**.
- **Black box:** Tally integration experience; document storage location.
- **Expected but missing:** Tally/Zoho Books named; booking calendar for a call.
- **Outcome:** **contact** (email). A calendar link instead of "we reply within one working day".

### TECH-18: Freelance consultant (shortlisting for a US client)
- **Profile:** solo consultant · client is a 90-person US logistics broker · Bengaluru · 30–34 · tech high · desktop · Sceptic: yes
- **Trigger / arrival:** client wants an India build partner with code they can audit; Google "custom software company India case studies".
- **First 10 seconds:** "Nice WebGL, light on facts." Understood: yes.
- **Path:** hero → Work → footer (looking for GitHub, blog) → About → leaves.
- **Reaction & opinion:** His client requires a code sample and a named reference before a call. There is neither. "I can't send my client a link that says trust us." Rating **4/10**.
- **Black box:** code quality; IP assignment; US-time-zone overlap.
- **Expected but missing:** GitHub/open-source, code samples on request, IP clause, time-zone statement.
- **Outcome:** **leave.** A public repo or "sample code and a reference call on request".

### TECH-19: CTO, freight-tech startup
- **Profile:** 25 employees · logistics SaaS · Hyderabad · 30–34 · tech high · phone (Galaxy S24, 5G) · Sceptic: no
- **Trigger / arrival:** saw the site shared on X as a "cool Indian studio site".
- **First 10 seconds:** 3D runs smoothly. "Custom software studio, wow hero." Understood: yes.
- **Path:** hero → story → Work deck (Singapore 40,000 requests/min) → Process → bookmarks.
- **Reaction & opinion:** Genuinely impressed by the loom and that it runs on a phone. The Singapore "40,000 requests a minute at peak" and "Zero unplanned downtime" make him curious, but there is no architecture behind the number. Rating **6/10**.
- **Black box:** how they got 40k req/min; what the stack was.
- **Expected but missing:** technical write-up of that project.
- **Outcome:** **bookmark-later.** The Singapore case as an engineering post.

### TECH-20: IT Head, apparel retail chain
- **Profile:** 500 employees · retail · Kolkata · 45–54 · tech high · desktop (low-spec office PC, Chrome) · Sceptic: no
- **Trigger / arrival:** POS across 40 stores doesn't talk to accounts; Google "retail POS custom software India".
- **First 10 seconds:** stutter, then lite mode. Understood: partly (needs the services section to be sure).
- **Path:** hero (lite) → services → Industry page ("Retail POS: point of sale tied to stock and accounts") → Ecommerce page → bookmarks.
- **Reaction & opinion:** Copy is relevant ("Online and shop stock disagree"). Lite line art looks cheap after the promise of a 3D site. Wants to know about offline POS in stores with bad internet. Rating **5/10**.
- **Black box:** offline capability; hardware integration (printers, scanners).
- **Expected but missing:** retail case study with store count; POS hardware notes.
- **Outcome:** **bookmark-later.** A retail chain reference.

## Singapore / Malaysia (6)

### TECH-21: IT Manager, events and MICE company
- **Profile:** 90 employees · events · Singapore · 35–44 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** wants a shared event and vendor record; Google "event management system developer Singapore".
- **First 10 seconds:** "Custom systems, they have a Singapore tourism project." Understood: yes.
- **Path:** hero → Work (Singapore tourism: "Data stays in-country", "Zero unplanned downtime") → Countries globe (Singapore arc) → Process → contact form.
- **Reaction & opinion:** The tourism case is close to his own business, and "Data stays in-country" answers the PDPA question before he asks. Rating **8/10**.
- **Black box:** support hours in SGT; whether they have local presence.
- **Expected but missing:** SGT support hours; a contact person's name.
- **Outcome:** **contact.** Already convinced; a named account lead would make it warmer.

### TECH-22: CTO, logistics SaaS
- **Profile:** 45 employees · SaaS · Singapore · 35–44 · tech high · phone (iPhone 15, MRT 5G) · Sceptic: yes
- **Trigger / arrival:** board asked him to price offshore development; LinkedIn ad.
- **First 10 seconds:** "Indian dev shop, very polished." Understood: yes.
- **Path:** hero → Pricing ("Priced on outcomes, not hours") → FAQ → leaves.
- **Reaction & opinion:** He wants a dedicated-team model he controls, not fixed-price outcomes. Nothing on IP assignment, governing law, or engineers' seniority. The long pinned scroll on mobile tests his patience. Rating **4/10**.
- **Black box:** IP and contract terms; team composition.
- **Expected but missing:** engagement models (dedicated team / T&M), IP clause, team page.
- **Outcome:** **leave.** A "how we contract" section (IP, law, models).

### TECH-23: Solution Architect, insurance broker
- **Profile:** 600 employees · insurance · Kuala Lumpur · 35–44 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** evaluating a partner for an agent portal; referral from a Malaysian peer.
- **First 10 seconds:** "Custom software, hosts on AWS/GCP." Understood: yes.
- **Path:** hero → services → Revenue page (Partner portals; Hosted on AWS, Google Cloud) → Countries (Malaysia) → FAQ security → bookmarks.
- **Reaction & opinion:** Partner-portal fit is good. Malaysia appears on the globe but there is no Malaysian case. Hosting just says "AWS, Google Cloud"; he needs data in the KL/Johor region and BNM-aligned controls. Rating **5/10**.
- **Black box:** region of hosting; security controls; DR.
- **Expected but missing:** hosting regions, backup/DR, security documentation.
- **Outcome:** **bookmark-later.** "We host in the client's chosen region" plus a security overview PDF.

### TECH-24: IT Head, electronics contract manufacturer
- **Profile:** 350 employees · manufacturing · Penang · 45–54 · tech high · phone (Android, 4G) · Sceptic: no
- **Trigger / arrival:** shop-floor tracking; Google search on the move.
- **First 10 seconds:** lite mode on his phone; line art. Understood: partly.
- **Path:** hero → story → services → Operations explorer (stepped scroll) → bookmarks to read on desktop.
- **Reaction & opinion:** Production OEE module is relevant; demo numbers in ₹ feel India-only. Says he'll look properly on his PC. Rating **5/10**.
- **Black box:** experience with factories outside India.
- **Expected but missing:** manufacturing case study; non-INR examples.
- **Outcome:** **bookmark-later.** A factory case outside India.

### TECH-25: Technical co-founder, payments startup
- **Profile:** 12 employees · fintech · Singapore · 25–29 · tech high · desktop, keyboard-heavy user · Sceptic: yes
- **Trigger / arrival:** shortlisting dev partners; Google "Singapore India software outsourcing".
- **First 10 seconds:** custom cursor ring and moving guide light. Understood: partly ("a creative studio?").
- **Path:** hero → tries Tab through the page (pinned sections make focus jump around) → services → leaves.
- **Reaction & opinion:** Considers the motion-heavy site a signal of style over substance; finds the custom cursor and scroll-jacking annoying. Doesn't trust a payments build to a studio whose main proof is a 3D hero. Rating **3/10**.
- **Black box:** PCI-DSS experience; security practices.
- **Expected but missing:** security/compliance page, accessibility statement.
- **Outcome:** **leave.** A plain, fast "for engineers" page with stack and security.

### TECH-26: Freelance consultant (shortlisting for an F&B group)
- **Profile:** solo consultant · client has 30 outlets · Singapore · 45–54 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** client wants inventory + central kitchen system; Google "custom inventory system Asia".
- **First 10 seconds:** "Custom software, priced on outcomes." Understood: yes.
- **Path:** hero → Before/after → Operations page → Pricing → Process → contact form.
- **Reaction & opinion:** "One price and one timeline, agreed before any building starts" is exactly what his client wants. Fine with anonymised cases at shortlist stage. Rating **6/10**.
- **Black box:** what the Understand/Shape stages cost, if anything.
- **Expected but missing:** whether discovery is paid; references.
- **Outcome:** **contact.** Saying whether the Shape stage is free or paid.

## UK / Netherlands / Czech Republic (6)

### TECH-27: CTO, property-management software
- **Profile:** 70 employees · proptech · Manchester · 35–44 · tech high · desktop · Sceptic: yes
- **Trigger / arrival:** offshore team for a tenant portal; Google "offshore development partner India UK".
- **First 10 seconds:** "Polished Indian studio." Understood: yes.
- **Path:** hero → Countries (UK on the globe) → FAQ → footer (looking for privacy policy / GDPR) → leaves.
- **Reaction & opinion:** UK appears on the globe but no UK case, no UK entity, no mention of GDPR or a DPA. Rating **4/10**.
- **Black box:** GDPR, data processing, UK working-hours overlap.
- **Expected but missing:** GDPR statement, privacy policy, UK contact.
- **Outcome:** **leave.** A short GDPR/DPA paragraph and UK hours.

### TECH-28: IT Manager, food wholesaler
- **Profile:** 180 employees · wholesale · Rotterdam · 45–54 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** B2B order portal integrated with Exact Online; referral from a Dutch peer who mentioned Wezigns.
- **First 10 seconds:** "Custom systems; they work in the Netherlands." Understood: yes.
- **Path:** hero → Work (B2B marketplace) → Integrations → Countries (Netherlands) → bookmarks.
- **Reaction & opinion:** B2B marketplace case is relevant. Exact Online not named; only English. Rating **5/10**.
- **Black box:** EU hosting; integration with Dutch accounting tools.
- **Expected but missing:** Dutch client example, EU hosting statement.
- **Outcome:** **bookmark-later.** Confirmation of EU data hosting.

### TECH-29: Solution Architect, industrial group
- **Profile:** 900 employees · manufacturing · Brno · 35–44 · tech high · desktop · Sceptic: yes
- **Trigger / arrival:** comparing nearshore (Poland/Romania) against India for a maintenance portal; consultant's longlist.
- **First 10 seconds:** a 3D loom with glowing threads. "Is this a creative or VFX studio?" Understood: no, until he scrolls to services.
- **Path:** hero → services → FAQ → About → leaves.
- **Reaction & opinion:** Needs ISO 27001 and GDPR compliance for procurement; neither is mentioned. Czech Republic on the globe surprises him, but with no evidence. Rating **4/10**.
- **Black box:** certifications; who the Czech client is.
- **Expected but missing:** ISO 27001, GDPR, team page, references in EU.
- **Outcome:** **leave.** Certifications listed on About.

### TECH-30: Technical co-founder, charity-tech
- **Profile:** 20 employees · non-profit tech · London · 30–34 · tech high · phone (iPhone, 4G) · Sceptic: no
- **Trigger / arrival:** donation platform rebuild; Google "fundraising platform developer".
- **First 10 seconds:** "Custom software studio." Understood: yes.
- **Path:** hero → Work deck → earlier systems (Fundraising platform) → FAQ → bookmarks.
- **Reaction & opinion:** The fundraising card is relevant but has no results or details (Gift Aid? Stripe?). Mobile Work deck is nice. Rating **6/10**.
- **Black box:** what the fundraising platform actually did; UK payment specifics.
- **Expected but missing:** details/results on the fundraising work.
- **Outcome:** **bookmark-later.** Two lines of results on that card.

### TECH-31: IT Manager, engineering consultancy
- **Profile:** 140 employees · engineering · Stoke-on-Trent · 45–54 · tech high · phone (Android, office Wi-Fi) · Sceptic: no
- **Trigger / arrival:** old wezigns.com bookmark that listed a Stoke-on-Trent office; wants project-tracking portal.
- **First 10 seconds:** "Same company, new site." Understood: yes. Notices only the Chennai address.
- **Path:** hero → contact page (looks for UK office) → Process → contact form.
- **Reaction & opinion:** Mildly confused that the Stoke office has gone. Still prefers a known vendor. Rating **6/10**.
- **Black box:** whether there is still a UK presence.
- **Expected but missing:** UK office/contact.
- **Outcome:** **contact** (email). A clear line on UK presence.

### TECH-32: Freelance consultant (accessibility-minded, shortlisting for a client)
- **Profile:** solo consultant · client is a 300-person Dutch logistics firm · Amsterdam · 35–44 · tech high · desktop, screen-reader spot checks · Sceptic: yes
- **Trigger / arrival:** client must meet the European Accessibility Act; Google "custom portal development partner".
- **First 10 seconds:** dark 3D hero, small text in frosted glass. Understood: partly.
- **Path:** hero → keyboard/VoiceOver spot check → services → FAQ → leaves.
- **Reaction & opinion:** Reduced motion is respected and lite mode exists (credit), but the custom cursor, pinned scroll sections and small grey-on-dark labels make her doubt their accessibility practice. No accessibility statement. Rating **3/10**.
- **Black box:** WCAG conformance of what they build.
- **Expected but missing:** accessibility statement; WCAG in the process.
- **Outcome:** **leave.** An accessibility statement and WCAG 2.2 AA in "How we build".

## Australia / US (4)

### TECH-33: CTO, construction-tech
- **Profile:** 50 employees · construction SaaS · Brisbane · 35–44 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** knew of a Brisbane office from the old site; wants extra capacity for a site-inspection app.
- **First 10 seconds:** "Custom software, Chennai HQ." Understood: yes.
- **Path:** hero → Countries (Australia) → Work → About → bookmarks.
- **Reaction & opinion:** No Brisbane office shown. AEST overlap and how they would collaborate in his sprints are unclear. Rating **5/10**.
- **Black box:** working model with an in-house team; time zones.
- **Expected but missing:** local presence, team augmentation option.
- **Outcome:** **bookmark-later.** Saying whether they can join an existing team's sprints.

### TECH-34: IT Director, US non-profit
- **Profile:** 120 employees · non-profit · Chicago · 45–54 · tech high · desktop · Sceptic: yes
- **Trigger / arrival:** donor CRM replacement; Google "fundraising CRM custom development offshore".
- **First 10 seconds:** "Overseas studio." Understood: yes.
- **Path:** hero → FAQ → footer → leaves.
- **Reaction & opinion:** His board requires SOC 2 and a US-law contract. Not mentioned anywhere. Preloader + heavy hero on his work laptop felt slow. Rating **3/10**.
- **Black box:** SOC 2, insurance, contract jurisdiction.
- **Expected but missing:** compliance page, US references.
- **Outcome:** **leave.** SOC 2 or a security questionnaire offer.

### TECH-35: Technical co-founder, early SaaS
- **Profile:** 8 employees · SaaS · Austin · 30–34 · tech high · phone (iPhone, LTE) · Sceptic: no
- **Trigger / arrival:** wants 2 contract developers; Reddit thread on Indian dev shops.
- **First 10 seconds:** preloader then 3D threads; scrolls fast. Understood: no ("some design agency").
- **Path:** hero → story → skims to Pricing → leaves.
- **Reaction & opinion:** Wanted hourly rates or monthly per-developer pricing; "Priced on outcomes" is the opposite of what he needs. Rating **4/10**.
- **Black box:** rates.
- **Expected but missing:** staff-augmentation / rates.
- **Outcome:** **leave.** Not a fit; a clear "we don't do staff augmentation" would have saved time.

### TECH-36: Solution Architect, homewares retailer
- **Profile:** 400 employees · retail · Sydney · 35–44 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** Shopify Plus plus custom fulfilment; Google "Shopify integration partner offshore".
- **First 10 seconds:** "Custom systems incl. ecommerce." Understood: yes.
- **Path:** hero → Ecommerce page → Work (marketplace) → Integrations → bookmarks.
- **Reaction & opinion:** Ecommerce page is well structured ("Orders land in the system the moment they are paid"). Would like to see Shopify Plus/Flow experience and an Australian client. Rating **6/10**.
- **Black box:** depth of Shopify experience; Australian GST/Afterpay handling.
- **Expected but missing:** Shopify partner status; AU case.
- **Outcome:** **bookmark-later.** Shopify Partner badge.

## UAE (4)

### TECH-37: IT Manager, safety training provider
- **Profile:** 200 employees · training · Dubai · 35–44 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** spreadsheets and WhatsApp for trainer scheduling; Google "training management system Dubai".
- **First 10 seconds:** "Custom systems, they've done safety training in Dubai." Understood: yes.
- **Path:** hero → Work (Dubai safety training: −80% admin, 100,000+ certifications) → People page (Training module) → Pricing → contact form.
- **Reaction & opinion:** The case study reads like his business. Numbers are specific. Rating **8/10**.
- **Black box:** UAE hosting; Arabic support.
- **Expected but missing:** Arabic interface mention; a UAE contact number.
- **Outcome:** **contact.** Already decided; a UAE number would help.

### TECH-38: CTO, proptech
- **Profile:** 30 employees · property · Dubai · 30–34 · tech high · phone (iPhone 15 Pro, 5G) · Sceptic: yes
- **Trigger / arrival:** LinkedIn ad.
- **First 10 seconds:** "3D studio... custom software." Understood: partly.
- **Path:** hero → Work deck → Countries → bookmarks.
- **Reaction & opinion:** Two Dubai cases, but anonymous: "Anyone can write '−80%'." Smooth on his phone. Rating **5/10**.
- **Black box:** who the clients are.
- **Expected but missing:** client names/logos, testimonials.
- **Outcome:** **bookmark-later.** One named client or a video testimonial.

### TECH-39: IT Head, engineering contractor
- **Profile:** 700 employees · construction/engineering · Abu Dhabi · 45–54 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** project-control portal; government entities require UAE data residency; Google search.
- **First 10 seconds:** "Custom software." Understood: yes.
- **Path:** hero → Work (engineering event on AWS) → System pages ("Hosted on AWS, Google Cloud") → FAQ → leaves.
- **Reaction & opinion:** Needs UAE-region hosting and NESA/ISR alignment; site doesn't address residency except for Singapore. Rating **4/10**.
- **Black box:** hosting region, compliance with UAE standards.
- **Expected but missing:** data residency statement, UAE presence.
- **Outcome:** **leave.** "We host in your country's cloud region" stated explicitly.

### TECH-40: Solution Architect, logistics and freight forwarding
- **Profile:** 300 employees · logistics · Sharjah · 35–44 · tech high · desktop · Sceptic: no
- **Trigger / arrival:** customs-document portal with OCR; referral from TECH-37's peer network.
- **First 10 seconds:** "Custom systems and AI." Understood: yes.
- **Path:** hero → AI page (Document processing: "Upload → Read & check → Into your system") → Integrations ("Government portals") → Process → contact form.
- **Reaction & opinion:** "Government portals" and document processing match his need. The mailto form opened Outlook, which he found old-fashioned but workable. Rating **7/10**.
- **Black box:** experience with UAE customs/government APIs.
- **Expected but missing:** a document-AI case study.
- **Outcome:** **contact.** A real form with confirmation instead of mailto.
