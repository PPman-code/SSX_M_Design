import { useId, type SVGProps } from 'react';

import { iconSpritePrefix, type IconName } from './icon-names.generated';
import styles from './Icon.module.css';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: 'xs' | 'sm' | 'base' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const spritePath = './iconfont/w1-design.symbol.svg';

export function Icon({ name, size = 'md', label, className, ...svgProps }: IconProps) {
  const instanceId = useId();
  const gradientId = `${instanceId}-aira-gradient`;
  const maskId = `${instanceId}-aira-mask`;
  const accessibilityProps: SVGProps<SVGSVGElement> = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };
  const classes = [styles.root, styles[size], className].filter(Boolean).join(' ');

  if (name === 'aira') return (
    <svg className={classes} data-size={size} focusable="false" viewBox="0 0 1024 1024" {...accessibilityProps} {...svgProps}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop className={styles.airaStart} offset="0%" />
          <stop className={styles.airaEnd} offset="100%" />
        </linearGradient>
        <mask className={styles.airaMask} height="1024" id={maskId} maskUnits="userSpaceOnUse" width="1024" x="0" y="0">
          <use height="1024" href={`${spritePath}#${iconSpritePrefix}${name}`} width="1024" />
        </mask>
      </defs>
      <rect fill={`url(#${gradientId})`} height="1024" mask={`url(#${maskId})`} width="1024" />
    </svg>
  );

  return (
    <svg className={classes} data-size={size} focusable="false" {...accessibilityProps} {...svgProps}>
      <use href={`${spritePath}#${iconSpritePrefix}${name}`} />
    </svg>
  );
}
