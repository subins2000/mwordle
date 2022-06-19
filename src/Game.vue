<script setup lang="ts">
import { onUnmounted } from 'vue'
import { answers, gameNo, nextMWordleDate, isIndianTimeZone } from './words'
import { GameState, GameStatsState, LetterState } from './types'
import {startCountdown, transliterate, disabledLetters} from './utils'

import Keyboard from './Keyboard.vue'

// Get word of the day
let answer = answers[gameNo]

// Board state. Each tile is represented as { letter, state }
const board = $ref(
  Array.from({ length: 6 }, () =>
    Array.from({ length: answer.length }, () => ({
      letter: '',
      state: LetterState.INITIAL
    }))
  )
)

let lastFilledRowIndex = $ref(-1)

// Current active row.
let currentRowIndex = $ref(0)
const currentRow = $computed(() => board[currentRowIndex])

// Feedback state: message and shake
let message = $ref('')
let appreciationWord = $ref('')
let shakeRowIndex = $ref(-1)
let success = $ref(false)
let isGameFinished = $ref(false)

// Keep track of revealed letters for the virtual keyboard
const letterStates: Record<string, LetterState> = $ref({})

// Handle keyboard input.
let allowInput = true

const onKeyup = (e: KeyboardEvent) => onKey(e.key)

window.addEventListener('keyup', onKeyup)
window.addEventListener('keydown', e => {
  if (e.key === "Backspace") {
    e.preventDefault()
  }
})

onUnmounted(() => {
  window.removeEventListener('keyup', onKeyup)
})

let transliterated = $ref("")
let transliteratedRows = $ref(Array(6).fill(""))

let transliterationInProgress = $ref(false)
let validWord = false

let lastRequestController: AbortController;
async function transliterateRow() {
  const word = currentRow.map((tile) => tile.letter).join('')
  try {
    if (lastRequestController) {
      lastRequestController.abort()
      lastRequestController = null
    }
    if (word === "") {
      transliteratedRows[currentRowIndex] = ""
      transliterationInProgress = false
      return
    }
    transliterationInProgress = true
    lastRequestController = new AbortController()
    const {
      exact_words,
      exact_matches,
      tokenizer_suggestions,
      greedy_tokenized
    } = await transliterate(word, lastRequestController.signal)
    const greedyWords = greedy_tokenized.map(item => item.word)
    const combined = [
      // Show all exact words :
      // ...(exact_words.length === 0 ? [] : [{word: exact_words.map(item => item.word).join(", ")}]),
      ...exact_words.map(item => item.word),
      ...exact_matches.map(item => item.word),
      ...greedyWords
    ]

    if (word.length >= 4) {
      transliteratedRows[currentRowIndex] = [...new Set([combined[0], ...greedyWords])].join(", ")
    } else {
      transliteratedRows[currentRowIndex] = [...new Set(combined)].join(", ")
    }

    validWord = exact_words.length > 0

    transliterationInProgress = false
  } catch (e) {
    console.log(e)
  }
}

function onKey(key: string) {
  if (!allowInput) return
  if (/^[a-zA-Z]$/.test(key) && disabledLetters.indexOf(key) === -1) {
    fillTile(key.toLowerCase())
  } else if (key === 'Backspace') {
    clearTile()
  } else if (key === 'Enter') {
    completeRow()
  }
}

function fillTile(letter: string) {
  for (const tile of currentRow) {
    if (!tile.letter) {
      tile.letter = letter
      transliterateRow()
      break
    }
  }
}

function clearTile() {
  for (const tile of [...currentRow].reverse()) {
    if (tile.letter) {
      tile.letter = ''
      transliterateRow()
      break
    }
  }
}

async function showAnswer() {
  const {exact_words} = await transliterate(`${answer}?finished`, null)
  showMessage(`${answer.toUpperCase()} - ${exact_words[0].word}`, 6000)
}

// DON'T FORGET TO COMMENT THIS
// setInterval(() => showMessage("test test test test test"), 2000)

function validateRowTiles(expected: string) {
  const expectedLetters: (string | null)[] = expected.split('')
  // first pass: mark correct ones
  currentRow.forEach((tile, i) => {
    if (expectedLetters[i] === tile.letter) {
      tile.state = letterStates[tile.letter] = LetterState.CORRECT
      expectedLetters[i] = null
    }
  })
  // second pass: mark the present
  currentRow.forEach((tile) => {
    if (!tile.state && expectedLetters.includes(tile.letter)) {
      tile.state = LetterState.PRESENT
      expectedLetters[expectedLetters.indexOf(tile.letter)] = null
      if (!letterStates[tile.letter]) {
        letterStates[tile.letter] = LetterState.PRESENT
      }
    }
  })
  // 3rd pass: mark absent
  currentRow.forEach((tile) => {
    if (!tile.state) {
      tile.state = LetterState.ABSENT
      if (!letterStates[tile.letter]) {
        letterStates[tile.letter] = LetterState.ABSENT
      }
    }
  })

  lastFilledRowIndex = currentRowIndex
}

function completeRow() {
  if (transliterationInProgress) return
  if (currentRow.every((tile) => tile.letter)) {
    const guess = currentRow.map((tile) => tile.letter).join('')
    if (!validWord && guess !== answer) {
      shake()
      showMessage(`Not in word list`)
      return
    }

    validateRowTiles(answer)

    allowInput = false
    if (currentRow.every((tile) => tile.state === LetterState.CORRECT)) {
      // yay!
      setTimeout(gameWon, 1600)
    } else if (currentRowIndex < board.length - 1) {
      // go the next row
      setTimeout(() => {
        allowInput = true
      }, 1600)
    } else {
      // game over :(
      setTimeout(async () => {
        setTimeout(() => {
          gameFinished()
        }, 1600)
        showAnswer()
      }, 1600)
    }
    currentRowIndex++
    saveGame()
  } else {
    shake()
    showMessage('Not enough letters')
  }
}

function showMessage(msg: string, time = 1000) {
  message = msg
  if (time > 0) {
    setTimeout(() => {
      message = ''
    }, time)
  }
}

function shake() {
  shakeRowIndex = currentRowIndex
  setTimeout(() => {
    shakeRowIndex = -1
  }, 1000)
}

const icons = {
  [LetterState.CORRECT]: '🟩',
  [LetterState.PRESENT]: '🟨',
  [LetterState.ABSENT]: '⬜',
  [LetterState.INITIAL]: null
}

function genResultGrid() {
  return board
    .slice(0, currentRowIndex)
    .map((row) => {
      return row.map((tile) => icons[tile.state]).join('')
    })
    .join('\n')
}

function isASupportedBrowser() {
  var ua = navigator.userAgent || navigator.vendor || window.opera;
  return navigator.userAgent.indexOf("Firefox") === -1 &&
    ua.indexOf("FBAN") === -1 &&
    ua.indexOf("FBAV") === -1 &&
    ua.indexOf("Instagram") === -1 &&
    ua.indexOf("Windows") === -1;
}

async function shareResult(extraText = "") {
  // currentRowIndex is incremented after every row fill
  // So, if user is at last row, currentRowIndex = 6 = board.length
  const tries = success ? currentRowIndex : "X"
  const text = `#മwordle ${gameNo} ${tries}/${board.length}\n\n${genResultGrid()}${extraText}`;

  // Best to assume share failed first
  let shareFailed = true

  try {
    // canShare() & shareData.text support came together in browsers (Chrome 75).
    // Firefox for Android doesn't support text data sharing
    if (navigator.canShare && isASupportedBrowser()) {
      const shareData = {
        text
      }
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData)
        shareFailed = false
      }
    }
  } catch (err: DOMException | any) {
    console.log(err)
    if (err.code === DOMException.ABORT_ERR) {
      // User cancelled sharing, it's alright :)
      shareFailed = false
    }
  }
  try {
    if (shareFailed) {
      await navigator.clipboard.writeText(text)
      showMessage("Copied results to clipboard!", 2000)
    }
  } catch(err) {
    showMessage("Share Failed. Try A Different Web Browser", 2000)
    console.log(err)
  }
}

let gameStats: GameStatsState = {
  lastGame: null,
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  winPositions: Array.from({length: 6}).fill(0)
};

function loadGameStats() {
  if (localStorage.getItem("gameStats")) {
    gameStats = JSON.parse(localStorage.getItem("gameStats"))
  }
}

loadGameStats()

function updateGameStats() {
  if (gameStats.lastGame === gameNo) return

  gameStats.gamesPlayed++
  if (success) {
    gameStats.gamesWon++
    gameStats.winPositions[lastFilledRowIndex]++
    if (gameStats.lastGame !== gameNo - 1) {
      gameStats.currentStreak = 1
    } else {
      gameStats.currentStreak++
    }
  } else {
    gameStats.currentStreak = 0
  }
  gameStats.lastGame = gameNo
  gameStats.maxStreak = Math.max(gameStats.currentStreak, gameStats.maxStreak)
  localStorage.setItem("gameStats", JSON.stringify(gameStats))
}

function gameWon() {
  appreciationWord = ['ഗംഭീരം', 'അടിപൊളി', 'മനോഹരം', 'പൊളി !', 'അമ്പോ !', 'രക്ഷപ്പെട്ട് 😌'][
    lastFilledRowIndex
  ]
  success = true
  gameFinished()
}

let isStatsWindowOpen = $ref(false)
let isHelpWindowOpen = $ref(false)
let isAboutWindowOpen = $ref(false)

let countdownTimer: number
const countdown = $ref({
  hours: "00",
  minutes: "00",
  seconds: "00"
})
function gameFinished() {
  updateGameStats()
  isGameFinished = true
  allowInput = false
  countdownTimer = startCountdown(nextMWordleDate(), countdown, () => {
    window.location.reload()
  })
  isStatsWindowOpen = true
}

document.addEventListener('keyup', function (evt) {
  if (evt.keyCode === 27) { // Escape key
    isStatsWindowOpen = isHelpWindowOpen = isAboutWindowOpen = false
  }
});

function saveGame() {
  const gameState: GameState = {
    gameNo,
    board: Array.from(board),
    transliteratedRows,
    currentRowIndex
  }
  localStorage.setItem("gameState", JSON.stringify(gameState))
}

// Saved game state
let gameStateRestore = $ref(false)

function restoreGame() {
  let gameState: GameState
  try {
    gameState = JSON.parse(localStorage.getItem("gameState"))
  } catch (e) {
    console.log(e)
    localStorage.removeItem("gameState")
    return
  }
  if (gameState && gameState.gameNo !== gameNo) {
    localStorage.removeItem("gameState")
    return
  }

  transliteratedRows = gameState.transliteratedRows

  gameStateRestore = true
  allowInput = false

  setTimeout(() => {
    while (currentRowIndex < gameState.currentRowIndex) {
      currentRow.forEach((tile, columnIndex) => {
        const savedRow = gameState.board[currentRowIndex][columnIndex]
        tile.letter = savedRow.letter
      })
      validateRowTiles(answer)
      if (currentRow.every((tile) => tile.state === LetterState.CORRECT)) {
        setTimeout(gameWon, 1000)
      }
      currentRowIndex++
    }
    setTimeout(() => {
      gameStateRestore = false

      if (!success) {
        allowInput = true
      }

      if (!success && currentRowIndex === board.length) {
        gameFinished()
      }
    }, 1000)
  }, 100)
}

if (localStorage.getItem("gameState")) {
  restoreGame()
}
</script>

<template>
  <Transition>
    <div class="message" id="message" v-show="message">
      {{ message }}
    </div>
  </Transition>
  <div class="overlay-bg"
    v-if="isStatsWindowOpen || isHelpWindowOpen || isAboutWindowOpen"
    @click="isStatsWindowOpen = isHelpWindowOpen = isAboutWindowOpen = false">
  </div>
  <div class="message" id="statsWindow" v-if="isStatsWindowOpen">
    <h2 v-if="success">
      {{appreciationWord}}
    </h2>
    <div id="stats">
      <div class="stat">
        <div class="number">{{gameStats.gamesPlayed}}</div>
        Played
      </div>
      <div class="stat">
        <div class="number">{{Math.round(gameStats.gamesWon / gameStats.gamesPlayed * 100, 0) || 0}}</div>
        Win %
      </div>
      <div class="stat">
        <div class="number">{{gameStats.currentStreak}}</div>
        Current Streak
      </div>
      <div class="stat">
        <div class="number">{{gameStats.maxStreak}}</div>
        Longest Streak
      </div>
    </div>
    <div id="guessDistributions" style="text-align: left;display: flex;flex-direction: column;gap: 2px;">
      <div
      v-for="(gamesWon, index) in gameStats.winPositions" style="display: flex;gap: 8px;">
        <span>{{index+1}}</span>
        <div :style="{
            background: success && index === lastFilledRowIndex ? '#6aaa64' : '#777',
            width: `calc(${(gamesWon/Math.max(...gameStats.winPositions))*100}% + 12px)`,
            textAlign: gamesWon > 0 ? 'right' : 'center',
            color: '#fff',
            padding: '0 6px',
          }">{{gamesWon}}</div>
      </div>
    </div>
    <div v-if="isGameFinished">
      <div>
        <div id="timer">{{countdown.hours}}:{{countdown.minutes}}:{{countdown.seconds}}<span v-if="!isIndianTimeZone">*</span></div>
      </div>
      <button @click="shareResult()">SHARE RESULT</button>
      <button
        id="shareWithLink"
        @click="shareResult('\n\nPlay: https://mwordle.subinsb.com')">
        SHARE With Link
      </button>
      <p style="font-size: 0.8rem">
        <span v-if="isIndianTimeZone">
          എല്ലാ ദിവസവും രാത്രി 10 മണിക്ക് പുതിയ വാക്ക്
        </span>
        <span v-else>
          * {{nextMWordleDate().toLocaleString('en-GB', { weekday: "short", hour: 'numeric', minute: 'numeric', hour12: true, timeZoneName: "long" })}}
        </span>
      </p>
    </div>
  </div>
  <div class="message" style="top: 50px; padding: 2px 6px;" v-if="isHelpWindowOpen">
    <h1>എങ്ങനെ കളിക്കാം</h1>
    <p>കളിയുടെ ലക്ഷ്യം ഒരു വാക്ക് കണ്ടുപിടിക്കലാണ്.</p>
    <p>ഒരു വാക്കടിച്ച് Enter കീ അമർത്തിയാൽ ഓരോ അക്ഷരത്തിന്മേലും പല നിറം വരും.</p>
    <p><img src="https://mwordle.subinsb.com/static/help-block.png" style="min-width: 300px; max-width:100%" /></p>
    <div style="text-align: left">
      <ul>
        <li>പച്ച - അക്ഷരവും അതിന്റെ സ്ഥാനവും ശരിയാണ്</li>
        <li>മഞ്ഞ - ലക്ഷ്യവാക്കിൽ അക്ഷരം ഉണ്ട് പക്ഷേ സ്ഥാനം തെറ്റാണ്</li>
        <li>ചാരനിറം - അക്ഷരം വാക്കിൽ ഇല്ലാ</li>
      </ul>
    </div>
    <p>പുതിയ വാക്ക് എല്ലാ ദിവസവും രാത്രി പത്തുമണിക്ക്.</p>
  </div>
  <div class="message" style="top: 50px;min-width: 300px;line-height: 1.5rem;" v-if="isAboutWindowOpen">
    <h2>മലയാളം Wordle</h2>
    <p>Game Number #{{gameNo}}</p>
    <p><a href="https://www.powerlanguage.co.uk/wordle/" target="_blank">Original Wordle Game</a> created by<br/>Josh Wardle</p>
    <p><a href="https://github.com/yyx990803/vue-wordle" target="_blank">Wordle in vue3</a> created by<br/> Evan You</p>
    <p>Malayalam Wordle created by<br/><a href="https://twitter.com/SubinSiby">Subin Siby</a></p>
    <p>Malayalam Transliteration powered by<br/><a href="https://varnamproject.com">Varnam Project</a></p>
    <p>Email:<br/>projects അറ്റ് subinsb ഡോട്ട് com</p>
  </div>
  <header>
    <div class="left">
      <a @click="isHelpWindowOpen = true">Help</a>
    </div>
    <div id="brand">
      <a @click="isAboutWindowOpen = true">
        <span>മwordle</span>
        <span style="font-size: 1rem;margin-left: 5px;">{{gameNo}}</span>
      </a>
    </div>
    <div class="right">
      <a @click="isAboutWindowOpen = true" style="margin-right:10px;">ℹ️</a>
      <a @click="isStatsWindowOpen = true">📊</a>
    </div>
    <div
      class="progress"
      :style="{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '7px',
        overflow: 'hidden'
      }"
    >
      <div v-if="transliterationInProgress">
        <div class="line"></div>
        <div class="subline inc"></div>
        <div class="subline dec"></div>
      </div>
      <div v-else style="border-bottom: 5px solid #CCC;"></div>
    </div>
  </header>
  <div id="board">
    <div
      v-for="(row, index) in board"
      :class="[
        'row',
        shakeRowIndex === index && 'shake',
        success && currentRowIndex === index && 'jump'
      ]"
    >
      <div class="ml-word" v-if="transliteratedRows[index]">
        {{transliteratedRows[index]}}
      </div>
      <div
        v-for="(tile, index) in row"
        :class="['tile', tile.letter && 'filled', tile.state && 'revealed']"
      >
        <div class="front" :style="{ transitionDelay: `${index * 300}ms` }">
          {{ tile.letter }}
        </div>
        <div
          :class="['back', tile.state]"
          :style="{
            transitionDelay: `${index * (gameStateRestore ? 120 : 300)}ms`,
            animationDelay: `${index * 100}ms`
          }"
        >
          {{ tile.letter }}
        </div>
      </div>
    </div>
  </div>
  <Keyboard @key="onKey" :letter-states="letterStates" />
</template>

<style scoped>
* {
  outline: none;
}
#app, .row {
  position: relative;
}
.ml-word {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  z-index: 10;
  font-weight: bold;
  font-size: 1rem;
}
.overlay-bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 19;
}
.message {
  position: absolute;
  left: 50%;
  top: 50px;
  color: rgba(0, 0, 0, 0.85);
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  transform: translateX(-50%);
  transition: oapcity 0.2s 1.5s;
  font-weight: 600;
  border: 2px solid #ccc;
  z-index: 20;
}
#message {
  z-index: 100;
}
.message.v-leave-to {
  opacity: 0;
}
#statsWindow {
  top: 40px;
  color: #fff;
  background-color: rgba(0, 0, 0, 1);
  border: 4px solid #ccc;
  border-radius: 20px;
  box-shadow: 0px 26px 80px rgba(0, 0, 0, 0.2), 0px 0px 1px rgba(0, 0, 0, 0.2);
}
#statsWindow h2 {
  margin-top: 0;
}
#statsWindow #timer {
  margin: 20px 0;
  font-size: 1.5rem;
}
#statsWindow button {
  display: block;
  margin: 5px auto;
  padding: 15px 20px;
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 1px;
  background: #6aaa64;
  color: #fff;
  border: 1px solid #000;
  border-radius: 5px;
  cursor: pointer;
}
#statsWindow button:hover {
  opacity: 0.95;
}
#statsWindow #shareWithLink {
  margin-top: 20px;
  padding: 7px 25px;
  font-size: 1rem;
}
#stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
#stats .stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-basis: 25%;
  font-size: 0.8rem;
  text-align: center;
}
#stats .stat .number {
  font-size: 1.8rem;
}
#board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px;
  margin: 0px auto;
  margin-bottom: 5px;
}
.row {
  display: flex;
  justify-content: center;
  gap: 5px;
  position: relative;
  max-width: 100%;
}
.tile {
  height:0;
  --width: min(62px, 7vh);
  width: var(--width);
  padding-bottom: var(--width);
  font-size: 2rem;
  line-height: 2rem;
  font-weight: bold;
  vertical-align: middle;
  text-transform: uppercase;
  user-select: none;
  position: relative;
}
.tile.filled {
  animation: zoom 0.2s;
}
.tile .front,
.tile .back {
  box-sizing: border-box;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  padding-top: 20px;
}
.tile .front {
  border: 2px solid #d3d6da;
}
.tile.filled .front {
  border-color: #999;
}
.tile .back {
  transform: rotateX(180deg);
}
.tile.revealed .front {
  transform: rotateX(180deg);
}
.tile.revealed .back {
  transform: rotateX(0deg);
}

@keyframes zoom {
  0% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0% {
    transform: translate(1px);
  }
  10% {
    transform: translate(-2px);
  }
  20% {
    transform: translate(2px);
  }
  30% {
    transform: translate(-2px);
  }
  40% {
    transform: translate(2px);
  }
  50% {
    transform: translate(-2px);
  }
  60% {
    transform: translate(2px);
  }
  70% {
    transform: translate(-2px);
  }
  80% {
    transform: translate(2px);
  }
  90% {
    transform: translate(-2px);
  }
  100% {
    transform: translate(1px);
  }
}

.jump .tile .back {
  animation: jump 0.5s;
}

@keyframes jump {
  0% {
    transform: translateY(0px);
  }
  20% {
    transform: translateY(5px);
  }
  60% {
    transform: translateY(-25px);
  }
  90% {
    transform: translateY(3px);
  }
  100% {
    transform: translateY(0px);
  }
}

@media (max-height: 680px) {
  .tile {
    font-size: 3vh;
  }
}
</style>
