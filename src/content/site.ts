// Single source of truth for all site copy. Sourced from website-wz.vercel.app — edit here, not in components.

export const brand = {
  name: 'Wezigns',
  legal: 'Wezigns Software Private Limited',
  email: 'hello@wezigns.com',
  phone: '+91 44 2364 3252',
  phoneHref: 'tel:+914423643252',
  city: 'Chennai, India',
}

export const nav = [
  { label: 'What we build', href: '#build' },
  { label: 'Before / after', href: '#before-after' },
  { label: 'Work', href: '#work' },
  { label: 'How we build', href: '#process' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Questions', href: '#faq' },
]

export const hero = {
  eyebrow: 'Custom software · Since 2012',
  title: ['Systems', 'that grow', 'with you.'],
  sub: 'Custom software for businesses that have outgrown spreadsheets, message threads and manual work.',
  primary: { label: 'Tell us what is not working', href: '#contact' },
  secondary: { label: 'Explore our work', href: '#work' },
  // Floating "chaos" fragments the 3D scene organises as you scroll.
  fragments: [
    'orders_FINAL_v7.xlsx',
    '42 unread · Ops group',
    'Manual entry',
    'Copy → paste → repeat',
    'Who approved this?',
    'Invoice #0193 missing',
  ],
}

export const principles = [
  {
    key: 'simplify',
    index: '01',
    title: 'Simplify',
    body: 'Less manual work and fewer steps, so everyday tasks get easier for the whole team.',
    chips: ['One source of truth', 'Fewer clicks', 'No re-typing'],
  },
  {
    key: 'scale',
    index: '02',
    title: 'Scale',
    body: 'Start focused, ship what matters first, and lay a foundation that is ready to grow.',
    chips: ['Modular by design', 'Grows in stages', 'No rewrites'],
  },
  {
    key: 'secure',
    index: '03',
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
    items: ['Custom business software', 'Customer & partner platforms', 'Ecommerce: catalogue, orders, stock, payments', 'Websites'],
    tone: 'lime',
  },
  {
    key: 'connect',
    kicker: 'Connect & automate',
    title: 'Connect the tools you already pay for.',
    items: ['Business process automation', 'System integration', 'Data & reporting systems', 'AI & Gen-AI integrations'],
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
      { name: 'Attendance', value: 96.4, suffix: '%', decimals: 1, caption: 'present · last 4 weeks', chart: { kind: 'heatmap', cells: 28, seed: 3 } },
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
      { name: 'Support desk', value: 18, caption: 'open tickets · 2.4h avg', delta: '-31%', chart: { kind: 'list', rows: [['#4821 Login loop on portal', 'P1'], ['#4819 Invoice PDF missing', 'P2'], ['#4817 Add GST field', 'P3']] } },
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
      { name: 'Approvals', value: 7, caption: 'awaiting sign-off · 3.2h avg', chart: { kind: 'dots', total: 48, on: 7 } },
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

export const workSection = { title: 'Our Work' }

export const processSection = { kicker: 'How we build', title: 'Four stages. No surprises.' }

export const work = [
  {
    id: 'safety-training',
    place: 'Dubai',
    sector: 'Safety training',
    title: 'One system for registration, trainer scheduling and compliance reporting.',
    before: 'Spreadsheets and chat threads',
    metrics: [
      { value: '80%', label: 'less administrative work' },
      { value: '100,000+', label: 'certifications a year' },
    ],
    tone: 'lime',
  },
  {
    id: 'tourism',
    place: 'Singapore',
    sector: 'Tourism',
    title: 'A shared platform for events and listings, used by operators, planners and agencies.',
    before: 'Disconnected listings and manual updates',
    metrics: [
      { value: '0', label: 'unplanned downtime' },
      { value: '40,000', label: 'requests per minute at peak' },
    ],
    tone: 'violet',
  },
] as const

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
  hqLabel: 'HQ · Chennai',
  regions: [
    { name: 'South Asia', countries: ['India'] },
    { name: 'Middle East', countries: ['UAE', 'Saudi Arabia'] },
    { name: 'Southeast Asia', countries: ['Singapore', 'Malaysia', 'Thailand'] },
    { name: 'Europe', countries: ['UK', 'Netherlands', 'Czech Republic'] },
    { name: 'Oceania', countries: ['Australia'] },
    { name: 'Americas', countries: ['USA'] },
  ],
}

export const footer = [
  { title: 'Explore', links: [['What we build', '#build'], ['How we build', '#process'], ['Work', '#work'], ['Questions', '#faq']] },
  { title: 'Capabilities', links: [['Custom software', '#build'], ['Ecommerce systems', '#build'], ['System integration', '#integrations'], ['AI integrations', '#ai']] },
  { title: 'Company', links: [['Contact', '#contact'], ['Case studies', '#work'], ['Email us', `mailto:${'hello@wezigns.com'}`]] },
] as const

// Second page: the time-loom concept (loom.html).
export const loom = {
  eyebrow: 'Custom business software · Since 2012',
  title: ['Every loose thread,', 'woven into', 'one system.'],
  sub: 'We design, build and run custom software for businesses that have outgrown spreadsheets, chat threads and manual work. Priced on outcomes, agreed before we build.',
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
  stats: { kicker: 'Twelve years at the loom', title: 'Woven, shipped and still running.' },
  beforeAfter: {
    title: 'From a dozen apps and manual work to one unified system.',
    before: ['Orders tracked in three spreadsheets', 'Approvals buried in chat', 'Stock counted every Friday', 'Reports rebuilt by hand each Monday'],
    after: ['One order system', 'Approvals with an audit trail', 'Live stock levels', 'Reports that build themselves'],
  },
  looms: { kicker: 'Three looms, one team', title: 'Build it. Connect it. Keep it running.' },
  timelines: { kicker: 'Work', title: 'Two tangles, straightened.' },
  contact: { kicker: 'Contact', title: 'Hand us the tangle.', body: 'Tell us what is slowing your team down. We reply within one working day.' },
}

