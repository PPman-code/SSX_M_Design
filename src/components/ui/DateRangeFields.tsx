import { useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { WheelPicker } from './WheelPicker';
import { dateRangePresets, rangeForPreset, type DateRange, type DateRangePeriod } from '../../lib/date-range';
import './DateRangeFields.css';

interface Props {
  today: string;
  period: DateRangePeriod | null;
  value: DateRange;
  onChange: (period: DateRangePeriod | null, value: DateRange) => void;
}
const labels = ['开始日期', '结束日期'];
const pad = (value: number) => String(value).padStart(2, '0');

// Controlled fields only: each caller owns its draft, reset and confirmation semantics.
export function DateRangeFields({ today, period, value, onChange }: Props) {
  const [active, setActive] = useState<0 | 1 | null>(null);
  const activeIndex = active ?? 0;
  const [year, month, day] = (value[activeIndex] || today).split('-').map(Number);
  const baseYear = Number(today.slice(0, 4));
  const firstYear = Math.min(baseYear - 100, year);
  const lastYear = Math.max(baseYear + 100, year);
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const columns = [
    { key: 'year', label: '年', options: Array.from({ length: lastYear - firstYear + 1 }, (_, index) => ({ value: String(firstYear + index), label: `${firstYear + index}年` })) },
    { key: 'month', label: '月', options: Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1), label: `${index + 1}月` })) },
    { key: 'day', label: '日', options: Array.from({ length: days }, (_, index) => ({ value: String(index + 1), label: `${index + 1}日` })) },
  ];
  function updateDate(parts: string[]) {
    const [nextYear, nextMonth, nextDay] = parts.map(Number);
    const clampedDay = Math.min(nextDay, new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate());
    const next: DateRange = [...value];
    next[activeIndex] = `${nextYear}-${pad(nextMonth)}-${pad(clampedDay)}`;
    onChange('自定义', next);
  }
  return <div className="date-range-fields">
    <div className="date-range-options" role="group" aria-label="快捷时段">
      {dateRangePresets.map(name => <Button key={name} className="sheet-choice-option" variant="soft" aria-pressed={period === name}
        onClick={() => {
          setActive(null);
          onChange(name, rangeForPreset(name, today));
        }}>{name}</Button>)}
    </div>
    <div className="date-range-dates">
      {labels.map((label, index) => <div key={label} className="date-range-date">
        <span aria-hidden="true">{label}</span>
        <Button variant="soft" aria-label={`${label} ${value[index] ? value[index].replaceAll('-', '/') : '请选择'}`}
          aria-pressed={active === index} data-empty={!value[index] || undefined}
          onClick={() => {
            const nextActive = active === index ? null : (index as 0 | 1);
            setActive(nextActive);
            if (!value[index] && nextActive !== null) {
              const next: DateRange = [...value]; next[index] = today; onChange('自定义', next);
            }
          }}>
          <span>{value[index] ? value[index].replaceAll('-', '/') : '请选择'}</span><Icon name="calendar" />
        </Button>
      </div>)}
    </div>
    {active !== null && <WheelPicker label={`选择${labels[activeIndex]}`} columns={columns}
      value={[String(year), String(month), String(day)]} onChange={updateDate} />}
  </div>;
}
