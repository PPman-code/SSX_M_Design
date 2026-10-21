import { useId, type MouseEvent, type ReactNode } from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import { Icon } from './Icon';
import './Checkbox.css';

interface CheckboxProps {
  label: string;
  description?: string;
  value?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  parent?: boolean;
  variant?: 'circle' | 'square' | 'check' | 'card';
  placement?: 'left' | 'right';
  hideLabel?: boolean;
  name?: string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export function Checkbox({ label, description, checked, onChange, variant = 'circle', placement = 'left', hideLabel = false, className, ...props }: CheckboxProps) {
  const descriptionId = useId();
  return <BaseCheckbox.Root {...props} checked={checked} onCheckedChange={onChange} aria-label={label} aria-describedby={description && !hideLabel ? descriptionId : undefined} className={['ssx-checkbox', hideLabel ? 'touch-target ssx-checkbox--icon' : '', `ssx-checkbox--${variant}`, `ssx-checkbox--${placement}`, className].filter(Boolean).join(' ')}>
    <span className="ssx-checkbox-mark" aria-hidden="true"><BaseCheckbox.Indicator keepMounted={variant === 'check'} className="ssx-checkbox-indicator"><Icon name={variant === 'check' ? 'check' : 'selection-check'} size={variant === 'check' ? 'sm' : 'md'} className="ssx-checkbox-check" /><span className="ssx-checkbox-minus" /></BaseCheckbox.Indicator></span>
    {!hideLabel && <span className="ssx-checkbox-content"><span className="ssx-checkbox-label">{label}</span>{description && <span className="ssx-checkbox-description" id={descriptionId}>{description}</span>}</span>}
  </BaseCheckbox.Root>;
}

interface GroupProps {
  label: string;
  value: string[];
  onChange?: (value: string[]) => void;
  allValues?: string[];
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal' | 'cards' | 'card-row';
  children: ReactNode;
}
export function CheckboxGroup({ label, layout = 'vertical', onChange, ...props }: GroupProps) {
  return <BaseCheckboxGroup {...props} onValueChange={onChange} aria-label={label} className={`ssx-checkbox-group ssx-checkbox-group--${layout}`} />;
}
