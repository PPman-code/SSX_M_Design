import { rangeForPreset } from '../../../lib/date-range';
export type AttendanceRole = 'teacher' | 'headmaster' | 'manager' | 'principal';
export type Period = '本月' | '上月' | '最近30天' | '自定义';

export const dimensions = ['班级名称', '课程名称', '班级标签', '上课校区', '年份', '期段', '年级', '科目', '类型', '班型'] as const;
export type Dimension = (typeof dimensions)[number];

export const roleLabels: Record<AttendanceRole, string> = {
  teacher: '老师',
  headmaster: '班主任',
  manager: '学管师',
  principal: '校长',
};

/** 与交互原稿一致：试听默认不计入比率，其余学员范围默认全部计入。 */
export interface AttendanceFilters {
  trial: boolean;
  temporary: boolean;
  transfer: boolean;
  makeup: boolean;
  main: boolean;
  assistant: boolean;
}

export const defaultFilters: AttendanceFilters = {
  trial: false, temporary: true, transfer: true, makeup: true, main: true, assistant: true,
};

export const filterLabels: Readonly<Record<keyof AttendanceFilters, string>> = {
  trial: '试听学员', temporary: '临加学员', transfer: '临调学员', makeup: '补课学员', main: '主教', assistant: '助教',
};

export type ClassMeta = Record<Dimension, string | readonly string[] | null> & { headmasterOwner: boolean };

export interface LessonStudent {
  id: string;
  owner: boolean;
  isTry: boolean;
  isJoin: boolean;
  isAdjusted: boolean;
  adjustCourse: boolean;
  isMend: boolean;
  isAttend: boolean;
  isCost: boolean;
  mendResult: { isAttend: boolean; isCost: boolean } | null;
}

export interface Lesson {
  id: string;
  meta: ClassMeta;
  date: string;
  time: string;
  status: 'finished' | 'scheduled' | 'cancelled' | 'revoked';
  mainOwner: boolean;
  assistantOwner: boolean | null;
  students: readonly LessonStudent[];
  scopedStudents?: readonly LessonStudent[];
}

export interface Stats {
  classes: number;
  people: number;
  trial: number;
  att: number;
  attFree: number;
  abs: number;
  absFree: number;
  make: number;
  makeFree: number;
}

const shanghai = { timeZone: 'Asia/Shanghai' } as const;
const formatter = new Intl.DateTimeFormat('sv-SE', shanghai);

export function toISODate(date: Date): string {
  return formatter.format(date);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function offsetDate(anchor: string, offset: number): string {
  const base = new Date(`${anchor}T12:00:00+08:00`);
  return toISODate(new Date(base.getTime() + offset * 86400000));
}

export function rangeFor(period: Exclude<Period, '自定义'>, today = todayISO()): [string, string] {
  return rangeForPreset(period, today);
}

export function periodLabel(start: string, end: string): string {
  return start.slice(0, 4) === end.slice(0, 4) ? `${start.slice(5).replace('-', '/')}–${end.slice(5).replace('-', '/')}` : `${start.replaceAll('-', '/')}–${end.replaceAll('-', '/')}`;
}

const classNames = [
  '机器人趣味班 A班', '机器人趣味班 B班', '机器人进阶班 A班', '机器人进阶班 B班',
  '编程基础班 A班', '编程基础班 B班', '编程提高班 A班', '编程提高班 B班',
  '数学思维班', '科学探索班', '专项试听班', '未来体验班',
];
const campuses = ['北京乐博', '上海乐博', '深圳乐博'];

function buildMeta(today: string): ClassMeta[] {
  return classNames.map((name, index) => ({
    '班级名称': name,
    '课程名称': index < 2 ? '机器人趣味课程' : index < 4 ? '机器人进阶课程' : index < 8 ? '少儿编程课程' : index === 8 ? '数学思维课程' : index === 9 ? '科学探索课程' : '体验课程',
    '班级标签': index === 10 ? [] : index % 3 === 0 ? ['常规班', '重点跟进'] : index % 3 === 1 ? ['常规班'] : ['考级班'],
    '上课校区': campuses[index % 3],
    '年份': index === 10 ? null : `${today.slice(0, 4)}年`,
    '期段': index === 10 ? null : index % 2 ? '秋季' : '春季',
    '年级': index === 10 ? null : ['一年级', '二年级', '三年级'][index % 3],
    '科目': index === 10 ? null : index < 4 ? '机器人' : index < 8 ? '编程' : index === 8 ? '数学' : '科学',
    '类型': index === 10 ? null : index % 2 ? '专项课程' : '常规课程',
    '班型': index === 10 ? null : index % 2 ? '进阶班' : '基础班',
    headmasterOwner: index <= 7 || index === 10,
  }));
}

/** 示例数据：仅用于设计预览，不代表真实出勤计算结果。 */
export function buildLessons(today = todayISO()): Lesson[] {
  const lessons: Lesson[] = [];
  buildMeta(today).forEach((meta, classIndex) => {
    const offsets = classIndex === 11 ? [2, 5] : [0, -2, -5, -8, -12, -16, -21, -25, -29, -36, -45];
    offsets.forEach((offset, lessonIndex) => {
      const mainOwner = classIndex !== 6 && classIndex !== 9 && lessonIndex % 3 !== 0;
      const assistantOwner = mainOwner
        ? lessonIndex % 2 ? false : null
        : classIndex === 6 || classIndex === 9 ? false : true;
      const students = Array.from({ length: classIndex === 10 ? 3 : 12 }, (_, seat) => {
        const isTry = classIndex === 10 || seat === 11;
        const absent = (seat + classIndex + lessonIndex) % 5 === 0;
        return {
          id: `student-${classIndex}-${seat}`,
          owner: classIndex === 9 || seat % 3 === 0 || isTry,
          isTry,
          isJoin: seat === 8,
          isAdjusted: false,
          adjustCourse: seat === 9,
          isMend: seat === 10,
          isAttend: !absent,
          isCost: seat % 4 !== 0,
          mendResult: absent && (seat + lessonIndex) % 2 === 0 ? { isAttend: true, isCost: seat % 4 !== 0 } : null,
        };
      });
      lessons.push({
        id: `${classIndex}-${lessonIndex}`,
        meta,
        date: offsetDate(today, offset),
        time: classIndex % 3 === 0 ? '10:00–11:30' : classIndex % 3 === 1 ? '14:00–15:30' : '16:00–17:00',
        status: offset > 0 ? 'scheduled' : 'finished',
        mainOwner,
        assistantOwner,
        students,
      });
    });
  });
  // 保留取消、撤销和未上课课次，用于验证它们不会计入报表。
  (['cancelled', 'revoked', 'scheduled'] as const).forEach((status, index) => {
    lessons.push({ ...lessons[0], id: `excluded-${index}`, status, date: offsetDate(today, -index - 1) });
  });
  return lessons;
}

export function dimensionNames(lesson: Lesson, dimension: Dimension): string[] {
  const value = lesson.meta[dimension];
  if (Array.isArray(value)) return value.length ? [...new Set(value)] : ['未指定'];
  return [typeof value === 'string' && value.trim() ? value : '未指定'];
}

export function includeStudent(student: LessonStudent, filters: AttendanceFilters): boolean {
  // 学员范围条件独立应用；类型重叠时必须同时满足所有已关闭条件。
  return !student.isAdjusted && (filters.trial || !student.isTry) && (filters.temporary || !student.isJoin)
    && (filters.transfer || !student.adjustCourse) && (filters.makeup || !student.isMend);
}

export function scopeRecords(role: AttendanceRole, lessons: readonly Lesson[], start: string, end: string, filters: AttendanceFilters): Lesson[] {
  if (role === 'principal') return [];
  return lessons
    .filter((lesson) => lesson.status === 'finished' && lesson.date >= start && lesson.date <= end)
    .filter((lesson) => {
      if (role === 'teacher') return (filters.main && lesson.mainOwner) || (filters.assistant && lesson.assistantOwner === true);
      if (role === 'headmaster') return lesson.meta.headmasterOwner;
      return lesson.students.some((student) => student.owner);
    })
    .map((lesson) => ({ ...lesson, scopedStudents: role === 'manager' ? lesson.students.filter((student) => student.owner) : lesson.students }));
}

export function computeStats(records: readonly Lesson[], filters: AttendanceFilters): Stats {
  const total: Stats = { classes: 0, people: 0, trial: 0, att: 0, attFree: 0, abs: 0, absFree: 0, make: 0, makeFree: 0 };
  const seen = new Set<string>();
  records.forEach((lesson) => {
    if (seen.has(lesson.id)) return;
    seen.add(lesson.id);
    total.classes += 1;
    const students = lesson.scopedStudents ?? lesson.students;
    // 试听数量独立展示，是否计入比率由包含条件决定。
    total.trial += students.filter((student) => student.isTry && !student.isAdjusted).length;
    students.filter((student) => includeStudent(student, filters)).forEach((student) => {
      total.people += 1;
      const key = `${student.isAttend ? 'att' : 'abs'}${student.isCost ? '' : 'Free'}` as 'att' | 'attFree' | 'abs' | 'absFree';
      total[key] += 1;
      if (!student.isAttend && student.mendResult?.isAttend) total[student.mendResult.isCost ? 'make' : 'makeFree'] += 1;
    });
  });
  return total;
}

export function percent(numerator: number, denominator: number): string {
  return denominator ? `${((numerator * 100) / denominator).toFixed(2)}%` : '—';
}

export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN');
}

const collator = new Intl.Collator('zh-CN', { numeric: true });

export function sortNames(a: string, b: string): number {
  return Number(a === '未指定') - Number(b === '未指定') || collator.compare(a, b);
}

export interface AttendanceGroup {
  name: string;
  lessons: Lesson[];
}

export function groupRecords(records: readonly Lesson[], dimension: Dimension): AttendanceGroup[] {
  const grouped = new Map<string, Lesson[]>();
  records.forEach((lesson) => {
    dimensionNames(lesson, dimension).forEach((name) => {
      const list = grouped.get(name);
      if (list) list.push(lesson); else grouped.set(name, [lesson]);
    });
  });
  return Array.from(grouped, ([name, lessons]) => ({ name, lessons })).sort((a, b) => sortNames(a.name, b.name));
}
