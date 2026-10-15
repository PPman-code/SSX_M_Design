import type { RefObject } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { WheelPicker, type WheelColumn } from './WheelPicker';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  columns: WheelColumn[];
  value: string[];
  onChange: (value: string[]) => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  finalFocus?: RefObject<HTMLElement | null>;
}

/** Classic picker composition. The caller owns draft state and cascading rules. */
export function Picker({ open, onOpenChange, title, columns, value, onChange, onConfirm, confirmDisabled, finalFocus }: Props) {
  return <BottomSheet open={open} onOpenChange={onOpenChange} title={title} className="picker-sheet" finalFocus={finalFocus}
    header={<div className="picker-toolbar">
      <Button variant="text" onClick={() => onOpenChange(false)}>取消</Button>
      <span className="picker-title" aria-hidden="true">{title}</span>
      <Button variant="text" disabled={confirmDisabled} onClick={() => { onConfirm(); onOpenChange(false); }}>确认</Button>
    </div>}>
    <WheelPicker label={title} columns={columns} value={value} onChange={onChange} />
  </BottomSheet>;
}
