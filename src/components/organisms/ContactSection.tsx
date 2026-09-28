'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms';
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
}

/**
 * Organism. The one conversion point.
 *
 * Rules from context.md §5, all load-bearing:
 * - Three fields only. Every extra field costs enquiries.
 * - Topic chips pre-set the subject (WCAG 2.2 SC 3.3.7, Redundant Entry).
 * - The reply promise sits UNDER the submit button, never above it.
 * - No phone field until the business can answer a phone.
 *
 * The endpoint is an open decision (architecture.md §6): host function or
 * managed endpoint. Until it is settled the form validates and reports state
 * locally and does not pretend to deliver.
 */
export function ContactSection({
  id,
  side,
  scene,
  headline,
  topics,
  fields,
  submit,
  promise,
  note,
}: ContactSectionProps) {
  const [topic, setTopic] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const titleId = `${id}-title`;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Record<string, string> = {};

    for (const field of fields) {
      const value = String(data.get(field.name) ?? '').trim();
      if (field.required && !value) {
        next[field.name] = `${field.label} is required.`;
      } else if (field.type === 'email' && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        next[field.name] = 'Enter a valid email address.';
      }
    }

    setErrors(next);
    // Delivery is wired once architecture.md §6 is decided — see tasks.md Phase 4.
  }

  return (
    <Section id={id} side={side} scene={scene} labelledBy={titleId}>
      <HeadlineSplit headline={headline} id={titleId} />

      <form noValidate onSubmit={onSubmit} className="mt-8 max-w-[46ch]">
        <TopicChips label="What is this about" topics={topics} selected={topic} onSelect={setTopic} />

        {/* Redundant Entry: the chip choice travels with the submission. */}
        <input type="hidden" name="topic" value={topic ?? ''} />

        {/* Honeypot — see .claude/agents/security-engineer.md. Never shown, never announced. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label htmlFor="company-url">Do not fill this in</label>
          <input id="company-url" name="company-url" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="mt-7 grid gap-5">
          {fields.map((field) => (
            <Field
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              error={errors[field.name]}
            />
          ))}
        </div>

        <div className="mt-7">
          <Button type="submit">{submit}</Button>
        </div>

        <p className="mt-4 text-[14px] text-ink-2">
          <b className="font-medium text-ink">{promise.strong}</b> {promise.rest}
        </p>
      </form>

      {note ? <p className="mt-6 max-w-[46ch] text-[13.5px] text-ink-3">{note}</p> : null}
    </Section>
  );
}
