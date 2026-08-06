import * as React from 'react';
import { cn } from '@/utils/cn';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-sm border border-ink/15 bg-paper px-3 text-sm text-ink placeholder:text-ink/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:border-forest',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-24 w-full rounded-sm border border-ink/15 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:border-forest',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-sm border border-ink/15 bg-paper px-3 text-sm text-ink',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:border-forest',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60', className)} {...props} />
);

export const FieldError = ({ children }: { children?: React.ReactNode }) => {
  if (!children) return null;
  return <p className="mt-1 text-xs text-rust">{children}</p>;
};
