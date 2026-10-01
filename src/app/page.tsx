import { content, footer, contactFacts } from '@/lib/content';
import { JsonLd } from '@/components/atoms';
import { SiteFooter, SiteHeader } from '@/components/organisms';
import { PremiumHome } from '@/components/templates/PremiumHome';
import { faqSchema, organizationSchema, websiteSchema } from '@/lib/structured-data';

export default function HomePage() {
  const faq = faqSchema();
  return (
    <>
      <JsonLd schema={[organizationSchema(), websiteSchema(), ...(faq ? [faq] : [])]} />
      <SiteHeader
        nav={content.nav.primary}
        cta={content.nav.cta}
        wordmark={footer.wordmark}
        name={content.meta.name}
        since={content.meta.since}
      />
      <PremiumHome content={content} />
      <SiteFooter
        {...contactFacts()}
        cta={footer.cta}
        columns={footer.columns}
        wordmark={footer.wordmark}
        base={footer.base}
        primaryCta={content.hero.actions[0]!}
      />
    </>
  );
}
