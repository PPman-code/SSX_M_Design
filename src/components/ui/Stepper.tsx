import { Button } from './Button';
import { Input, type InputProps } from './Input';
import './Stepper.css';

type Props = Omit<InputProps, 'prefix' | 'suffix'> & { unit?: string };

/** Candidate composition: editable decimal field with one-unit increments. */
export function Stepper({ label, value, onValueChange, unit, placeholder = '0', className = '', disabled, readOnly, ...props }: Props) {
  function step(direction: number) {
    const current = Number(value.trim());
    const cents = value.trim() && Number.isFinite(current) ? Math.round(current * 100) : 0;
    const next = Math.max(0, cents + direction * 100);
    if (Number.isSafeInteger(next)) onValueChange(String(Number((next / 100).toFixed(2))));
  }
  return <Input {...props} label={label} value={value} onValueChange={onValueChange} disabled={disabled} readOnly={readOnly} className={`ssx-stepper ${className}`} inputMode="decimal" placeholder={placeholder}
    prefix={<Button variant="ghost" iconOnly icon="minus" aria-label={`减少${label}`} disabled={disabled || readOnly} onClick={() => step(-1)} />}
    suffix={<><Button variant="ghost" iconOnly icon="plus" aria-label={`增加${label}`} disabled={disabled || readOnly} onClick={() => step(1)} />{unit && <span>{unit}</span>}</>} />;
}
