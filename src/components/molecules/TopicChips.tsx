'use client';

import { Chip, Eyebrow } from '@/components/atoms';

export interface TopicChipsProps {
  label: string;
  topics: string[];
  selected: string | null;
  onSelect: (topic: string) => void;
}

/**
 * Molecule. Pre-sets the form subject.
 *
 * WCAG 2.2 SC 3.3.7 Redundant Entry: choosing a topic here fills the subject
 * so nobody types it twice.
 */
export function TopicChips({ label, topics, selected, onSelect }: TopicChipsProps) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-3 p-0">
        <Eyebrow>{label}</Eyebrow>
      </legend>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Chip key={topic} selected={selected === topic} onClick={() => onSelect(topic)}>
            {topic}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}
