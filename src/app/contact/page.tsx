import type { Metadata } from 'next';
import { content, footer, contactFacts } from '@/lib/content';
import { contactPage } from '@/lib/pages';
import { Eyebrow } from '@/components/atoms';
import { ContactSection } from '@/components/organisms';
import { DocumentPage } from '@/components/templates';

const page = contactPage;

export const metadata: Metadata = {
  // The content file carries the full title, so bypass the layout's
  // "%s · Wezigns" template rather than doubling the suffix.
  title: { absolute: page.title },
  description: page.description,
  alternates: { canonical: '/contact' },
};

/**
 * Contact as its own page, for people sent straight here.
 *
 * It reuses the home page's `contact` section from content/site.json rather
 * than restating it, so the form, the topics and the reply promise can never
 * drift between the two. The phone and the office render only while those
 * facts exist (rule 1) — see `contactFacts`.
 */
export default function ContactPage() {
  const { sections } = content;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const form = sections.find((s) => (s as any).id === 'contact') as any;
  const { phone, office } = contactFacts();

  return (
    <DocumentPage scene={{ scene: 'start', glyph: 'software' }}>
        {/* The form carries its own H1 here: on this page it is the subject,
            not one section among many. */}
        <ContactSection
          id="contact"
          headline={form.headline}
          topics={form.topics}
          fields={form.fields}
          submit={form.submit}
          promise={form.promise}
          note={form.note}
          requiredNote={form.requiredNote}
          topicLabel={form.topicLabel}
          topicCodes={form.topicCodes}
          as="h1"
        />

        {/* The other ways to reach a person. Each renders only if the fact is
            there — no placeholder number, ever. */}
        <section
          aria-labelledby="contact-direct"
          className="mt-section border-t border-line pt-section"
        >
          <h2 id="contact-direct" className="text-d2 text-balance text-ink">
            Or reach us directly
          </h2>
          <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            <div>
              <dt>
                <Eyebrow>Email</Eyebrow>
              </dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${footer.cta.email}`}
                  className="text-body text-ink-2 underline decoration-line-2 underline-offset-4 transition-colors duration-300 ease-brand hover:text-ink"
                >
                  {footer.cta.email}
                </a>
              </dd>
            </div>

            {phone ? (
              <div>
                <dt>
                  <Eyebrow>Phone</Eyebrow>
                </dt>
                <dd className="mt-1">
                  <a
                    href={phone.href}
                    className="text-body text-ink-2 underline decoration-line-2 underline-offset-4 transition-colors duration-300 ease-brand hover:text-ink"
                  >
                    {phone.display}
                  </a>
                </dd>
              </div>
            ) : null}

            {office ? (
              <div>
                <dt>
                  <Eyebrow>{office.label ?? 'Office'}</Eyebrow>
                </dt>
                <dd className="mt-1">
                  <address className="not-italic text-body leading-relaxed text-ink-2">
                    {office.lines?.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                    <span className="block">
                      {[office.city, office.postalCode].filter(Boolean).join(' ')}
                      {office.country ? `, ${office.country}` : ''}
                    </span>
                  </address>
                  {office.mapUrl ? (
                    <a
                      href={office.mapUrl}
                      className="mt-2 inline-flex min-h-10 items-center text-small text-ink-2 underline decoration-line-2 underline-offset-4 transition-colors duration-300 ease-brand hover:text-ink"
                    >
                      Open in Google Maps
                    </a>
                  ) : null}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
    </DocumentPage>
  );
}
