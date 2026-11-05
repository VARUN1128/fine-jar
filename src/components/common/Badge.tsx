import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'outline' | 'dark' | 'lime' | 'cyan' | 'magenta';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  size = 'md',
}) => {
  const variantStyles = {
    default: 'bg-[#090e0b] text-[#38ff8e] border-[#304c3b]',
    success: 'bg-[#090e0b] text-[#38ff8e] border-[#38ff8e]',
    lime: 'bg-[#090e0b] text-[#38ff8e] border-[#38ff8e]',
    danger: 'bg-[#090e0b] text-[#ff65d8] border-[#ff65d8]',
    warning: 'bg-[#090e0b] text-[#65f8ff] border-[#65f8ff]',
    info: 'bg-[#090e0b] text-[#65f8ff] border-[#65f8ff]',
    cyan: 'bg-[#090e0b] text-[#65f8ff] border-[#65f8ff]',
    magenta: 'bg-[#090e0b] text-[#ff65d8] border-[#ff65d8]',
    outline: 'bg-transparent text-[#c2cbc5] border-[#304c3b]',
    dark: 'bg-[#020303] text-[#f8fffa] border-[#304c3b]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-0.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono uppercase font-semibold tracking-wider border rounded-none select-none',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
