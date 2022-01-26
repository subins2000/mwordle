export const enum LetterState {
  INITIAL = 0,
  CORRECT = 'correct',
  PRESENT = 'present',
  ABSENT = 'absent'
}

export interface Countdown {
  hours: string | number,
  minutes: string | number,
  seconds: string | number
}
