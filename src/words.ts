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
  'kutti',
  'uppan',
  'kokka',
  'poott',
  'katta', // June 7, 2022
  'muzha',
  'chukk',
  'thuka',
  'paisa',
  'paara', // June 12, 2022
  'mutti',
  'muriv',
  'praav', // June 15, 2022
  'nelli',
  'chena',
  'neela',
  'thatt',
  'nilam', // June 20, 2022
  'unni',
  'pazham',
  'pettu',
  'chevi',
  'ennum',
  'keeri',
  'kuzhal',
  'irul',
  'uyaram',
  'kaana', // June 30, 2022
  'kuppi',
  'gasal',
  'chatti',
  'nuna',
  'pana',
  'thotti',
  'thuka',
  'kavil',
  'muni',
  'vett',
  'muna',
  'nura', // July 12, 2022
  'kuru',
  'patha',
  'kani', // July 15, 2022
  'ilam',
  'thennal',
  'kuli',
  'annum',
  'kili',
  'pukil',
  'piri',
  'jeevan',
  'samayam',
  'kuthira',
  'kali', // July 26, 2022
  'mala',
  'mazhu',
  'kula',
  'porul',
  'chathi',
  'kallam',
  'vala',
  'oru',
  'vela',
  'olivil',
  'thiriv',
  'sathyam', // August 7, 2022
  'thukal',
  'kaayal',
  'asooya', // August 10, 2022
  'sathram',
  'vratham',
  'cheera',
  'ulli',
  'kuri',
  'pott', // August 16, 2022
  'karu',
  'parunth',
  'nulli',
  'pothu',
  'thulyam',
  'sneham',
  'uluva',
  'cheral',
  'karupp', // August 25, 2022
  'pera',
  'pani',
  'kitti',
  'kola',
  'lahari',
  'vili',
  'verupp',
  'neelam',
  'gulika',
  'vila',
  'niyamam',
  'roopa',
  'paayal',
  'rachana',
  'putti', // September 9, 2022
  'onam',
  'gama',
  'joli',
  'patti',
  'muram',
  'thura',
  'kothi',
  'mazhu',
  'vanitha',
  'neethi',
  'kazhiv',
  'visham', // September 21, 2022
  'vari',
  'kinnam', // September 23, 2022
  'vellam',
  'chaavi',
  'kinaav',
  'muri',
  'puli',
  'kulam',
  'chuzhi',
  'thaaram',
  'janal',
  'vaathil',
  'amma',
  'theeram',
  'yamuna',
  'kari', // October 7
  'gunam',
  'lipi', // October 9
  'valli',
  'chali',
  'raksha',
  'aikyam',
  'gamanam',
  'yogam',
  'tharuka',
  'kalli',
  'vidham',
  'pulli', // October 19
  'kuripp',
  'uri',
  'cholam',
  'thula',
  'eli',
  'thira',
  'naav',
  'thavala', // October 27
  'rogi',
  'yuvathi',
  'unangi',
  'puram',
  'kathak',
  'laksham',
  'akam',
  'minnal',
  'avan',
  'virunn',
  'aviyal',
  'kshama',
  'arike',
  'mara',
  'innale',
  'thiriv',
  'sheelam',
  'aval',
  'lakshmi',
  'irunnu',
  'ariv',
  'vanangi', // Nov 18
  'yuvav',
  'murali',
  'dinam',
  'kuyil', // Nov 22
  'varan',
  'kiranam',
  'pooram',
  'bhayam',
  'eriv', // Nov 27
  'mani',
  'uruli',
  'inam',
  'sthalam',
  'kaav',
  'vasthu',
  'thapass',
  'vaka',
  'tharam', // Dec 6
  'olakka',
  'murukk',
  'thvara',
  'thuni',
  'ara',
  'malli',
  'raajyam',
  'putt',
  'samaram',
  'chovva',
  'nell',
  'bhoomi',
  'nikuthi', // Dec 19
  'chuli',
  'yaathra',
  'roopam',
  'poraali',
  'maravi',
  'kaniv',
  'manthri',
  'poothi',
  'sahaayi',
  'churuli' // Dec 29
]

export const gameNo = getGameNumber()
