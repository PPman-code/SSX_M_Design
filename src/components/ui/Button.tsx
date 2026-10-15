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
  const classes = `button button--${variant} button--${size} ${tone !== 'brand' ? `button--${tone}` : ''} ${shape !== 'default' ? `button--${shape}` : ''} ${block ? 'button--block' : ''} ${iconOnly ? 'button--icon-only' : ''} ${className}`;
  return <BaseButton {...props} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} data-loading={loading && !disabled ? '' : undefined}>
    {loading ? <span className="button-spinner" aria-hidden="true" /> : icon ? <Icon name={icon} size="md" /> : null}
    {!iconOnly && (loading && loadingText ? loadingText : children)}
  </BaseButton>;
}
