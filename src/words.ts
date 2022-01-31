const defaultMessage = ' Using word of the day instead.'

const newGameTime = {
  hours: 16,
  minutes: 30
}

// January 25 2022, 22:00 IST = January 25 2022, 16:30 UTC
export const gameStartDate = new Date(Date.UTC(2022, 0, 25, newGameTime.hours, newGameTime.minutes, 0))

export const isIndianTimeZone = new Date().toLocaleString('en-GB', {timeZoneName: "long", hour: "numeric"}).indexOf("India Standard") > -1

// New mwordle every 10PM IST globally
export const nextMWordleDate = () => {
  const date = new Date();
  if (
    date.getUTCHours() > newGameTime.hours ||
    (
      date.getUTCHours() === newGameTime.hours &&
      date.getUTCMinutes() >= newGameTime.minutes
    )
  ) {
    // Pick tomorrow if we're already past 16:30 UTC
    date.setUTCDate(date.getUTCDate() + 1)
  }
  date.setUTCHours(newGameTime.hours, newGameTime.minutes, 0, 0);
  return date
}

// Thanks MaxVT
// https://stackoverflow.com/a/2627493/1372424
export function getGameNumber(firstDate: Date, secondDate: Date) {
  const now = new Date()
  const diff = Number(now) - Number(gameStartDate)
  let day = Math.floor(diff / (1000 * 60 * 60 * 24))
  while (day > answers.length) {
    day -= answers.length
  }
  return day
}

export function getWordOfTheDay() {
  let day = gameNo
  while (day > answers.length) {
    day -= answers.length
  }
  return answers[day]
}

/**************
 * DO NOT
 * READ
 * FURTHER
 * IF
 * YOU
 * DON'T
 * WANT
 * TO
 * SEE
 * ANSWERS 
 **************/

// Avoid words ending with 'u'
const answers = [
  'aalam', // 0. January 26, 2022
  'maram',
  'panni',
  'makan',
  'lokam',
  'mlaav',
  'vaava',
  'mazha',
  'kinar',
  'kuzhi',
  'mathil', // 10. February 5, 2022
  'kalam',
  'kanni',
  'patti',
  'muyal',
  'thiri',
  'vaaka',
  'kizhi',
  'melam',
  'lolan'
]

export const gameNo = getGameNumber(gameStartDate, new Date())
