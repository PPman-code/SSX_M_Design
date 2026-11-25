import type { SVGProps } from 'react';
import { iconSpritePrefix, type IconName as SpriteIconName } from './icon-names.generated';
import styles from './Icon.module.css';

const localGlyphs = {
  'app-tab-home': { path: 'teacher-app/tab-home.svg', size: 24, width: 18.4286, height: 19.7146, mode: 'mask' },
  'app-tab-mine': { path: 'teacher-app/tab-mine.svg', size: 24, mode: 'mask' },
  'app-tab-aira': { path: 'teacher-app/tab-aira-motion.svg', size: 44, mode: 'original' },
  'home-prospective': { path: 'teacher-app/prospective-students.svg', size: 20, mode: 'original' },
  'home-students': { path: 'teacher-app/student-management.svg', size: 20, mode: 'original' },
  'home-enrollment': { path: 'teacher-app/enrollment-payment.svg', size: 20, mode: 'original' },
  'home-orders': { path: 'teacher-app/order-management.svg', size: 20, mode: 'original' },
  'home-timetable': { path: 'teacher-app/timetable.svg', size: 20, mode: 'original' },
  'home-roll-call': { path: 'teacher-app/roll-call.svg', size: 20, mode: 'original' },
  'home-classes': { path: 'teacher-app/class-management.svg', size: 20, mode: 'original' },
  'home-notification': { path: 'teacher-app/notification.svg', size: 18, mode: 'mask' },
  'home-report-badge': { path: 'teacher-app/report-badge.svg', size: 18, mode: 'original' },
  'teacher-settings': { path: 'teacher-app/settings.svg', size: 24, mode: 'original' },
  'school-chevron': { path: 'teacher-app/school-chevron.svg', size: 16, mode: 'mask' },
} as const;

export type IconName = SpriteIconName | 'selection-check' | 'selection-close' | keyof typeof localGlyphs;

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
  if (name in localGlyphs) {
    const glyph = localGlyphs[name as keyof typeof localGlyphs];
    const glyphPath = `${import.meta.env.BASE_URL}icons/${glyph.path}`;
    const width = 'width' in glyph ? glyph.width : glyph.size;
    const height = 'height' in glyph ? glyph.height : glyph.size;
    if (glyph.mode === 'original') {
      return <svg className={classes} data-size={size} data-icon={name} viewBox={`0 0 ${width} ${height}`} focusable="false" {...accessibilityProps} {...svgProps}><image href={glyphPath} width={width} height={height} /></svg>;
    }
    return <svg className={`${classes} ${styles.componentGlyph}`} data-size={size} data-icon={name} viewBox={`0 0 ${width} ${height}`} focusable="false" {...accessibilityProps} {...svgProps} style={{ ...svgProps.style, maskImage: `url("${glyphPath}")`, WebkitMaskImage: `url("${glyphPath}")` }}><rect width={width} height={height} /></svg>;
  }
  if (name === 'loading') {
    const mask = `${import.meta.env.BASE_URL}icons/loading/ring-mask.svg`;
    return <svg className={`${classes} ${styles.loadingGlyph}`} data-size={size} data-icon="loading" viewBox="0 0 16 16" focusable="false" {...accessibilityProps} {...svgProps}
      style={{ ...svgProps.style, maskImage: `url("${mask}")`, WebkitMaskImage: `url("${mask}")` }} />;
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
