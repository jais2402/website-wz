# Tools we connect to: research (Oct 2026)

Source for `src/content/systemTools.ts`. Goal: replace the thin "Tools we use" lists on the six system pages with
the tools SME buyers in India, the Gulf, South-East Asia, the UK, EU and Australia actually run, so a visitor sees
their own tools named. The audience study (`docs/audience-study/summary.md`) found about 26 of 200 prospects
looked for Tally, Zoho, GST e-invoicing / e-way bill, PF/ESI, biometrics, SAP or WhatsApp and did not find them.
"Tally" was the single most-missed word for Indian buyers.

## Competitors and peers reviewed

| Firm | Market | URL | Tools they name |
|---|---|---|---|
| Mallow Technologies | Chennai, global | https://www.mallow-tech.com/ | AWS (partner), Salesforce, Power BI, LangChain. No payments, accounting or HR tools. |
| Fingent | Kochi / US | https://www.fingent.com/ | SAP (S/4HANA migration), Microsoft Dynamics, Odoo, Active Directory. |
| Hidden Brains | Ahmedabad, global | https://www.hiddenbrains.com/ | AWS, Azure, Google Cloud, Dynamics 365, Salesforce, ServiceNow, Power BI, M365, Magento, Shopify, WordPress, OpenAI, Gemini, Okta. Builds time and attendance, CMMS, fleet, invoicing. |
| Sparx IT Solutions | Noida, global | https://www.sparxitsolutions.com/ | Shopify, Magento, PrestaShop, WordPress, Drupal, Salesforce, WhatsApp (contact only). |
| Ideas2IT | Chennai, US | https://www.ideas2it.com/ | OpenAI (partner), AWS, BigQuery, Snowflake, Databricks, Tableau, Looker. |
| Agriya | Chennai | https://www.agriya.com/ | Now redirects to iScripts (product scripts). Not a useful peer. |
| Codingclave | Dubai | https://codingclave.com/uae/custom-software-development-dubai | Stripe, Telr, PayTabs, N-Genius, Tabby, Tamara, Zoho Books, Tally, Odoo, SAP Business One, HubSpot, WhatsApp Business API, Shopify, AWS UAE region. The most concrete list found. |
| Emeron Infospace | UAE | https://emeron.io/?p=990414 | SAP, Salesforce, Zoho, WhatsApp, Oracle. |
| Teamseven | UK | https://teamseven.ltd/bespoke-software-development-uk | Xero, QuickBooks, Sage, Stripe, HubSpot, Salesforce, OpenAI, Claude, AWS, Azure. |
| SpotDev | UK (HubSpot partner) | https://www.spotdev.co.uk/blog/connect-sage-to-hubspot-50-200-x3-intacct | HubSpot with Xero, QuickBooks and Sage. Notes Sage 50 needs custom work. |

Also read: Indian HRMS vendors (HROne, Fuzen) on biometric and Tally payroll sync; GSP vendors (GSTHero,
PrecisionTech) on e-invoice and e-way bill from ERPs; Apideck on Xero and UK MTD.

### What the review shows

- The big Indian studios list enterprise platforms (SAP, Salesforce, Dynamics, Power BI) and cloud, almost never
  Indian SME tools. None of them names Tally, GST e-invoicing, PF/ESI or biometric devices. That gap is our
  opening: it is exactly what the audience study says SME buyers look for.
- Gulf agencies sell on local payments (Telr, PayTabs, Tabby, Tamara), WhatsApp and Zoho / Tally / Odoo.
- UK agencies sell on accounting sync (Xero, QuickBooks, Sage) plus Stripe and HubSpot.
- Everyone lists the three big clouds.

## How tools were chosen

- Real, widely used products with a public API, SDK or a documented file or portal format (EPFO ECR, ESIC, NIC
  e-way bill). Nothing that needs a licence a studio cannot get.
- Each system gets 4 groups plus the shared "Hosted on" group (AWS, Google Cloud, Microsoft Azure) last, built
  from one constant (`HOSTING_GROUP`). Azure is new: Hidden Brains and Teamseven list it and it is already in the
  site's stack list.
- Every tool already on the pages is kept: Stripe, Razorpay, Twilio, Mailchimp, Klaviyo, Shopify, Magento,
  WooCommerce, WordPress, Inscribe, AWS, Google Cloud.
- Indian tools first in each group where they fit, then one or two for overseas buyers (Xero, QuickBooks, HMRC,
  PayPal, Tabby, Aramex, DHL).

## Groups per system and why

**People** (HR, payroll, attendance)
- Attendance devices: eSSL, ZKTeco, Matrix COSEC. The three device brands most Indian offices and factories use.
  "Biometrics" was asked for directly.
- Payroll & compliance: EPFO, ESIC (PF and ESI files), TallyPrime, Zoho Books, Xero. PF/ESI and Tally were asked
  for directly; Xero covers UK and Australia.
- Sign-in & documents: Google Workspace, Microsoft 365, DigiLocker, Leegality, DocuSign. Onboarding needs ID
  documents and signed offer letters.
- Staff messages: WhatsApp Business Platform, Twilio, Microsoft Teams, Slack, Mailchimp. The pain quotes say
  leave requests arrive on WhatsApp.

**Revenue** (CRM, quotes, billing, support)
- CRM & support: Zoho CRM, HubSpot, Salesforce, Freshdesk. Zoho was asked for; the other three are what peers list.
- Payments: Razorpay, Stripe, PayU, Cashfree, PayPal. The main Indian gateways plus overseas cards.
- Messaging & calls: WhatsApp Business Platform, Twilio, Exotel, Mailchimp, Klaviyo. Exotel for Indian call
  centres and sales teams.
- Accounting: TallyPrime, Zoho Books, QuickBooks, Xero. Invoices need to land in the books.

**Operations** (orders, inventory, procurement, production)
- Order sources: Shopify, WooCommerce, Magento, Amazon Seller Central, Flipkart Seller Hub.
- Accounts & ERP: TallyPrime, Zoho Books, SAP Business One, Odoo, E-way bill (NIC). SAP and e-way bill were asked
  for; Odoo and SAP B1 are what Gulf peers list.
- Shipping: Shiprocket, Delhivery, DHL Express, Aramex. India first, then international and Gulf.
- Alerts & labels: Twilio, WhatsApp Business Platform, Zebra printers. The pain quote "POs approved on WhatsApp".

**Ecommerce**
- Store platforms: Shopify, Magento, WooCommerce, WordPress (unchanged).
- Payments: Razorpay, Stripe, PayU, Cashfree, PayPal, Tabby (Gulf pay later, listed by Dubai peers).
- Marketplaces & shipping: Amazon, Flipkart, Shiprocket, Delhivery.
- Marketing: Klaviyo, Mailchimp, WhatsApp Business Platform, Google Analytics, Meta Commerce.

**Finance** (accounts, expenses, audit)
- Accounting: TallyPrime, Zoho Books, QuickBooks, Xero, SAP Business One.
- Tax & e-invoicing: GST e-invoice (IRP), E-way bill (NIC), ClearTax, HMRC Making Tax Digital. GST e-invoicing
  was asked for directly.
- Payments & payouts: Razorpay, Cashfree, Stripe.
- Reports & checks: Power BI, Looker Studio, Metabase, Inscribe (kept), DocuSign.

**Industry** (healthcare, education, property, lending, retail POS, logistics)
- Payments: Razorpay, Stripe, PayU, Pine Labs (counter card terminals for retail POS and clinics).
- Identity & KYC: DigiLocker, Digio, Leegality, Inscribe. Lending and property need KYC and signed agreements.
- Messaging & calls: WhatsApp Business Platform, Twilio, Exotel.
- Maps & video: Google Maps Platform (logistics tracking), Zoom (classes and teleconsults), Google Workspace.

## Left out on purpose

- ONDC: needs network participant onboarding, not a simple API connection.
- Account Aggregator, UAE PASS, Singpass: need regulator or government approval per client.
- Sage 50: no real-time API; add only if the client has done it.
- Telr, PayTabs, N-Genius, Tamara: real Gulf gateways, add if Gulf payments are a focus.
- Solvable (in `tools` in `site.ts`): could not place it in any system; check what it is and whether to keep it.

## To confirm with the client

1. Which of these Wezigns has actually integrated before. Mark anything never done, or drop it. Highest priority:
   Tally, Zoho Books, GST e-invoice / e-way bill, EPFO / ESIC files, eSSL / ZKTeco devices, SAP Business One,
   WhatsApp Business Platform, Exotel, Digio / Leegality, Pine Labs.
2. Whether GST e-invoice and e-way bill go direct to the government portals or through a GSP (ClearTax, GSTHero).
   This changes how we word it.
3. Whether Gulf payments (Telr, PayTabs, Tabby, Tamara) and UK tools (Xero, HMRC MTD, GoCardless) should be shown.
4. Whether Microsoft Azure hosting is offered.
5. What "Solvable" is.
