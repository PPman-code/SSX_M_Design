import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import './Tag.css';

export type TagSize = 'sm' | 'md' | 'lg';
export type TagTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
export type TagVariant = 'soft' | 'solid' | 'outline' | 'dashed';
type Props = Omit<ComponentPropsWithoutRef<'span'>, 'color'> & {
  children: ReactNode;
  size?: TagSize;
  tone?: TagTone;
  variant?: TagVariant;
  round?: boolean;
};

/** Static text label; actions and unread counts use their own local components. */
export function Tag({ children, size = 'md', tone = 'neutral', variant = 'soft', round = false, className = '', ...props }: Props) {
  return <span {...props} className={`ssx-tag ${className}`.trim()} data-size={size} data-tone={tone} data-variant={variant} data-round={round || undefined}>{children}</span>;
}
