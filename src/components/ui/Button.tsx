import { Button as BaseButton } from '@base-ui/react/button';
import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};
export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }: Props) {
  return <BaseButton type={type} className={`button button--${variant} button--${size} ${className}`} {...props} />;
}
