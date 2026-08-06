import * as React from 'react';
import { cn } from '@/utils/cn';

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-md border border-ink/10 bg-white/60', className)} {...props} />
);

const badgeVariants: Record<string, string> = {
  default: 'bg-ink/8 text-ink',
  forest: 'bg-forest text-paper',
  amber: 'bg-amber text-ink',
  sage: 'bg-sage/30 text-ink-soft',
  rust: 'bg-rust/10 text-rust',
};

export const Badge = ({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof badgeVariants }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide',
      badgeVariants[variant],
      className
    )}
    {...props}
  />
);

export const Spinner = ({ className }: { className?: string }) => (
  <div
    className={cn('h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-forest', className)}
    role="status"
    aria-label="Loading"
  />
);

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
    <h3 className="font-display text-xl text-ink">{title}</h3>
    {description && <p className="max-w-sm text-sm text-ink/60">{description}</p>}
    {action}
  </div>
);
