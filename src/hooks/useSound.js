import { useRef, useCallback, useEffect } from 'react'

const SOUND_MAP = {
  bet: '/sounds/Bet.mp3',
  diceRolling: '/sounds/DiceRolling.mp3',
  limboLose: '/sounds/LimboLose.mp3',
  limboTick: '/sounds/LimboTick.mp3',
  minesBomb: '/sounds/MinesBomb.mp3',
  minesGem: '/sounds/MinesGem.mp3',
  plinkoBall: '/sounds/PlinkoBall.mp3',
  win: '/sounds/Win.mp3',
}

let globalCache = null
let globalReady = {}
let loadAttempted = false

function loadAllSounds() {
    if (loadAttempted) return
    loadAttempted = true
    globalCache = {}
    Object.entries(SOUND_MAP).forEach(([name, url]) => {
        const audio = new Audio(url)
        audio.preload = 'auto'
        audio.addEventListener('canplaythrough', () => { globalReady[name] = true }, { once: true })
        audio.addEventListener('error', () => { globalReady[name] = true }, { once: true })
        audio.load()
        globalCache[name] = audio
        if (audio.readyState >= 2) globalReady[name] = true
    })
}

export default function useSound(enabled) {
  useEffect(() => {
    if (enabled && !loadAttempted) loadAllSounds()
  }, [enabled])

  const play = useCallback((name, { loop = false, overlap = false } = {}) => {
    if (!enabled) return
    let audio
    if (overlap) {
      audio = new Audio(SOUND_MAP[name])
      const promise = audio.play()
      if (promise) promise.then(() => {
        audio.addEventListener('ended', () => audio.remove(), { once: true })
      }).catch(() => {})
      return
    }
    audio = globalCache?.[name]
    if (!audio) {
      audio = new Audio(SOUND_MAP[name])
    }
    if (!audio) return
    audio.loop = loop
    audio.currentTime = 0
    const promise = audio.play()
    if (promise) promise.catch(() => {})
  }, [enabled])

  const stop = useCallback((name) => {
    const audio = globalCache?.[name]
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.loop = false
    }
  }, [])

  return { play, stop }
}
