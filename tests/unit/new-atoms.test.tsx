import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Chip, Figure, Rule } from '@/components/atoms';
import { cn } from '@/lib/cn';

describe('Chip', () => {
  it('renders static markup with no onClick', () => {
    const { container } = render(<Chip>A new system</Chip>);
    expect(screen.getByText('A new system')).toBeInTheDocument();
    expect(container.querySelector('button')).toBeNull();
  });

  it('is a pressable button with onClick, and reports its state', () => {
    render(
      <Chip selected onClick={() => {}}>
        Fixing a process
      </Chip>,
    );
    const button = screen.getByRole('button', { name: 'Fixing a process' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Figure', () => {
  it('renders the value and suffix together', () => {
    render(<Figure value={90} suffix="+" />);
    expect(screen.getByText(/90/)).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });
});

describe('Rule', () => {
  it('is hidden from assistive tech — it carries no meaning', () => {
    const { container } = render(<Rule />);
    expect(container.querySelector('hr')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('cn', () => {
  // This is a regression test. A plain join emitted both classes and let CSS
  // source order decide, which kept the header CTA visible at 390px despite
  // `hidden sm:inline-flex`.
  it('lets the last conflicting utility win', () => {
    expect(cn('inline-flex', 'hidden')).toBe('hidden');
    expect(cn('text-ink', 'text-ink-3')).toBe('text-ink-3');
  });

  it('keeps a size and a colour that only look similar', () => {
    expect(cn('text-d1', 'text-ink')).toBe('text-d1 text-ink');
  });

  it('keeps responsive variants alongside their base', () => {
    expect(cn('hidden', 'sm:inline-flex')).toBe('hidden sm:inline-flex');
  });
});
