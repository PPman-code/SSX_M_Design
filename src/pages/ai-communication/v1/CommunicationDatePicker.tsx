import { Calendar } from '../../../components/ui/Calendar';

export function CommunicationDatePicker({ open, onOpenChange, value, onChange, onConfirm, today, onPending, title = '下次跟进日期' }: { title?: string; onPending?: () => void; open: boolean; onOpenChange: (open: boolean) => void; value: string; onChange: (value: string) => void; onConfirm: () => void; today: string }) {
  return <Calendar open={open} onOpenChange={onOpenChange} title={title} value={value} onChange={onChange} today={today} minDate={today} onConfirm={onConfirm} onPending={onPending} />;
}
