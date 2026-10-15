import { useEffect, useId, useRef } from 'react';

export interface WheelOption { value: string; label: string; disabled?: boolean }
export interface WheelColumn { key: string; label: string; options: WheelOption[]; disabled?: boolean }
interface Props {
  label: string;
  columns: WheelColumn[];
  value: string[];
  onChange: (value: string[]) => void;
  showLabels?: boolean;
}

const rowHeight = 44;

function PickerColumn({ column, value, onChange, showLabel }: { column: WheelColumn; value: string; onChange: (value: string) => void; showLabel: boolean }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const scrolling = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const selected = column.options.findIndex(option => option.value === value);
  const current = useRef(value);

  useEffect(() => {
    current.current = value;
    if (!scrolling.current && ref.current) ref.current.scrollTop = Math.max(0, selected) * rowHeight;
  }, [value, selected, column.options]);
  useEffect(() => () => clearTimeout(timer.current), []);

  function nearest(index: number) {
    let best = -1;
    column.options.forEach((option, i) => {
      if (!option.disabled && (best === -1 || Math.abs(i - index) < Math.abs(best - index))) best = i;
    });
    return best;
  }
  function choose(index: number) {
    if (column.disabled || index < 0) return;
    const option = column.options[index];
    if (!option || option.disabled) return;
    clearTimeout(timer.current);
    scrolling.current = false;
    current.current = option.value;
    onChange(option.value);
    if (ref.current) ref.current.scrollTop = index * rowHeight;
  }
  function scroll() {
    if (column.disabled || !ref.current) return;
    scrolling.current = true;
    const index = nearest(Math.round(ref.current.scrollTop / rowHeight));
    if (index >= 0 && current.current !== column.options[index].value) {
      current.current = column.options[index].value;
      onChange(current.current);
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      scrolling.current = false;
      if (ref.current && index >= 0) ref.current.scrollTop = index * rowHeight;
    }, 140);
  }
  const active = selected >= 0 && !column.options[selected].disabled;
  return <div className="wheel-picker-column">
    <div className={showLabel ? 'wheel-picker-label' : 'sr-only'} id={`${id}-label`}>{column.label}</div>
    <div className="wheel-picker-window">
      <div className="wheel-picker-center" aria-hidden="true" />
      <div ref={ref} className="wheel-picker-list" role="listbox" aria-labelledby={`${id}-label`} aria-disabled={column.disabled || undefined}
        aria-activedescendant={active ? `${id}-option-${selected}` : undefined} tabIndex={column.disabled ? -1 : 0} onScroll={scroll}
        onKeyDown={event => {
          if (column.disabled) return;
          const direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
          if (direction) {
            event.preventDefault();
            let next = selected + direction;
            while (next >= 0 && next < column.options.length && column.options[next].disabled) next += direction;
            if (next >= 0 && next < column.options.length) choose(next);
          } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault(); choose(nearest(event.key === 'Home' ? 0 : column.options.length - 1));
          }
        }}>
        {column.options.map((option, index) => <div key={option.value} id={`${id}-option-${index}`} role="option" aria-selected={option.value === value} aria-disabled={column.disabled || option.disabled || undefined}
          className="wheel-picker-option" onClick={() => choose(index)}>{option.label}</div>)}
        {!column.options.length && <div className="wheel-picker-empty" role="status">暂无选项</div>}
      </div>
    </div>
  </div>;
}

/** Controlled columns only; cascading options and confirmation drafts belong to the caller. */
export function WheelPicker({ label, columns, value, onChange, showLabels = false }: Props) {
  return <div className="wheel-picker" role="group" aria-label={label}>
    {columns.map((column, index) => <PickerColumn key={column.key} column={column} value={value[index] ?? ''} showLabel={showLabels} onChange={next => onChange(columns.map((_, i) => i === index ? next : value[i] ?? ''))} />)}
  </div>;
}
