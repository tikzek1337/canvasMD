import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'soft' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({ children, className, variant = 'soft', size = 'md', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)} {...props}>
      {children}
    </button>
  );
}
