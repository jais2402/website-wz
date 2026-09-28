import { cn } from '@/lib/cn';
import type { Headline } from '@/types/content';

export interface HeadlineSplitProps {
  headline: Headline;
  level?: 'd1' | 'd2';
  as?: 'h1' | 'h2';
  id?: string;
  className?: string;
}

/**
 * Molecule. The two-tone headline: the lead in ink, the accent in blueprint.
 * One h1 per page — pass as="h1" only in the hero.
 */
export function HeadlineSplit({
  headline,
  level = 'd2',
  as: Tag = 'h2',
  id,
  className,
}: HeadlineSplitProps) {
  const { lead, accent, muteFirst } = headline;
  return (
    <Tag
      id={id}
      className={cn(level === 'd1' ? 'text-d1' : 'text-d2', 'text-balance', className)}
    >
      {muteFirst ? <span className="text-blueprint-t">{lead}</span> : lead}
      {accent ? (
        <>
          {' '}
          {muteFirst ? accent : <span className="text-blueprint-t">{accent}</span>}
        </>
      ) : null}
    </Tag>
  );
}
