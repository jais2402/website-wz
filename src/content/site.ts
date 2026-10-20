// Single source of truth for all site copy. Sourced from website-wz.vercel.app — edit here, not in components.

export const brand = {
  name: 'Wezigns',
  legal: 'Wezigns Software Private Limited',
  email: 'contact@wezigns.com',
  phone: '+91 44 2364 3252',
  phoneHref: 'tel:+914423643252',
  city: 'Chennai, India',
  // Head office, from wezigns.com. Brisbane and Stoke-on-Trent offices are not shown until confirmed current.
  address: ['#4 / 25B, 1st Floor, Block 1', 'Boopathy Street, Arcot Road', 'Virugambakkam, Chennai 600092', 'India'],
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Boopathy+Street+Arcot+Road+Virugambakkam+Chennai+600092',
  url: 'https://www.wezigns.com',
}

// Header: every page is one click away. Questions (#faq) stays in the footer and on the home page.
export const nav = [
  { label: 'Systems', href: '/our-services' },
  { label: 'AI', href: '/ai' },
  { label: 'Technology', href: '/technology' },
  { label: 'Work', href: '/portfolio' },
  { label: 'How pricing works', href: '/pricing' },
  { label: 'About', href: '/about-us' },
]

// The "Systems" nav item opens this menu (headed by a link to the overview at /our-services, the old site's URL).
// Order matches `areas` and the /systems/* pages.
export const navSystemsAll = { label: 'All systems', href: '/our-services' }

export const navSystems = [
  { label: 'People & workforce', short: 'HR', href: '/systems/people' },
  { label: 'Revenue & customers', short: 'CRM', href: '/systems/revenue' },
  { label: 'Operations & supply chain', short: 'Inventory', href: '/systems/operations' },
  { label: 'Ecommerce', short: 'Ecommerce', href: '/systems/ecommerce' },
  { label: 'Finance & governance', short: 'Finance', href: '/systems/finance' },
  { label: 'Industry systems', short: 'Industry', href: '/systems/industry' },
]

// Sticky call button on phones; the phone was how most simulated prospects actually got in touch.
export const quickContact = { call: 'Call us', email: 'Email' }

// Screen-reader and keyboard labels for the header.
export const navA11y = { skip: 'Skip to content', menu: 'Menu', closeMenu: 'Close menu' }

// Shown on every dashboard built from `areas`, so demo figures are never read as client results.
export const sampleDataLabel = 'Sample data'

// Section headings and labels that several components (and the crawlable snapshot in lib/snapshot.ts) share.
export const storySection = { kicker: 'How a Wezigns system feels' }
export const proofSection = { toolsLabel: 'Tools we build with', title: 'Building software for growing businesses since 2012.' }
export const areasSection = { kicker: 'The systems we build', title: 'Every corner of the business, connected.' }
export const faqSection = { title: 'Straight answers.' }
export const footerCopy = {
  tagline: `Custom software that grows with you. Designed, built, hosted and maintained from ${brand.city}.`,
}

// The head office block on the contact sections and the contact page.
export const office = { label: 'Head office, Chennai', short: 'Head office', maps: 'Open in Google Maps' }

// Both enquiry forms and the contact page header share one submit label.
export const enquiryCopy = { submit: 'Send message', sending: 'Sending…' }

// The AI demo on the home page. Vendors and amounts are invented, and the window carries `sampleDataLabel`.
export const aiDemo = {
  window: 'Purchase approvals',
  columns: ['PO', 'Vendor', 'Amount', 'Status'],
  focusId: 'PO-2231',
  rows: [
    { id: 'PO-2229', vendor: 'Gulf Safety Supplies', amt: '₹ 1,24,000', status: 'Approved' },
    { id: 'PO-2231', vendor: 'Apex Industrial', amt: '₹ 3,86,500', status: 'Review' },
    { id: 'PO-2234', vendor: 'Coastline Logistics', amt: '₹ 58,200', status: 'Approved' },
    { id: 'PO-2236', vendor: 'Northwind Traders', amt: '₹ 2,10,750', status: 'Pending' },
  ],
  approvedStatus: 'Approved',
  cardLabel: 'Wezigns AI suggestion',
  suggestion:
    'Invoice #0193 matches PO-2231 except quantity: 48 received vs 50 ordered. Suggest approving 48 and flagging the supplier for the short delivery.',
  done: '✓ Approved by you and logged to the audit trail',
  replay: 'Replay',
  approve: 'Approve 48 units',
  askAgain: 'Ask again',
  human: 'Human in control',
}

export const hero = {
  eyebrow: 'Custom software since 2012',
  title: ['Systems', 'that grow', 'with you.'],
  sub: 'Custom software for businesses that have outgrown spreadsheets, message threads and manual work.',
  primary: { label: 'Tell us what is not working', href: '#contact' },
  secondary: { label: 'Explore our work', href: '#work' },
  // Floating "chaos" fragments the 3D scene organises as you scroll.
  fragments: [
    'orders_FINAL_v7.xlsx',
    '42 unread in Ops group',
    'Manual entry',
    'Copy → paste → repeat',
    'Who approved this?',
    'Invoice #0193 missing',
  ],
}

export const principles = [
  {
    key: 'simplify',
    title: 'Simplify',
    body: 'Less manual work and fewer steps, so everyday tasks get easier for the whole team.',
    chips: ['One source of truth', 'Fewer clicks', 'No re-typing'],
  },
  {
    key: 'scale',
    title: 'Scale',
    body: 'Start focused, ship what matters first, and lay a foundation that is ready to grow.',
    chips: ['Modular by design', 'Grows in stages', 'No rewrites'],
  },
  {
    key: 'secure',
    title: 'Secure',
    body: 'Security designed into the first version, then reviewed and maintained after launch.',
    chips: ['Built in from day one', 'Reviewed', 'Maintained'],
  },
]

export const tools = [
  'AWS',
  'Google Cloud',
  'Stripe',
  'Razorpay',
  'Solvable',
  'Inscribe',
  'Shopify',
  'Magento',
  'WordPress',
  'WooCommerce',
  'Twilio',
  'Mailchimp',
  'Klaviyo',
]

export const stats = [
  { value: 20, suffix: '+', label: 'Products, portals and platforms shipped' },
  { value: 11, suffix: '', label: 'Countries our systems run in' },
  { value: 2012, suffix: '', label: 'Building since', plain: true },
]

export const servicesSection = {
  title: 'A technology partner for every part of your business.',
  body: 'Operations, sales, finance, HR. We design, build, host and maintain the software behind each of them, from the first workshop to years after launch.',
}

export const services = [
  {
    key: 'build',
    kicker: 'Build a system',
    title: 'Software built around how your team works.',
    items: ['Custom business software', 'Customer & partner portals', 'Ecommerce: catalogue, orders, stock, payments', 'Mobile-first web apps and websites'],
    tone: 'lime',
  },
  {
    key: 'connect',
    kicker: 'Connect & automate',
    title: 'Connect the tools you already pay for.',
    items: ['Business process automation', 'System and open-source integration', 'Data & reporting systems', 'AI & Gen-AI integrations'],
    tone: 'violet',
  },
  {
    key: 'run',
    kicker: 'Keep it running',
    title: 'Hosted, watched and improved after launch.',
    items: ['Cloud hosting', 'Monitoring', 'Support', 'Maintenance'],
    tone: 'coral',
  },
] as const

// ---- Systems explorer (Areas section) ----------------------------------------------------------------
// The numbers below are ILLUSTRATIVE demo data for the mock dashboards, not real Wezigns client figures.

export type Chart =
  | { kind: 'line' | 'area' | 'bars'; series: number[] }
  | { kind: 'ring' | 'gauge'; percent: number }
  | { kind: 'heatmap'; cells: number; seed: number }
  | { kind: 'funnel' | 'stack'; items: [string, number][] }
  | { kind: 'list'; rows: [string, string][] }
  | { kind: 'dots'; total: number; on: number }

export type Module = {
  name: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  caption: string
  delta?: string
  down?: boolean
  chart: Chart
}

export type Kpi = { label: string; value: number; prefix?: string; suffix?: string; decimals?: number }

export type Area = { title: string; kpis: Kpi[]; modules: Module[] }

export const areas: Area[] = [
  {
    title: 'People & workforce',
    kpis: [
      { label: 'Employees', value: 248 },
      { label: 'Attendance today', value: 96.4, suffix: '%', decimals: 1 },
      { label: 'Open roles', value: 12 },
    ],
    modules: [
      { name: 'HR', value: 248, caption: 'headcount', delta: '+14 this qtr', chart: { kind: 'area', series: [182, 190, 197, 205, 214, 226, 237, 248] } },
      { name: 'Payroll', value: 18.4, prefix: '₹', suffix: 'L', decimals: 1, caption: 'processed this month', delta: 'on time', chart: { kind: 'bars', series: [62, 70, 66, 74, 71, 80, 84] } },
      { name: 'Attendance', value: 96.4, suffix: '%', decimals: 1, caption: 'present, last 4 weeks', chart: { kind: 'heatmap', cells: 28, seed: 3 } },
      { name: 'Appraisals', value: 72, suffix: '%', caption: 'reviews completed', delta: '+18%', chart: { kind: 'ring', percent: 72 } },
      { name: 'Training', value: 3, caption: 'programmes running', chart: { kind: 'stack', items: [['Safety', 92], ['Compliance', 78], ['Product', 54]] } },
      { name: 'Hiring', value: 9, caption: 'offers out', delta: '-6 days to hire', chart: { kind: 'funnel', items: [['Applied', 320], ['Screened', 96], ['Interview', 34], ['Offer', 9]] } },
    ],
  },
  {
    title: 'Revenue & customers',
    kpis: [
      { label: 'Pipeline', value: 4.2, prefix: '₹', suffix: ' Cr', decimals: 1 },
      { label: 'Win rate', value: 31, suffix: '%' },
      { label: 'NPS', value: 64 },
    ],
    modules: [
      { name: 'CRM', value: 1284, caption: 'active accounts', delta: '+9.2%', chart: { kind: 'line', series: [40, 46, 44, 55, 52, 63, 66, 74] } },
      { name: 'Quotations', value: 86, caption: 'sent this month', delta: '+12', chart: { kind: 'bars', series: [38, 52, 47, 66, 58, 72, 86] } },
      { name: 'Billing', value: 94, suffix: '%', caption: 'invoices collected', chart: { kind: 'gauge', percent: 94 } },
      { name: 'Support desk', value: 18, caption: 'open tickets, 2.4h avg', delta: '-31%', chart: { kind: 'list', rows: [['#4821 Login loop on portal', 'P1'], ['#4819 Invoice PDF missing', 'P2'], ['#4817 Add GST field', 'P3']] } },
      { name: 'Renewals', value: 88, suffix: '%', caption: 'retention this year', delta: '+4%', chart: { kind: 'ring', percent: 88 } },
      { name: 'Partner portals', value: 42, caption: 'partners active', chart: { kind: 'dots', total: 48, on: 42 } },
    ],
  },
  {
    title: 'Operations & supply chain',
    kpis: [
      { label: 'Orders today', value: 1284 },
      { label: 'On time', value: 98.2, suffix: '%', decimals: 1 },
      { label: 'Stock value', value: 2.6, prefix: '₹', suffix: ' Cr', decimals: 1 },
    ],
    modules: [
      { name: 'Orders', value: 1284, caption: 'orders today', delta: '+18%', chart: { kind: 'area', series: [30, 42, 38, 55, 61, 58, 72, 88] } },
      { name: 'Inventory', value: 4, caption: 'SKUs below reorder', down: true, delta: 'action', chart: { kind: 'stack', items: [['Raw', 84], ['WIP', 46], ['Finished', 71]] } },
      { name: 'Warehouse', value: 82, suffix: '%', caption: 'bin utilisation', chart: { kind: 'heatmap', cells: 28, seed: 9 } },
      { name: 'Procurement', value: 37, caption: 'POs this week', chart: { kind: 'funnel', items: [['Requested', 52], ['Approved', 44], ['Ordered', 37], ['Received', 29]] } },
      { name: 'Production', value: 87, suffix: '%', caption: 'line efficiency (OEE)', delta: '+3.1%', chart: { kind: 'gauge', percent: 87 } },
      { name: 'Assets', value: 312, caption: 'assets tracked', chart: { kind: 'dots', total: 48, on: 39 } },
    ],
  },
  {
    title: 'Ecommerce',
    kpis: [
      { label: 'Sales today', value: 4.6, prefix: '₹', suffix: 'L', decimals: 1 },
      { label: 'Orders today', value: 312 },
      { label: 'Conversion', value: 3.2, suffix: '%', decimals: 1 },
    ],
    modules: [
      { name: 'Storefront', value: 9840, caption: 'visits today', delta: '+14%', chart: { kind: 'area', series: [32, 41, 38, 52, 58, 55, 69, 81] } },
      { name: 'Orders', value: 312, caption: 'orders today', delta: '+22', chart: { kind: 'bars', series: [180, 214, 196, 240, 228, 276, 312] } },
      { name: 'Payments', value: 99.1, suffix: '%', decimals: 1, caption: 'payments succeeded', chart: { kind: 'gauge', percent: 99 } },
      { name: 'Catalogue', value: 1860, caption: 'products live', chart: { kind: 'dots', total: 48, on: 44 } },
      { name: 'Returns', value: 2.4, suffix: '%', decimals: 1, caption: 'of orders returned', delta: '-0.6%', chart: { kind: 'line', series: [4.1, 3.8, 3.6, 3.3, 3.0, 2.8, 2.6, 2.4] } },
      { name: 'Fulfilment', value: 287, caption: 'shipped today', chart: { kind: 'funnel', items: [['Placed', 312], ['Packed', 298], ['Shipped', 287], ['Delivered', 241]] } },
    ],
  },
  {
    title: 'Finance & governance',
    kpis: [
      { label: 'Revenue MTD', value: 3.1, prefix: '₹', suffix: ' Cr', decimals: 1 },
      { label: 'Expenses MTD', value: 1.2, prefix: '₹', suffix: ' Cr', decimals: 1 },
      { label: 'Approvals pending', value: 7 },
    ],
    modules: [
      { name: 'Accounts', value: 1.9, prefix: '₹', suffix: ' Cr', decimals: 1, caption: 'cash position', delta: '+6.4%', chart: { kind: 'line', series: [52, 48, 57, 61, 58, 66, 71, 76] } },
      { name: 'Expenses', value: 64, suffix: '%', caption: 'of quarterly budget', chart: { kind: 'ring', percent: 64 } },
      { name: 'Dashboards', value: 26, caption: 'live reports', chart: { kind: 'bars', series: [48, 62, 55, 78, 70, 88, 92] } },
      { name: 'Audit', value: 0, caption: 'open findings', delta: 'clean', chart: { kind: 'list', rows: [['Q2 access review', 'Done'], ['Vendor KYC refresh', 'Done'], ['GST reconciliation', 'Today']] } },
      { name: 'Projects', value: 14, caption: 'projects on track', chart: { kind: 'stack', items: [['Portal v2', 86], ['ERP sync', 62], ['Mobile app', 38]] } },
      { name: 'Approvals', value: 7, caption: 'awaiting sign-off, 3.2h avg', chart: { kind: 'dots', total: 48, on: 7 } },
    ],
  },
  {
    title: 'Industry systems',
    kpis: [
      { label: 'Patients / day', value: 420 },
      { label: 'Students', value: 3200 },
      { label: 'Rooms occupied', value: 86, suffix: '%' },
    ],
    modules: [
      { name: 'Healthcare', value: 420, caption: 'appointments today', delta: '+11%', chart: { kind: 'area', series: [22, 35, 48, 61, 58, 70, 66, 78] } },
      { name: 'Education', value: 3200, caption: 'students enrolled', chart: { kind: 'bars', series: [55, 60, 58, 72, 78, 82, 90] } },
      { name: 'Property & hotels', value: 86, suffix: '%', caption: 'occupancy tonight', chart: { kind: 'ring', percent: 86 } },
      { name: 'Lending', value: 118, caption: 'loans disbursed', chart: { kind: 'funnel', items: [['Applied', 640], ['KYC', 410], ['Approved', 182], ['Disbursed', 118]] } },
      { name: 'Retail POS', value: 6.8, prefix: '₹', suffix: 'L', decimals: 1, caption: 'sales today', delta: '+7.5%', chart: { kind: 'line', series: [20, 34, 30, 46, 58, 52, 68, 80] } },
      { name: 'Logistics', value: 97, suffix: '%', caption: 'deliveries on time', chart: { kind: 'gauge', percent: 97 } },
    ],
  },
]

export const ai = {
  title: 'Put AI to work inside your systems.',
  body: 'We add AI to the software you already run. It reads your records, flags what needs attention and drafts the next step. A person signs off before anything goes through.',
  points: [
    { title: 'A person signs off.', text: 'AI suggests. Someone on your team approves every key decision.' },
    { title: 'Your data stays put.', text: 'It works from your own records, inside your own systems.' },
    { title: 'Less checking by hand.', text: 'Invoices, orders and approvals move without someone re-reading every line.' },
  ],
}

export const workSection = {
  title: 'Our Work',
  lead: 'Five of the systems we have built and what each one replaced.',
  all: { label: 'See all our work', href: '/portfolio' },
  // The bento grid on the home page: the first id is the large lead tile.
  featured: ['safety-training', 'tourism', 'engineering-event', 'marketplace', 'car-rental'],
  more: {
    title: 'Over a hundred projects and counting.',
    body: 'Every case study, plus the stores, portals and booking systems behind them.',
  },
}

export const processSection = { kicker: 'How we build', title: 'Four stages. No surprises.' }

// Case studies, from the original site's content (content/site.json on main). Client names are not published.
export const work = [
  {
    id: 'safety-training',
    place: 'Dubai',
    sector: 'Safety training',
    title: 'One system instead of spreadsheets and chat threads.',
    body: 'Registration, trainer scheduling and compliance reporting for a nationwide training operation, in one place.',
    metrics: [
      { value: '−80%', label: 'administrative work' },
      { value: '100,000+', label: 'certifications a year' },
    ],
    tags: ['Registration', 'Scheduling', 'Compliance'],
    tone: 'lime',
  },
  {
    id: 'tourism',
    place: 'Singapore',
    sector: 'Tourism',
    title: 'One record of events instead of email threads.',
    body: 'A shared record of events and listings for operators, planners and government agencies. Data stays in-country.',
    metrics: [
      { value: 'Zero', label: 'unplanned downtime' },
      { value: '40,000', label: 'requests a minute at peak' },
    ],
    tags: ['Multi-operator', 'Event ledger', 'Localised data'],
    tone: 'violet',
  },
  {
    id: 'engineering-event',
    place: 'Dubai',
    sector: 'Engineering event',
    title: 'One dashboard for hundreds of people running one event.',
    body: 'An operations dashboard and participant platform for a large annual engineering event, on AWS.',
    metrics: [
      { value: 'Hundreds', label: 'people coordinated live' },
      { value: 'AWS', label: 'high-availability set-up' },
    ],
    tags: ['Real-time', 'High concurrency', 'AWS'],
    tone: 'coral',
  },
  {
    id: 'marketplace',
    place: 'Retail',
    sector: 'Marketplace',
    title: 'Sellers grew fifteen times over. Support headcount did not.',
    body: 'Automated seller onboarding with real-time API integrations for a regional B2B marketplace.',
    metrics: [
      { value: '300 → 4,500', label: 'active sellers' },
      { value: '+0', label: 'support headcount added' },
    ],
    tags: ['Seller onboarding', 'Catalogue', 'Real-time APIs'],
    tone: 'lime',
  },
] as const

// Earlier systems from the wezigns.com portfolio, confirmed by the client as real systems (not brochure sites).
// The old site has no case data, so these have no published results and no client names. Review the wording.
export const pastWork = [
  {
    id: 'car-rental',
    sector: 'Car rental',
    title: 'Bookings and the fleet, run from one admin.',
    body: 'Online booking for a car rental company. Customers pick a car and dates; the team manages vehicles and reservations in one place.',
    tags: ['Online booking', 'Fleet admin', 'Reservations'],
    tone: 'violet',
  },
  {
    id: 'recruitment',
    sector: 'Recruitment',
    title: 'Job portals that keep every application on track.',
    body: 'Job portals for recruitment firms. Candidates search and apply, employers post roles, and recruiters follow every application.',
    tags: ['Job listings', 'Applications', 'Recruiter dashboard'],
    tone: 'coral',
  },
  {
    id: 'online-retail',
    sector: 'Retail',
    title: 'Online stores with the orders behind them.',
    body: 'Online stores for retail and fashion brands: catalogue, cart and checkout, with order management behind one admin.',
    tags: ['Catalogue', 'Checkout', 'Order management'],
    tone: 'lime',
  },
  {
    id: 'education',
    sector: 'Education',
    title: 'Courses, enquiries and sign-ups in one portal.',
    body: 'Portals for tutoring and admissions providers. Course listings, student enquiries and enrolments are handled online.',
    tags: ['Course listings', 'Enquiries', 'Enrolment'],
    tone: 'violet',
  },
  {
    id: 'fundraising',
    sector: 'Non-profit',
    title: 'Giving made simple, for donors and the charity.',
    body: 'A fundraising platform: campaign pages, online donations and donor records, kept in one place.',
    tags: ['Campaigns', 'Online giving', 'Donor records'],
    tone: 'coral',
  },
] as const

// Sectors for the archive filter on /portfolio, in chip order ('Other' last).
export const archiveSectors = [
  'Health and wellness',
  'Retail',
  'Professional services',
  'Technology',
  'Recruitment',
  'Education',
  'Property',
  'Events',
  'Non-profit',
  'Car rental',
  'Sports',
  'Other',
] as const

// Every project listed on the old wezigns.com/portfolio (100 items, in that page's order). The old item pages only
// held template placeholder text, so all we have is each project's name, which that page already published.
// `sector` is set only where the name itself says it; everything else is 'Other'. `system` points to the earlier
// system above that the project is part of. Ids come from the old /portfolio-item-<slug> URLs.
export const portfolioArchive: readonly {
  id: string
  name: string
  sector: (typeof archiveSectors)[number]
  system?: (typeof pastWork)[number]['id']
}[] = [
    { id: '3week', name: '3 Week Diet Formula', sector: 'Health and wellness' },
    { id: 'adarsh', name: 'Adarsh', sector: 'Other' },
    { id: 'alloperator', name: 'Alloperator', sector: 'Other' },
    { id: 'apptrico', name: 'Furni', sector: 'Other' },
    { id: 'astrology', name: 'Astrology', sector: 'Other' },
    { id: 'awk', name: 'AWK', sector: 'Other' },
    { id: 'born2b', name: 'Born2be', sector: 'Other' },
    { id: 'wedding-chime', name: 'The Wedding Chime', sector: 'Events' },
    { id: 'burkland', name: 'Burkland', sector: 'Other' },
    { id: 'careers', name: 'Careers 24 x 7', sector: 'Recruitment', system: 'recruitment' },
    { id: 'ckca-rental', name: 'CKCar Rental', sector: 'Car rental', system: 'car-rental' },
    { id: 'cyberopsec', name: 'Cyberopsec', sector: 'Technology' },
    { id: 'finelines', name: 'Finelines', sector: 'Other' },
    { id: 'gps', name: 'GPS', sector: 'Other' },
    { id: 'grace', name: 'Grace', sector: 'Other' },
    { id: 'halal', name: 'Halal', sector: 'Other' },
    { id: 'hw', name: 'HW', sector: 'Other' },
    { id: 'imark', name: 'Imark', sector: 'Other' },
    { id: 'intech2', name: 'Intech', sector: 'Other' },
    { id: 'ipextras', name: 'Ipextras', sector: 'Other' },
    { id: 'ish', name: 'Ish', sector: 'Other' },
    { id: 'kinngs', name: 'Kinngs', sector: 'Other' },
    { id: 'mailin-repair', name: 'Mailin Repair', sector: 'Other' },
    { id: 'make-u-easy', name: 'Make U Easy', sector: 'Other' },
    { id: 'michel-geiger-blog', name: 'Michel Geiger Blog', sector: 'Other' },
    { id: 'qfp', name: 'QFP', sector: 'Other' },
    { id: 'shoppersmark', name: 'Shoppersmark', sector: 'Retail' },
    { id: 'stirling', name: 'Stirling', sector: 'Other' },
    { id: 'summit-global-service', name: 'Summit Global Service', sector: 'Other' },
    { id: 'tameera', name: 'Tameera', sector: 'Other' },
    { id: 'tech-guy', name: 'Tec Guy', sector: 'Other' },
    { id: 'datalogic-technologies', name: 'Datalogic Technologies', sector: 'Technology' },
    { id: 'acreageindia', name: 'Acreage India', sector: 'Property' },
    { id: 'campbell', name: 'Campbell', sector: 'Other' },
    { id: 'dd', name: 'DD', sector: 'Other' },
    { id: 'laforce', name: 'La Force Vitale', sector: 'Other' },
    { id: 'super-scholars', name: 'Super Scholars', sector: 'Education', system: 'education' },
    { id: 'oxbridge', name: 'Oxbridge', sector: 'Education', system: 'education' },
    { id: 'pencamera', name: 'Pencamera', sector: 'Other' },
    { id: 'prestige', name: 'Prestige', sector: 'Other' },
    { id: 'naadodigal', name: 'Naadodigal', sector: 'Other' },
    { id: 'elitecare', name: 'Elite Care Recruitments', sector: 'Recruitment', system: 'recruitment' },
    { id: 'mattoconsulting', name: 'Matto Consulting', sector: 'Professional services' },
    { id: 'mnco-india', name: 'MNCO India', sector: 'Other' },
    { id: 'wedoms', name: 'Wedoms', sector: 'Other' },
    { id: 'arabic-baptist-church-of-christ', name: 'Arabic Baptist Church of Christ', sector: 'Non-profit' },
    { id: 'bambeeq', name: 'Bambeeq', sector: 'Other' },
    { id: 'beer-fest', name: 'Beer Fest', sector: 'Events' },
    { id: 'blue-root', name: 'Blue Root Acupuncture', sector: 'Health and wellness' },
    { id: 'body-retreat', name: 'Body Retreat', sector: 'Health and wellness' },
    { id: 'buysimple', name: 'Buysimple', sector: 'Retail' },
    { id: 'chef', name: 'Chef', sector: 'Other' },
    { id: 'cigar', name: 'Cigar', sector: 'Other' },
    { id: 'dental', name: 'The DentalSite', sector: 'Health and wellness' },
    { id: 'embedded', name: 'Embeddedoutlet', sector: 'Retail' },
    { id: 'esl', name: 'ESL', sector: 'Other' },
    { id: 'eyecamz', name: 'Eyecamz', sector: 'Other' },
    { id: 'fotoshotz', name: 'Fotoshotz', sector: 'Other' },
    { id: 'free-phone', name: 'Free Phone', sector: 'Other' },
    { id: 'grace-legacy', name: 'Grace Legacy', sector: 'Other' },
    { id: 'hoobbi', name: 'Hoobbi', sector: 'Other' },
    { id: 'idd', name: 'IDD', sector: 'Other' },
    { id: 'infoflo', name: 'Infoflo', sector: 'Other' },
    { id: 'inscribe', name: 'Inscribe', sector: 'Other' },
    { id: 'interface-planet', name: 'Interface Planet', sector: 'Other' },
    { id: 'ipls', name: 'IPLS', sector: 'Other' },
    { id: 'irena', name: 'Irena', sector: 'Other' },
    { id: 'kudu-clothes', name: 'Kudu Clothes', sector: 'Retail', system: 'online-retail' },
    { id: 'lap-law', name: 'Lap Law', sector: 'Professional services' },
    { id: 'lionhead', name: 'Lionhead', sector: 'Other' },
    { id: 'madrid', name: 'Madrid', sector: 'Other' },
    { id: 'mygreen', name: 'Mygreen', sector: 'Other' },
    { id: 'numisor', name: 'Numisor', sector: 'Other' },
    { id: 'os-tickests', name: 'Os Tickests', sector: 'Other' },
    { id: 'pfill', name: 'Pfill', sector: 'Other' },
    { id: 'planetspace', name: 'Planetspace', sector: 'Other' },
    { id: 'pro-hobby', name: 'Pro Hobby', sector: 'Other' },
    { id: 'rcons', name: 'Rcons', sector: 'Other' },
    { id: 'skyscape', name: 'Skyscape', sector: 'Other' },
    { id: 'software-phd', name: 'Software PHD', sector: 'Technology' },
    { id: 'spectral', name: 'Spectral', sector: 'Other' },
    { id: 'treesandbees', name: 'Trees and Bees', sector: 'Other' },
    { id: 'truepay', name: 'Truepay', sector: 'Other' },
    { id: 'unilink', name: 'Unilink', sector: 'Other' },
    { id: 'vcare', name: 'Vcare', sector: 'Other' },
    { id: 'wezads', name: 'Wezads', sector: 'Other' },
    { id: 'world-shine', name: 'World Shine', sector: 'Other' },
    { id: 'callrehabcenters', name: 'Callrehabcenters.com', sector: 'Health and wellness' },
    { id: 'cidersys', name: 'Cidersys.com', sector: 'Other' },
    { id: 'debut-directors', name: 'Debut Directors', sector: 'Other' },
    { id: 'dobebe', name: 'Dobebe.com', sector: 'Other' },
    { id: 'ekubus', name: 'Ekubus.com', sector: 'Other' },
    { id: 'gracecapital', name: 'Grace Legacy Capital', sector: 'Professional services' },
    { id: 'kelmesskelbimai', name: 'Kelmesskelbimai.lt', sector: 'Other' },
    { id: 'kindergiving', name: 'Kindergiving', sector: 'Non-profit', system: 'fundraising' },
    { id: 'linetpixels', name: 'Linetpixels', sector: 'Other' },
    { id: 'maytek', name: 'Maytek.com', sector: 'Other' },
    { id: 'rajkumaran-builders', name: 'Rajkumaran Builders', sector: 'Property' },
    { id: 'theamigotowel', name: 'The Amigo', sector: 'Other' },
    { id: 'varrun-sports', name: 'Varrun Sports', sector: 'Sports' },
]

export const process = [
  { title: 'Understand', body: 'Map the people, workflows, systems and constraints.' },
  { title: 'Shape', body: 'Define scope, priorities, technology, price and timeline.' },
  { title: 'Build', body: 'Deliver in working pieces you can test and review.' },
  { title: 'Run', body: 'Host, monitor, maintain and improve after launch.' },
]

// Pricing section. Built only from statements on the client's site: outcomes not hours, agreed before
// building starts, cost driven by scope / integrations / process change (not technology), price from Shape.
export const pricing = {
  title: ['Priced on outcomes,', 'not hours.'],
  body: 'You get one price and one timeline, agreed before any building starts.',
  cta: { label: 'Get a price for your system', href: '#contact' },
  // Under the CTA: the full page about pricing.
  more: { label: 'See how pricing works', href: '/pricing' },
  sets: [
    { name: 'Scope', text: 'What the system has to do, and for whom.' },
    { name: 'Integrations', text: 'The tools, portals and databases it has to talk to.' },
    { name: 'Process change', text: 'How much the way your team works needs to change.' },
  ],
  doesnt: ['Hours logged', 'The technology we choose'],
  steps: [
    { name: 'Understand', text: 'We map your people, workflows and systems.' },
    { name: 'Shape', text: 'Scope, priorities and technology are agreed.' },
    { name: 'Your price', text: 'One price and one timeline, before building starts.' },
  ],
}

export const integrationsSection = {
  title: 'Integrates with the software you already use.',
  body: 'Accounting and CRM tools, payment gateways, government portals, identity checks, maps, and the legacy database nobody wants to touch. Your new system talks to all of them, so data moves on its own.',
}

export const integrations = [
  'Finance tools',
  'Sales & CRM',
  'Operations systems',
  'Government portals',
  'Identity verification',
  'Maps',
  'Legacy databases',
  'Payments',
]

export const faq = [
  {
    q: 'What does Wezigns do?',
    a: 'We design, build, host and maintain custom software, from the first workshop to years after launch.',
  },
  {
    q: 'How do you handle security?',
    a: 'Security is built into the first version, then reviewed and maintained after launch.',
  },
  {
    q: 'Can you take over software another company built?',
    a: 'Yes. It usually starts with a code and hosting review, so we both know exactly what we are taking on.',
  },
  {
    q: 'Do you work with small businesses?',
    a: 'Yes, when custom software is the right fit. If an off-the-shelf tool will do the job, we will say so.',
  },
  {
    q: 'How much does it cost?',
    a: 'Cost depends on scope, integrations and how much your process changes. You get a price and timeline at the end of the Shape stage.',
  },
]

export const enquiryTopics = [
  'A new system',
  'Fixing a process',
  'Connecting tools',
  'A website',
  'Hosting & support',
  'A vendor review',
]

export const countries = [
  { name: 'India', code: 'IN', lat: 13.08, lon: 80.27 },
  { name: 'USA', code: 'US', lat: 40.71, lon: -74.0 },
  { name: 'UK', code: 'GB', lat: 51.5, lon: -0.12 },
  { name: 'Singapore', code: 'SG', lat: 1.35, lon: 103.82 },
  { name: 'Thailand', code: 'TH', lat: 13.75, lon: 100.5 },
  { name: 'Australia', code: 'AU', lat: -33.87, lon: 151.21 },
  { name: 'Netherlands', code: 'NL', lat: 52.37, lon: 4.9 },
  { name: 'UAE', code: 'AE', lat: 25.2, lon: 55.27 },
  { name: 'Malaysia', code: 'MY', lat: 3.14, lon: 101.69 },
  { name: 'Saudi Arabia', code: 'SA', lat: 24.71, lon: 46.67 },
  { name: 'Czech Republic', code: 'CZ', lat: 50.08, lon: 14.43 },
]

// Countries section: Chennai HQ with threads to every country we serve (names must match `countries`).
export const reach = {
  title: 'Delivered across 11 countries.',
  body: 'Designed and built in Chennai. Running every day for teams across Asia, the Middle East, Europe, Australia and the Americas.',
  hq: 'India',
  hqLabel: 'HQ, Chennai',
  regions: [
    { name: 'South Asia', countries: ['India'] },
    { name: 'Middle East', countries: ['UAE', 'Saudi Arabia'] },
    { name: 'Southeast Asia', countries: ['Singapore', 'Malaysia', 'Thailand'] },
    { name: 'Europe', countries: ['UK', 'Netherlands', 'Czech Republic'] },
    { name: 'Oceania', countries: ['Australia'] },
    { name: 'Americas', countries: ['USA'] },
  ],
}

// Contact page (/contact-us)
export const contactPage = {
  kicker: 'Contact',
  title: 'Tell us what is not working.',
  lead: 'We reply within one working day. You get scope, price and timeline in writing before anything is built.',
  phoneNote: 'Head office, Chennai',
  emailNote: 'For enquiries and quotes.',
  // {n} is the number of countries.
  reach: 'Working with teams in {n} countries.',
  reachLink: 'See where',
  // The enquiry form's question, also the no-JavaScript snapshot's form section.
  formIntro: 'What is slowing your team down?',
}

export const footer = [
  { title: 'Explore', links: [['What we build', '#build'], ['How we build', '#process'], ['Work', '/portfolio'], ['How pricing works', '/pricing'], ['Questions', '#faq']] },
  {
    title: 'Systems',
    links: [
      ['All systems', '/our-services'],
      ['People & workforce', '/systems/people'],
      ['Revenue & customers', '/systems/revenue'],
      ['Operations & supply chain', '/systems/operations'],
      ['Ecommerce', '/systems/ecommerce'],
      ['Finance & governance', '/systems/finance'],
      ['Industry systems', '/systems/industry'],
    ],
  },
  { title: 'Capabilities', links: [['Custom software', '#build'], ['System integration', '#integrations'], ['AI', '/ai'], ['Technology', '/technology']] },
  { title: 'Company', links: [['About', '/about-us'], ['Contact', '/contact-us'], ['Email us', 'mailto:contact@wezigns.com']] },
] as const

// Footer bottom row, beside the copyright.
export const legalLinks = [
  { label: 'Privacy policy', href: '/privacy-policy' },
  { label: 'Terms and conditions', href: '/terms-and-conditions' },
  { label: 'Cookie policy', href: '/cookie-policy' },
  { label: 'Sitemap', href: '/sitemap.xml' },
]

// One line beside each enquiry form's submit button: the purpose, stated where the details are collected.
export const privacyNotice = {
  text: "We'll use your details to reply to your enquiry by email or phone. See our",
  link: { label: 'privacy policy', href: '/privacy-policy' },
}

// Optional, unticked marketing opt-in on both enquiry forms. `label` is the exact consent wording: it is quoted in
// the enquiry email as the record of consent, and api/enquiry.ts keeps a copy (api/_enquiry.test.ts checks they match).
export const marketingOptIn = {
  label: 'Email me occasional updates from Wezigns. You can unsubscribe at any time.',
  hint: 'Optional. Your enquiry is sent either way.',
}

// Second page: the time-loom concept (loom.html).
export const loom = {
  eyebrow: 'Custom business software since 2012',
  title: ['Every loose thread,', 'woven into', 'one system.'],
  sub: 'We design, build and run custom software for businesses that have outgrown spreadsheets, chat threads and manual work. Priced on outcomes, agreed before we build.',
  // Links straight to the system pages, which convert best (docs/audience-study/summary.md).
  systemsLine: 'Systems we build',
  // Hero copy chosen by the simulated 5-second persona test (see docs/concept-study.md, "Hero copy test").
  phases: [
    { kicker: 'We map it', title: 'Start with a clear map of how work runs.', body: 'We map every spreadsheet, chat group and workaround your team relies on before we write a line of code.' },
    { kicker: 'We build it', title: 'One system, built around your workflow.', body: 'Orders, people, approvals and reports in one place, connected to the tools you already use, with security built in from day one.' },
    { kicker: 'We run it', title: 'We stay on after launch.', body: 'We host, monitor and maintain what we build, and keep improving it as your business grows.' },
  ],
  weave: { title: 'Swap the workarounds for customised software with Wezigns.' },
  threadsIn: ['orders_FINAL_v7.xlsx', 'Ops WhatsApp group', 'Email approvals', 'Paper forms', 'Legacy database', 'Side tools', 'Manual re-entry', 'Who approved this?'],
  threadsOut: ['One source of truth', 'Approvals with an audit trail', 'Live dashboards', 'Connected tools', 'Secure by default', 'Grows in stages'],
  closing: { title: 'Hand us the tangle.', body: 'Tell us what is not working. We reply within one working day.', cta: 'Start the conversation', href: '#contact' },
  nav: [
    { label: 'The weave', href: '#weave' },
    { label: 'Before / after', href: '#before-after' },
    { label: 'Services', href: '#services' },
    { label: 'Work', href: '#work' },
    { label: 'Questions', href: '#faq' },
  ],
  // Sections listed on the side "thread" rail, in page order.
  rail: [
    { label: 'Loom', href: '#top' },
    { label: 'Weave', href: '#weave' },
    { label: 'Proof', href: '#stats' },
    { label: 'Before / after', href: '#before-after' },
    { label: 'Services', href: '#services' },
    { label: 'Work', href: '#work' },
    { label: 'Process', href: '#process' },
    { label: 'Questions', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ],
  untangle: ['Spreadsheets', 'WhatsApp groups', 'Email approvals', 'Paper forms', 'Legacy databases', 'Copy → paste', 'Monday reports', 'Side tools'],
  stats: { kicker: 'At the loom since 2012', title: 'Woven, shipped and still running.' },
  beforeAfter: {
    // The "after" dashboard in the slider. Figures and names are invented and carry `sampleDataLabel`.
    app: {
      url: 'ops.wezigns.app',
      kpis: [
        { label: 'Orders today', value: '1,284' },
        { label: 'On time', value: '98.2%' },
        { label: 'Approvals pending', value: '0' },
      ],
      rows: [
        { label: 'PO-2231, Apex Industrial', status: 'Approved' },
        { label: 'Stock: finished goods', status: 'Live' },
        { label: 'Weekly report', status: 'Auto, Mon 9:00' },
      ],
    },
    title: 'From a dozen apps and manual work to one unified system.',
    before: ['Orders tracked in three spreadsheets', 'Approvals buried in chat', 'Stock counted every Friday', 'Reports rebuilt by hand each Monday'],
    after: ['One order system', 'Approvals with an audit trail', 'Live stock levels', 'Reports that build themselves'],
  },
  looms: { kicker: 'Three looms, one team', title: 'Build it. Connect it. Keep it running.' },
  timelines: { kicker: 'Work', title: 'Two tangles, straightened.' },
  contact: { kicker: 'Contact', title: 'Hand us the tangle.', body: 'Tell us what is slowing your team down. We reply within one working day.' },
}


// "Executive AI Summary": opens an AI assistant with a ready-made prompt about Wezigns. `{q}` is replaced with the
// URL-encoded prompt. Gemini has no prompt URL, so its tile opens Google's AI Mode (Gemini-powered).
export const aiSummary = {
  title: 'Executive AI Summary',
  prompt:
    'Give me an executive summary of Wezigns Software Private Limited (https://www.wezigns.com), a custom software and systems company in Chennai, India, founded in 2012. Cover: what they build (business systems for HR, CRM, operations, ecommerce, finance and industry, plus AI workflows and custom AI solutions), who they serve (SMEs and MSMEs in India and 10 other countries), how they work and price projects, and what a growing business should ask them before starting.',
  engines: [
    { key: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/?q={q}' },
    { key: 'claude', name: 'Claude', url: 'https://claude.ai/new?q={q}' },
    { key: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/search?q={q}' },
    { key: 'gemini', name: 'Gemini', url: 'https://www.google.com/search?udm=50&q={q}' },
    { key: 'grok', name: 'Grok', url: 'https://grok.com/?q={q}' },
  ],
}

// Technology stack. From the old wezigns.com (PHP, Laravel, CodeIgniter, WordPress, Magento, MySQL, Android) plus
// what building today's systems and AI needs. Review before launch.
export const stack = [
  { group: 'Web & app front end', items: ['React', 'Next.js', 'TypeScript', 'Angular', 'HTML5 / CSS', 'Tailwind CSS'] },
  { group: 'Back end & APIs', items: ['Node.js', 'Python', 'FastAPI', 'Django', 'PHP', 'Laravel', 'CodeIgniter', 'REST', 'GraphQL', 'Webhooks'] },
  { group: 'Mobile', items: ['React Native', 'Flutter', 'Android', 'iOS', 'Progressive web apps'] },
  { group: 'Databases & data', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'BigQuery'] },
  { group: 'AI & machine learning', items: ['OpenAI', 'Claude', 'Gemini', 'Open-source models', 'LangChain', 'LlamaIndex', 'pgvector', 'Retrieval (RAG)', 'OCR & document AI', 'Whisper speech-to-text'] },
  { group: 'Cloud, DevOps & security', items: ['AWS', 'Google Cloud', 'Microsoft Azure', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Cloudflare', 'Monitoring & alerts'] },
  { group: 'Commerce & content', items: ['Shopify', 'Magento', 'WooCommerce', 'WordPress', 'Headless CMS'] },
  { group: 'Payments, messaging & integrations', items: ['Stripe', 'Razorpay', 'Twilio', 'WhatsApp Business Platform', 'Mailchimp', 'Klaviyo', 'Google Workspace', 'Microsoft 365'] },
]

export const technologyPage = {
  kicker: 'Technology',
  title: ['The stack behind', 'the systems', 'we build.'],
  lead: 'For technical teams: the languages, frameworks, data and cloud tools we build with, how a Wezigns system fits together, and how we add AI. We pick the stack for your system, not the other way round.',
  stackTitle: 'What we build with',
  stackIntro: 'From the PHP and Laravel systems we have run since 2012 to today’s React, Python and AI work.',
  layersTitle: 'How a system fits together',
  layers: [
    { name: 'Screens', text: 'Web and mobile apps your team and customers use, fast on any phone.', items: ['React', 'Next.js', 'React Native', 'Flutter'] },
    { name: 'Business logic & APIs', text: 'The rules of your business: approvals, pricing, stock, payroll.', items: ['Node.js', 'Python', 'Laravel', 'REST / GraphQL'] },
    { name: 'Data', text: 'One source of truth, backed up and searchable.', items: ['PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch'] },
    { name: 'Integrations', text: 'Connections to the tools you already pay for.', items: ['Payments', 'Messaging', 'Commerce', 'Accounting'] },
    { name: 'AI', text: 'Models that read, flag and draft, with a person signing off.', items: ['OpenAI', 'Claude', 'Gemini', 'RAG'] },
    { name: 'Hosting & monitoring', text: 'Run, watched and maintained after launch.', items: ['AWS', 'Google Cloud', 'Docker', 'Alerts'] },
  ],
  aiTitle: 'How we add AI',
  ai: [
    { title: 'Your data first', text: 'Answers come from your own records and documents, retrieved at the moment they are needed.' },
    { title: 'The right model for the job', text: 'Hosted models such as OpenAI, Claude or Gemini, or open-source models where data must stay in your own cloud.' },
    { title: 'People approve, everything is logged', text: 'Key decisions wait for a person. Every AI action is recorded.' },
  ],
}

// Calls to action placed where a visitor is ready to act. `contact` is the shared primary action.
export const ctas = {
  contact: { label: 'Tell us what is not working', href: '/contact-us' },
  // Under the systems explorer tabs; changes with the selected system.
  explorer: { title: 'Want this for your team?', body: 'We build it around how your team works, with one price agreed first.', explore: 'Explore systems' },
  hero: { secondary: { label: 'See our work', href: '#work' } },
  aiDemo: { label: 'See how we use AI', href: '/ai' },
  integrations: { label: 'See our full stack', href: '/technology' },
  faq: { title: 'Still have a question?', body: 'Call or email us. We reply within one working day.', call: 'Call' },
  system: {
    title: 'Want this for your team?',
    body: 'We map how your team works today, then give you one price and one timeline before anything is built.',
    secondary: { label: 'How pricing works', href: '/pricing' },
  },
  ai: {
    title: 'Which job would you hand to AI first?',
    body: 'Tell us the task. We test AI on your own past cases before anyone relies on it.',
    secondary: { label: 'See our AI stack', href: '/technology' },
  },
  technology: {
    title: 'Not sure which stack fits?',
    body: 'Tell us what the system has to do. We choose the stack around it and explain why.',
    secondary: { label: 'Explore the systems', href: '/our-services' },
  },
  about: {
    title: 'Work with a team that has been building since 2012.',
    body: 'Tell us what is slowing your team down. We reply within one working day.',
    secondary: { label: 'See our work', href: '/portfolio' },
  },
  portfolio: {
    title: 'Your system could be next.',
    body: 'Tell us what is slowing your team down. We map it with you, then agree one price and one timeline before we build.',
    secondary: { label: 'How pricing works', href: '/pricing' },
  },
  pricing: {
    title: 'Want a price for your system?',
    body: 'Tell us what is slowing your team down. We map it with you, then give you one price and one timeline before we build.',
    secondary: { label: 'See our work', href: '/portfolio' },
  },
}
