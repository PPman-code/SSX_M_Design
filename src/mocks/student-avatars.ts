/** User supplied mock portraits, with fixed demo genders. Assign once by seed identity, never by visible row index. */
export const mockStudentPortraits: readonly { avatar: string; gender: 'male' | 'female' }[] = [
  { avatar: '/mock/students/avatar-01.png', gender: 'male' },
  { avatar: '/mock/students/avatar-02.png', gender: 'male' },
  { avatar: '/mock/students/avatar-03.png', gender: 'female' },
  { avatar: '/mock/students/avatar-04.png', gender: 'male' },
  { avatar: '/mock/students/avatar-05.png', gender: 'male' },
  { avatar: '/mock/students/avatar-06.png', gender: 'female' },
];
