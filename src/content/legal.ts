// Copy for the legal pages: Privacy Policy, Terms and Conditions and Cookie Policy.
// DRAFT: written from the research in docs/legal/research.md. A qualified lawyer must review all of it before it
// is published. Placeholders are in [square brackets]; search for "[" to find them.
// The text describes the site as it will be at launch: fonts self-hosted (no Google Fonts requests), Google Analytics 4
// only after the visitor accepts the cookie banner (Consent Mode v2, basic mode; choice in localStorage `wz-consent`),
// and an optional, unticked opt-in for marketing emails on both enquiry forms. If the code changes (new analytics,
// embeds, cookies, a mailing tool), update this file and the research notes first.

import { brand, marketingOptIn } from './site.ts'

export type LegalSection = { id: string; heading: string; body: string[] }
export type LegalDoc = { title: string; lead: string; sections: LegalSection[] }

const address = brand.address.join(', ')
const privacyEmail = brand.email

export const legalMeta = {
  updated: '2026-10-20',
  // The visible draft notice is off (client decision, 2026-10-20). Placeholders such as [CIN] stay until the
  // details arrive; set a note here again to show it on every legal page.
  reviewNote: '',
}

export const privacyPolicy: LegalDoc = {
  title: 'Privacy Policy',
  lead: 'We collect only what we need: the details you send in an enquiry, the basic logs any website needs to run and, if you allow it, website analytics. If you ask for them, we also send occasional emails. This page explains what we hold, why, and how you can control it.',
  sections: [
    {
      id: 'who-we-are',
      heading: 'Who we are',
      body: [
        `This website, ${brand.url.replace('https://', '')}, is run by ${brand.legal} ("Wezigns", "we", "us"), a company registered in India.`,
        `Registered office: ${address}. Company registration number (CIN): [CIN]. Phone: ${brand.phone}. Email: ${brand.email}.`,
        'For the personal data described here, we decide why and how it is used. Under Indian law that makes us the Data Fiduciary. Under the EU and UK GDPR we are the controller.',
        'This policy covers this website only. When we build software for a client, how personal data is handled in that project is set out in our contract with that client.',
      ],
    },
    {
      id: 'what-we-collect',
      heading: 'What we collect and why',
      body: [
        'Replying to your enquiry. Our forms ask for your name, email address, the topics you need help with and your message. Company and phone number are optional. We also record which page the form was sent from. We use these details to reply to you by email or phone about your enquiry, to understand what you need and, if you ask, to prepare a proposal. We do not use your phone number for sales or promotional calls. Legal basis: you give us this information yourself for this purpose (Digital Personal Data Protection Act 2023, section 7(a)); under the GDPR and UK GDPR, taking steps at your request before a contract and our legitimate interest in answering business enquiries.',
        'If you then talk to us by email or phone. We keep that correspondence with your enquiry, for the same purpose and on the same basis.',
        `Marketing emails, only if you ask. Each form has a separate box: "${marketingOptIn.label}" It is optional and unticked. Your enquiry is sent whether you tick it or not. If you tick it, we add your email address to our mailing list and send you occasional news about our work and services. We send these by email only, never by phone call or SMS. Every email has an unsubscribe link. We keep a record of when you agreed and the words you agreed to. Legal basis: your consent (Digital Personal Data Protection Act 2023, section 6; GDPR and UK GDPR, Article 6(1)(a); in the UK, also the Privacy and Electronic Communications Regulations). You can withdraw it at any time with the unsubscribe link or by emailing ${privacyEmail}.`,
        'Website analytics, only if you accept. If you accept analytics cookies in our cookie banner, we use Google Analytics 4 to see how the site is used, so we can improve it. It records the pages you visit, events such as button clicks and forms being sent, your approximate location (such as country and city, worked out from your IP address), and your device, browser, operating system and screen size. We do not send your name, email address, phone number or message to Google Analytics. When a form is sent, it records only that a form was sent, which form, and whether the marketing box was ticked. Google signals and all advertising features are turned off. Legal basis: your consent (Digital Personal Data Protection Act 2023, section 6; GDPR and UK GDPR, Article 6(1)(a), and the EU and UK cookie rules). If you reject, or do not choose, Google Analytics does not load and nothing is sent to Google. You can change your choice at any time with the "Cookie settings" link in the footer.',
        'When you visit any page. Our hosting provider keeps standard server logs: your IP address, browser type, the page requested and the time. These are used only to deliver the site, keep it secure and fix faults. Legal basis: our duty to keep data secure and our legitimate interest in running a safe, reliable website.',
        'Each form also contains a hidden field that people cannot see. It catches automated spam and holds no personal data.',
      ],
    },
    {
      id: 'what-we-dont-collect',
      heading: 'What we do not do',
      body: [
        'We do not sell your personal data, and we do not share it with anyone for their own marketing.',
        'We do not advertise to you. There are no advertising or social media pixels, no remarketing and no ad cookies on this website.',
        'We do not profile you. We look at analytics only as totals and trends, such as how many people visited a page. We do not use fingerprinting or session recording.',
        'There are no user accounts and no payments on this website.',
        'Our forms do not ask for sensitive information such as health, financial or identity details. Please do not include it in your message.',
      ],
    },
    {
      id: 'providers',
      heading: 'Who handles your data for us',
      body: [
        'Vercel Inc. (United States) hosts this website and runs the small server function that receives your enquiry. It serves the site through a global network, so a request may be handled in a data centre near you. It keeps the server logs described above.',
        `Resend Inc. (United States) sends your enquiry to our mailbox (${brand.email}). The enquiry is not stored in a database. It lives in our email.`,
        'Google provides Google Analytics: Google Ireland Limited for visitors in the European Economic Area and the United Kingdom, and Google LLC (United States) elsewhere. It runs only if you accept analytics cookies. Google processes the analytics data for us under its data processing terms.',
        'If we use a separate service to send marketing emails, we will name it here before we start using it. It will act only on our instructions.',
        'If the form cannot reach our server, it opens your own email app with your message filled in. You then send it yourself, through your own email provider.',
        'These providers act only on our instructions, under data processing terms that require them to keep the data secure and confidential.',
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
        'We are based in India, and our providers are based in the United States or have parent companies there. So your enquiry is handled in India and the United States, server logs may be handled wherever Vercel has a data centre, and analytics data may be handled in the United States.',
        'Vercel, Resend and Google LLC are certified under the EU-US Data Privacy Framework. Their data processing terms also include the European Commission Standard Contractual Clauses and the UK Addendum.',
        'If you write to us from the European Economic Area or the United Kingdom, your enquiry comes to us in India so that we can answer the request you have made (GDPR and UK GDPR, Article 49(1)(b)).',
        'Transfers out of India follow section 16 of the Digital Personal Data Protection Act 2023 and any restrictions the Government of India sets.',
      ],
    },
    {
      id: 'retention',
      heading: 'How long we keep it',
      body: [
        'Enquiries and related emails: 24 months from our last contact with you, then deleted. If you become a client, we keep them as part of the client record for as long as our contract and the law require.',
        'Marketing list: until you unsubscribe or ask us to remove you. After that, we keep only your email address on a suppression list, so that we never email you again by mistake. We keep the record of your consent with it, so we can show when and how you agreed.',
        'Analytics: Google Analytics keeps the event data for 14 months, then deletes it. Reports made only of totals do not identify anyone.',
        'Your cookie choice: kept in your browser for 12 months. See our Cookie Policy.',
        'Server logs: kept by Vercel for a short period, for running and securing the site.',
        'You can ask us to delete your data sooner. See "Your rights" below.',
      ],
    },
    {
      id: 'security',
      heading: 'How we keep it safe',
      body: [
        'The website is served only over an encrypted connection (HTTPS). Enquiries travel encrypted to our server function and on to our mailbox.',
        'Only the people at Wezigns who answer enquiries can read our enquiry mailbox.',
        'We use established providers that commit, in their data processing terms, to keep the data secure.',
        'No system is perfectly secure. If a breach affects your personal data, we will tell you and the relevant authorities as the law requires.',
      ],
    },
    {
      id: 'your-rights',
      heading: 'Your rights',
      body: [
        'Wherever you are, you can ask us to: tell you what personal data we hold about you and how we use it; correct or complete it; delete it; and stop using it.',
        `Where we rely on your consent, you can withdraw it at any time, as easily as you gave it. For marketing emails, use the unsubscribe link in any email or write to ${privacyEmail}. For analytics, use the "Cookie settings" link in the footer. Withdrawing does not affect anything we did before, and it does not affect your enquiry.`,
        'You can object to marketing at any time, and we will stop. You do not need to give a reason.',
        'In India (Digital Personal Data Protection Act 2023): you can also raise a grievance with us, and nominate someone to exercise your rights if you die or become unable to.',
        'In the EU and UK (GDPR and UK GDPR): you can also object to processing based on legitimate interests, ask us to restrict processing, and receive the data you gave us in a portable format.',
        'Similar rights apply under the laws of Singapore, Thailand, Malaysia, the UAE, Saudi Arabia, Australia and the United States, where those laws apply to us. We will honour any right your local law gives you.',
        `To use any of these rights, email ${privacyEmail} or write to us at the address above. We may ask you to confirm your identity. We will reply within one month. If your request is complex, we will tell you why we need longer, and we will never take more than the time your law allows.`,
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
        `Name: [Grievance Officer name]. Designation: [Designation]. Email: ${privacyEmail}. Phone: ${brand.phone}. Address: ${address}.`,
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
        'We will update this policy when the website or the law changes. The date at the top shows the latest version. If we add a new tool that changes what we collect, we will update this page first and ask for your consent where it is needed.',
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
        'Our case studies describe real projects. They name the sector, not the client, and some details are changed to protect confidentiality. The project list on our portfolio page uses the project names that were already published on our earlier website. If you would like your project removed from that list, email us and we will take it down.',
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
        'The website is free to use. So, to the extent the law allows, any liability we have to you for a claim about the website itself is limited to what is fair and reasonable in the circumstances.',
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
  lead: 'We store one small item in your browser to remember your cookie choice. Google Analytics cookies are set only if you accept them. Saying no makes no difference to how you can use the site.',
  sections: [
    {
      id: 'what-we-use',
      heading: 'What we use',
      body: [
        'Cookies and local storage are small pieces of information a website keeps in your browser. We use two kinds: one that is strictly necessary, and analytics cookies that are optional and set only if you say yes.',
        'We use no advertising, social media or tracking pixels, and no fingerprinting. Our fonts are served from our own website, so visiting does not contact Google Fonts or any other font service.',
        'Like every website, our host keeps basic server logs, such as your IP address and the page requested, to deliver and secure the site. This does not store anything on your device. See our Privacy Policy for details.',
      ],
    },
    {
      id: 'strictly-necessary',
      heading: 'Strictly necessary: your cookie choice',
      body: [
        'Name: wz-consent. Type: local storage in your browser (not a cookie). Set by: Wezigns. Purpose: remembers whether you accepted or rejected analytics cookies, so we do not ask you on every page. Kept for: 12 months, then we ask again.',
        'It records only your choice. It is not sent to us or to anyone else. Because the site needs it to respect your choice, it does not need your consent.',
      ],
    },
    {
      id: 'analytics',
      heading: 'Analytics: Google Analytics, only if you accept',
      body: [
        'Name: _ga. Type: cookie. Set by: Google Analytics, on our domain. Purpose: tells one browser\'s visits apart from another\'s, so we can count visitors. Kept for: about 2 years.',
        'Name: _ga_<container-id> (the end is our Google Analytics ID). Type: cookie. Set by: Google Analytics, on our domain. Purpose: keeps track of your current visit. Kept for: about 2 years.',
        'These cookies are set only after you accept. Until then, and if you reject, Google Analytics does not load and nothing is sent to Google.',
        'Google signals and advertising features are turned off. We use the data only as totals, to see how the site is used and improve it. Google keeps the event data for 14 months. See our Privacy Policy for what is collected.',
      ],
    },
    {
      id: 'your-choice',
      heading: 'Accepting, rejecting or changing your choice',
      body: [
        'When you first visit, a banner asks whether you accept analytics cookies. You can accept or reject them. Nothing optional is set before you choose.',
        'You can change your mind at any time with the "Cookie settings" link in the footer of every page. If you withdraw your consent, Google Analytics stops loading from then on.',
        'Rejecting analytics cookies makes no difference to how you can use the site. Every page, form and link works the same.',
        'You can also block or delete cookies and local storage in your browser settings. If you clear the wz-consent item, we will ask for your choice again.',
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
      heading: 'Changes to this policy',
      body: [
        'If we add or change any cookie or similar technology, we will update this page first. Where the law requires it, we will ask for your consent again before anything non-essential is set.',
        `Questions: ${privacyEmail}.`,
      ],
    },
  ],
}
