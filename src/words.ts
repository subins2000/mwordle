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
export function getGameNumber() {
  const now = new Date()
  const diff = Number(now) - Number(gameStartDate)
  let day = Math.floor(diff / (1000 * 60 * 60 * 24))
  while (day > answers.length) {
    day -= answers.length
  }
  return day
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

// Use https://www.somacon.com/p568.php to find duplicates in a list

// Avoid words ending with 'u'
export const answers = [
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
  'muyal',
  'thiri', // 11. February 5, 2022
  'petti',
  'kanni',
  'vaaka',
  'kizhi',
  'melam',
  'lolan',
  'pavan', // 18. February 12, 2022
  'anali',
  'oppam',
  'madhu',
  'vazhi',
  'jilla',
  'dveep',
  'jalam', // 25. February 19, 2022
  'sabha',
  'thala',
  'vidya',
  'balam',
  'mutta',
  'vanam',
  'kural', // 32. February 26, 2022
  'puzha',
  'paatt',
  'rasam',
  'jaiva',
  'param',
  'pakal',
  'kayar',
  'mayil',
  'tholi',
  'jeevi',
  'mashi',
  'nayam',
  'theng',
  'kanam',
  'varav', // 47. March 14, 2022
  'naaya',
  'janmi',
  'gathi',
  'valam',
  'maala',
  'chevi',
  'kaaya',
  'palli',
  'kooli',
  'paamp',
  'dhanu',
  'yugam',
  'kriya',
  'varam',
  'maapp',
  'mozhi',
  'appam', // March 31, 2022
  'mikav',
  'vayal',
  'neeli',
  'mulla',
  'ruchi',
  'pizha',
  'veyil',
  'nanma',
  'konna',
  'vaaya',
  'vishu',
  'payar',
  'urukk',
  'illam',
  'potti',
  'appan',
  'vayar',
  'kappa',
  'chuma',
  'karam', // April 20, 2022
  'janam',
  'kanav',
  'vaiki',
  'kutta',
  'harji',
  'vadhu',
  'pokki',
  'mizhi',
  'nanav',
  'aruvi',
  'oruma',
  'kozha',
  'kayam',
  'thuni',
  'puzhu',
  'mushi',
  'malar', // May 7, 2022
  'plaav',
  'soura',
  'loham',
  'kanal',
  'lelam',
  'valav',
  'paava',
  'shiva',
  'doore',
  'kurav',
  'maami',
  'thekk',
  'manam', // May 20, 2022
  'varan',
  'kalav',
  'jayam',
  'chiri',
  'vayya',
  'piriv',
  'poyka', // May 27, 2022
  'oothi',
  'lajja',
  'pothi',
  'ugran',
  'chepp',
  'irutt', // June 2, 2022
]

export const gameNo = getGameNumber()
