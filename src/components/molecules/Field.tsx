import { cn } from '@/lib/cn';

export interface FieldProps {
  name: string;
  label: string;
  type?: string | undefined;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  error?: string | undefined;
  defaultValue?: string | undefined;
}

/**
 * Molecule. A labelled input.
 *
 * The label is a real <label>, never a placeholder. Errors are text, tied to
 * the field with aria-describedby, announced, and never colour-only —
 * standards.md §2.
 */
export function Field({
  name,
  label,
  type = 'text',
  placeholder,
  required,
  error,
  defaultValue,
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
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: cn(
      'w-full rounded-[2px] border bg-raised px-3.5 py-3 text-[15px] text-ink',
      'placeholder:text-ink-3 transition-colors duration-300 ease-[var(--ease-brand)]',
      error ? 'border-signal-t' : 'border-line-2 hover:border-ink-3',
    ),
  };

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[14px] text-ink-2">
        {label}
        {required ? (
          <span className="ml-1.5 text-ink-3">(required)</span>
        ) : (
          <span className="ml-1.5 text-ink-3">(optional)</span>
        )}
      </label>
      {isArea ? <textarea rows={4} {...shared} /> : <input type={type} {...shared} />}
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-[13.5px] text-signal-t">
          {error}
        </p>
      ) : null}
    </div>
  );
}
