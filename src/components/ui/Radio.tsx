import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface GroupProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
}
export function RadioGroup({ label, value, onChange, children, className = '', ...props }: GroupProps) {
  return <BaseRadioGroup className={`ssx-radio-group ${className}`} aria-label={label} value={value} onValueChange={onChange} {...props}>{children}</BaseRadioGroup>;
}
interface RadioProps {
  value: string;
  label: string;
  variant?: 'dot' | 'check' | 'list';
  onSelect?: () => void;
  disabled?: boolean;
  hideLabel?: boolean;
  className?: string;
}
export function Radio({ value, label, variant = 'dot', onSelect, disabled, hideLabel = false, className = '' }: RadioProps) {
  return <label className={`ssx-radio-label ${hideLabel ? 'ssx-radio-label--icon' : ''} ${className}`}>
    <BaseRadio.Root value={value} disabled={disabled} onClick={onSelect} aria-label={hideLabel ? label : undefined} className={`ssx-radio ssx-radio--${variant}`}>
      <span className="ssx-radio-mark" aria-hidden="true"><BaseRadio.Indicator className="ssx-radio-indicator">{variant === 'list' ? <Icon name="check" size="sm" /> : null}</BaseRadio.Indicator></span>
    </BaseRadio.Root>
    {!hideLabel && <span className="ssx-radio-text">{label}</span>}
  </label>;
}
