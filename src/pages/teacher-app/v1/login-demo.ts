export const demoAccount = 'teacher@example.com';
export const unboundDemoAccount = 'new@example.com';
export const demoPassword = '888888';
export const demoCode = '123456';

export const onboardingPhone = '13700137000';
export const unregisteredPhone = '13800138000';
export const conflictPhone = '13900139000';
export const demoSchools = [
  { id: 'xinghe', name: '星禾艺术学校', campus: '城南校区', role: '授课老师', status: 'onboarding', account: demoAccount },
  { id: 'yungu', name: '云谷科技培训学校', campus: '滨江校区', role: '兼职老师', status: 'active', account: 'teacher-yungu@example.com' },
  { id: 'qicheng', name: '启程培训学校', campus: '总校区', role: '授课老师', status: 'inactive' },
] as const;

export const demoAccountSchools = [
  demoSchools[0],
  { id: 'qinghe', name: '青禾美术学校', campus: '中心校区', role: '授课老师', status: 'onboarding', account: unboundDemoAccount },
] as const;
export const allDemoSchools = [...demoSchools, demoAccountSchools[1]] as const;
export type DemoSchool = typeof allDemoSchools[number];
export type DemoAccountSchool = typeof demoAccountSchools[number];
export const schoolStatusLabel = { onboarding: '本次入职', active: '在职', inactive: '已离职' };

export function maskPhone(phone: string) {
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}
