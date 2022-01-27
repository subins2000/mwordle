<script setup lang="ts">
import { onUnmounted } from 'vue'
import { gameNo, getWordOfTheDay, hourOfNewMWordle } from './words'
import Keyboard from './Keyboard.vue'
import { GameState, LetterState } from './types'
import {startCountdown} from './utils'

// Get word of the day
const answer = getWordOfTheDay()

// Board state. Each tile is represented as { letter, state }
const board = $ref(
  Array.from({ length: 6 }, () =>
    Array.from({ length: 5 }, () => ({
      letter: '',
      state: LetterState.INITIAL
    }))
  )
)

// Current active row.
let currentRowIndex = $ref(0)
const currentRow = $computed(() => board[currentRowIndex])

// Feedback state: message and shake
let message = $ref('')
let appreciationWord = $ref('')
let shakeRowIndex = $ref(-1)
let success = $ref(false)
let finished = $ref(false)

// Keep track of revealed letters for the virtual keyboard
const letterStates: Record<string, LetterState> = $ref({})

// Handle keyboard input.
let allowInput = true

const onKeyup = (e: KeyboardEvent) => onKey(e.key)

window.addEventListener('keyup', onKeyup)

onUnmounted(() => {
  window.removeEventListener('keyup', onKeyup)
})

let transliterated = $ref("")
let validWord = $ref(false)
let transliteratedRows = $ref(Array(6).fill(""))

let lastRequestController: AbortController;
async function transliterate() {
  const word = currentRow.map((tile) => tile.letter).join('')
  try {
    if (lastRequestController) {
      lastRequestController.abort()
      lastRequestController = null
    }
    if (word === "") {
      transliteratedRows[currentRowIndex] = ""
      return
    }
    lastRequestController = new AbortController()
    const response = await fetch(`https://api.varnamproject.com/atl/ml/${word}`, {signal: lastRequestController.signal})
    const {exact_matches, dictionary_suggestions, tokenizer_suggestions} = await response.json()
    transliteratedRows[currentRowIndex] = [...exact_matches, ...dictionary_suggestions, ...tokenizer_suggestions][0].word
    validWord = exact_matches.length > 0
  } catch (e) {
    console.log(e)
  }
}

function onKey(key: string) {
  if (!allowInput) return
  if (/^[a-zA-Z]$/.test(key)) {
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
      transliterate()
      break
    }
  }
}

function clearTile() {
  for (const tile of [...currentRow].reverse()) {
    if (tile.letter) {
      tile.letter = ''
      transliterate()
      break
    }
  }
}

function completeRow() {
  if (currentRow.every((tile) => tile.letter)) {
    const guess = currentRow.map((tile) => tile.letter).join('')
    if (!validWord && guess !== answer) {
      shake()
      showMessage(`Not in word list`)
      return
    }

    const answerLetters: (string | null)[] = answer.split('')
    // first pass: mark correct ones
    currentRow.forEach((tile, i) => {
      if (answerLetters[i] === tile.letter) {
        tile.state = letterStates[tile.letter] = LetterState.CORRECT
        answerLetters[i] = null
      }
    })
    // second pass: mark the present
    currentRow.forEach((tile) => {
      if (!tile.state && answerLetters.includes(tile.letter)) {
        tile.state = LetterState.PRESENT
        answerLetters[answerLetters.indexOf(tile.letter)] = null
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

    allowInput = false
    if (currentRow.every((tile) => tile.state === LetterState.CORRECT)) {
      // yay!
      setInterval(gameWon, 1600)
    } else if (currentRowIndex < board.length - 1) {
      // go the next row
      setTimeout(() => {
        allowInput = true
      }, 1600)
    } else {
      // game over :(
      setTimeout(() => {
        showMessage(answer.toUpperCase(), 5000)
        setTimeout(() => {
          gameFinished()
        }, 1600)
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
    .slice(0, currentRowIndex + 1)
    .map((row) => {
      return row.map((tile) => icons[tile.state]).join('')
    })
    .join('\n')
}

function shareResult() {
  const tries = success ? currentRowIndex : "X"
  const text = `മwordle ${gameNo} ${tries}/${board.length}\n\n${genResultGrid()}`;
  navigator.clipboard.writeText(text).then(() => {
    showMessage("Copied results to clipboard!", 2000)
  })
}

function gameWon() {
  appreciationWord = ['Genius', 'Magnificent', 'Impressive', 'Splendid', 'Great', 'Phew'][
    currentRowIndex-1
  ]
  success = true
  gameFinished()
}

let countdownTimer: number = $ref()
const countdown = $ref({
  hours: "00",
  minutes: "00",
  seconds: "00"
})
function gameFinished() {
  finished = true
  allowInput = false
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(hourOfNewMWordle, 0, 0, 0);
  countdownTimer = startCountdown(tomorrow, countdown)
}

function hideFinished() {
  finished = false
  clearInterval(countdownTimer)
}
document.addEventListener('keyup', function (evt) {
  if (evt.keyCode === 27 && finished) {
    hideFinished()
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
let gameState: GameState
let gameStateRestore = $ref(false)

function restoreGame() {
  gameState = JSON.parse(localStorage.getItem("gameState"))
  if (gameState.gameNo !== gameNo) {
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
        tile.state = letterStates[tile.letter] = savedRow.state
      })
      if (currentRow.every((tile) => tile.state === LetterState.CORRECT)) {
        setTimeout(gameWon, 1000)
      }
      currentRowIndex++
    }
    setTimeout(() => {
      gameStateRestore = false
      allowInput = true

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
    <div class="message" v-if="message">
      {{ message }}
    </div>
  </Transition>
  <Transition>
    <div class="overlay-bg" v-if="finished">
      <div id="finished" v-click-outside="hideFinished">
        <h2 v-if="success">
          {{appreciationWord}}
        </h2>
        <div>
          Next മwordle in
          <div id="timer">{{countdown.hours}}:{{countdown.minutes}}:{{countdown.seconds}}</div>
        </div>
        <button @click="shareResult">SHARE</button>
      </div>
    </div>
  </Transition>
  <header>
    <h1>മwordle {{gameNo}}</h1>
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
  padding: 2px 0 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  z-index: 10;
  font-weight: bold;
  font-size: 1rem;
}
#board {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 5px;
  padding: 10px;
  box-sizing: border-box;
  --height: min(420px, calc(var(--vh, 100vh) - 310px));
  height: var(--height);
  width: min(350px, calc(var(--height) / 6 * 5));
  margin: 0px auto;
}
.message, #finished {
  position: absolute;
  left: 50%;
  top: 80px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.85);
  padding: 16px 20px;
  z-index: 20;
  border-radius: 4px;
  transform: translateX(-50%);
  transition: opacity 0.3s ease-out;
  font-weight: 600;
}
.message {
  z-index: 100;
}
.message.v-leave-to {
  opacity: 0;
}
#finished {
  top: 25%;
  background-color: rgba(0, 0, 0, 0.85);
}
#finished h2 {
  margin-top: 0;
}
#finished #timer {
  margin: 20px 0;
  font-size: 1.5rem;
}
#finished button {
  padding: 10px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 1px;
  background: #6aaa64;
  color: #fff;
  border: 1px solid #000;
  border-radius: 5px;
  cursor: pointer;
}
.overlay-bg {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.3);
  z-index: 20;
}
.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;
}
.tile {
  width: 100%;
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
