/** Local preview facts keyed by stable student IDs; not production ownership or enrollment data. */
export const studentFilterOptions = {
  campuses: ['北京乐博', '上海乐博'],
  classes: ['美术启蒙一班', '创意绘画二班', '周末素描班'],
  teachers: ['刘老师', '王老师', '陈老师'],
  periods: ['春季班', '暑假班', '秋季班', '寒假班', '全年班'],
  courseTypes: ['常规课程', '精品小班', '一对一', '体验课程', '短期集训'],
};
export type StudentFilterFacts = {
  own: boolean; campus: string; classes: string[]; teachers: string[];
  lastDate: string; birthDate: string;
  courses: { period: string; type: string }[];
};
const seedIds = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
export const studentFilterFacts: Record<string, StudentFilterFacts> = Object.fromEntries(seedIds.map((id, index) => [id, {
  own: index % 2 === 0,
  campus: studentFilterOptions.campuses[index % 2],
  classes: [studentFilterOptions.classes[index % 3]],
  teachers: [studentFilterOptions.teachers[index % 3]],
  lastDate: index === 4 ? '' : `2026-10-${String(28 - index).padStart(2, '0')}`,
  birthDate: ['2017-04-06', '2016-08-12', '2018-11-02', '2017-12-18', '2016-01-08', '2018-06-16', '2017-03-22', '2018-09-10'][index],
  courses: [
    { period: studentFilterOptions.periods[index % studentFilterOptions.periods.length], type: studentFilterOptions.courseTypes[index % studentFilterOptions.courseTypes.length] },
    { period: '秋季班', type: studentFilterOptions.courseTypes[(index + 1) % studentFilterOptions.courseTypes.length] },
  ],
}]));
