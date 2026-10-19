// Copy for the inner pages: About, the six system pages and the AI page.
// Rules: pain points and impact are written in the visitor's own words; no invented statistics (real case results
// only, linked to Our Work); tools come from the shared `tools` list in site.ts, split per system.

export type Voice = 'Owner' | 'Manager' | 'Team member'

export type SystemPage = {
  slug: string
  /** Index into `areas` in site.ts: reuses its KPIs and module dashboard. */
  area: number
  title: string
  promise: string
  intro: string
  pains: { who: Voice; quote: string }[]
  modules: Record<string, string>
  impact: { who: Voice; before: string; after: string }[]
  proof?: { value: string; label: string; caseId: string }
  tools: { label: string; items: string[] }[]
  caseId: string
}

const HOSTING = { label: 'Hosted on', items: ['AWS', 'Google Cloud'] }

export const systemPages: SystemPage[] = [
  {
    slug: 'people',
    area: 0,
    title: 'People & workforce',
    promise: 'Your people, payroll and paperwork in one place.',
    intro:
      'HR, payroll, attendance, appraisals, training and hiring in one system your team actually uses. No more chasing forms, rebuilding spreadsheets or asking who approved what.',
    pains: [
      { who: 'Owner', quote: 'I sign off payroll every month without really knowing if the numbers are right.' },
      { who: 'Manager', quote: 'Leave requests come in by WhatsApp, email and a sticky note on my desk.' },
      { who: 'Team member', quote: 'I have asked HR for my leave balance three times this week.' },
      { who: 'Manager', quote: 'Appraisal season means two weeks of chasing forms.' },
      { who: 'Owner', quote: 'When someone leaves, their training records leave with them.' },
    ],
    modules: {
      HR: 'One record per employee: role, documents, history and who they report to.',
      Payroll: 'Salaries, deductions and payslips worked out from attendance, with nothing typed twice.',
      Attendance: 'Check-ins, shifts and leave in one calendar, with approvals on the phone.',
      Appraisals: 'Review cycles that remind people, collect feedback and keep the history.',
      Training: 'Programmes, certificates and expiry dates, with alerts before anything lapses.',
      Hiring: 'Openings, applicants and interviews in one pipeline, from application to offer.',
    },
    impact: [
      { who: 'Owner', before: 'I approve payroll on trust.', after: 'I see how every number was worked out before I approve.' },
      { who: 'Manager', before: 'I chase leave requests across three apps.', after: 'Requests come to one place and I approve them from my phone.' },
      { who: 'Team member', before: 'I email HR to ask for a payslip.', after: 'I open the app and download it myself.' },
      { who: 'Manager', before: 'Appraisals take two weeks of follow-ups.', after: 'The system sends the reminders. I just read the reviews.' },
    ],
    proof: { value: '−80%', label: 'administrative work for a nationwide training operation', caseId: 'safety-training' },
    tools: [HOSTING, { label: 'Connects to', items: ['Twilio (SMS and WhatsApp alerts)', 'Mailchimp (staff updates)'] }],
    caseId: 'safety-training',
  },
  {
    slug: 'revenue',
    area: 1,
    title: 'Revenue & customers',
    promise: 'Every customer, quote and invoice, followed through.',
    intro:
      'CRM, quotations, billing, support, renewals and partner portals working as one. Your team sees the whole customer, and fewer deals or payments slip through the cracks.',
    pains: [
      { who: 'Owner', quote: 'Our best customer list lives in one salesperson’s phone.' },
      { who: 'Manager', quote: 'I only find out a quote went cold when the customer has already gone elsewhere.' },
      { who: 'Team member', quote: 'I copy every quote into an invoice by hand.' },
      { who: 'Manager', quote: 'Support tickets sit in a shared inbox and nobody knows who owns them.' },
      { who: 'Owner', quote: 'Renewals sneak up on us every year.' },
    ],
    modules: {
      CRM: 'Every account, contact and conversation in one timeline the whole team can see.',
      Quotations: 'Quotes built from your price list, sent in minutes and tracked until they are answered.',
      Billing: 'Accepted quotes turn into invoices, with reminders and online payment links.',
      'Support desk': 'Tickets with owners, priorities and response times, from email, web or WhatsApp.',
      Renewals: 'Contracts and subscriptions with dates, so nothing renews or lapses by surprise.',
      'Partner portals': 'A login for partners and dealers to place orders, see stock and track payments.',
    },
    impact: [
      { who: 'Owner', before: 'Customer history leaves when a salesperson does.', after: 'Every conversation stays with the company.' },
      { who: 'Manager', before: 'I find lost quotes after the fact.', after: 'I see every open quote and follow up the same day.' },
      { who: 'Team member', before: 'I retype quotes into invoices.', after: 'One click turns an accepted quote into an invoice.' },
      { who: 'Manager', before: 'Nobody knows who owns a ticket.', after: 'Every ticket has an owner and a clock.' },
    ],
    tools: [
      HOSTING,
      { label: 'Payments', items: ['Stripe', 'Razorpay'] },
      { label: 'Messaging and email', items: ['Twilio', 'Mailchimp', 'Klaviyo'] },
    ],
    caseId: 'marketplace',
  },
  {
    slug: 'operations',
    area: 2,
    title: 'Operations & supply chain',
    promise: 'Orders, stock and production you can see in real time.',
    intro:
      'Orders, inventory, warehouse, procurement, production and assets in one live picture. Know what you have, what is coming and what is stuck, before a customer asks.',
    pains: [
      { who: 'Owner', quote: 'I find out we are out of stock when a customer calls.' },
      { who: 'Manager', quote: 'Purchase orders get approved on WhatsApp and nobody can find them later.' },
      { who: 'Team member', quote: 'I count the same shelf twice because the spreadsheet is never current.' },
      { who: 'Manager', quote: 'I can’t tell which line is running behind until the day is over.' },
      { who: 'Owner', quote: 'We bought a machine part we already had in the other warehouse.' },
    ],
    modules: {
      Orders: 'Every order from every channel in one queue, with status from received to delivered.',
      Inventory: 'Stock levels across locations, with reorder points that warn you in time.',
      Warehouse: 'Bins, picking and packing, so items are found the first time.',
      Procurement: 'Requests, approvals and purchase orders with a clear trail of who signed what.',
      Production: 'Work orders, line output and efficiency, visible while the shift is running.',
      Assets: 'Machines, vehicles and tools, with locations and maintenance dates.',
    },
    impact: [
      { who: 'Owner', before: 'Stock-outs reach me through complaints.', after: 'The system warns us before stock runs low.' },
      { who: 'Manager', before: 'PO approvals are lost in chat.', after: 'Every PO has an approver, a date and a trail.' },
      { who: 'Team member', before: 'I recount shelves to trust the numbers.', after: 'The count I see is the count on the shelf.' },
      { who: 'Manager', before: 'I learn about delays at the end of the day.', after: 'I see a slow line while there is still time to fix it.' },
    ],
    tools: [HOSTING, { label: 'Order sources', items: ['Shopify', 'Magento', 'WooCommerce'] }, { label: 'Alerts', items: ['Twilio'] }],
    caseId: 'engineering-event',
  },
  {
    slug: 'ecommerce',
    area: 3,
    title: 'Ecommerce',
    promise: 'A store that sells, with the operations behind it.',
    intro:
      'Storefront, orders, payments, catalogue, returns and fulfilment connected to the rest of your business. Selling online stops meaning a second set of spreadsheets.',
    pains: [
      { who: 'Owner', quote: 'The website takes orders, then someone types them into our system.' },
      { who: 'Manager', quote: 'Updating prices means editing two hundred products one by one.' },
      { who: 'Team member', quote: 'Customers ask where their order is and I have to check four places.' },
      { who: 'Manager', quote: 'Returns are a pile of emails nobody wants to open.' },
      { who: 'Owner', quote: 'We sold an item online that was already sold in the shop.' },
    ],
    modules: {
      Storefront: 'A fast store on the platform that suits you, or built from scratch.',
      Orders: 'Online orders flow straight into operations, with no retyping.',
      Payments: 'Cards, UPI and wallets through Stripe or Razorpay, reconciled automatically.',
      Catalogue: 'Products, prices and stock managed once and published everywhere.',
      Returns: 'Return requests with reasons, approvals and refunds in one flow.',
      Fulfilment: 'Packing, shipping and tracking updates that customers get without asking.',
    },
    impact: [
      { who: 'Owner', before: 'Online orders are retyped by hand.', after: 'Orders land in the system the moment they are paid.' },
      { who: 'Manager', before: 'Price changes take a whole afternoon.', after: 'I change a price once and it updates everywhere.' },
      { who: 'Team member', before: 'I check four places to answer “where is my order?”', after: 'Customers get tracking updates without asking.' },
      { who: 'Owner', before: 'Online and shop stock disagree.', after: 'One stock count for every channel.' },
    ],
    proof: { value: '300 → 4,500', label: 'active sellers on a B2B marketplace, with no support staff added', caseId: 'marketplace' },
    tools: [
      HOSTING,
      { label: 'Store platforms', items: ['Shopify', 'Magento', 'WooCommerce', 'WordPress'] },
      { label: 'Payments', items: ['Stripe', 'Razorpay'] },
      { label: 'Marketing', items: ['Klaviyo', 'Mailchimp'] },
    ],
    caseId: 'online-retail',
  },
  {
    slug: 'finance',
    area: 4,
    title: 'Finance & governance',
    promise: 'Money, approvals and audits you can trust.',
    intro:
      'Accounts, expenses, dashboards, audit, projects and approvals with one source of truth. Month-end gets shorter, and every number has a trail.',
    pains: [
      { who: 'Owner', quote: 'I don’t know our cash position until the accountant sends a spreadsheet.' },
      { who: 'Manager', quote: 'Expense claims arrive as photos of receipts on WhatsApp.' },
      { who: 'Team member', quote: 'Month-end means three days of copying numbers between files.' },
      { who: 'Owner', quote: 'When the auditor asks who approved a payment, nobody is sure.' },
      { who: 'Manager', quote: 'Every report I need is a request to someone else.' },
    ],
    modules: {
      Accounts: 'Cash, receivables and payables in one live view, matched to the bank.',
      Expenses: 'Claims with receipts, limits and approvals, paid without paperwork.',
      Dashboards: 'The reports you ask for every month, updated on their own.',
      Audit: 'Every change and approval logged, so an audit is a search, not a hunt.',
      Projects: 'Budgets against actual spend for every project, as it happens.',
      Approvals: 'Payments and spend over a limit go to the right person, with a reminder.',
    },
    impact: [
      { who: 'Owner', before: 'I wait for a spreadsheet to know our cash.', after: 'I check it on my phone any morning.' },
      { who: 'Manager', before: 'Receipts arrive as WhatsApp photos.', after: 'Claims come in with the receipt attached and a limit checked.' },
      { who: 'Team member', before: 'Month-end takes days of copying.', after: 'The numbers are already where they need to be.' },
      { who: 'Owner', before: 'Approvals are hard to prove.', after: 'Every approval has a name, a time and a reason.' },
    ],
    tools: [HOSTING, { label: 'Payments', items: ['Stripe', 'Razorpay'] }, { label: 'Document checks', items: ['Inscribe'] }],
    caseId: 'tourism',
  },
  {
    slug: 'industry',
    area: 5,
    title: 'Industry systems',
    promise: 'Software shaped around how your sector works.',
    intro:
      'Healthcare, education, property and hotels, lending, retail and logistics each have their own rules. We build systems that already speak your industry’s language.',
    pains: [
      { who: 'Owner', quote: 'Off-the-shelf software makes us work its way, not ours.' },
      { who: 'Manager', quote: 'We pay for five tools and still run the day on paper.' },
      { who: 'Team member', quote: 'I enter the same patient, student or guest details in three systems.' },
      { who: 'Manager', quote: 'Our regulator wants reports our software can’t produce.' },
      { who: 'Owner', quote: 'Every new branch means another set of spreadsheets.' },
    ],
    modules: {
      Healthcare: 'Appointments, patient records and billing for clinics and diagnostic centres.',
      Education: 'Admissions, enrolment, fees and timetables for schools and tutoring providers.',
      'Property & hotels': 'Bookings, occupancy, tenants and maintenance in one place.',
      Lending: 'Applications, KYC, approvals and disbursal with a full audit trail.',
      'Retail POS': 'Point of sale tied to stock and accounts across every store.',
      Logistics: 'Pickups, routes, proof of delivery and live tracking.',
    },
    impact: [
      { who: 'Owner', before: 'We bend our process to fit the software.', after: 'The software fits the way we already work.' },
      { who: 'Team member', before: 'I type the same details three times.', after: 'I enter them once and every screen has them.' },
      { who: 'Manager', before: 'Compliance reports are built by hand.', after: 'The report the regulator wants is one click.' },
      { who: 'Owner', before: 'A new branch means new spreadsheets.', after: 'A new branch is a new login.' },
    ],
    tools: [
      HOSTING,
      { label: 'Payments', items: ['Stripe', 'Razorpay'] },
      { label: 'Messaging', items: ['Twilio'] },
      { label: 'Document checks', items: ['Inscribe'] },
    ],
    caseId: 'education',
  },
]

export const systemsSection = {
  kicker: 'Systems',
  painsTitle: 'Sound familiar?',
  buildTitle: 'What we build',
  impactTitle: 'What changes for you',
  toolsTitle: 'Tools we use',
  moreTitle: 'Other systems we build',
  cta: { label: 'Tell us what is not working', href: '/contact' },
}

export const aboutPage = {
  kicker: 'About Wezigns',
  title: ['From small business', 'to enterprise', 'systems.'],
  lead: 'The leading systems and custom software provider for SMEs and MSMEs. We are a software studio in Chennai, and since 2012 we have built the systems growing businesses run on: the portals, stores, dashboards and tools that replace spreadsheets, chat threads and manual work.',
  whyTitle: 'Why small and growing businesses work with us',
  why: [
    { title: 'Built around how you work.', text: 'We start from your people and your process, not from a template. The software fits the business, not the other way round.' },
    { title: 'Priced on outcomes.', text: 'One price and one timeline, agreed before we build. No hourly meter running in the background.' },
    { title: 'Grows in stages.', text: 'Start with the part that hurts most. Add the next module when you are ready, without a rewrite.' },
  ],
  storyTitle: 'Twelve years, one thread',
  story: [
    { year: '2012', title: 'Started in Chennai', text: 'A small design and web team, building websites for local businesses.' },
    { year: 'Portals & stores', title: 'From pages to platforms', text: 'Online stores, job portals, booking and education systems for clients at home and abroad.' },
    { year: 'Business systems', title: 'The software teams run on', text: 'HR, operations, finance and industry systems that replace spreadsheets and chat threads.' },
    { year: 'Today', title: 'Systems with AI inside', text: 'Custom systems and AI workflows for SMEs and MSMEs in 11 countries.' },
  ],
  numbersTitle: 'In numbers',
  processTitle: 'How we work',
  cta: { label: 'Tell us what is not working', href: '/contact' },
}

export const aiPage = {
  kicker: 'AI',
  title: ['AI that does', 'real work', 'for your business.'],
  heroLink: 'See the two ways',
  heroVisualLabel: 'A record is read by AI, which flags it, drafts the next step and waits for a person to approve.',
  waysTitle: 'Two ways to use AI',
  waysLink: 'See how',
  howKicker: 'How we build it',
  lead: 'Two ways to put AI to work: inside the systems you already run, or as a custom AI solution built around one job. Either way, a person signs off and your data stays yours.',
  ways: [
    {
      key: 'inside',
      label: 'AI in your systems',
      title: 'AI workflows inside your systems',
      text: 'AI added to the software your team uses every day. It reads records, flags what needs attention and drafts the next step.',
    },
    {
      key: 'solution',
      label: 'AI as the solution',
      title: 'Custom AI solutions',
      text: 'A tool built around one job: answering from your documents, processing paperwork, running routine steps or talking to customers.',
    },
  ],
  insideTitle: 'AI that works where your team already does',
  inside: [
    { system: 'Finance', title: 'Invoice matching', text: 'Reads each supplier invoice, matches it to the order and receipt, and flags anything that does not add up.' },
    { system: 'Operations', title: 'Reorder suggestions', text: 'Looks at sales and stock levels and suggests what to reorder, and when.' },
    { system: 'People', title: 'CV screening', text: 'Sorts applications against the role and writes a short summary of each shortlist.' },
    { system: 'Revenue', title: 'Reply drafts', text: 'Drafts answers to support tickets and customer emails from your own history.' },
    { system: 'Ecommerce', title: 'Product copy and search', text: 'Writes product descriptions and helps customers find what they mean, not just what they typed.' },
    { system: 'Every system', title: 'Ask your data', text: 'Ask a question in plain words, like “which orders are late this week?”, and get the answer with the records behind it.' },
  ],
  solutionsTitle: 'AI built around one job',
  solutions: [
    { title: 'Assistants on your documents', text: 'Your team asks questions and gets answers from your own policies, manuals and records, with the source shown.', flow: ['Question', 'Your documents', 'Answer + source'] },
    { title: 'Document processing', text: 'Invoices, forms and IDs are read, the details pulled out and checked, then sent to the right system.', flow: ['Upload', 'Read & check', 'Into your system'] },
    { title: 'Back-office agents', text: 'Routine steps like chasing approvals, updating records or preparing reports run on their own, and a person approves the result.', flow: ['Trigger', 'Agent runs it', 'Person approves'] },
    { title: 'Customer chat', text: 'Answers customers on your website or WhatsApp from your own information, and hands over to your team when it should.', flow: ['Customer asks', 'AI answers', 'Hands to staff'] },
  ],
  howTitle: 'How we build AI that works',
  how: [
    { title: 'Pick one job', text: 'We start with one task that takes your team real time each week.' },
    { title: 'Connect your data', text: 'The AI works from your records and documents, inside your systems.' },
    { title: 'Test on real cases', text: 'We check it against your own past work before anyone relies on it.' },
    { title: 'People approve', text: 'Key decisions wait for a person. Every AI action is logged.' },
    { title: 'Measure, then extend', text: 'Once one job runs well, we add the next.' },
  ],
  guardrails: [
    { title: 'A person signs off.', text: 'AI suggests. Someone on your team approves every key decision.' },
    { title: 'Your data stays put.', text: 'It works from your own records, inside your own systems.' },
    { title: 'Everything is logged.', text: 'You can see what the AI did, when, and why.' },
  ],
  cta: { label: 'Tell us what is not working', href: '/contact' },
}

// 404 page (404.html): Vercel serves it for any unknown URL.
export const notFoundPage = {
  kicker: 'Page not found',
  title: ['This thread', 'leads', 'nowhere.'],
  lead: 'The page you were looking for has moved or never existed. Head back to the home page, or tell us what you were after and we will point you to it.',
  home: { label: 'Back to the home page', href: '/' },
  linksTitle: 'Or go straight to',
  links: [
    { label: 'Systems we build', text: 'HR, CRM, operations, ecommerce, finance and industry', href: '/systems/people' },
    { label: 'AI', text: 'AI inside your systems and custom AI solutions', href: '/ai' },
    { label: 'Technology', text: 'The stack behind the systems we build', href: '/technology' },
    { label: 'Our work', text: 'Case studies from 11 countries', href: '/#work' },
    { label: 'About', text: 'Chennai, since 2012', href: '/about' },
    { label: 'Contact', text: 'Phone, email, address and the enquiry form', href: '/contact' },
  ],
}
