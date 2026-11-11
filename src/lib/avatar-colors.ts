/** Stable pseudo-random palette slot; never depends on visible order or render time. */
export function avatarAttributes(kind: 'student' | 'teacher', identity: string) {
  let hash = 0;
  for (const character of identity) hash = (Math.imul(hash, 31) + character.codePointAt(0)!) >>> 0;
  const count = kind === 'student' ? 5 : 4;
  return { 'data-avatar-kind': kind, 'data-avatar-color': String(hash % count) };
}
