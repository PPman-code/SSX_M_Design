import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { WheelPicker } from '../../../components/ui/WheelPicker';
import { rangeFor, type Period } from '../v1/attendance-data';
import './attendance-period-fields.css';

type DateRange = [string, string];
interface Props {
  today: string;
  period: Period;
  value: DateRange;
  onChange: (period: Period, value: DateRange) => void;
}
const periods: Exclude<Period, '自定义'>[] = ['本月', '上月', '最近30天'];
const labels = ['开始日期', '结束日期'];
const pad = (value: number) => String(value).padStart(2, '0');

// Page-level combination shared by the two attendance versions; not a public date-picker API.
export function AttendancePeriodFields({ today, period, value, onChange }: Props) {
  const [active, setActive] = useState<0 | 1 | null>(null);
  const activeIndex = active ?? 0;
  const [year, month, day] = value[activeIndex].split('-').map(Number);
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
  return <div className="attendance-period-fields">
    <div className="attendance-period-options" role="group" aria-label="快捷时段">
      {periods.map(name => <Button key={name} variant="soft" aria-pressed={period === name}
        onClick={() => {
          setActive(null);
          onChange(name, rangeFor(name, today));
        }}>{name}</Button>)}
    </div>
    <div className="attendance-period-dates">
      {labels.map((label, index) => <div key={label} className="attendance-period-date">
        <span aria-hidden="true">{label}</span>
        <Button variant="soft" aria-label={`${label} ${value[index].replaceAll('-', '/')}`}
          aria-pressed={active === index}
          onClick={() => {
            const nextActive = active === index ? null : (index as 0 | 1);
            setActive(nextActive);
          }}>
          <span>{value[index].replaceAll('-', '/')}</span><Icon name="calendar" />
        </Button>
      </div>)}
    </div>
    {active !== null && <WheelPicker label={`选择${labels[activeIndex]}`} columns={columns}
      value={[String(year), String(month), String(day)]} onChange={updateDate} />}
  </div>;
}
