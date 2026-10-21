import { Input as BaseInput } from '@base-ui/react/input';
import { useId, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import './CellIcons.css';
import './Input.css';
import './FieldDivider.css';

type InputStatus = 'default' | 'success' | 'warning' | 'error';
export interface InputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'prefix'> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  layout?: 'horizontal' | 'vertical' | 'external';
  hideLabel?: boolean;
  optional?: boolean;
  description?: string;
  status?: InputStatus;
  clearable?: boolean;
  leadingIcon?: IconName;
  prefix?: ReactNode;
  suffix?: ReactNode;
}
const statusIcons: Record<Exclude<InputStatus, 'default'>, IconName> = {
  success: 'check', warning: 'exclamation', error: 'close',
};

/** A controlled text field. Selection, verification and business validation belong to callers. */
export function Input({ label, value, onValueChange, layout = 'horizontal', hideLabel = false, optional = false, description, status = 'default', clearable = false, leadingIcon, prefix, suffix, type = 'text', disabled = false, readOnly = false, required = false, id, className = '', 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);
  const editable = !disabled && !readOnly;
  const password = type === 'password';
  return <div className={`ssx-input ${layout !== 'external' ? 'field-divider' : ''} ssx-input--${layout} ssx-input--${status} ${className}`} data-disabled={disabled || undefined} data-readonly={readOnly || undefined}>
    <div className="ssx-input-main">
      <label htmlFor={inputId} className={`ssx-input-label ${hideLabel ? 'ssx-input-label--hidden' : ''}`}>
        {leadingIcon && <span className="ssx-input-label-icon" aria-hidden="true"><Icon name={leadingIcon} size="md" /></span>}{label}{required && <span className="ssx-input-required" aria-hidden="true">*</span>}{optional && !required && <span className="ssx-input-optional">（选填）</span>}
      </label>
      <div className="ssx-input-body">
        {prefix && <span className="ssx-input-prefix">{prefix}</span>}
        <BaseInput {...props} ref={inputRef} id={inputId} className="ssx-input-native" value={value} onValueChange={next => { if (editable) onValueChange(next); }} type={password && visible ? 'text' : type} disabled={disabled} readOnly={readOnly} required={required} aria-invalid={status === 'error' ? true : invalid} aria-describedby={[describedBy, description ? descriptionId : undefined].filter(Boolean).join(' ') || undefined} />
        {clearable && value && editable && <button type="button" className="ssx-input-icon ssx-input-clear touch-target" aria-label={`清除${label}`} onPointerDown={event => event.preventDefault()} onClick={() => { onValueChange(''); inputRef.current?.focus(); }}><Icon name="close-circle-fill" size="md" /></button>}
        {password && <button type="button" className="ssx-input-icon touch-target" aria-label={visible ? '隐藏密码' : '显示密码'} aria-pressed={visible} disabled={disabled} onPointerDown={event => event.preventDefault()} onClick={() => setVisible(current => !current)}><Icon name={visible ? 'eye' : 'eye-invisible'} size="md" /></button>}
        {status !== 'default' && <Icon name={statusIcons[status]} size="md" className="ssx-input-status" />}
        {suffix && <span className="ssx-input-suffix">{suffix}</span>}
      </div>
    </div>
    {description && <p className="ssx-input-description" id={descriptionId}>{description}</p>}
  </div>;
}
