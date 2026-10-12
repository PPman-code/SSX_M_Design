import type { SVGProps } from 'react';
import { iconSpritePrefix, type IconName } from './icon-names.generated';
import styles from './Icon.module.css';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: 'xs' | 'sm' | 'base' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const spritePath = `${import.meta.env.BASE_URL}iconfont/ssx-design.symbol.svg`;

export function Icon({ name, size = 'md', label, className, ...svgProps }: IconProps) {
  const accessibilityProps: SVGProps<SVGSVGElement> = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };
  const classes = [styles.root, styles[size], className].filter(Boolean).join(' ');
  return (
    <svg className={classes} data-size={size} viewBox="0 0 1024 1024" focusable="false" {...accessibilityProps} {...svgProps}>
      <use href={`${spritePath}#${iconSpritePrefix}${name}`} />
    </svg>
  );
}
