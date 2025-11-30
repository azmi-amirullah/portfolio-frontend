import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      href,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary/90 shadow',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      outline: 'border border-input bg-background hover:bg-accent',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 py-2',
      lg: 'h-10 px-8',
      icon: 'h-9 w-9',
    };

    const variantStyles = variants[variant] || variants.primary;
    const sizeStyles = sizes[size] || sizes.md;

    const combinedClassName = cn(
      baseStyles,
      variantStyles,
      sizeStyles,
      className
    );

    if (href) {
      return (
        <a
          href={href}
          className={combinedClassName}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        className={combinedClassName}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
