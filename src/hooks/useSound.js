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

export default function useSound(enabled) {
  const cache = useRef({})

  useEffect(() => {
    if (!enabled) return
    Object.entries(SOUND_MAP).forEach(([name, url]) => {
      const audio = new Audio(url)
      audio.preload = 'auto'
      audio.load()
      cache.current[name] = audio
    })
    return () => {
      Object.keys(cache.current).forEach(name => {
        const audio = cache.current[name]
        audio.pause()
        audio.src = ''
      })
      cache.current = {}
    }
  }, [enabled])

  const play = useCallback((name, { loop = false } = {}) => {
    if (!enabled) return
    const audio = cache.current[name]
    if (!audio) return
    audio.loop = loop
    audio.currentTime = 0
    const promise = audio.play()
    if (promise) promise.catch(() => {})
  }, [enabled])

  const stop = useCallback((name) => {
    const audio = cache.current[name]
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.loop = false
    }
  }, [])

  return { play, stop }
}
