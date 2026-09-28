import { content, footer } from '@/lib/content';
import { JsonLd } from '@/components/atoms';
import { HeroSection, SiteFooter, SiteHeader } from '@/components/organisms';
import { SectionRenderer, SplitScrollTemplate } from '@/components/templates';
import { SceneCanvas } from '@/components/three';
import { faqSchema, organizationSchema, websiteSchema } from '@/lib/structured-data';

/**
 * The scroll journey. Content enters here and flows down as props —
 * no organism below this point reads content/site.json.
 *
 * To change what is on this page, edit content/site.json. Section order is
 * array order; each section's `pattern` selects its organism in
 * SectionRenderer. No code change is needed to add, reorder or drop a section.
 */
export default function HomePage() {
  const { hero, sections, cases, nav } = content;
  const primaryCta = hero.actions[0]!;
  const faq = faqSchema();
  const schema = [organizationSchema(), websiteSchema(), ...(faq ? [faq] : [])];

  return (
    <>
    <JsonLd schema={schema} />
    <SplitScrollTemplate
      header={<SiteHeader nav={nav.primary} cta={primaryCta} wordmark={content.meta.name} />}
      scene={<SceneCanvas />}
      footer={
        <SiteFooter
          cta={footer.cta}
          columns={footer.columns}
          wordmark={footer.wordmark}
          base={footer.base}
          primaryCta={primaryCta}
        />
      }
    >
      <HeroSection
        headline={hero.headline!}
        sub={hero.sub}
        caption={hero.caption as string | undefined}
        actions={hero.actions}
        facts={hero.facts as Array<{ label: string; value: string }> | undefined}
        builtWith={hero.builtWith as { label: string; items: string[] } | undefined}
      />
      <SectionRenderer sections={sections} cases={cases} />
    </SplitScrollTemplate>
    </>
  );
}
