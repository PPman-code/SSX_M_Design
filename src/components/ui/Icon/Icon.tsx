import type { SVGProps } from 'react';
import { iconSpritePrefix, type IconName as SpriteIconName } from './icon-names.generated';
import styles from './Icon.module.css';

export type IconName = SpriteIconName | 'selection-check' | 'selection-close';

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
  if (name === 'loading') {
    const mask = `${import.meta.env.BASE_URL}icons/loading/ring-mask.svg`;
    return <svg className={classes} data-size={size} data-icon="loading" viewBox="0 0 16 16" focusable="false" {...accessibilityProps} {...svgProps}>
      <foreignObject width="16" height="16"><div className={styles.loadingFill} style={{ maskImage: `url("${mask}")`, WebkitMaskImage: `url("${mask}")` }} /></foreignObject>
    </svg>;
  }
  if (name === 'selection-check' || name === 'selection-close') {
    const glyphPath = `${import.meta.env.BASE_URL}icons/selection/${name === 'selection-check' ? 'check' : 'close'}.svg`;
    return <svg className={`${classes} ${styles.componentGlyph}`} data-size={size} data-icon={name} viewBox="0 0 16 16" focusable="false" {...accessibilityProps} {...svgProps} style={{ ...svgProps.style, maskImage: `url("${glyphPath}")`, WebkitMaskImage: `url("${glyphPath}")` }}><rect width="16" height="16" /></svg>;
  }
  return (
    <svg className={classes} data-size={size} viewBox="0 0 1024 1024" focusable="false" {...accessibilityProps} {...svgProps}>
      <use href={`${spritePath}#${iconSpritePrefix}${name}`} />
    </svg>
  );
}
