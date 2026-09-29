import sub from '@content/pages.json';
import type { AboutPage, AreaPage, CapabilityPage, ContactPage, HowPage } from '@/types/content';

/**
 * Copy for the deep sub-pages, in its own file — never imported by anything
 * the home page renders.
 *
 * Why it is not in content/site.json: that file is reachable from the client
 * bundle (the 3D scene reads the offerings' hues and order from it), so every
 * byte added to it is downloaded by every visitor. The capability, about and
 * contact pages are read by server components only, and their copy has no
 * business being in the home page's JavaScript. Keeping them apart is what
 * stops the initial-route budget (architecture.md §8) creeping up by a few
 * kilobytes with every page added.
 *
 * Same rules apply: no placeholder, validated by scripts/validate-content.mjs.
 */
const pagesContent = sub as unknown as {
  capabilityPages: Record<string, CapabilityPage>;
  areaPages: Record<string, AreaPage>;
  howPage: HowPage;
  about: AboutPage;
  contact: ContactPage;
};

export const capabilityPages = pagesContent.capabilityPages;
export const areaPages = pagesContent.areaPages;
export const howPage = pagesContent.howPage;
export const aboutPage = pagesContent.about;
export const contactPage = pagesContent.contact;
