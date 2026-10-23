import { mockStudentPortraits } from '../../../mocks/student-avatars';

export type StudentStatus = '在读' | '退学' | '停课' | '试听' | '休学';
export type Student = {
  id: string; name: string; avatar?: string; gender?: 'male' | 'female'; phone: string; status: StudentStatus; tuition: number; quantity: number;
  wallet: number; validUntil: string; inputDate: string; communicationDue: boolean; arrears: boolean; birthdayToday: boolean;
};
export const students: Student[] = [
  { id: 's1', ...mockStudentPortraits[0], name: '金灿灿', phone: '13355556666', status: '在读', tuition: 4700, quantity: 25, wallet: 0, validUntil: '2025-11-30', inputDate: '2025-10-15', communicationDue: true, arrears: false, birthdayToday: true },
  { id: 's2', ...mockStudentPortraits[1], name: '欧阳丽丽', phone: '13355556666', status: '退学', tuition: -3782, quantity: -17, wallet: 0, validUntil: '', inputDate: '2025-10-14', communicationDue: false, arrears: true, birthdayToday: false },
  { id: 's3', ...mockStudentPortraits[2], name: '王小米', phone: '13355556666', status: '停课', tuition: 4700, quantity: 25, wallet: 0, validUntil: '2025-11-30', inputDate: '2025-10-13', communicationDue: true, arrears: false, birthdayToday: true },
  { id: 's4', ...mockStudentPortraits[3], name: '阳光_试听', phone: '13355556666', status: '试听', tuition: 4700, quantity: 25, wallet: 0, validUntil: '', inputDate: '2025-10-12', communicationDue: false, arrears: false, birthdayToday: false },
  { id: 's5', ...mockStudentPortraits[4], name: '金妮妮', phone: '13355556666', status: '休学', tuition: 4700, quantity: 25, wallet: 0, validUntil: '', inputDate: '2025-10-11', communicationDue: false, arrears: true, birthdayToday: false },
];
export const tabs = [{ key: 'all', label: '全部' }, { key: 'communication', label: '待沟通' }, { key: 'arrears', label: '欠费' }, { key: 'birthday', label: '生日' }] as const;
export type StudentTab = typeof tabs[number]['key'];
export const sortOptions = [{ key: 'inputDate', label: '录入时间' }, { key: 'name', label: '姓名' }, { key: 'tuition', label: '剩余学费' }, { key: 'quantity', label: '剩余数量' }] as const;
export type StudentSort = typeof sortOptions[number]['key'];
export type StudentFilters = { statuses: string[]; balance: 'all' | 'negative' | 'positive' | 'zero'; validity: 'all' | 'limited' | 'unlimited' };
export const defaultFilters = (): StudentFilters => ({ statuses: [], balance: 'all', validity: 'all' });
export function inTab(student: Student, tab: StudentTab) {
  return tab === 'all' || tab === 'communication' && student.communicationDue || tab === 'arrears' && student.arrears || tab === 'birthday' && student.birthdayToday;
}
export function filterStudents(data: Student[], query: string, filters: StudentFilters) {
  const keyword = query.trim().toLocaleLowerCase();
  return data.filter(student => (!keyword || student.name.toLocaleLowerCase().includes(keyword) || student.phone.includes(keyword))
    && (!filters.statuses.length || filters.statuses.includes(student.status))
    && (filters.balance === 'all' || filters.balance === 'negative' && student.tuition < 0 || filters.balance === 'positive' && student.tuition > 0 || filters.balance === 'zero' && student.tuition === 0)
    && (filters.validity === 'all' || filters.validity === 'limited' && !!student.validUntil || filters.validity === 'unlimited' && !student.validUntil));
}
export function money(value: number) {
  return `${value < 0 ? '-' : ''}¥${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: value === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}
