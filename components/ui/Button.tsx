import React from 'react';
import { cn } from '@/lib/utils';
import { CgSpinner } from 'react-icons/cg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  href?: string;
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
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
      isLoading,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer';

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

    const isButtonDisabled = isLoading || disabled;

    if (href && !isButtonDisabled) {
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
        disabled={isButtonDisabled}
        {...props}
      >
        {isLoading && <CgSpinner className='mr-2 h-4 w-4 animate-spin' />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
