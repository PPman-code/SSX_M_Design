import { studentFilterFacts } from './student-filter-data';
import { mockStudentPortraits } from '../../../mocks/student-avatars';

export const studentStatuses = ['在读', '试听', '休学', '退学'] as const;
export type StudentStatus = typeof studentStatuses[number];
export type Student = {
  id: string; studentNumber: string; groupCount: number; name: string; avatar?: string; gender?: 'male' | 'female'; phone: string; status: StudentStatus; tuition: number; quantity: number;
  wallet: number; validUntil: string; inputDate: string; communicationDue: boolean; arrears: boolean; birthdayToday: boolean;
};
export const students: Student[] = [
  { id: 's1', studentNumber: 'XGJ001', groupCount: 2, ...mockStudentPortraits[0], name: '金灿灿', phone: '13355556666', status: '在读', tuition: 4700, quantity: 25, wallet: 0, validUntil: '2025-11-30', inputDate: '2025-10-15', communicationDue: true, arrears: false, birthdayToday: true },
  { id: 's2', studentNumber: 'XGJ002', groupCount: 0, ...mockStudentPortraits[1], name: '欧阳晨宇', phone: '13355556666', status: '退学', tuition: -3782, quantity: -17, wallet: 0, validUntil: '', inputDate: '2025-10-14', communicationDue: false, arrears: true, birthdayToday: false },
  { id: 's3', studentNumber: 'XGJ003', groupCount: 1, ...mockStudentPortraits[2], name: '王小米', phone: '13355556666', status: '在读', tuition: 4700, quantity: 25, wallet: 0, validUntil: '2025-11-30', inputDate: '2025-10-13', communicationDue: true, arrears: false, birthdayToday: true },
  { id: 's4', studentNumber: 'XGJ004', groupCount: 1, ...mockStudentPortraits[3], name: '林晓晴_试听', phone: '13355556666', status: '试听', tuition: 4700, quantity: 25, wallet: 0, validUntil: '', inputDate: '2025-10-12', communicationDue: false, arrears: false, birthdayToday: false },
  { id: 's5', studentNumber: 'XGJ005', groupCount: 0, ...mockStudentPortraits[4], name: '金子轩', phone: '13355556666', status: '在读', tuition: 4700, quantity: 25, wallet: 0, validUntil: '', inputDate: '2025-10-11', communicationDue: false, arrears: true, birthdayToday: false },
  { id: 's6', studentNumber: 'XGJ006', groupCount: 1, name: '林可欣', gender: 'female', phone: '13355556666', status: '在读', tuition: 4700, quantity: 25, wallet: 0, validUntil: '', inputDate: '2025-10-04', communicationDue: false, arrears: false, birthdayToday: false },
  { id: 's7', studentNumber: 'XGJ007', groupCount: 1, name: '许子轩', gender: 'male', phone: '13355556667', status: '休学', tuition: 4700, quantity: 25, wallet: 0, validUntil: '', inputDate: '2025-10-03', communicationDue: false, arrears: false, birthdayToday: false },
  { id: 's8', studentNumber: 'XGJ008', groupCount: 1, name: '陈雨桐', gender: 'female', phone: '13355556668', status: '在读', tuition: 4700, quantity: 25, wallet: 0, validUntil: '', inputDate: '2025-10-02', communicationDue: false, arrears: false, birthdayToday: false },
];
export const tabs = [{ key: 'all', label: '全部' }, { key: 'communication', label: '待沟通' }, { key: 'arrears', label: '欠费' }, { key: 'birthday', label: '生日' }] as const;
export type StudentTab = typeof tabs[number]['key'];
export const sortOptions = [{ key: 'inputDate', label: '录入时间' }, { key: 'name', label: '姓名' }, { key: 'tuition', label: '剩余学费' }, { key: 'quantity', label: '剩余数量' }] as const;
export type StudentSort = typeof sortOptions[number]['key'];
export type StudentFilters = {
  scope: 'all' | 'self'; campuses: string[]; classes: string[]; teachers: string[];
  gender: '' | 'male' | 'female'; statuses: string[]; periods: string[]; courseTypes: string[];
  quantityRange: [string, string]; tuitionRange: [string, string];
  lastDate: [string, string]; birthDate: [string, string]; birthday: [string, string];
};
export const defaultFilters = (): StudentFilters => ({ scope: 'all', campuses: [], classes: [], teachers: [], gender: '', statuses: [], periods: [], courseTypes: [], quantityRange: ['', ''], tuitionRange: ['', ''], lastDate: ['', ''], birthDate: ['', ''], birthday: ['', ''] });
export function inTab(student: Student, tab: StudentTab) {
  return tab === 'all' || tab === 'communication' && student.communicationDue || tab === 'arrears' && student.arrears || tab === 'birthday' && student.birthdayToday;
}
function inNumberRange(value: number, [min, max]: [string, string]) {
  return (!min.trim() || value >= Number(min)) && (!max.trim() || value <= Number(max));
}
function inDateRange(value: string, [start, end]: [string, string]) {
  return (!start && !end) || !!value && (!start || value >= start) && (!end || value <= end);
}
function inBirthdayRange(value: string, range: [string, string]) {
  const [start, end] = range.map(date => date.slice(5));
  const day = value.slice(5);
  if (!start && !end) return true;
  if (!day) return false;
  return start && end && start > end ? day >= start || day <= end : (!start || day >= start) && (!end || day <= end);
}
export function filterStudents(data: Student[], query: string, filters: StudentFilters) {
  const keyword = query.trim().toLocaleLowerCase();
  return data.filter(student => {
    if (keyword && !student.name.toLocaleLowerCase().includes(keyword) && !student.phone.includes(keyword)) return false;
    if (filters.statuses.length && !filters.statuses.includes(student.status)) return false;
    if (filters.gender && student.gender !== filters.gender) return false;
    const facts = studentFilterFacts[student.id];
    if (!facts) return false;
    if (filters.scope === 'self' && !facts.own) return false;
    if (filters.campuses.length && !filters.campuses.includes(facts.campus)) return false;
    if (filters.classes.length && !filters.classes.some(value => facts.classes.includes(value))) return false;
    if (filters.teachers.length && !filters.teachers.some(value => facts.teachers.includes(value))) return false;
    const courses = facts.courses.filter(course => (!filters.periods.length || filters.periods.includes(course.period)) && (!filters.courseTypes.length || filters.courseTypes.includes(course.type)));
    if ((filters.periods.length || filters.courseTypes.length) && !courses.length) return false;
    return inNumberRange(student.quantity, filters.quantityRange) && inNumberRange(student.tuition, filters.tuitionRange)
      && inDateRange(facts.lastDate, filters.lastDate) && inDateRange(facts.birthDate, filters.birthDate) && inBirthdayRange(facts.birthDate, filters.birthday);
  });
}
export function money(value: number) {
  return `${value < 0 ? '-' : ''}¥${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: value === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}
