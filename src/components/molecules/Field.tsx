import { cn } from '@/lib/cn';

export interface FieldProps {
  name: string;
  label: string;
  type?: string | undefined;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  error?: string | undefined;
  defaultValue?: string | undefined;
  autoComplete?: string | undefined;
  /**
   * Show "(required)" / "(optional)" after the label. Turn off when the form
   * states the rule once instead — every field required — which is the
   * accessible way to say it without repeating it on every label.
   */
  showRequirement?: boolean | undefined;
}

/**
 * Molecule. A labelled input.
 *
 * The label is a real <label>, never a placeholder. Errors are text, tied to
 * the field with aria-describedby, announced, and never colour-only —
 * standards.md §2. Focus is a blueprint border plus a soft ring, as in the
 * prototype.
 */
export function Field({
  name, label, type = 'text', placeholder, required, error, defaultValue, autoComplete,
  showRequirement = true,
}: FieldProps) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const isArea = type === 'textarea';

  const shared = {
    id,
    name,
    placeholder,
    defaultValue,
    required,
    autoComplete,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: cn(
      'w-full rounded-[2px] border bg-raised px-3.5 py-[13px] text-base leading-normal lg:text-body text-ink',
      'placeholder:text-ink-3 transition-[border-color,box-shadow] duration-300 ease-[var(--ease-brand)]',
      'focus:border-blueprint-t focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-blueprint)_22%,transparent)] focus:outline-none',
      error ? 'border-signal-t' : 'border-line-2 hover:border-ink-3',
      isArea && 'min-h-[120px] resize-y',
    ),
  };

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-caption text-ink-2">
        {label}
        {showRequirement ? (
          <span className="ml-1.5 text-ink-3">{required ? '(required)' : '(optional)'}</span>
        ) : null}
      </label>
      {isArea ? <textarea {...shared} /> : <input type={type} {...shared} />}
      {error ? (
        <p id={errorId} role="alert" className="text-caption text-signal-t">
          {error}
        </p>
      ) : null}
    </div>
  );
}
