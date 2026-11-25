import { allDemoSchools, demoAccountSchools, onboardingPhone, type DemoSchool } from './login-demo';

export const loginSessionKey = 'ssx-teacher-app-demo-login-v1';

export type LoginSession = {
  schoolId: DemoSchool['id'] | null;
  bindings: { schoolId: DemoSchool['id']; phone: string }[];
};

function isActiveSchool(value: unknown): value is DemoSchool['id'] {
  return allDemoSchools.some(school => school.id === value && school.status !== 'inactive');
}

export function readLoginSession(): LoginSession {
  const defaultBinding = { schoolId: demoAccountSchools[0].id, phone: onboardingPhone };
  const empty: LoginSession = { schoolId: null, bindings: [defaultBinding] };
  try {
    const raw = localStorage.getItem(loginSessionKey);
    if (!raw) return empty;
    const saved = JSON.parse(raw) as { schoolId?: unknown; bindings?: unknown; demoBindingsInitialized?: boolean } | null;
    const bindings = Array.isArray(saved?.bindings)
      ? saved.bindings.filter((binding): binding is LoginSession['bindings'][number] =>
          isActiveSchool(binding?.schoolId) && typeof binding?.phone === 'string' && /^1[3-9]\d{9}$/.test(binding.phone))
      : [];
    if (!saved?.demoBindingsInitialized && !bindings.some(binding => binding.schoolId === defaultBinding.schoolId)) {
      bindings.push(defaultBinding);
    }
    return { schoolId: isActiveSchool(saved?.schoolId) ? saved.schoolId : null, bindings };
  } catch {
    return empty;
  }
}

export function writeLoginSession(session: LoginSession) {
  try {
    localStorage.setItem(loginSessionKey, JSON.stringify({ ...session, demoBindingsInitialized: true }));
  } catch {
    // This preview can still run for the current page when browser storage is unavailable.
  }
}
