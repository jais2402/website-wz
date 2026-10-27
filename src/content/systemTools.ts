// Tools each system page says we connect to. Research and reasons: docs/tools-research.md.
// Every entry is a real product with a public API or a documented file/portal format.
// Confirmed by the client on 2026-10-20: all listed integrations stay, Azure is offered, GST goes direct to the portals.

export type Tool = { name: string; role: string }
export type ToolGroup = { label: string; tools: Tool[] }
export type SystemSlug = 'people' | 'revenue' | 'operations' | 'ecommerce' | 'finance' | 'industry'

/** Shared last group on every system page. */
export const HOSTING_GROUP: ToolGroup = {
  label: 'Hosted on',
  tools: [
    { name: 'AWS', role: 'hosting, backups and monitoring' },
    { name: 'Google Cloud', role: 'hosting, backups and monitoring' },
    { name: 'Microsoft Azure', role: 'hosting for Microsoft-based teams' },
  ],
}

export const systemTools: Record<SystemSlug, ToolGroup[]> = {
  people: [
    {
      label: 'Attendance devices',
      tools: [
        { name: 'eSSL', role: 'attendance from biometric devices' },
        { name: 'ZKTeco', role: 'attendance from biometric devices' },
        { name: 'Matrix COSEC', role: 'face and card attendance' },
      ],
    },
    {
      label: 'Payroll & compliance',
      tools: [
        { name: 'EPFO', role: 'PF return files (ECR)' },
        { name: 'ESIC', role: 'ESI contribution files' },
        { name: 'TallyPrime', role: 'payroll entries into accounts' },
        { name: 'Zoho Books', role: 'payroll entries into accounts' },
        { name: 'Xero', role: 'payroll journals for UK and Australia' },
      ],
    },
    {
      label: 'Sign-in & documents',
      tools: [
        { name: 'Google Workspace', role: 'staff sign-in and calendars' },
        { name: 'Microsoft 365', role: 'staff sign-in and calendars' },
        { name: 'DigiLocker', role: 'verified ID and education documents' },
        { name: 'Leegality', role: 'Aadhaar eSign for offer letters' },
        { name: 'DocuSign', role: 'offer letters signed online' },
      ],
    },
    {
      label: 'Staff messages',
      tools: [
        { name: 'WhatsApp Business Platform', role: 'leave and payslip alerts' },
        { name: 'Twilio', role: 'SMS and WhatsApp alerts' },
        { name: 'Microsoft Teams', role: 'approval requests in chat' },
        { name: 'Slack', role: 'approval requests in chat' },
        { name: 'Mailchimp', role: 'staff updates by email' },
      ],
    },
    HOSTING_GROUP,
  ],

  revenue: [
    {
      label: 'CRM & support',
      tools: [
        { name: 'Zoho CRM', role: 'sync contacts and deals' },
        { name: 'HubSpot', role: 'sync contacts and deals' },
        { name: 'Salesforce', role: 'sync accounts and opportunities' },
        { name: 'Freshdesk', role: 'support tickets in one view' },
      ],
    },
    {
      label: 'Payments',
      tools: [
        { name: 'Razorpay', role: 'payment links and UPI' },
        { name: 'Stripe', role: 'cards and subscription billing' },
        { name: 'PayU', role: 'cards, UPI and net banking' },
        { name: 'Cashfree', role: 'payment links and refunds' },
        { name: 'PayPal', role: 'payments from overseas customers' },
        { name: 'Telr', role: 'card payments in the UAE and Saudi' },
        { name: 'PayTabs', role: 'payment links across the Gulf' },
      ],
    },
    {
      label: 'Messaging & calls',
      tools: [
        { name: 'WhatsApp Business Platform', role: 'quotes and payment reminders' },
        { name: 'Twilio', role: 'SMS and WhatsApp alerts' },
        { name: 'Exotel', role: 'click-to-call and call logs' },
        { name: 'Mailchimp', role: 'newsletters and campaigns' },
        { name: 'Klaviyo', role: 'customer email flows' },
      ],
    },
    {
      label: 'Accounting',
      tools: [
        { name: 'TallyPrime', role: 'invoices posted to accounts' },
        { name: 'Zoho Books', role: 'invoices posted to accounts' },
        { name: 'QuickBooks', role: 'invoices and customer balances' },
        { name: 'Xero', role: 'invoices and customer balances' },
      ],
    },
    HOSTING_GROUP,
  ],

  operations: [
    {
      label: 'Order sources',
      tools: [
        { name: 'Shopify', role: 'online orders into one queue' },
        { name: 'WooCommerce', role: 'online orders into one queue' },
        { name: 'Magento', role: 'online orders into one queue' },
        { name: 'Amazon Seller Central', role: 'marketplace orders and stock' },
        { name: 'Flipkart Seller Hub', role: 'marketplace orders and stock' },
      ],
    },
    {
      label: 'Accounts & ERP',
      tools: [
        { name: 'TallyPrime', role: 'purchase and stock vouchers' },
        { name: 'Zoho Books', role: 'bills and purchase orders' },
        { name: 'SAP Business One', role: 'items, orders and stock sync' },
        { name: 'Odoo', role: 'items, orders and stock sync' },
        { name: 'E-way bill (NIC)', role: 'e-way bills for dispatches' },
      ],
    },
    {
      label: 'Shipping',
      tools: [
        { name: 'Shiprocket', role: 'labels and courier tracking' },
        { name: 'Delhivery', role: 'pickups and delivery status' },
        { name: 'DHL Express', role: 'international shipments and tracking' },
        { name: 'Aramex', role: 'Gulf shipments and tracking' },
      ],
    },
    {
      label: 'Alerts & labels',
      tools: [
        { name: 'Twilio', role: 'stock and delay alerts' },
        { name: 'WhatsApp Business Platform', role: 'purchase order approvals' },
        { name: 'Zebra printers', role: 'barcode and bin labels' },
      ],
    },
    HOSTING_GROUP,
  ],

  ecommerce: [
    {
      label: 'Store platforms',
      tools: [
        { name: 'Shopify', role: 'store, catalogue and orders' },
        { name: 'Magento', role: 'store, catalogue and orders' },
        { name: 'WooCommerce', role: 'store, catalogue and orders' },
        { name: 'WordPress', role: 'content pages and blog' },
      ],
    },
    {
      label: 'Payments',
      tools: [
        { name: 'Razorpay', role: 'UPI, cards and wallets' },
        { name: 'Stripe', role: 'cards and international payments' },
        { name: 'PayU', role: 'UPI, cards and EMI' },
        { name: 'Cashfree', role: 'payments and instant refunds' },
        { name: 'PayPal', role: 'payments from overseas buyers' },
        { name: 'Tabby', role: 'pay later in the Gulf' },
        { name: 'Tamara', role: 'pay later in Saudi and the UAE' },
        { name: 'Telr', role: 'card checkout in the UAE and Saudi' },
        { name: 'PayTabs', role: 'Gulf card and wallet payments' },
      ],
    },
    {
      label: 'Marketplaces & shipping',
      tools: [
        { name: 'Amazon Seller Central', role: 'listings, orders and stock' },
        { name: 'Flipkart Seller Hub', role: 'listings, orders and stock' },
        { name: 'Shiprocket', role: 'labels and courier tracking' },
        { name: 'Delhivery', role: 'pickups and delivery status' },
      ],
    },
    {
      label: 'Marketing',
      tools: [
        { name: 'Klaviyo', role: 'abandoned cart and order emails' },
        { name: 'Mailchimp', role: 'newsletters and campaigns' },
        { name: 'WhatsApp Business Platform', role: 'order and delivery updates' },
        { name: 'Google Analytics', role: 'sales and traffic reports' },
        { name: 'Meta Commerce', role: 'catalogue for Instagram and Facebook' },
      ],
    },
    HOSTING_GROUP,
  ],

  finance: [
    {
      label: 'Accounting',
      tools: [
        { name: 'TallyPrime', role: 'vouchers and ledgers sync' },
        { name: 'Zoho Books', role: 'vouchers and ledgers sync' },
        { name: 'QuickBooks', role: 'bills, invoices and ledgers' },
        { name: 'Xero', role: 'bills, invoices and ledgers' },
        { name: 'SAP Business One', role: 'journals and cost centres' },
      ],
    },
    {
      label: 'Tax & e-invoicing',
      tools: [
        { name: 'GST e-invoice (IRP)', role: 'IRN and QR on invoices' },
        { name: 'E-way bill (NIC)', role: 'e-way bills from invoices' },
        { name: 'ClearTax', role: 'GST returns data' },
        { name: 'HMRC Making Tax Digital', role: 'UK VAT returns' },
      ],
    },
    {
      label: 'Payments & payouts',
      tools: [
        { name: 'Razorpay', role: 'collections and vendor payouts' },
        { name: 'Cashfree', role: 'vendor and expense payouts' },
        { name: 'Stripe', role: 'card collections and refunds' },
      ],
    },
    {
      label: 'Reports & checks',
      tools: [
        { name: 'Power BI', role: 'board and finance dashboards' },
        { name: 'Looker Studio', role: 'shared monthly reports' },
        { name: 'Metabase', role: 'self-serve reports on live data' },
        { name: 'DocuSign', role: 'approvals signed online' },
      ],
    },
    HOSTING_GROUP,
  ],

  industry: [
    {
      label: 'Payments',
      tools: [
        { name: 'Razorpay', role: 'fees, bills and EMIs' },
        { name: 'Stripe', role: 'cards and international payments' },
        { name: 'PayU', role: 'fees, bills and EMIs' },
        { name: 'Pine Labs', role: 'card terminals at the counter' },
      ],
    },
    {
      label: 'Identity & KYC',
      tools: [
        { name: 'DigiLocker', role: 'verified customer documents' },
        { name: 'Digio', role: 'Aadhaar eKYC and eSign' },
        { name: 'Leegality', role: 'loan and lease agreements signed' },
      ],
    },
    {
      label: 'Messaging & calls',
      tools: [
        { name: 'WhatsApp Business Platform', role: 'appointment and due-date reminders' },
        { name: 'Twilio', role: 'SMS and WhatsApp alerts' },
        { name: 'Exotel', role: 'call routing and call logs' },
      ],
    },
    {
      label: 'Maps & video',
      tools: [
        { name: 'Google Maps Platform', role: 'routes and live tracking' },
        { name: 'Zoom', role: 'online classes and consultations' },
        { name: 'Google Workspace', role: 'staff sign-in and calendars' },
      ],
    },
    HOSTING_GROUP,
  ],
}

/** Copy around the tool map on each system page. */
export const toolsCopy = {
  countLabel: 'tools this system can connect to',
  note: 'Already pay for something that is not listed? If it has an API or an export, we can usually connect it.',
}
