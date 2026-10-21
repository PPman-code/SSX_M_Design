import { useState } from 'react';
import type { RefObject } from 'react';
import { SideDrawer } from '../../../components/ui/SideDrawer';
import { SheetActions, SheetChoiceGroup } from '../../../components/ui/SheetContent';
import { defaultFilters } from './model';
import type { StudentFilters as FilterValue } from './model';

export function StudentFilters({ value, onApply, open, onOpenChange, finalFocus }: {
  value: FilterValue; onApply: (filters: FilterValue) => void; open: boolean; onOpenChange: (open: boolean) => void;
  finalFocus: RefObject<HTMLButtonElement | null>;
}) {
  const [draft, setDraft] = useState(() => structuredClone(value));
  return <SideDrawer title="筛选学员" open={open} onOpenChange={onOpenChange} finalFocus={finalFocus} footer={<SheetActions secondary={{ label: '重置', onClick: () => setDraft(defaultFilters()) }} primary={{ label: '确定', onClick: () => { onApply(draft); onOpenChange(false); } }} />}>
    <div className="student-filter-content"><SheetChoiceGroup label="学员状态" options={['在读', '退学', '停课', '试听', '休学'].map(value => ({ value, label: value }))} value={draft.statuses} onToggle={value => setDraft(previous => ({ ...previous, statuses: previous.statuses.includes(value) ? previous.statuses.filter(item => item !== value) : [...previous.statuses, value] }))} />
      <SheetChoiceGroup label="剩余学费" options={[{ value: 'all', label: '不限' }, { value: 'negative', label: '小于 0' }, { value: 'zero', label: '等于 0' }, { value: 'positive', label: '大于 0' }]} value={[draft.balance]} onToggle={value => setDraft({ ...draft, balance: value as FilterValue['balance'] })} />
      <SheetChoiceGroup label="有效期" options={[{ value: 'all', label: '不限' }, { value: 'limited', label: '有有效期' }, { value: 'unlimited', label: '无限期' }]} value={[draft.validity]} onToggle={value => setDraft({ ...draft, validity: value as FilterValue['validity'] })} />
    </div>
  </SideDrawer>;
}
