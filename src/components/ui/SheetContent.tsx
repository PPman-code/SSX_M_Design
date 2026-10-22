import { useId } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { Radio, RadioGroup } from './Radio';

type Option = { value: string; label: string; disabled?: boolean };
type SelectionProps = {
  label: string;
  options: Option[];
} & ({
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
  onReselect?: (value: string) => void;
  indicator?: 'list' | 'dot';
} | {
  multiple: true;
  value: string[];
  onToggle: (value: string) => void;
});

/** Selection presentation only. Draft state, validation and dismissal belong to the caller. */
export function SheetSelectionList(props: SelectionProps) {
  if (props.multiple) {
    return <div className="sheet-selection-list" role="group" aria-label={props.label}>
      {props.options.map(option => <button className="sheet-selection-option" type="button" key={option.value} disabled={option.disabled} aria-pressed={props.value.includes(option.value)} onClick={() => props.onToggle(option.value)}>
        <span>{option.label}</span><span className="sheet-selection-mark" aria-hidden="true"><Icon name="check" size="sm" /></span>
      </button>)}
    </div>;
  }
  return <RadioGroup className="sheet-selection-list" label={props.label} value={props.value} onChange={props.onChange}>
    {props.options.map(option => <Radio key={option.value} value={option.value} label={option.label} disabled={option.disabled} variant={props.indicator ?? 'list'} onSelect={option.value === props.value ? () => props.onReselect?.(option.value) : undefined} />)}
  </RadioGroup>;
}

export function SheetChoiceGroup({ label, options, value, onToggle, hint, error }: {
  label: string;
  options: Option[];
  value: string[];
  onToggle: (value: string) => void;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  return <section className="sheet-choice-section" aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`}>{label}</h3>
    <div className="sheet-choice-grid" role="group" aria-label={label} aria-describedby={[hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined}>
      {options.map(option => <button className="sheet-choice-option" type="button" key={option.value} disabled={option.disabled} aria-pressed={value.includes(option.value)} onClick={() => onToggle(option.value)}>{option.label}</button>)}
    </div>
    {hint && <p className="sheet-choice-hint" id={`${id}-hint`}>{hint}</p>}
    {error && <p className="sheet-choice-error" id={`${id}-error`} role="alert">{error}</p>}
  </section>;
}

type Action = { label: string; onClick: () => void; disabled?: boolean };
type PrimaryAction = Action & { tone?: 'brand' | 'danger' | 'warning' };
export function SheetActions({ primary, secondary }: { primary: PrimaryAction; secondary?: Action }) {
  return <div className={`sheet-actions ${secondary ? '' : 'sheet-actions--single'}`}>
    {secondary && <Button variant="soft" disabled={secondary.disabled} onClick={secondary.onClick}>{secondary.label}</Button>}
    <Button tone={primary.tone} disabled={primary.disabled} onClick={primary.onClick}>{primary.label}</Button>
  </div>;
}
