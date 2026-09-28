import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/atoms/Button';
import { Swatch } from '@/components/atoms/Swatch';

describe('Button', () => {
  it('renders an anchor when given an href', () => {
    render(<Button href="/#contact">Tell us what is not working</Button>);
    const link = screen.getByRole('link', { name: 'Tell us what is not working' });
    expect(link).toHaveAttribute('href', '/#contact');
  });

  it('renders a button element without an href', () => {
    render(<Button type="submit">Start a conversation</Button>);
    expect(screen.getByRole('button', { name: 'Start a conversation' })).toBeInTheDocument();
  });
});

describe('Swatch', () => {
  it('is decorative and never announced on its own', () => {
    const { container } = render(<Swatch hue="signal" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
