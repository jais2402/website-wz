import type { ReactNode } from 'react';
import { content, footer, contactFacts } from '@/lib/content';
import { SiteFooter, SiteHeader } from '@/components/organisms';
import { DocumentTemplate } from './DocumentTemplate';

/**
 * Template. The chrome every document page shares: header, centred measure,
 * footer.
 *
 * Templates may read the content file — the boundary is that nothing *below*
 * templates does (CLAUDE.md rule 2, enforced in eslint.config.mjs). Putting the
 * chrome here rather than in each route means the nav, the CTA and the contact
 * facts cannot fall out of step between pages, which is exactly what started to
 * happen once there were more than a handful of routes.
 */
export interface DocumentPageProps {
  children: ReactNode;
}

export function DocumentPage({ children }: DocumentPageProps) {
  const { nav, hero, meta } = content;
  const primaryCta = hero.actions[0]!;

  return (
    <DocumentTemplate
      header={
        <SiteHeader
          nav={nav.primary}
          cta={nav.cta}
          wordmark={footer.wordmark}
          name={meta.name}
          since={meta.since}
        />
      }
      footer={
        <SiteFooter
          {...contactFacts()}
          cta={footer.cta}
          columns={footer.columns}
          wordmark={footer.wordmark}
          base={footer.base}
          primaryCta={primaryCta}
        />
      }
    >
      <div className="mx-auto max-w-centre px-gutter pb-[clamp(72px,9vh,110px)]">{children}</div>
    </DocumentTemplate>
  );
}
