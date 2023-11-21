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

export interface GameState {
  gameNo: number,
  board: {
    letter: string,
    state: LetterState
  }[][],
  transliteratedRows: string[],
  currentRowIndex: number
}

export interface GameStatsState {
  lastGame: number|null,
  gamesPlayed: number,
  gamesWon: number,
  currentStreak: number,
  maxStreak: number,
  winPositions: number[]
}
