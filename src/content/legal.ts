// Copy for the legal pages: Privacy Policy, Terms and Conditions and Cookie Policy.
// DRAFT: written from the research in docs/legal/research.md. A qualified lawyer must review all of it before it
// is published. Placeholders are in [square brackets]; search for "[" to find them.
// The text describes the site as it will be at launch: fonts self-hosted (no Google Fonts requests), no cookies,
// no analytics. If the code changes (analytics, embeds, cookies), update this file and the research notes first.

import { brand } from './site.ts'

export type LegalSection = { id: string; heading: string; body: string[] }
export type LegalDoc = { title: string; lead: string; sections: LegalSection[] }

const address = brand.address.join(', ')
const grievanceEmail = 'privacy@wezigns.com [confirm: or contact@wezigns.com]'

export const legalMeta = {
  updated: '2026-10-19',
  reviewNote:
    'Draft for review by a qualified lawyer before publishing. Fill in every [placeholder] and remove this note once approved.',
}

export const privacyPolicy: LegalDoc = {
  title: 'Privacy Policy',
  lead: 'We collect very little through this website: only what you choose to send us in an enquiry, and the basic logs any website needs to run. We use no cookies and no tracking. This page explains what we hold, why, and how you can control it.',
  sections: [
    {
      id: 'who-we-are',
      heading: 'Who we are',
      body: [
        `This website, ${brand.url.replace('https://', '')}, is run by ${brand.legal} ("Wezigns", "we", "us"), a company registered in India. CIN: [CIN]. GSTIN: [GSTIN].`,
        `Registered office: ${address}. Phone: ${brand.phone}. Email: ${brand.email}.`,
        'For the personal data described here, we decide why and how it is used. Under Indian law that makes us the Data Fiduciary. Under the EU and UK GDPR we are the controller.',
        'This policy covers this website only. When we build software for a client, how personal data is handled in that project is set out in our contract with that client.',
      ],
    },
    {
      id: 'what-we-collect',
      heading: 'What we collect and why',
      body: [
        'When you send an enquiry. Our forms ask for your name, email address, the topics you need help with and your message. Company and phone number are optional. We also record which page the form was sent from. We use these details to reply to you, to understand what you need and, if you ask, to prepare a proposal. Legal basis: you give us this information yourself for this purpose (Digital Personal Data Protection Act 2023, section 7(a)); under the GDPR and UK GDPR, taking steps at your request before a contract and our legitimate interest in answering business enquiries.',
        'If you then talk to us by email or phone. We keep that correspondence with your enquiry, for the same purpose and on the same basis.',
        'When you visit any page. Our hosting provider keeps standard server logs: your IP address, browser type, the page requested and the time. These are used only to deliver the site, keep it secure and fix faults. Legal basis: our duty to keep data secure and our legitimate interest in running a safe, reliable website.',
        'Each form also contains a hidden field that people cannot see. It catches automated spam and holds no personal data.',
        'We do not use your details for marketing. If we ever want to send you news, we will ask you first and you can say no.',
      ],
    },
    {
      id: 'what-we-dont-collect',
      heading: 'What we do not collect',
      body: [
        'This website sets no cookies and stores nothing in your browser (no local storage or session storage).',
        'We use no analytics, no advertising or social media pixels, no fingerprinting and no session recording.',
        'There are no user accounts and no payments on this website.',
        'We do not sell your personal data or share it for advertising.',
        'Our forms do not ask for sensitive information such as health, financial or identity details. Please do not include it in your message.',
      ],
    },
    {
      id: 'providers',
      heading: 'Who handles your data for us',
      body: [
        'Vercel Inc. (United States) hosts this website and runs the small server function that receives your enquiry. It serves the site through a global network, so a request may be handled in a data centre near you. It keeps the server logs described above.',
        `Resend Inc. (United States) sends your enquiry to our mailbox (${brand.email}). The enquiry is not stored in a database. It lives in our email.`,
        'If the form cannot reach our server, it opens your own email app with your message filled in. You then send it yourself, through your own email provider.',
        'Both providers act only on our instructions, under data processing agreements that require them to keep the data secure and confidential.',
        'Our fonts are served from our own website. Your browser does not contact Google or any other font service when you visit.',
        'We may share personal data if the law requires it, for example with a court or a regulator, or to protect our legal rights.',
      ],
    },
    {
      id: 'outbound-links',
      heading: 'Links to other services',
      body: [
        'Some links open other services: Google Maps for our address, your phone or email app, and the Executive AI Summary links to ChatGPT, Claude, Perplexity, Google AI Mode and Grok.',
        'These links send nothing about you to those services until you click. When you do, the link opens in a new tab with a ready-made question about Wezigns. From then on, that service handles your data under its own privacy policy, not ours. We do not receive what you type there or what it answers.',
      ],
    },
    {
      id: 'transfers',
      heading: 'International transfers',
      body: [
        'We are based in India, and our providers are based in the United States. So your enquiry is handled in India and the United States, and server logs may be handled wherever Vercel has a data centre.',
        'Vercel and Resend are both certified under the EU-US Data Privacy Framework, and their data processing agreements also include the European Commission Standard Contractual Clauses and the UK Addendum.',
        'If you write to us from the European Economic Area or the United Kingdom, your enquiry comes to us in India so that we can answer the request you have made (GDPR and UK GDPR, Article 49(1)(b)).',
        'Transfers out of India follow section 16 of the Digital Personal Data Protection Act 2023 and any restrictions the Government of India sets.',
      ],
    },
    {
      id: 'retention',
      heading: 'How long we keep it',
      body: [
        'Enquiries and related emails: 24 months from our last contact with you [confirm], then deleted. If you become a client, we keep them as part of the client record for as long as our contract and the law require.',
        'Server logs: kept by Vercel for a short period, usually between one hour and 30 days [confirm], for running and securing the site.',
        'You can ask us to delete your enquiry sooner. See "Your rights" below.',
      ],
    },
    {
      id: 'security',
      heading: 'How we keep it safe',
      body: [
        'The website is served only over an encrypted connection (HTTPS). Enquiries travel encrypted to our server function and on to our mailbox.',
        'Access to our mailbox and hosting accounts is limited to the people who need it, and protected by strong passwords and two-step sign-in [confirm].',
        'No system is perfectly secure. If a breach affects your personal data, we will tell you and the relevant authorities as the law requires.',
      ],
    },
    {
      id: 'your-rights',
      heading: 'Your rights',
      body: [
        'Wherever you are, you can ask us to: tell you what personal data we hold about you and how we use it; correct or complete it; delete it; and stop using it. Where we rely on your consent, you can withdraw it at any time, as easily as you gave it.',
        'In India (Digital Personal Data Protection Act 2023): you can also raise a grievance with us, and nominate someone to exercise your rights if you die or become unable to.',
        'In the EU and UK (GDPR and UK GDPR): you can also object to processing based on legitimate interests, ask us to restrict processing, and receive the data you gave us in a portable format.',
        'Similar rights apply under the laws of Singapore, Thailand, Malaysia, the UAE, Saudi Arabia, Australia and the United States, where those laws apply to us. We will honour any right your local law gives you.',
        `To use any of these rights, email ${grievanceEmail} or write to us at the address above. We may ask you to confirm your identity. We will reply within one month. If your request is complex, we will tell you why we need longer, and we will never take more than the time your law allows.`,
        'Using your rights is free.',
      ],
    },
    {
      id: 'children',
      heading: 'Children',
      body: [
        'This website is for businesses and is not meant for anyone under 18. We do not knowingly collect personal data from children. If you think a child has sent us an enquiry, contact us and we will delete it.',
      ],
    },
    {
      id: 'contact',
      heading: 'Grievance Officer and contact',
      body: [
        'Our Grievance Officer handles privacy questions, requests and complaints.',
        `Name: [Grievance Officer name]. Designation: [Designation]. Email: ${grievanceEmail}. Phone: ${brand.phone}. Address: ${address}.`,
        'We will acknowledge your message promptly and resolve it within one month of receiving it.',
      ],
    },
    {
      id: 'complaints',
      heading: 'Complaints to a regulator',
      body: [
        'Please contact us first. We would like the chance to put things right.',
        'In India, once you have used our grievance process, you can complain to the Data Protection Board of India.',
        'In the United Kingdom, you can complain to the Information Commissioner\'s Office (ico.org.uk). In the EU, you can complain to the data protection authority where you live or work, for example the Autoriteit Persoonsgegevens in the Netherlands or the Office for Personal Data Protection (ÚOOÚ) in the Czech Republic.',
        'Elsewhere, you can contact your local regulator, such as the Personal Data Protection Commission in Singapore, the Personal Data Protection Committee in Thailand, or the Office of the Australian Information Commissioner.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      body: [
        'We will update this policy when the website or the law changes. The date at the top shows the latest version. If we ever start using cookies, analytics or anything else that changes what we collect, we will update this page first and ask for your consent where it is needed.',
      ],
    },
  ],
}

export const termsOfUse: LegalDoc = {
  title: 'Terms and Conditions',
  lead: 'These terms cover your use of this website. They are not a contract for software work: that is always a separate written agreement.',
  sections: [
    {
      id: 'who-we-are',
      heading: 'Who we are',
      body: [
        `This website is run by ${brand.legal}, a company registered in India (CIN: [CIN]), with its registered office at ${address}.`,
        'By using this website you accept these terms. If you do not agree, please do not use it.',
      ],
    },
    {
      id: 'using-the-site',
      heading: 'Using the site',
      body: [
        'You may browse, read and share links to this website for your own information and to consider working with us.',
        'Please do not misuse it. That means no attempts to break in, overload or disrupt it, no automated scraping that harms its performance, no sending spam or harmful code through our forms, and nothing unlawful.',
        'We may change, pause or remove any part of the website at any time.',
      ],
    },
    {
      id: 'no-offer',
      heading: 'Nothing here is a binding offer',
      body: [
        'The website describes our services, how we work and how we price. It is general information, not an offer.',
        'A price, scope or timeline becomes binding only when both sides sign a written agreement. Anything said before that, on this site, by email or in a call, is an estimate to help you decide.',
      ],
    },
    {
      id: 'intellectual-property',
      heading: 'Intellectual property',
      body: [
        'The website, its text, design, code, illustrations and 3D visuals belong to Wezigns or are used with permission. The Wezigns name and logo are ours.',
        'You may quote short parts with a link back to us. Please do not copy, adapt or reuse the content, design or code without our written permission.',
        'Names of other companies, products and tools belong to their owners and are used only to describe what we work with.',
      ],
    },
    {
      id: 'case-studies',
      heading: 'Case studies and sample figures',
      body: [
        'Our case studies describe real projects. Clients are not named unless they have agreed, and some details are changed to protect confidentiality.',
        'Results such as percentages are what those clients saw in their own circumstances. Your results will depend on your business and are not guaranteed.',
        'The dashboards in the systems explorer and on the system pages show sample data, labelled as such. They illustrate what a system can look like and are not real client figures.',
      ],
    },
    {
      id: 'third-party-links',
      heading: 'Links to other services',
      body: [
        'Some links take you to other services, such as Google Maps or the AI assistants in the Executive AI Summary (ChatGPT, Claude, Perplexity, Google AI Mode and Grok).',
        'We do not control those services. Their own terms and privacy policies apply. AI assistants can make mistakes: what they say about us is their summary, not a statement by Wezigns. Please check anything important with us directly.',
      ],
    },
    {
      id: 'enquiries',
      heading: 'Enquiries and communications',
      body: [
        'When you send an enquiry, please give accurate details and do not include confidential or sensitive information until we have agreed how to handle it, for example under a non-disclosure agreement.',
        'Sending an enquiry does not create a client relationship or oblige either of us to work together.',
        'How we handle the details you send is set out in our Privacy Policy.',
      ],
    },
    {
      id: 'liability',
      heading: 'Our responsibility to you',
      body: [
        'We work to keep the website accurate and available, but we provide it "as is". We do not promise it will always be complete, current, error-free or uninterrupted.',
        'To the extent the law allows, we are not liable for any indirect or consequential loss, or for loss of profit, business, data or opportunity, arising from your use of this website or reliance on its content.',
        'Because the website is free to use, our total liability to you for any claim about the website itself is limited to INR 10,000 [confirm].',
        'Nothing in these terms limits liability that cannot be limited by law, such as liability for fraud.',
      ],
    },
    {
      id: 'governing-law',
      heading: 'Governing law',
      body: [
        'These terms are governed by the laws of India. The courts at Chennai, Tamil Nadu, have exclusive jurisdiction over any dispute about them.',
        'If you use the website from another country, you are responsible for following your local laws. Mandatory consumer protections in your country are not affected.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to these terms',
      body: [
        'We may update these terms. The date at the top shows the latest version. If you keep using the website after a change, the new terms apply.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      body: [`Questions about these terms: ${brand.email}, ${brand.phone}, or write to us at ${address}.`],
    },
  ],
}

export const cookieStatement: LegalDoc = {
  title: 'Cookie Policy',
  lead: 'This website uses no cookies. There is no cookie banner because there is nothing to ask you about.',
  sections: [
    {
      id: 'what-we-use',
      heading: 'What we use',
      body: [
        'We set no cookies, of any kind. We do not use local storage, session storage, tracking pixels, fingerprinting or any similar technology.',
        'There are no analytics, advertising or social media tools on this website. Our fonts are served from our own website, so visiting does not contact Google or any other third party.',
        'Like every website, our host keeps basic server logs, such as your IP address and the page requested, to deliver and secure the site. This does not store anything on your device. See our Privacy Policy for details.',
      ],
    },
    {
      id: 'other-sites',
      heading: 'Other websites',
      body: [
        'If you follow a link to another service, such as Google Maps or an AI assistant, that service may set its own cookies under its own policy.',
      ],
    },
    {
      id: 'changes',
      heading: 'If this changes',
      body: [
        'If we ever add cookies or similar technology, we will update this statement first. Where the law requires it, we will ask for your consent before anything non-essential is set, and saying no will be as easy as saying yes.',
        `Questions: ${grievanceEmail}.`,
      ],
    },
  ],
}
