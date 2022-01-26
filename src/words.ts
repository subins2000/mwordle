const defaultMessage = ' Using word of the day instead.'

export const gameStartDate = new Date(2022, 0, 27)

// Thanks MaxVT
// https://stackoverflow.com/a/2627493/1372424
export function daysSince(firstDate: Date, secondDate: Date) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

export const gameNo = daysSince(gameStartDate, new Date())

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
