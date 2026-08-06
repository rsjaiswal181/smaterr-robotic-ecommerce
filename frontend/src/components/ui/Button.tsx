import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-forest text-paper hover:bg-forest-light',
        accent: 'bg-amber text-ink hover:brightness-95',
        outline: 'border border-ink/20 bg-transparent text-ink hover:bg-ink/5',
        ghost: 'bg-transparent text-ink hover:bg-ink/5',
        danger: 'bg-rust text-paper hover:brightness-90',
        link: 'bg-transparent underline-offset-4 hover:underline text-ink p-0 h-auto',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-5',
        lg: 'h-13 px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
