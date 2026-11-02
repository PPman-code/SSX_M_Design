import { useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { WheelPicker } from './WheelPicker';
import { dateRangePresets, rangeForPreset, type DateRange, type DateRangePeriod, type DateRangePreset } from '../../lib/date-range';
import './DateRangeFields.css';

interface Props {
  today: string;
  precision?: 'date' | 'month-day';
  presets?: readonly DateRangePreset[];
  period: DateRangePeriod | null;
  value: DateRange;
  onChange: (period: DateRangePeriod | null, value: DateRange) => void;
}
const labels = ['开始日期', '结束日期'];
const pad = (value: number) => String(value).padStart(2, '0');

// Controlled fields only: each caller owns its draft, reset and confirmation semantics.
export function DateRangeFields({ today, period, value, onChange, presets = dateRangePresets, precision = 'date' }: Props) {
  const [active, setActive] = useState<0 | 1 | null>(null);
  const monthDayOnly = precision === 'month-day';
  const activeIndex = active ?? 0;
  const [year, month, day] = (value[activeIndex] || today).split('-').map(Number);
  const baseYear = Number(today.slice(0, 4));
  const firstYear = Math.min(baseYear - 100, year);
  const lastYear = Math.max(baseYear + 100, year);
  const calendarYear = monthDayOnly ? 2000 : year;
  const days = new Date(Date.UTC(calendarYear, month, 0)).getUTCDate();
  const columns = [
    { key: 'year', label: '年', options: Array.from({ length: lastYear - firstYear + 1 }, (_, index) => ({ value: String(firstYear + index), label: `${firstYear + index}年` })) },
    { key: 'month', label: '月', options: Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1), label: `${index + 1}月` })) },
    { key: 'day', label: '日', options: Array.from({ length: days }, (_, index) => ({ value: String(index + 1), label: `${index + 1}日` })) },
  ];
  function displayDate(date: string) {
    return date ? monthDayOnly ? `${date.slice(5, 7)}月${date.slice(8, 10)}日` : date.replaceAll('-', '/') : '请选择';
  }
  function updateDate(parts: string[]) {
    const [nextYear, nextMonth, nextDay] = (monthDayOnly ? ['2000', ...parts] : parts).map(Number);
    const clampedDay = Math.min(nextDay, new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate());
    const next: DateRange = [...value];
    next[activeIndex] = `${nextYear}-${pad(nextMonth)}-${pad(clampedDay)}`;
    onChange('自定义', next);
  }
  return <div className="date-range-fields">
    {!monthDayOnly && <div className="date-range-options" role="group" aria-label="快捷时段">
      {presets.map(name => <Button key={name} className="sheet-choice-option" variant="soft" aria-pressed={period === name}
        onClick={() => {
          setActive(null);
          onChange(name, rangeForPreset(name, today));
        }}>{name}</Button>)}
    </div>}
    <div className="date-range-dates">
      {labels.map((label, index) => <div key={label} className="date-range-date">
        <span aria-hidden="true">{label}</span>
        <Button variant="soft" aria-label={`${label} ${displayDate(value[index])}`}
          aria-pressed={active === index} data-empty={!value[index] || undefined}
          onClick={() => {
            const nextActive = active === index ? null : (index as 0 | 1);
            setActive(nextActive);
            if (!value[index] && nextActive !== null) {
              const next: DateRange = [...value]; next[index] = monthDayOnly ? `2000-${today.slice(5)}` : today; onChange('自定义', next);
            }
          }}>
          <span>{displayDate(value[index])}</span><Icon name="calendar" />
        </Button>
      </div>)}
    </div>
    {active !== null && <WheelPicker label={`选择${labels[activeIndex]}`} columns={monthDayOnly ? columns.slice(1) : columns}
      value={monthDayOnly ? [String(month), String(day)] : [String(year), String(month), String(day)]} onChange={updateDate} />}
  </div>;
}
