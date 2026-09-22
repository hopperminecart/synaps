'use client';

import { ReactNode, HTMLAttributes, ElementType } from 'react';

interface GlassPanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: 'default' | 'subtle' | 'elevated' | 'card';
  className?: string;
  as?: ElementType;
  [key: string]: any;
}

const variantClasses: Record<string, string> = {
  default: 'glass-panel',
  subtle: 'glass-panel-subtle',
  elevated: 'glass-panel-elevated',
  card: 'glass-card',
};

export function GlassPanel({
  children,
  variant = 'default',
  className = '',
  as: Component = 'div',
  ...props
}: GlassPanelProps) {
  return (
    <Component
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
