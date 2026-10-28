import { useState } from 'react';
import { Button } from './ui/Button';
import { Calendar } from './ui/Calendar';

export function CalendarExamples() {
  const today = new Date().toLocaleDateString('en-CA');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [draft, setDraft] = useState(today);
  return <section className="demo-section" aria-labelledby="calendar-demo-title">
    <div className="section-heading"><h2 id="calendar-demo-title">日历选择器</h2><span>单日期 · 待定</span></div>
    <div className="demo-card stack"><Button variant="soft" onClick={() => { setDraft(value || today); setOpen(true); }}>选择日期</Button><p className="sheet-demo-caption">已选日期：{value || '待定'}</p></div>
    <Calendar open={open} onOpenChange={setOpen} title="选择日期" value={draft} onChange={setDraft} today={today} minDate={today} onConfirm={() => setValue(draft)} onPending={() => setValue('')} />
  </section>;
}
