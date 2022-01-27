const defaultMessage = ' Using word of the day instead.'

export const hourOfNewMWordle = 22

// January 25 2022, 10PM
export const gameStartDate = new Date(2022, 0, 25, hourOfNewMWordle)

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
  if (location.search) {
    try {
      const query = atob(location.search.slice(1))
      if (query.length !== 5) {
        alert(`Incorrect word length from encoded query. ${defaultMessage}`)
      } else {
        return query
      }
    } catch (e) {
      alert(`Malformed encoded word query. ${defaultMessage}`)
    }
  }

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
  'palli',
  'varam',
  'makan',
  'mazha',
  'vaava',
  'kinar',
  'kuzhi',
  'mathil', // 10. February 5, 2022
  'kalam',
  'kanni',
  'thiri',
  'vaaka',
  'kizhi',
]

export const gameNo = getGameNumber(gameStartDate, new Date())
