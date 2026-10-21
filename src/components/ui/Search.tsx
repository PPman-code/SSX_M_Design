import { useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import './Search.css';

export interface SearchProps {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder?: string;
  clearLabel?: string;
  actions?: ReactNode;
  className?: string;
}

export function Search({ value, onValueChange, label, placeholder, clearLabel = '清除搜索', actions, className }: SearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return <div className={['search', className].filter(Boolean).join(' ')} role="search" aria-label={`${label}区域`}>
    <div className="search-field">
      <Icon name="search" size="base" className="search-leading-icon" />
      <input
        ref={inputRef}
        type="text"
        enterKeyHint="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={event => onValueChange(event.target.value)}
        onBlur={() => {
          if (window.scrollX !== 0) {
            window.scrollTo(0, window.scrollY);
          }
        }}
      />
      {value && <button type="button" className="search-clear touch-target" aria-label={clearLabel} onClick={() => { onValueChange(''); inputRef.current?.focus(); }}><Icon name="close-circle-fill" size="base" /></button>}
    </div>
    {actions && <div className="search-actions">{actions}</div>}
  </div>;
}
