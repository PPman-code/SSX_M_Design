import { Switch } from '@base-ui/react/switch';
interface Props {
  label: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  showText?: boolean;
  id?: string;
  name?: string;
}

export function Toggle({ label, checked, onChange, disabled = false, readOnly = false, showText = false, id, name }: Props) {
  return (
    <Switch.Root className={`toggle ${showText ? 'toggle--text' : ''}`} aria-label={label} checked={checked} onCheckedChange={onChange} disabled={disabled} readOnly={readOnly} id={id} name={name}>
      <span className="toggle-track" aria-hidden="true">
        {showText && <span className="toggle-state-text">{checked ? '开' : '关'}</span>}
        <Switch.Thumb className="toggle-thumb" />
      </span>
    </Switch.Root>
  );
}
