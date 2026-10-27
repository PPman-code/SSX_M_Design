import { useId, useRef, useLayoutEffect, useImperativeHandle, type ComponentPropsWithRef, type ReactNode } from 'react';
import './Tabs.css';

export type TabItem<Value extends string = string> = {
  value: Value;
  label: ReactNode;
  id?: string;
  panelId: string;
};
type Props<Value extends string> = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onChange' | 'role' | 'aria-label'> & {
  items: readonly TabItem<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  label: string;
  size?: 'primary' | 'secondary';
  layout?: 'stretch' | 'content';
  indicator?: 'fixed' | 'label';
};

/** Controlled content navigation. Panel content, scrolling and sticky positioning belong to the caller. */
export function Tabs<Value extends string>({ items, value, onValueChange, label, size = 'secondary', layout = 'stretch', indicator = 'fixed', className = '', ref, ...props }: Props<Value>) {
  const generatedId = useId();
  const buttons = useRef(new Map<Value, HTMLButtonElement>());
  const root = useRef<HTMLDivElement>(null);
  const underline = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => {
    const container = root.current;
    const line = underline.current;
    if (!container || !line) return;
    function measure() {
      if (!container || !line) return;
      const selected = buttons.current.get(value);
      if (!selected) { line.removeAttribute('data-ready'); return; }
      const box = selected.getBoundingClientRect();
      const width = indicator === 'label' ? box.width : 24;
      const left = box.left - container.getBoundingClientRect().left - container.clientLeft + container.scrollLeft + (box.width - width) / 2;
      line.style.width = `${width}px`;
      line.style.transform = `translateX(${left}px)`;
      line.setAttribute('data-ready', '');
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    for (const button of buttons.current.values()) observer.observe(button);
    return () => observer.disconnect();
  }, [value, indicator, items]);
  return <div {...props} ref={root} className={`ssx-tabs ${className}`.trim()} role="tablist" aria-label={label} aria-orientation="horizontal" data-size={size} data-layout={layout} data-indicator={indicator}>
    {items.map((item, index) => <button key={item.value} type="button" className="ssx-tab" role="tab" id={item.id ?? `${generatedId}-tab-${encodeURIComponent(item.value)}`} aria-controls={item.panelId} aria-selected={value === item.value} tabIndex={value === item.value ? 0 : -1}
      ref={node => { if (node) buttons.current.set(item.value, node); else buttons.current.delete(item.value); }}
      onClick={() => onValueChange(item.value)} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
        const next = items[nextIndex];
        if (!next) return;
        onValueChange(next.value);
        buttons.current.get(next.value)?.focus();
      }}>{item.label}</button>)}
    <span ref={underline} className="ssx-tabs-indicator" aria-hidden="true" />
  </div>;
}
