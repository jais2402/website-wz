'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Reveal } from '@/components/atoms';
import { EvidenceNumber } from '@/components/organisms/EvidenceNumber';
import { AnimatedDisclosure } from '@/components/organisms/AnimatedDisclosure';
import { CapabilitySelector } from '@/components/organisms/CapabilitySelector';
import { ProcessJourney } from '@/components/organisms/ProcessJourney';
import { BusinessJourney } from '@/components/organisms/BusinessJourney';
import { CaseSculpture } from '@/components/three/CaseSculpture';
import { SystemSculpture } from '@/components/three/SystemSculpture';
import type { SiteContent } from '@/types/content';

type Offering = { n: string; title: string; body: string };
type Step = Offering & { output: string };
type Question = { q: string; a: string };
function Action({
  children,
  href,
  light = false,
}: {
  children: ReactNode;
  href: string;
  light?: boolean;
}) {
  return (
    <Link href={href} className={`premium-button ${light ? 'button-light' : ''}`}>
      {children}
    </Link>
  );
}

/** Existing business content, composed as a spatial editorial experience. */
export function PremiumHome({ content }: { content: SiteContent }) {
  const [integrationActive, setIntegrationActive] = useState(-1);
  const [expanded, setExpanded] = useState(false);
  const [sculptureRequested, setSculptureRequested] = useState(false);
  const [topic, setTopic] = useState('A new system');
  const [emailReady, setEmailReady] = useState(false);
  const [draft, setDraft] = useState('');
  const section = <T,>(id: string) => content.sections.find((s) => s.id === id) as unknown as T;
  const offerings = section<{ items: Offering[] }>('build').items;
  const steps = section<{ items: Step[] }>('how').items;
  const questions = section<{ items: Question[] }>('faq').items;
  const contact = section<{ topics: string[]; note: string; promise: { strong: string } }>(
    'contact',
  );
  const range = section<{ items: { title: string; systems: string[] }[] }>('range').items;
  function prepareEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const body = `Name: ${values.get('name')}\nEmail: ${values.get('email')}\nTopic: ${topic}\n\n${values.get('message')}`;
    setDraft(
      `mailto:${content.meta.email}?subject=${encodeURIComponent(`Wezigns enquiry: ${topic}`)}&body=${encodeURIComponent(body)}`,
    );
    setEmailReady(true);
  }
  return (
    <div className="premium-home">
      <a href="#main" className="premium-skip">
        Skip to content
      </a>
      <main id="main">
        <section className="premium-hero" id="hero" aria-labelledby="hero-heading">
          <div className="hero-layout">
            <div className="hero-copy">
              <h1 id="hero-heading">
                Systems that
                <br />
                <span>grow with you.</span>
              </h1>
              <p>
                Custom software for businesses that have outgrown spreadsheets, message threads, and
                manual work.
              </p>
              <div className="hero-ctas">
                <Action href="/#contact">{content.hero.actions[0]!.label}</Action>
                <Link href="/work" className="quiet-link">
                  Explore our work
                </Link>
              </div>
            </div>
            <div className="sculpture-stage">
              <div className="sculpture-fallback" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="sculpture-labels" aria-label="Parts of a connected business">
                <span>People</span>
                <span>Process</span>
                <span>Technology</span>
              </div>
              <SystemSculpture expanded={expanded} enabled={sculptureRequested} />
              <button
                className="sculpture-control"
                aria-pressed={expanded}
                onClick={() => {
                  setSculptureRequested(true);
                  setExpanded(!expanded);
                }}
              >
                <span aria-hidden="true">{expanded ? '−' : '+'}</span>
                {expanded ? 'Bring it together' : 'Explore the system'}
              </button>
            </div>
          </div>
        </section>

        <section className="premium-principles section-pad" id="principles">
          <Reveal>
            <div className="principle-grid">
              {section<{ items: { title: string; body: string; note: string }[] }>(
                'principles',
              ).items.map((item, index) => (
                <div key={item.title}>
                  <CaseSculpture
                    variant={(['simplify', 'scale', 'secure'] as const)[index]!}
                    className="principle-model"
                  />
                  <h3>{item.title}.</h3>
                  <p>{item.body}</p>
                  <small>{item.note}</small>
                </div>
              ))}
            </div>
            <div className="technology-line" id="tech">
              <p>Built with established tools</p>
              <div>
                {['AWS', 'Google Cloud', 'Stripe', 'Razorpay'].map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section id="moment" className="premium-intro section-pad">
          <Reveal>
            <h2>
              When your business
              <br />
              outgrows the <span className="intro-emphasis">workaround.</span>
            </h2>
          </Reveal>
          <Reveal className="intro-bottom">
            <p>
              We understand the process, agree on scope and price, then build a system your team can
              use and grow with.
            </p>
            <div className="intro-proof" id="evidence">
              <div>
                <EvidenceNumber value="20+" />
                <span>Products, portals & platforms</span>
              </div>
              <div>
                <EvidenceNumber value="11" />
                <span>Countries we work in</span>
              </div>
              <div>
                <EvidenceNumber value="2012" count={false} />
                <span>Building since</span>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="work" className="premium-work section-pad">
          <div className="section-heading">
            <h2>Systems we’ve built.</h2>
            <Link href="/work" className="quiet-link">
              All case studies
            </Link>
          </div>
          <div className="work-grid">
            {content.cases.slice(0, 2).map((item, i) => (
              <article key={item.slug} className={`work-card case-${i}`}>
                <Link href={`/work#${item.slug}`} className="case-card-link">
                  <CaseSculpture variant={i === 0 ? 'training' : 'tourism'} />
                  <div className="case-details">
                    <p className="case-sector">
                      {item.sector} · {item.region}
                    </p>
                    <h3>{item.title}</h3>
                    <p className="case-description">{item.body[0]}</p>
                    <div className="case-metrics">
                      {item.metrics.map((metric) => (
                        <div key={metric.label}>
                          <b>{metric.value}</b>
                          <span>{metric.label}</span>
                        </div>
                      ))}
                    </div>
                    <span className="case-read">Read case study</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
          <p className="work-note">Client references shared where permission allows.</p>
        </section>

        <section id="build" className="premium-capabilities section-pad">
          <CapabilitySelector offerings={offerings} />
          <BusinessJourney areas={range} />
        </section>

        <section id="ai" className="premium-ai section-pad">
          <Reveal className="ai-copy">
            <div>
              <h2>
                AI inside the system.
                <br />
                <span>People in control.</span>
              </h2>
              <p>
                AI works with your own data, inside the screens your team already uses. A person
                stays in control of important decisions.
              </p>
              <Link href="/#contact" className="quiet-link">
                {content.hero.actions[0]!.label}
              </Link>
            </div>
          </Reveal>
          <div className="integration-strip" id="integration">
            <div>
              <h3>Your tools, connected.</h3>
              <CaseSculpture
                variant="flow"
                stage={integrationActive}
                className="integration-model"
              />
            </div>
            <div>
              {section<{ items: { title: string; body: string }[] }>('integration').items.map(
                (item, index) => (
                  <AnimatedDisclosure
                    group="integrations"
                    key={item.title}
                    title={item.title}
                    onExpandedChange={(open) =>
                      setIntegrationActive((current) =>
                        open ? index : current === index ? -1 : current,
                      )
                    }
                  >
                    <p>{item.body}</p>
                  </AnimatedDisclosure>
                ),
              )}
            </div>
          </div>
        </section>

        <section id="how" className="premium-process section-pad">
          <div className="section-heading">
            <h2>How we build.</h2>
            <Link href="/how-we-build" className="quiet-link">
              Our way of working
            </Link>
          </div>
          <ProcessJourney steps={steps} />
          <div className="pricing-note" id="pricing">
            <div className="pricing-copy">
              <h3>We price the outcome, not the hours.</h3>
              <p>No build starts before that number is agreed.</p>
            </div>
            <Action href="/#contact">{content.hero.actions[0]!.label}</Action>
          </div>
        </section>

        <section id="faq" className="premium-faq section-pad">
          <Reveal className="faq-layout">
            <div>
              <h2>Questions before you start.</h2>
              <p>
                Sometimes custom software is the right answer. Sometimes it is not, and we will say
                so.
              </p>
              <CaseSculpture variant="questions" className="faq-model" />
            </div>
            <Reveal className="faq-answers" stagger={0.06}>
              {questions.map((q) => (
                <AnimatedDisclosure
                  group="questions"
                  className="premium-question"
                  key={q.q}
                  title={q.q}
                >
                  <p>{q.a}</p>
                </AnimatedDisclosure>
              ))}
            </Reveal>
          </Reveal>
        </section>

        <section id="contact" className="premium-contact section-pad">
          <Reveal className="contact-layout">
            <div>
              <h2>
                Tell us what is
                <br />
                <span>not working.</span>
              </h2>
              <p>Describe the process, where it breaks, and who it slows down.</p>
              <a className="contact-email" href={`mailto:${content.meta.email}`}>
                {content.meta.email}
              </a>
              <a
                className="contact-phone"
                href={`tel:${content.meta.TODO_business_facts.phoneE164}`}
              >
                {content.meta.TODO_business_facts.phone}
              </a>
              <CaseSculpture variant="conversation" className="contact-model" />
            </div>
            <form onSubmit={prepareEmail} onChange={() => setEmailReady(false)}>
              <fieldset>
                <legend>What is this about?</legend>
                <div className="contact-topics">
                  {contact.topics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={topic === t}
                      onClick={() => {
                        setTopic(t);
                        setEmailReady(false);
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="contact-fields">
                <label>
                  Your name
                  <input name="name" autoComplete="name" placeholder="Your name" required />
                </label>
                <label>
                  Work email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                  />
                </label>
              </div>
              <label>
                What is happening today?
                <textarea
                  name="message"
                  placeholder="What happens today, where it breaks, and who it slows down."
                  rows={3}
                  required
                />
              </label>
              <small className="form-requirement">
                All fields are required. This form prepares an email in your email app.
              </small>
              <button type="submit" className="premium-button">
                Prepare your enquiry
              </button>
              {emailReady && (
                <div className="email-result" role="status">
                  <p>Your enquiry is ready. Open your email app to review and send it.</p>
                  <a href={draft}>Open email draft</a>
                </div>
              )}
              <p className="reply-promise">{contact.promise.strong}</p>
              <p className="contact-note">{contact.note}</p>
            </form>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
