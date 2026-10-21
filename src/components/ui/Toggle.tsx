import { Switch } from '@base-ui/react/switch';
import { Icon } from './Icon';
interface Props {
  label: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  showText?: boolean;
  content?: 'none' | 'text' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  id?: string;
  name?: string;
}

export function Toggle({ label, checked, onChange, disabled = false, readOnly = false, showText = false, content, size = 'md', loading = false, id, name }: Props) {
  const thumbContent = content ?? (showText ? 'text' : 'none');
  return (
    <Switch.Root className={`toggle touch-target toggle--${size}`} aria-label={label} checked={checked} onCheckedChange={onChange} disabled={disabled} readOnly={readOnly || loading} aria-busy={loading || undefined} data-loading={loading ? '' : undefined} id={id} name={name}>
      <span className="toggle-track" aria-hidden="true">
        <Switch.Thumb className="toggle-thumb">
          {loading ? <Icon name="loading" className="toggle-spinner" /> : thumbContent === 'text' ? <span className="toggle-state-text">{checked ? '开' : '关'}</span> : thumbContent === 'icon' ? <Icon name={checked ? 'selection-check' : 'selection-close'} className="toggle-state-icon" /> : null}
        </Switch.Thumb>
      </span>
    </Switch.Root>
  );
}
