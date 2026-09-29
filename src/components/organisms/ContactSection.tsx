'use client';

import { useEffect, useState } from 'react';
import { Button, Swatch } from '@/components/atoms';
import { Field, HeadlineSplit, TopicChips } from '@/components/molecules';
import { Section } from './Section';
import type { Headline, Side } from '@/types/content';

export interface ContactField {
  name: string;
  label: string;
  type?: string | undefined;
  placeholder?: string | undefined;
  required?: boolean | undefined;
}

export interface ContactSectionProps {
  id: string;
  side?: Side | undefined;
  scene?: string | undefined;
  headline: Headline;
  topics: string[];
  fields: ContactField[];
  submit: string;
  promise: { strong: string; rest: string };
  note?: string | undefined;
  /** Said once, instead of "(required)" on every label. From content. */
  requiredNote?: string | undefined;
  topicLabel?: string | undefined;
  /** Topic code on a CTA → the chip it preselects. From content. */
  topicCodes?: Record<string, string> | undefined;
  /** `h1` on /contact, where the form is the page's subject. Default `h2`. */
  as?: 'h1' | 'h2' | undefined;
}

const AUTOCOMPLETE: Record<string, string> = { name: 'name', email: 'email' };

/**
 * Organism. The one conversion point.
 *
 * Grouped as the prototype groups it, so it reads as one form rather than a
 * stack of separate blocks: topic chips; name and email on one row; the message
 * full width; a full-width submit; then the reply promise in a single ruled
 * block. The requirement rule is stated once — every field is required — which
 * satisfies WCAG 2.2 SC 3.3.2 without repeating "(required)" three times.
 *
 * Rules from context.md §5, all load-bearing:
 * - Three fields only. Every extra field costs enquiries.
 * - Topic chips pre-set the subject (WCAG 2.2 SC 3.3.7, Redundant Entry).
 * - The reply promise sits UNDER the submit button, never above it.
 * - No phone field until the business can answer a phone.
 *
 * The endpoint is an open decision (architecture.md §6). Until it is settled
 * the form validates and reports state locally and does not pretend to deliver.
 */
export function ContactSection({
  id, side, scene, headline, topics, fields, submit, promise, note, requiredNote,
  topicLabel = 'What is this about?', topicCodes, as: headingAs,
}: ContactSectionProps) {
  const [topic, setTopic] = useState<string | null>(null);

  // A CTA elsewhere on the page ("Talk to us about your stack") carries a topic
  // code; following it preselects the matching chip, so the reader does not
  // tell us twice (context.md §5, WCAG 2.2 SC 3.3.7).
  useEffect(() => {
    if (!topicCodes) return;
    function onClick(event: MouseEvent) {
      const el = (event.target as Element | null)?.closest<HTMLElement>('[data-topic]');
      const code = el?.dataset.topic;
      const label = code ? topicCodes?.[code] : undefined;
      if (label && topics.includes(label)) setTopic(label);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [topicCodes, topics]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const titleId = `${id}-title`;

  const short = fields.filter((f) => f.type !== 'textarea');
  const long = fields.filter((f) => f.type === 'textarea');
  const allRequired = fields.every((f) => f.required);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Record<string, string> = {};
    for (const field of fields) {
      const value = String(data.get(field.name) ?? '').trim();
      if (field.required && !value) next[field.name] = `${field.label} is required.`;
      else if (field.type === 'email' && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        next[field.name] = 'Enter a valid email address.';
      }
    }
    setErrors(next);
    // Delivery is wired once architecture.md §6 is decided — see tasks.md Phase 4.
  }

  const renderField = (field: ContactField) => (
    <Field
      key={field.name}
      name={field.name}
      label={field.label}
      type={field.type}
      placeholder={field.placeholder}
      required={field.required}
      autoComplete={AUTOCOMPLETE[field.name]}
      error={errors[field.name]}
      showRequirement={!(allRequired && requiredNote)}
    />
  );

  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId}>
      <HeadlineSplit headline={headline} id={titleId} level="d1" as={headingAs ?? 'h2'} />

      <form noValidate onSubmit={onSubmit} className="mt-9 max-w-measure">
        <TopicChips label={topicLabel} topics={topics} selected={topic} onSelect={setTopic} />
        <input type="hidden" name="topic" value={topic ?? ''} />

        {/* Honeypot — see .claude/agents/security-engineer.md. Never shown, never announced. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label htmlFor="company-url">Do not fill this in</label>
          <input id="company-url" name="company-url" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="mt-7 grid gap-3.5">
          {short.length ? (
            <div className="grid gap-3.5 sm:grid-cols-2">{short.map(renderField)}</div>
          ) : null}
          {long.map(renderField)}
        </div>

        {allRequired && requiredNote ? (
          <p className="mt-3 text-caption text-ink-3">{requiredNote}</p>
        ) : null}

        <Button type="submit" className="mt-5 w-full justify-center">
          {submit}
        </Button>

        {/* The reply promise, UNDER the submit — context.md §5. */}
        <div className="mt-4 grid grid-cols-[10px_minmax(0,1fr)] gap-3.5 border-y border-line py-3.5">
          <Swatch hue="pine" active className="mt-[7px]" />
          <p className="text-body leading-normal text-ink-2">
            <b className="font-medium text-ink">{promise.strong}</b> {promise.rest}
          </p>
        </div>

        {note ? <p className="mt-3.5 text-caption text-ink-3">{note}</p> : null}
      </form>
    </Section>
  );
}
