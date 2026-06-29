import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { t } from '../i18n/translations'
import UserContext from './UserContext'

const WalletContext = createContext(null)

const INITIAL_BALANCES = { btc: 0, eth: 0, ton: 0, ltc: 0, sol: 0, usdt: 0 }
const STORAGE_KEY = 'stake_wallet_balances'
const ACTIVE_CURRENCY_KEY = 'stake_active_currency'
const DEPOSITS_KEY = 'stake_total_deposits'
const FIAT_KEY = 'stake_fiat'
const LANG_KEY = 'stake_language'

const FIATS = [
    { code: 'USD', symbol: '$', label: 'US Dollar', rate: 1 },
    { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.92 },
    { code: 'GBP', symbol: '£', label: 'British Pound', rate: 0.79 },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen', rate: 149.5 },
    { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', rate: 1.37 },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', rate: 1.54 },
    { code: 'BRL', symbol: 'R$', label: 'Brazilian Real', rate: 5.24 },
    { code: 'INR', symbol: '₹', label: 'Indian Rupee', rate: 83.5 },
]

const COUNTRY_LANG = {
    US: 'en', GB: 'en', AU: 'en', NZ: 'en', ZA: 'en', IE: 'en',
    IN: 'hi', RU: 'ru', BY: 'ru', KG: 'ru',
    ID: 'id',
    PK: 'ur',
    PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
    AE: 'ar', SA: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar', KW: 'ar',
    LB: 'ar', LY: 'ar', MA: 'ar', OM: 'ar', QA: 'ar', SD: 'ar',
    SY: 'ar', TN: 'ar', YE: 'ar', BH: 'ar', DZ: 'ar',
    DE: 'de', AT: 'de', CH: 'de',
    FR: 'fr', BE: 'fr', CA: 'fr',
    ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
    UZ: 'uz',
    IR: 'fa', AF: 'fa',
    KZ: 'kk',
    UA: 'uk',
    PH: 'fil',
}

const COUNTRY_FIAT = {
    US: 'USD', EC: 'USD', SV: 'USD',
    DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR',
    NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', FI: 'EUR',
    GR: 'EUR', SK: 'EUR', SI: 'EUR', LT: 'EUR', LV: 'EUR',
    EE: 'EUR', HR: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR',
    GB: 'GBP',
    JP: 'JPY',
    CA: 'CAD',
    AU: 'AUD',
    BR: 'BRL',
    IN: 'INR',
    RU: 'EUR', UA: 'EUR', TR: 'EUR',
}

function getDefaultsFromCountry(countryCode) {
    const lang = COUNTRY_LANG[countryCode] || 'en'
    const fiatCode = COUNTRY_FIAT[countryCode] || 'USD'
    const fiat = FIATS.find(f => f.code === fiatCode) || FIATS[0]
    return { lang, fiat }
}

function getStoredFiat() {
    try { const c = localStorage.getItem(FIAT_KEY); return FIATS.find(f => f.code === c) || FIATS[0] } catch { return FIATS[0] }
}

const API_BASE = import.meta.env.VITE_API_URL || ''

function getStoredBalances() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed && typeof parsed === 'object') return parsed
        }
    } catch (e) { /* ignore */ }
    return { ...INITIAL_BALANCES }
}

function getStoredActiveCurrency() {
    try {
        const stored = localStorage.getItem(ACTIVE_CURRENCY_KEY)
        if (stored && INITIAL_BALANCES[stored] !== undefined) return stored
    } catch (e) { /* ignore */ }
    return 'btc'
}

function getStoredDeposits() {
    try {
        const stored = localStorage.getItem(DEPOSITS_KEY)
        if (stored !== null) {
            const parsed = parseFloat(stored)
            return isNaN(parsed) ? 0 : parsed
        }
    } catch (e) { /* ignore */ }
    return 0
}

export function WalletProvider({ children }) {
    const [balances, setBalancesState] = useState(getStoredBalances)
    const [activeCurrency, setActiveCurrencyState] = useState(getStoredActiveCurrency)
    const [activeFiat, setActiveFiatState] = useState(getStoredFiat)
    const [activeLang, setActiveLangState] = useState(() => {
        try { return localStorage.getItem(LANG_KEY) || 'en' } catch { return 'en' }
    })
    const [transactions, setTransactions] = useState([])
    const [totalDeposits, setTotalDeposits] = useState(getStoredDeposits)
    const [pollingEnabled, setPollingEnabled] = useState(false)
    const pollingRef = useRef(null)

    useEffect(() => {
        const hasLang = (() => { try { return !!localStorage.getItem(LANG_KEY) } catch { return false } })()
        const hasFiat = (() => { try { return !!localStorage.getItem(FIAT_KEY) } catch { return false } })()
        if (hasLang && hasFiat) return
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        fetch('https://ip-api.com/json/', { signal: controller.signal })
            .then(r => r.json())
            .then(data => {
                if (data.countryCode) {
                    const defaults = getDefaultsFromCountry(data.countryCode)
                    if (!hasLang) {
                        setActiveLangState(defaults.lang)
                        try { localStorage.setItem(LANG_KEY, defaults.lang) } catch {}
                    }
                    if (!hasFiat) {
                        setActiveFiatState(defaults.fiat)
                        try { localStorage.setItem(FIAT_KEY, defaults.fiat.code) } catch {}
                    }
                }
            })
            .catch(() => {})
            .finally(() => clearTimeout(timeout))
    }, [])

    const balance = balances[activeCurrency] || 0

    const userCtx = useContext(UserContext)
    const userId = userCtx?.userId || 'dev_user'
    const displayName = userCtx?.displayName || 'Player'
    const photoUrl = userCtx?.photoUrl || null

    const setBalances = useCallback((newBalances) => {
        setBalancesState(newBalances)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newBalances)) } catch (e) { /* ignore */ }
    }, [])

    // Sync balance from server to localStorage
    const syncFromServer = useCallback(async () => {
        if (!userId || userId === 'dev_user') return
        try {
            const resp = await fetch(`${API_BASE}/api/balance?userId=${userId}`)
            if (resp.ok) {
                const data = await resp.json()
                if (data.balances) {
                    setBalances(data.balances)
                }
                if (data.totalDeposits != null) {
                    setTotalDeposits(data.totalDeposits)
                    try { localStorage.setItem(DEPOSITS_KEY, data.totalDeposits.toString()) } catch (e) { /* ignore */ }
                }
            }
        } catch (e) { /* silently fail */ }
    }, [userId, setBalances, setTotalDeposits])

    // Push balance change to server (fire-and-forget)
    const syncToServer = useCallback(async (action, coin, amount) => {
        if (!userId || userId === 'dev_user') return
        try {
            await fetch(`${API_BASE}/api/balance/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, coin, action, amount }),
            })
        } catch (e) { /* silently fail */ }
    }, [userId])

    // Pull server balance on mount
    useEffect(() => {
        syncFromServer()
    }, [])

    // Toast system
    const [toasts, setToasts] = useState([])
    const toastIdRef = useRef(0)

    const showToast = useCallback((type, title, description, duration = 3000) => {
        const id = ++toastIdRef.current
        setToasts(prev => [...prev, { id, type, title, description }].slice(-2))
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const setActiveCurrency = useCallback((currency) => {
        setActiveCurrencyState(currency)
        try { localStorage.setItem(ACTIVE_CURRENCY_KEY, currency) } catch (e) { /* ignore */ }
    }, [])

    const setActiveFiat = useCallback((code) => {
        const f = FIATS.find(f => f.code === code) || FIATS[0]
        setActiveFiatState(f)
        try { localStorage.setItem(FIAT_KEY, code) } catch (e) { /* ignore */ }
    }, [])

    const setActiveLang = useCallback((code) => {
        setActiveLangState(code)
        try { localStorage.setItem(LANG_KEY, code) } catch (e) { /* ignore */ }
    }, [])

    // Sync balances from Vercel API (backward-compatible: accepts optional userId param)
    const syncBalance = useCallback(async (externalUserId) => {
        const uid = externalUserId || userId
        if (!uid || uid === 'dev_user') return
        try {
            const resp = await fetch(`${API_BASE}/api/balance?userId=${uid}`)
            if (resp.ok) {
                const data = await resp.json()
                if (data.balances) {
                    setBalances(data.balances)
                }
                if (data.totalDeposits != null) {
                    setTotalDeposits(data.totalDeposits)
                    try { localStorage.setItem(DEPOSITS_KEY, data.totalDeposits.toString()) } catch (e) { /* ignore */ }
                }
            }
        } catch (e) { /* silently fail */ }
    }, [userId, setBalances, setTotalDeposits])

    // Update balance and persist to localStorage
    const updateBalance = useCallback((newBalance) => {
        const rounded = parseFloat(newBalance.toFixed(2))
        setBalances(prev => {
            const next = { ...prev, [activeCurrency]: rounded }
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (e) { /* ignore */ }
            return next
        })
    }, [activeCurrency, setBalances])

    // Cleanup polling interval on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
                pollingRef.current = null
            }
        }
    }, [])

    const enablePolling = useCallback(() => {
        if (pollingEnabled || pollingRef.current || !userId || userId === 'dev_user') return
        setPollingEnabled(true)
        syncBalance()
        pollingRef.current = setInterval(() => syncBalance(), 3000)
        const cleanup = () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
                pollingRef.current = null
            }
            setPollingEnabled(false)
        }
        return cleanup
    }, [pollingEnabled, syncBalance, userId])

    // Place a bet (deduct from active currency)
    const placeBet = useCallback((amount) => {
        const amt = parseFloat(amount)
        if (isNaN(amt) || amt <= 0) return false

        setBalancesState(prev => {
            const currentCoinBal = prev[activeCurrency] || 0
            if (amt > currentCoinBal) return prev
            const newCoinBal = parseFloat((currentCoinBal - amt).toFixed(2))
            const next = { ...prev, [activeCurrency]: newCoinBal }
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (e) { /* ignore */ }

            setTransactions(txs => [{
                id: Date.now(),
                type: 'bet',
                amount: -amt,
                currency: activeCurrency,
                balance: newCoinBal,
                timestamp: new Date(),
            }, ...txs].slice(0, 100))

            return next
        })

        syncToServer('bet', activeCurrency, amt)
        return true
    }, [activeCurrency, syncToServer])

    // Add winnings to active currency
    const addWinnings = useCallback((amount) => {
        const amt = parseFloat(amount)
        if (isNaN(amt) || amt <= 0) return

        setBalancesState(prev => {
            const currentCoinBal = prev[activeCurrency] || 0
            const newCoinBal = parseFloat((currentCoinBal + amt).toFixed(2))
            const next = { ...prev, [activeCurrency]: newCoinBal }
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (e) { /* ignore */ }

            setTransactions(txs => [{
                id: Date.now(),
                type: 'win',
                amount: amt,
                currency: activeCurrency,
                balance: newCoinBal,
                timestamp: new Date(),
            }, ...txs].slice(0, 100))

            return next
        })

        syncToServer('win', activeCurrency, amt)
    }, [activeCurrency, syncToServer])

    // Deposit funds to a specific currency
    // Pass isBonus=true to skip totalDeposits increment (used for 100% deposit bonus)
    const deposit = useCallback((amount, currency, isBonus) => {
        const amt = parseFloat(amount)
        const coin = currency || activeCurrency
        if (isNaN(amt) || amt <= 0) return

        setBalancesState(prev => {
            const currentCoinBal = prev[coin] || 0
            const newCoinBal = parseFloat((currentCoinBal + amt).toFixed(2))
            const next = { ...prev, [coin]: newCoinBal }
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (e) { /* ignore */ }

            setTransactions(txs => [{
                id: Date.now(),
                type: isBonus ? 'bonus' : 'deposit',
                amount: amt,
                currency: coin,
                balance: newCoinBal,
                timestamp: new Date(),
            }, ...txs].slice(0, 100))

            return next
        })

        if (!isBonus) {
            setTotalDeposits(prev => {
                const newTotal = parseFloat((prev + amt).toFixed(2))
                try { localStorage.setItem(DEPOSITS_KEY, newTotal.toString()) } catch (e) { /* ignore */ }
                return newTotal
            })
        }

        if (!userId || userId === 'dev_user') return
        if (!isBonus) {
            fetch(`${API_BASE}/api/balance/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, coin, action: 'win', amount: amt, isDeposit: true }),
            }).catch(() => {})
        }
        fetch(`${API_BASE}/api/leaderboard/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, displayName, photoUrl, depositAmount: isBonus ? amt : 0 }),
        }).catch(() => {})
    }, [activeCurrency, userId, displayName, photoUrl])

    const addTransaction = useCallback((type, amount, currency) => {
        setTransactions(txs => [{
            id: Date.now(),
            type,
            amount,
            currency,
            timestamp: new Date(),
        }, ...txs].slice(0, 100))
    }, [])

    // Reset balances to initial
    const resetBalance = useCallback(() => {
        const initBal = { ...INITIAL_BALANCES }
        setBalances(initBal)
        setTransactions([{
            id: Date.now(),
            type: 'reset',
            amount: INITIAL_BALANCES.btc,
            balance: INITIAL_BALANCES.btc,
            timestamp: new Date(),
        }])
    }, [setBalances])

    const totalBalance = Object.values(balances).reduce((sum, v) => sum + v, 0)

    const value = {
        balance,
        balances,
        totalBalance,
        activeCurrency,
        setActiveCurrency,
        currency: activeCurrency,
        setCurrency: setActiveCurrency,
        activeFiat,
        setActiveFiat,
        FIATS,
        activeLang,
        setActiveLang,
        t: (key) => t(key, activeLang),
        transactions,
        totalDeposits,
        placeBet,
        addWinnings,
        addTransaction,
        deposit,
        resetBalance,
        updateBalance,
        syncBalance,
        enablePolling,
        toasts,
        showToast,
    }

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    )
}

export function useWallet() {
    const context = useContext(WalletContext)
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider')
    }
    return context
}

export default WalletContext
