const defaultMessage = ' Using word of the day instead.'

export const gameStartDate = new Date(2022, 0, 26)

// Thanks MaxVT
// https://stackoverflow.com/a/2627493/1372424
export function getGameNumber(firstDate: Date, secondDate: Date) {
  const now = new Date()
  const start = new Date(2022, 0, 26)
  const diff = Number(now) - Number(start)
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

const answers = [
  'aalam',
  'maram',
  'varam',
  'panni',
  'mazha',
  'palli',
  'makan',
  'kinar',
  'kuzhi',
  'mathil',
  'kalam',
  'mannu',
  'kanni',
]

export const gameNo = getGameNumber(gameStartDate, new Date())
