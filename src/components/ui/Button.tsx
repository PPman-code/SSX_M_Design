import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentPropsWithRef } from 'react';
import { Icon, type IconName } from './Icon';

type Props = ComponentPropsWithRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  tone?: 'brand' | 'danger' | 'warning';
  shape?: 'default' | 'round' | 'square';
  block?: boolean;
  loading?: boolean;
  loadingText?: string;
} & ({ iconOnly: true; icon: IconName; 'aria-label': string } | { iconOnly?: false; icon?: IconName });

export function Button({ variant = 'primary', size = 'md', tone = 'brand', shape = 'default', block = false, loading = false, loadingText, icon, iconOnly = false, disabled = false, children, className = '', type = 'button', ...props }: Props) {
  const isText = variant === 'text';
  const classes = `button ${isText ? 'touch-target' : ''} button--${variant} button--${size} ${tone !== 'brand' ? `button--${tone}` : ''} ${shape !== 'default' ? `button--${shape}` : ''} ${block ? 'button--block' : ''} ${iconOnly ? 'button--icon-only' : ''} ${className}`;
  const iconSize = iconOnly ? (size === 'lg' ? 'lg' : size === 'sm' ? 'base' : 'md') : (isText || size === 'sm' ? 'sm' : 'base');
  return <BaseButton {...props} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} data-loading={loading && !disabled ? '' : undefined}>
    {loading ? <Icon name="loading" className="button-spinner" /> : icon ? <Icon name={icon} size={iconSize} /> : null}
    {!iconOnly && (loading && loadingText ? loadingText : children)}
  </BaseButton>;
}
