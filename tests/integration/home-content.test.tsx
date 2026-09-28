import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { content } from '@/lib/content';
import { SectionRenderer } from '@/components/templates';

/**
 * Integration: every section in content/site.json renders through the
 * pattern map, against the real content file rather than a fixture.
 *
 * These assertions are about the contract, not about copy length — no test
 * here depends on site.json being a particular size (standards.md §5).
 */
describe('SectionRenderer against real content', () => {
  it('renders every section, with no unknown pattern', () => {
    // SectionRenderer throws in dev on an unrecognised pattern, so this both
    // renders and asserts the map is complete.
    const { container } = render(
      <SectionRenderer sections={content.sections} cases={content.cases} />,
    );
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBe(content.sections.length);
  });

  it('gives every section an id matching content, since anchors are public URLs', () => {
    const { container } = render(
      <SectionRenderer sections={content.sections} cases={content.cases} />,
    );
    for (const section of content.sections) {
      expect(container.querySelector(`#${section.id}`)).not.toBeNull();
    }
  });

  it('labels every section with its own heading', () => {
    const { container } = render(
      <SectionRenderer sections={content.sections} cases={content.cases} />,
    );
    container.querySelectorAll('section').forEach((section) => {
      const labelledBy = section.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(container.querySelector(`#${labelledBy}`)).not.toBeNull();
    });
  });

  it('puts every FAQ answer in the DOM, open or not — extractable by crawlers', () => {
    render(<SectionRenderer sections={content.sections} cases={content.cases} />);
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const faq = content.sections.find((s) => (s as any).pattern === 'faq') as any;
    for (const item of faq.items) {
      expect(screen.getByText(item.a)).toBeInTheDocument();
    }
  });

  it('keeps the two measured brand phrases intact', () => {
    render(<SectionRenderer sections={content.sections} cases={content.cases} />);
    // context.md §4 — the highest-recall strings the brand owns.
    expect(screen.getAllByText(/Tell us what is/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/outgrows the workaround/i)).toBeInTheDocument();
  });

  it('ships no placeholder copy', () => {
    const { container } = render(
      <SectionRenderer sections={content.sections} cases={content.cases} />,
    );
    const text = container.textContent ?? '';
    // Rule 1: an absence costs less than a fake (context.md §3.2).
    expect(text).not.toMatch(/\[[A-Z][^\]]*\]/);
    expect(text).not.toMatch(/Lorem|TODO:|TBD/i);
  });

  it('renders the contact form with a real label per field', () => {
    render(<SectionRenderer sections={content.sections} cases={content.cases} />);
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const form = content.sections.find((s) => (s as any).pattern === 'form') as any;
    for (const field of form.fields) {
      // Queried by accessible name: a placeholder alone would fail this.
      expect(screen.getByLabelText(new RegExp(field.label, 'i'))).toBeInTheDocument();
    }
  });

  it('exposes the case studies as a tablist', () => {
    render(<SectionRenderer sections={content.sections} cases={content.cases} />);
    const tablist = screen.getByRole('tablist', { name: /case studies/i });
    expect(within(tablist).getAllByRole('tab')).toHaveLength(content.cases.length);
  });
});
