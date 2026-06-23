import { useEffect, useState } from 'react'

const tg = window.Telegram?.WebApp

export function useTelegram() {
  const [ready, setReady] = useState(!!tg)

  useEffect(() => {
    if (!tg) return
    tg.ready()
    tg.expand()
    tg.enableClosingConfirmation?.()
    setReady(true)
  }, [])

  const isDark = tg?.colorScheme !== 'light'
  const theme = tg?.themeParams || {}

  const showAlert = (msg) => tg?.showAlert?.(msg)
  const showConfirm = (msg) => tg?.showConfirm?.(msg)
  const close = () => tg?.close()

  return { tg, ready, isDark, theme, showAlert, showConfirm, close }
}

export function TelegramThemeProvider({ children }) {
  const { isDark } = useTelegram()
  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', isDark ? 'dark' : 'light')
  }, [isDark])
  return children
}
