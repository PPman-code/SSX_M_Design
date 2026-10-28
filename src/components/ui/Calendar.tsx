import { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { SheetActions } from './SheetContent';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string;
  onChange: (date: string) => void;
  onConfirm: () => void;
  minDate: string;
  maxDate?: string;
  today: string;
  onPending?: () => void;
}
const pad = (value: number) => String(value).padStart(2, '0');
const monthNumber = (date: string) => Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1;

/** Candidate single-date calendar. The caller owns the selection draft and commits it. */
export function Calendar(props: Props) {
  // Remount the content on each opening so scrolling and the month window start at the current draft.
  return <BottomSheet open={props.open} onOpenChange={props.onOpenChange} title={props.title} className="calendar-sheet"
    footer={<SheetActions secondary={props.onPending ? { label: '待定', onClick: () => { props.onPending?.(); props.onOpenChange(false); } } : undefined}
      primary={{ label: '确定', onClick: () => { props.onConfirm(); props.onOpenChange(false); } }} />}>
    {props.open && <CalendarMonths {...props} />}
  </BottomSheet>;
}
function CalendarMonths({ value, onChange, minDate, maxDate, today }: Props) {
  const minimum = monthNumber(minDate);
  const maximum = maxDate ? monthNumber(maxDate) : (Math.floor(minimum / 12) + 101) * 12 - 1;
  const initial = Math.min(maximum, Math.max(minimum, monthNumber(value || minDate)));
  const [start, setStart] = useState(initial);
  const [end, setEnd] = useState(Math.min(maximum, initial + 11));
  return <div className="calendar">
    <div className="calendar-weekdays" aria-hidden="true">{['日', '一', '二', '三', '四', '五', '六'].map(day => <span key={day}>{day}</span>)}</div>
    {start > minimum && <Button variant="text" className="calendar-load" onClick={() => setStart(current => Math.max(minimum, current - 12))}>查看更早月份</Button>}
    {Array.from({ length: end - start + 1 }, (_, index) => {
      const month = start + index;
      const year = Math.floor(month / 12);
      const m = month % 12;
      const offset = new Date(year, m, 1).getDay();
      const days = new Date(year, m + 1, 0).getDate();
      return <section className="calendar-month" key={month} aria-label={`${year}年${m + 1}月`}>
        <h3>{year}年{m + 1}月</h3>
        <div className="calendar-days">
          {Array.from({ length: offset }, (_, blank) => <span aria-hidden="true" key={`blank-${blank}`} />)}
          {Array.from({ length: days }, (_, day) => {
            const date = `${year}-${pad(m + 1)}-${pad(day + 1)}`;
            return <button type="button" className="calendar-day" key={date} aria-label={date} aria-pressed={value === date} aria-current={date === today ? 'date' : undefined}
              disabled={date < minDate || (!!maxDate && date > maxDate)} onClick={() => onChange(date)}>{day + 1}</button>;
          })}
        </div>
      </section>;
    })}
    {end < maximum && <Button variant="text" className="calendar-load" onClick={() => setEnd(current => Math.min(maximum, current + 12))}>查看更多月份</Button>}
  </div>;
}
