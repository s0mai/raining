import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useUser } from '../hooks/useUser'
import '../components/ProfileModal.css'
import './DepositPage.css'

function CollapsibleCard({ icon, title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen)
    const bodyRef = useRef(null)

    function toggle() {
        if (!open) {
            setOpen(true)
        } else {
            setOpen(false)
        }
    }

    useEffect(() => {
        const wrap = bodyRef.current?.parentElement
        if (!wrap) return
        if (open) {
            const h = bodyRef.current.scrollHeight
            wrap.style.maxHeight = (h + 16) + 'px'
            const ro = new ResizeObserver(() => {
                const h2 = bodyRef.current?.scrollHeight
                if (h2) wrap.style.maxHeight = (h2 + 16) + 'px'
            })
            ro.observe(bodyRef.current)
            wrap._resizeObserver = ro
        } else {
            wrap.style.maxHeight = '0px'
            if (wrap._resizeObserver) {
                wrap._resizeObserver.disconnect()
                delete wrap._resizeObserver
            }
        }
        return () => {
            if (wrap._resizeObserver) {
                wrap._resizeObserver.disconnect()
                delete wrap._resizeObserver
            }
        }
    }, [open])

    return (
        <div className="profile-card collapsible">
            <div className="profile-card-header-clickable" onClick={toggle}>
                {icon}
                <span style={{ flex: 1 }}>{title}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
            <div className="profile-card-body-wrap">
                <div ref={bodyRef}>
                    <div className="profile-card-body">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

const VIP_LEVELS = [
    { name: 'Bronze', minDeposit: 10, color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32, #a06520)' },
    { name: 'Silver', minDeposit: 50, color: '#c0c0c0', gradient: 'linear-gradient(135deg, #c0c0c0, #909090)' },
    { name: 'Gold', minDeposit: 100, color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700, #daa520)' },
    { name: 'Platinum I', minDeposit: 250, color: '#8ea4b8', gradient: 'linear-gradient(135deg, #8ea4b8, #6d8299)' },
    { name: 'Platinum II', minDeposit: 500, color: '#7a90a8', gradient: 'linear-gradient(135deg, #7a90a8, #5a7088)' },
    { name: 'Platinum III', minDeposit: 1000, color: '#667c94', gradient: 'linear-gradient(135deg, #667c94, #4a6078)' },
    { name: 'Platinum IV', minDeposit: 2500, color: '#526880', gradient: 'linear-gradient(135deg, #526880, #3a5068)' },
    { name: 'Platinum V', minDeposit: 5000, color: '#3e5470', gradient: 'linear-gradient(135deg, #3e5470, #2a4060)' },
    { name: 'Platinum VI', minDeposit: 10000, color: '#2a4060', gradient: 'linear-gradient(135deg, #2a4060, #1a3050)' },
    { name: 'Diamond I', minDeposit: 25000, color: '#b0e0e6', gradient: 'linear-gradient(135deg, #b0e0e6, #80d0e0)' },
    { name: 'Diamond II', minDeposit: 50000, color: '#87ceeb', gradient: 'linear-gradient(135deg, #87ceeb, #60b8d8)' },
    { name: 'Diamond III', minDeposit: 100000, color: '#5fcdee', gradient: 'linear-gradient(135deg, #5fcdee, #30b0d0)' },
    { name: 'Diamond IV', minDeposit: 250000, color: '#40e0d0', gradient: 'linear-gradient(135deg, #40e0d0, #20c0b0)' },
    { name: 'Diamond V', minDeposit: 500000, color: '#00ffff', gradient: 'linear-gradient(135deg, #00ffff, #00d0d0)' },
    { name: 'Obsidian', minDeposit: 1000000, color: '#6b3fa0', gradient: 'linear-gradient(135deg, #6b3fa0, #2d1b4e)' },
]

const PROMO_CODES = {
    WELCOME10: { bonus: 10, label: '$10 Welcome Bonus' },
    VIPBONUS: { bonus: 50, label: '$50 VIP Bonus' },
    LUCKY7: { bonus: 7, label: '$7 Lucky Bonus' },
    DOUBLE: { bonus: 20, label: '$20 Double Up' },
    WELCOME: { bonus: 1000, label: '$1000 Welcome Bonus' },
}

const LANG_COUNTRY = {
    en: 'US', hi: 'IN', ru: 'RU', id: 'ID', ur: 'PK', pt: 'PT',
    ar: 'SA', de: 'DE', fr: 'FR', es: 'ES', uz: 'UZ', fa: 'IR',
    kk: 'KZ', uk: 'UA', fil: 'PH',
}

function flagImg(countryCode) {
    return `/images/flags/circle-flags-gh-pages/flags/${countryCode.toLowerCase()}.svg`
}

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ru', label: 'Русский' },
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'ur', label: 'اردو' },
    { code: 'pt', label: 'Português' },
    { code: 'ar', label: 'العربية' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'uz', label: 'Oʻzbek' },
    { code: 'fa', label: 'فارسی' },
    { code: 'kk', label: 'Қазақ' },
    { code: 'uk', label: 'Українська' },
    { code: 'fil', label: 'Filipino' },
]

function getVIPInfo(totalDeposits) {
    let level = null
    let nextLevel = null
    for (let i = 0; i < VIP_LEVELS.length; i++) {
        if (totalDeposits >= VIP_LEVELS[i].minDeposit) {
            level = VIP_LEVELS[i]
        } else {
            nextLevel = VIP_LEVELS[i]
            break
        }
    }
    return { level, nextLevel }
}

const VIP_TEXT_COLORS = {
    Bronze: '#A06520',
    Silver: '#2d2d2d',
    Gold: '#5C3D00',
    'Platinum I': '#fff',
    'Platinum II': '#fff',
    'Platinum III': '#fff',
    'Platinum IV': '#fff',
    'Platinum V': '#fff',
    'Platinum VI': '#fff',
    'Diamond I': '#fff',
    'Diamond II': '#fff',
    'Diamond III': '#fff',
    'Diamond IV': '#fff',
    'Diamond V': '#fff',
    Obsidian: '#fff',
}

const VIP_ICONS = {
    Bronze: 'bronze',
    Silver: 'silver',
    Gold: 'gold',
    'Platinum I': 'platinum',
    'Platinum II': 'platinum',
    'Platinum III': 'platinum',
    'Platinum IV': 'platinum',
    'Platinum V': 'platinum',
    'Platinum VI': 'platinum',
    'Diamond I': 'diamond',
    'Diamond II': 'diamond',
    'Diamond III': 'diamond',
    'Diamond IV': 'diamond',
    'Diamond V': 'diamond',
    Obsidian: 'infernal',
}

function getVIPImg(levelName, size = 24) {
    const icon = VIP_ICONS[levelName]
    if (!icon) return null
    return <img src={`/images/vip/${icon}.webp`} alt={levelName} width={size} height={size} style={{ objectFit: 'contain' }} />
}

function ReferralSection({ userId, t }) {
    const { activeFiat } = useWallet()
    const API_BASE = import.meta.env.VITE_API_URL || ''
    const referralLink = userId
        ? `t.me/rainbetoriginalbot?start=REF${userId}`
        : 't.me/rainbetoriginalbot?start=PLAYER'

    const [count, setCount] = useState(0)
    const [bonus, setBonus] = useState(0)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!userId || userId === 'dev_user') return
        fetch(`${API_BASE}/api/balance?userId=${userId}`)
            .then(r => r.json())
            .then(data => {
                if (data.refCount != null) setCount(data.refCount)
                if (data.refBonus != null) setBonus(data.refBonus)
            })
            .catch(() => {})
    }, [userId])

    function handleCopy() {
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <CollapsibleCard
            icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>}
            title={t('profile.referral')}
        >
            <div className="referral-link-row">
                <span className="referral-link-text">{referralLink}</span>
                <button className="referral-copy-btn" onClick={handleCopy}>
                    {copied ? (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1475e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    )}
                </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                {t('profile.referral_desc')}
            </div>
            <div className="referral-stats">
                <span className="referral-stat">
                    <span className="referral-stat-num">{count}</span> {t('profile.people_referred')}
                </span>
                <span className="referral-stat-divider">•</span>
                <span className="referral-stat">
                    <span className="referral-stat-num">{activeFiat.symbol}{bonus.toFixed(2)}</span> {t('profile.bonus_earned')}
                </span>
            </div>
        </CollapsibleCard>
    )
}

function PromoSection({ addWinnings, showToast, t, userId }) {
    const { activeFiat, setLuckBoosted } = useWallet()
    const [code, setCode] = useState('')
    const [status, setStatus] = useState(null)
    const [message, setMessage] = useState('')
    const [appliedCodes, setAppliedCodes] = useState(() => {
        try { return JSON.parse(localStorage.getItem('stake_applied_promos')) || [] } catch { return [] }
    })

    function handleSubmit() {
        const trimmed = code.trim().toUpperCase()
        if (!trimmed) return

        if (appliedCodes.includes(trimmed)) {
            setStatus('error')
            setMessage(t('profile.code_used'))
            return
        }

        const promo = PROMO_CODES[trimmed]
        if (promo) {
            addWinnings(promo.bonus)
            const newApplied = [...appliedCodes, trimmed]
            setAppliedCodes(newApplied)
            try { localStorage.setItem('stake_applied_promos', JSON.stringify(newApplied)) } catch { }
            setLuckBoosted()
            setStatus('success')
            const fiatVal = (promo.bonus * activeFiat.rate).toFixed(2)
            setMessage(t('profile.code_applied').replace('${amount}', () => `${activeFiat.symbol}${fiatVal}`))
            if (showToast) showToast('win', t('profile.promo_applied_title'), t('profile.code_applied').replace('${amount}', () => `${activeFiat.symbol}${fiatVal}`), 3000)
            if (userId && userId !== 'dev_user') fetch(`${import.meta.env.VITE_API_URL || ''}/api/bonus`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'markUsed' }) }).catch(() => {})
        } else {
            setStatus('error')
            setMessage(t('profile.code_invalid'))
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSubmit()
    }

    return (
        <div className="profile-card">
            <div className="profile-card-header">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M13 5v2" />
                    <path d="M13 17v2" />
                    <path d="M13 11v2" />
                </svg>
                <span>{t('profile.promo_codes')}</span>
            </div>
            <div className="profile-card-body">
                <div className="promo-input-row">
                    <input
                        className="promo-input"
                        placeholder={t('profile.promo_placeholder')}
                        value={code}
                        onChange={e => { setCode(e.target.value); setStatus(null); setMessage('') }}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="promo-submit-btn" onClick={handleSubmit}>{t('profile.apply')}</button>
                </div>
                {status && (
                    <div className={`promo-response ${status}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}

function HistorySection({ transactions, fiat, t }) {
    const cur = fiat || { symbol: '$', rate: 1 }
    if (!transactions || transactions.length === 0) {
        return (
            <CollapsibleCard
                icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                title={t('profile.history')}
            >
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
                    {t('profile.no_transactions')}
                </div>
            </CollapsibleCard>
        )
    }

    return (
        <CollapsibleCard
            icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
            title={t('profile.history')}
        >
                {transactions.map(tx => (
                    <div key={tx.id} className="history-row" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: 13,
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                {tx.type}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {new Date(tx.timestamp).toLocaleString()}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                fontWeight: 700,
                                color: tx.amount > 0 ? 'var(--color-positive)' : '#ed4245',
                            }}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {t('profile.bal')}: {cur.symbol}{(tx.balance * cur.rate).toFixed(2)}
                            </div>
                        </div>
                    </div>
                ))}
        </CollapsibleCard>
    )
}

function FiatCurrencySection() {
    const { activeFiat, setActiveFiat, FIATS, t } = useWallet()
    const [fiatCode, setFiatCode] = useState(activeFiat.code)

    function handleChange(e) {
        const code = e.target.value
        setFiatCode(code)
        setActiveFiat(code)
    }

    return (
        <CollapsibleCard
            icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
            title={t('profile.currency')}
        >
            <select
                className="promo-input"
                value={fiatCode}
                onChange={handleChange}
                style={{ cursor: 'pointer' }}
            >
                {FIATS.map(f => (
                    <option key={f.code} value={f.code}>{f.symbol} {f.label} ({f.code})</option>
                ))}
            </select>
        </CollapsibleCard>
    )
}

function LanguageSection() {
    const { activeLang, setActiveLang, t } = useWallet()
    const [language, setLanguage] = useState(activeLang)
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    function handleSelect(code) {
        setLanguage(code)
        setActiveLang(code)
    }

    useEffect(() => {
        function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <CollapsibleCard
            icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
            title={t('profile.language')}
        >
            <div ref={ref}>
                <div
                    onClick={() => setOpen(!open)}
                    className="promo-input"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={flagImg(LANG_COUNTRY[language] || 'US')} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                        <span>{(LANGUAGES.find(l => l.code === language) || {}).label || language}</span>
                    </span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
                {open && (
                    <div style={{
                        background: 'var(--bg-secondary)', borderRadius: 8, marginTop: 4,
                        border: '1px solid var(--border-color)',
                    }}>
                        {LANGUAGES.map(l => (
                            <div
                                key={l.code}
                                onClick={() => { handleSelect(l.code); setOpen(false) }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                                    cursor: 'pointer', fontSize: 13,
                                    background: l.code === language ? 'var(--bg-tertiary)' : 'transparent',
                                    color: 'var(--text-primary)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                onMouseLeave={e => { if (l.code !== language) e.currentTarget.style.background = 'transparent' }}
                            >
                                <img src={flagImg(LANG_COUNTRY[l.code] || 'US')} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                                <span>{l.label}</span>
                                {l.code === language && (
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CollapsibleCard>
    )
}

const COINGECKO_TON = 'the-open-network'

function StarsToTonSection({ userId, t }) {
    const { balances, syncBalance, showToast, activeFiat } = useWallet()
    const { initData } = useUser()
    const [starsAmount, setStarsAmount] = useState('')
    const [tonPrice, setTonPrice] = useState(0)
    const [starsUsdRate, setStarsUsdRate] = useState(0.025)
    const [exchanging, setExchanging] = useState(false)
    const API_BASE = import.meta.env.VITE_API_URL || ''

    useEffect(() => {
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_TON}&vs_currencies=usd`)
            .then(r => r.json())
            .then(data => { if (data[COINGECKO_TON]?.usd) setTonPrice(data[COINGECKO_TON].usd) })
            .catch(() => setTonPrice(6.5))

        async function fetchRate() {
            try {
                const resp = await fetch(`${API_BASE}/api/balance?userId=${userId}`)
                const data = await resp.json()
                if (data.starsUsdRate > 0) setStarsUsdRate(data.starsUsdRate)
            } catch {}
        }
        fetchRate()
    }, [])

    const starsBalance = balances.stars || 0
    const estimatedTon = starsAmount && tonPrice > 0
        ? parseFloat(((parseFloat(starsAmount) * starsUsdRate) / tonPrice).toFixed(6))
        : 0
    const starsFiatValue = starsAmount
        ? (parseFloat(starsAmount) * starsUsdRate * activeFiat.rate).toFixed(2)
        : 0

    async function handleExchange() {
        const amt = parseFloat(starsAmount)
        if (isNaN(amt) || amt <= 0) { showToast('error', t('profile.error_title'), t('profile.enter_valid_stars')); return }
        if (amt > starsBalance) { showToast('error', t('profile.error_title'), t('profile.insufficient_stars')); return }
        setExchanging(true)
        try {
            const resp = await fetch(`${API_BASE}/api/balance/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, coin: 'stars', action: 'exchange_stars_to_ton', amount: amt, tonPrice, initData }),
            })
            const data = await resp.json()
            if (resp.ok) {
                await syncBalance(userId)
                showToast('win', t('profile.exchange_title'), t('profile.exchange_success').replace('{amount}', `+${data.tonAmount}`).replace('{currency}', t('profile.ton_currency')), 5000)
                setStarsAmount('')
            } else {
                showToast('error', t('profile.error_title'), data.error || t('profile.exchange_failed'))
            }
        } catch (e) {
            showToast('error', t('profile.error_title'), t('profile.exchange_failed'))
        } finally {
            setExchanging(false)
        }
    }

    return (
        <CollapsibleCard
            icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>}
            title={t('profile.exchange_title')}
        >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                {t('profile.stars_balance')}: {starsBalance} {t('profile.stars_currency')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                1 {t('profile.stars_currency')} ≈ {activeFiat.symbol}{(starsUsdRate * activeFiat.rate).toFixed(4)}
            </div>
            <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={starsAmount}
                onChange={e => setStarsAmount(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', marginBottom: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
            />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                ~{estimatedTon} {t('profile.ton_currency')}
            </div>
            {starsAmount > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    {activeFiat.symbol}{starsFiatValue}
                </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={() => setStarsAmount(starsBalance.toString())}
                    disabled={exchanging}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                    {t('deposit.max')}
                </button>
                <button
                    onClick={handleExchange}
                    disabled={exchanging || !starsAmount || parseFloat(starsAmount) <= 0}
                    style={{ flex: 1, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #1475e1, #0d5bb5)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: (exchanging || !starsAmount || parseFloat(starsAmount) <= 0) ? 0.5 : 1 }}
                >
                    {exchanging ? t('deposit.creating') : t('profile.exchange_btn')}
                </button>
            </div>
        </CollapsibleCard>
    )
}

function roundNiceFiat(usdValue, rate) {
    if (rate === 1) return usdValue
    const raw = usdValue * rate
    if (raw < 10) return Math.ceil(raw)
    const magnitude = Math.max(10, Math.pow(10, Math.floor(Math.log10(raw)) - 1))
    return Math.ceil(raw / magnitude) * magnitude
}

function ProfilePage() {
    const navigate = useNavigate()
    const { totalDeposits, transactions, addWinnings, showToast, activeFiat, t } = useWallet()
    const { userId, displayName, photoUrl } = useUser()
    const fiat = activeFiat

    const { level, nextLevel } = getVIPInfo(totalDeposits)

    let progressPercent = 0
    let progressColor = '#cd7f32'
    let isObsidian = false

    if (!level && nextLevel) {
        progressPercent = (totalDeposits / nextLevel.minDeposit) * 100
        progressColor = nextLevel.color
    } else if (level && nextLevel) {
        progressPercent = ((totalDeposits - level.minDeposit) / (nextLevel.minDeposit - level.minDeposit)) * 100
        progressColor = level.color
    } else if (level && level.name === 'Obsidian') {
        progressPercent = 100
        isObsidian = true
    }

    const [lbRank, setLbRank] = useState(null)
    const [lbScore, setLbScore] = useState(0)
    const API_BASE = import.meta.env.VITE_API_URL || ''

    useEffect(() => {
        if (!userId || userId === 'dev_user') return
        fetch(`${API_BASE}/api/leaderboard/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, displayName, photoUrl }),
        }).then(r => r.json()).then(data => {
            if (data.rank > 0) {
                setLbRank(data.rank)
                setLbScore(data.score)
            }
        }).catch(() => {})
    }, [userId, displayName, photoUrl, API_BASE])

    const topBadges = []
    if (lbRank !== null) {
        if (lbRank <= 100) topBadges.push('top100')
        if (lbRank <= 3) topBadges.push(`top${lbRank}`)
        topBadges.push('verified')
    }

    return (
        <div className="profile-page" style={{
            maxWidth: 400,
            margin: '0 auto',
            padding: '0 16px 80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
        }}>
            <div className="deposit-nav-scroll" style={{ width: '100%', maxWidth: 400, margin: '0 auto', alignSelf: 'stretch' }}>
                <button className="dn-item active" onClick={() => navigate('/profile')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C9.38 2 7.25 4.13 7.25 6.75c0 2.57 2.01 4.65 4.63 4.74.08-.01.16-.01.22 0h.07a4.738 4.738 0 0 0 4.58-4.74C16.75 4.13 14.62 2 12 2ZM17.08 14.149c-2.79-1.86-7.34-1.86-10.15 0-1.27.85-1.97 2-1.97 3.23s.7 2.37 1.96 3.21c1.4.94 3.24 1.41 5.08 1.41 1.84 0 3.68-.47 5.08-1.41 1.26-.85 1.96-1.99 1.96-3.23-.01-1.23-.7-2.37-1.96-3.21Z" fill="currentColor" />
                    </svg>
                    <span>Profile</span>
                </button>
                <button className="dn-item" onClick={() => navigate('/deposit')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="m 11.94 2.212 l -2.41 5.61 H 7.12 c -0.4 0 -0.79 0.03 -1.17 0.11 l 1 -2.4 l 0.04 -0.09 l 0.06 -0.16 c 0.03 -0.07 0.05 -0.13 0.08 -0.18 c 1.16 -2.69 2.46 -3.53 4.81 -2.89 Z M 18.731 8.09 l -0.02 -0.01 c -0.6 -0.17 -1.21 -0.26 -1.83 -0.26 h -6.26 l 2.25 -5.23 l 0.03 -0.07 c 0.14 0.05 0.29 0.12 0.44 0.17 l 2.21 0.93 c 1.23 0.51 2.09 1.04 2.62 1.68 c 0.09 0.12 0.17 0.23 0.25 0.36 c 0.09 0.14 0.16 0.28 0.2 0.43 c 0.04 0.09 0.07 0.17 0.09 0.26 c 0.15 0.51 0.16 1.09 0.02 1.74 Z M 18.288 9.52 c -0.45 -0.13 -0.92 -0.2 -1.41 -0.2 h -9.76 c -0.68 0 -1.32 0.13 -1.92 0.39 a 4.894 4.894 0 0 0 -2.96 4.49 v 1.95 c 0 0.24 0.02 0.47 0.05 0.71 c 0.22 3.18 1.92 4.88 5.1 5.09 c 0.23 0.03 0.46 0.05 0.71 0.05 h 7.8 c 3.7 0 5.65 -1.76 5.84 -5.26 c 0.01 -0.19 0.02 -0.39 0.02 -0.59 V 14.2 a 4.9 4.9 0 0 0 -3.47 -4.68 Z m -3.79 6.67 h -1.75 V 18 c 0 0.41 -0.34 0.75 -0.75 0.75 s -0.75 -0.34 -0.75 -0.75 v -1.81 h -1.75 a 0.749 0.749 0 1 1 0 -1.5 h 1.75 V 13 c 0 -0.41 0.34 -0.75 0.75 -0.75 s 0.75 0.34 0.75 0.75 v 1.69 h 1.75 a 0.749 0.749 0 1 1 0 1.5 Z" />
                    </svg>
                    <span>Deposit</span>
                </button>
                <button className="dn-item" onClick={() => navigate('/withdraw')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="m 11.94 2.212 l -2.41 5.61 H 7.12 c -0.4 0 -0.79 0.03 -1.17 0.11 l 1 -2.4 l 0.04 -0.09 l 0.06 -0.16 c 0.03 -0.07 0.05 -0.13 0.08 -0.18 c 1.16 -2.69 2.46 -3.53 4.81 -2.89 Z M 18.731 8.09 l -0.02 -0.01 c -0.6 -0.17 -1.21 -0.26 -1.83 -0.26 h -6.26 l 2.25 -5.23 l 0.03 -0.07 c 0.14 0.05 0.29 0.12 0.44 0.17 l 2.21 0.93 c 1.23 0.51 2.09 1.04 2.62 1.68 c 0.09 0.12 0.17 0.23 0.25 0.36 c 0.09 0.14 0.16 0.28 0.2 0.43 c 0.04 0.09 0.07 0.17 0.09 0.26 c 0.15 0.51 0.16 1.09 0.02 1.74 Z M 18.288 9.52 c -0.45 -0.13 -0.92 -0.2 -1.41 -0.2 h -9.76 c -0.68 0 -1.32 0.13 -1.92 0.39 a 4.894 4.894 0 0 0 -2.96 4.49 v 1.95 c 0 0.24 0.02 0.47 0.05 0.71 c 0.22 3.18 1.92 4.88 5.1 5.09 c 0.23 0.03 0.46 0.05 0.71 0.05 h 7.8 c 3.7 0 5.65 -1.76 5.84 -5.26 c 0.01 -0.19 0.02 -0.39 0.02 -0.59 V 14.2 a 4.9 4.9 0 0 0 -3.47 -4.68 Z m -3.79 7.23 h -5 c -0.41 0 -0.75 -0.34 -0.75 -0.75 s 0.34 -0.75 0.75 -0.75 h 5 c 0.41 0 0.75 0.34 0.75 0.75 s -0.34 0.75 -0.75 0.75 Z" fill="currentColor" />
                    </svg>
                    <span>Withdraw</span>
                </button>
                <button className="dn-item" onClick={() => navigate('/bonuses')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M20 12V18C20 20.21 18.21 22 16 22H8C5.79 22 4 20.21 4 18V12C4 11.45 4.45 11 5 11H6.97C7.52 11 7.97 11.45 7.97 12V15.14C7.97 15.88 8.38 16.56 9.03 16.91C9.32 17.07 9.64 17.15 9.97 17.15C10.35 17.15 10.73 17.04 11.06 16.82L12.01 16.2L12.89 16.79C13.5 17.2 14.28 17.25 14.93 16.9C15.59 16.55 16 15.88 16 15.13V12C16 11.45 16.45 11 17 11H19C19.55 11 20 11.45 20 12Z" fill="currentColor"/>
                        <path d="M21.5 7V8C21.5 9.1 20.97 10 19.5 10H4.5C2.97 10 2.5 9.1 2.5 8V7C2.5 5.9 2.97 5 4.5 5H19.5C20.97 5 21.5 5.9 21.5 7Z" fill="currentColor"/>
                        <path d="M11.6388 5.00141H6.11881C5.77881 4.63141 5.78881 4.06141 6.14881 3.70141L7.56881 2.28141C7.93881 1.91141 8.54881 1.91141 8.91881 2.28141L11.6388 5.00141Z" fill="currentColor"/>
                        <path d="M17.8716 5.00141H12.3516L15.0716 2.28141C15.4416 1.91141 16.0516 1.91141 16.4216 2.28141L17.8416 3.70141C18.2016 4.06141 18.2116 4.63141 17.8716 5.00141Z" fill="currentColor"/>
                        <path d="M13.9714 11C14.5214 11 14.9714 11.45 14.9714 12V15.13C14.9714 15.93 14.0814 16.41 13.4214 15.96L12.5214 15.36C12.1914 15.14 11.7614 15.14 11.4214 15.36L10.4814 15.98C9.82141 16.42 8.94141 15.94 8.94141 15.15V12C8.94141 11.45 9.39141 11 9.94141 11H13.9714Z" fill="currentColor"/>
                    </svg>
                    <span>Bonuses</span>
                </button>
                <button className="dn-item" onClick={() => navigate('/affiliate')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M13.06 8.11l1.77-1.77a3.5 3.5 0 0 1 4.95 4.95l-2.12 2.12a3.5 3.5 0 0 1-5.66-.7l-.7-.7a1.5 1.5 0 0 1 2.12-2.12l.7.7a.5.5 0 0 0 .71 0l2.12-2.12a.5.5 0 0 0 0-.71l-1.77-1.77a.5.5 0 0 0-.7 0L12.35 6.7a1.5 1.5 0 0 1-2.12-2.12l.71-.71a3.5 3.5 0 0 1 4.95 0l1.77 1.77a3.5 3.5 0 0 1 0 4.95l-2.12 2.12a3.5 3.5 0 0 1-5.66-.7l-.7-.7a1.5 1.5 0 0 1 2.12-2.12l.7.7a.5.5 0 0 0 .71 0l2.12-2.12a.5.5 0 0 0 0-.71M10.94 15.89l-1.77 1.77a3.5 3.5 0 0 1-4.95-4.95l2.12-2.12a3.5 3.5 0 0 1 5.66.7l.7.7a1.5 1.5 0 0 1-2.12 2.12l-.7-.7a.5.5 0 0 0-.71 0l-2.12 2.12a.5.5 0 0 0 0 .71l1.77 1.77a.5.5 0 0 0 .7 0l1.42-1.42a1.5 1.5 0 0 1 2.12 2.12l-.71.71a3.5 3.5 0 0 1-4.95 0l-1.77-1.77a3.5 3.5 0 0 1 0-4.95l2.12-2.12a3.5 3.5 0 0 1 5.66.7l.7.7a1.5 1.5 0 0 1-2.12 2.12l-.7-.7a.5.5 0 0 0-.71 0l-2.12 2.12a.5.5 0 0 0 0 .71" fill="currentColor" />
                    </svg>
                    <span>Referral Program</span>
                </button>
                <button className="dn-item" onClick={() => navigate('/affiliate')}>
                    <svg width="18" height="18" viewBox="0 0 30 30" fill="none">
                        <path d="M 24.5643 9.483 C 23.7293 9.48364 22.9237 9.77896 22.3019 10.3125 C 21.6801 10.8459 21.2857 11.5802 21.1941 12.3746 L 21.1925 12.3893 L 18.5665 13.062 C 18.1925 12.5987 17.692 12.2433 17.1202 12.0351 L 17.0971 12.0281 V 9.28704 C 18.3674 8.79636 19.2473 7.62605 19.2473 6.25822 C 19.2473 4.45881 17.7239 3 15.843 3 C 14.9402 3.00021 14.0745 3.34357 13.4362 3.95459 C 12.798 4.5656 12.4394 5.39422 12.4394 6.25822 C 12.4392 6.90739 12.6416 7.54182 13.0207 8.08016 C 13.3997 8.61849 13.9382 9.03618 14.5669 9.27966 L 14.5893 9.28743 V 11.9457 C 14.3035 12.0506 14.0354 12.1951 13.7934 12.3746 L 13.8007 12.3691 L 8.80794 9.76295 C 8.81318 9.66762 8.81318 9.5721 8.80794 9.47678 V 9.48378 C 8.80794 7.68398 7.2845 6.22556 5.40397 6.22556 C 4.50114 6.22566 3.63533 6.56898 2.99697 7.18001 C 2.35862 7.79103 2 8.61971 2 9.48378 C 2.00011 10.3478 2.35883 11.1765 2.99726 11.7874 C 3.63569 12.3984 4.50155 12.7416 5.40438 12.7416 C 6.23782 12.7416 7.04082 12.4418 7.65419 11.9018 L 7.65175 11.9037 L 12.4926 14.4582 C 12.4759 14.6413 12.4762 14.8254 12.4934 15.0084 L 12.4926 14.9967 C 12.4931 15.4341 12.5842 15.867 12.7608 16.2704 L 12.7522 16.2487 L 8.96962 19.7647 C 8.53371 19.5682 8.05803 19.4657 7.57619 19.4645 H 7.57538 L 7.51038 19.4637 C 7.06194 19.4637 6.61789 19.5483 6.2036 19.7125 C 5.7893 19.8768 5.41287 20.1175 5.09579 20.421 C 4.77872 20.7245 4.52722 21.0848 4.35564 21.4814 C 4.18407 21.8779 4.09579 22.3029 4.09584 22.7321 C 4.09584 23.1612 4.18418 23.5862 4.3558 23.9827 C 4.52742 24.3792 4.77897 24.7395 5.09608 25.043 C 5.41319 25.3464 5.78966 25.5871 6.20397 25.7514 C 6.61829 25.9156 7.06234 26 7.51078 26 C 7.95918 26 8.4032 25.9155 8.81747 25.7512 C 9.23174 25.587 9.60815 25.3463 9.92522 25.0428 C 10.2423 24.7394 10.4938 24.3791 10.6654 23.9826 C 10.837 23.5862 10.9253 23.1612 10.9253 22.7321 C 10.9394 22.2853 10.8521 21.8409 10.6694 21.4295 L 10.6775 21.4498 L 14.4597 17.9334 C 14.8945 18.1252 15.3678 18.2239 15.8466 18.2227 H 15.8547 C 16.3406 18.2343 16.8217 18.1246 17.2471 17.9031 C 17.6725 17.6817 18.0285 17.3544 18.2815 16.9546 C 18.5346 16.5548 18.6768 16.0959 18.6929 15.6236 C 18.709 15.1514 18.5986 14.6842 18.3728 14.2687 L 18.3775 14.2789 L 22.1609 10.7638 C 21.9135 10.3398 21.785 9.86457 21.7855 9.38238 C 21.7855 7.50335 23.3502 6 25.2895 6 C 26.4676 6 27.5196 6.61581 28.0743 7.5655 C 28.3612 8.08142 28.5097 8.65537 28.5068 9.23787 C 28.5096 9.84682 28.3469 10.4455 28.0359 10.9729 C 27.7248 11.5002 27.2763 11.9384 26.7362 12.2357 C 26.1961 12.533 25.5848 12.6786 24.9684 12.6565 L 24.9781 12.6567 L 22.3537 13.3285 C 22.2961 13.741 22.139 14.1345 21.8944 14.478 C 21.6499 14.8215 21.3238 15.1069 20.9411 15.3132 C 21.4542 15.6415 21.861 16.0973 22.1196 16.6291 C 22.3782 17.1609 22.4793 17.7494 22.4117 18.332 C 22.344 18.9147 22.1098 19.47 21.7316 19.9387 C 21.3533 20.4074 20.8447 20.7712 20.2623 20.9924 C 20.3751 21.5776 20.3214 22.1798 20.1071 22.7389 C 19.8928 23.2979 19.5248 23.7925 19.0413 24.1702 C 18.5577 24.548 17.9767 24.7954 17.3612 24.8882 C 16.7457 24.9811 16.1179 24.9163 15.5341 24.6999 C 14.9503 24.4836 14.4303 24.1234 14.0227 23.6536 C 13.615 23.1837 13.3331 22.6203 13.2018 22.0174 C 13.0705 21.4145 13.0943 20.7909 13.2703 20.199 L 13.2675 20.2086 L 17.03 16.673 C 17.4117 16.8624 17.835 16.9611 18.2654 16.9605 C 18.6977 16.9605 19.1191 16.8624 19.5029 16.673 H 19.5025 L 18.2588 16.5005 L 19.5029 16.673 C 19.8724 16.4929 20.1933 16.2348 20.4426 15.9179 C 20.6919 15.6009 20.8633 15.2332 20.9446 14.8411 C 21.0259 14.4491 21.015 14.0431 20.9126 13.6553 C 20.8102 13.2675 20.619 12.9079 20.353 12.6032 C 20.0871 12.2984 19.7535 12.0563 19.3764 11.893 C 18.9993 11.7297 18.589 11.6495 18.1759 11.6585 C 17.7628 11.6676 17.3566 11.7658 16.9874 11.9457 C 16.6182 12.1256 16.2958 12.3824 16.0437 12.6988 C 15.7916 13.0153 15.6162 13.3833 15.5311 13.7755 L 15.5315 13.7735 L 12.5332 14.2821 L 12.5319 14.2862 C 12.4124 13.8513 12.2012 13.4455 11.9166 13.0989 C 11.632 12.7523 11.2799 12.4709 10.8769 12.2635 L 10.885 12.2679 L 15.7205 9.70875 C 16.0839 9.89615 16.4868 9.99542 16.8965 9.9975 C 17.1572 9.99828 17.4153 9.94891 17.6535 9.85262 L 17.6448 9.85581 L 15.2581 8.49181 L 17.6448 9.85581 C 17.8827 9.76158 18.0936 9.62108 18.2648 9.44396 C 18.436 9.26685 18.5633 9.0575 18.6379 8.83139 C 18.7125 8.60527 18.7328 8.3679 18.6977 8.13408 C 18.6625 7.90025 18.5728 7.6747 18.4422 7.47083 C 18.3115 7.26696 18.1419 7.08864 17.9421 6.94625 C 17.7423 6.80387 17.515 6.69957 17.2724 6.63847 C 17.0298 6.57738 16.7756 6.56024 16.5255 6.58796 C 16.2754 6.61568 16.0332 6.68782 15.8112 6.80008 L 15.8202 6.79588 L 13.1257 5.24138 C 13.5072 4.71376 13.7219 4.09983 13.7482 3.46554 C 13.7745 2.83125 13.6121 2.20274 13.2829 1.64873 L 13.285 1.65325 C 13.1773 1.22335 12.9553 0.827461 12.6379 0.498289 C 12.3205 0.169117 11.9169 -0.0841704 11.46 -0.241941 C 11.0031 -0.399712 10.5067 -0.456954 10.0171 -0.409506 C 9.52754 -0.362059 9.0594 -0.211478 8.6536 0.0313039 L 8.66089 0.0269467 C 8.16649 0.490638 7.81324 1.06859 7.63979 1.7005 C 7.46633 2.33242 7.47934 2.99672 7.67706 3.62154 L 7.67392 3.61258 L 5.04082 5.1358 C 4.67959 4.98178 4.28971 4.90128 3.89522 4.89898 C 3.56092 4.89898 3.23046 4.96556 2.92592 5.09683 C 2.62138 5.2281 2.34934 5.42088 2.12756 5.66139 C 1.90577 5.90191 1.7388 6.1845 1.63686 6.48988 C 1.53493 6.79527 1.5 7.11586 1.53415 7.43101 C 1.5683 7.74616 1.67064 8.04862 1.83455 8.31815 C 1.99846 8.58769 2.22011 8.81768 2.48455 8.99256 C 2.74899 9.16744 3.05006 9.28278 3.3674 9.32916 C 3.68473 9.37553 4.01046 9.3517 4.31792 9.25937 L 4.30935 9.2619 L 9.60434 11.7836 C 9.56678 11.9216 9.53786 12.0615 9.51775 12.2026 L 9.5131 12.2357 L 9.50559 12.3893 L 9.5064 12.3919 C 9.47083 12.5962 9.44949 12.8025 9.44252 13.0094 L 9.44194 13.0609 C 9.44047 13.5239 9.53108 13.9827 9.70817 14.414 L 9.70078 14.3938 L 4.80595 17.0328 C 4.48675 16.8934 4.14108 16.8217 3.79079 16.8221 H 3.77225 C 3.50224 16.8224 3.23653 16.8789 2.99344 16.9866 C 2.75036 17.0944 2.53481 17.2497 2.35629 17.4415 L 2.35933 17.4382 C 2.07478 18.1284 2.10237 18.8941 2.43547 19.5665 L 2.42707 19.5497 L 1.22941 21.645 C 1.08092 21.8939 0.992738 22.1707 0.972041 22.4544 C 0.951344 22.738 0.998597 23.0215 1.11098 23.2847 C 1.22337 23.548 1.39846 23.7845 1.62393 23.9776 C 1.8494 24.1706 2.11971 24.3164 2.41478 24.4046 C 2.70986 24.4928 3.02282 24.5218 3.33144 24.4898 C 3.64006 24.4578 3.93714 24.3658 4.20149 24.2206 C 4.46584 24.0753 4.6915 23.8806 4.86251 23.6505 L 4.8599 23.6543 L 6.00825 21.5443 C 6.3857 21.5883 6.76894 21.5481 7.12668 21.4292 L 7.11292 21.4339 L 8.27201 23.4373 C 8.46628 23.7537 8.74071 24.0225 9.0715 24.2183 C 9.40229 24.4142 9.77975 24.5314 10.1722 24.5592 C 10.5647 24.5869 10.9602 24.5243 11.3254 24.3741 C 11.6906 24.2239 12.0152 23.9888 12.2732 23.6902 C 12.5313 23.3915 12.7161 23.0353 12.8146 22.6512 C 12.9131 22.2672 12.9226 21.8616 12.8424 21.4731 C 12.7622 21.0846 12.5945 20.7198 12.3485 20.4027 C 12.1026 20.0855 11.7835 19.8254 11.4134 19.6477 L 11.4253 19.6537 L 15.2205 16.1263 C 15.5118 16.4325 15.8799 16.6653 16.2909 16.8028 L 16.2709 16.7959 Z" fill="currentColor"/>
                    </svg>
                    <span>Affiliate Program</span>
                </button>
            </div>
            {photoUrl ? (
                <img src={photoUrl} alt="" className="profile-avatar" />
            ) : (
                <div className="profile-avatar-placeholder">
                    {displayName[0].toUpperCase()}
                </div>
            )}

            <div className="profile-name" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                {displayName}
                {topBadges.map(b => (
                    <img key={b} src={`/images/badges/${b}.png`} alt={b} title={b} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                ))}
            </div>

            {level ? (
                <div className="vip-badge" style={{ background: level.name === 'Obsidian' ? 'linear-gradient(135deg, #2d1b4e, #4a2a7a)' : level.gradient }}>
                    <span className="vip-badge-icon">{getVIPImg(level.name, 18)}</span>
                    <span style={{ color: VIP_TEXT_COLORS[level.name] || '#fff' }}>
                        {level.name}
                    </span>
                </div>
            ) : (
                <div className="vip-badge" style={{ background: 'var(--bg-tertiary)' }}>
                    <span className="vip-badge-icon">{getVIPImg('Bronze', 18)}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{t('profile.unranked')}</span>
                </div>
            )}

            {lbRank !== null && (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{t('nav.leaderboard')}: #{lbRank}</span>
                </div>
            )}

            <div className="vip-progress-section">
                <div className="vip-progress-label">
                    <span>{level ? level.name : t('profile.unranked')}</span>
                    <span>{nextLevel ? nextLevel.name : t('profile.max_level')}</span>
                </div>
                <div className="vip-progress-bar">
                    <div className="vip-progress-fill-wrap" style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}>
                        <div
                            className={`vip-progress-fill${isObsidian ? ' obsidian' : ''}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                background: isObsidian ? undefined : progressColor,
                            }}
                        />
                    </div>
                    <div className="vip-progress-markers">
                        {[
                            { name: 'Bronze', pct: 5 },
                            { name: 'Silver', pct: 20 },
                            { name: 'Gold', pct: 40 },
                            { name: 'Platinum I', pct: 60 },
                            { name: 'Diamond I', pct: 80 },
                            { name: 'Obsidian', pct: 95 },
                        ].map(l => {
                            const achieved = totalDeposits >= VIP_LEVELS.find(v => v.name === l.name).minDeposit
                            return (
                                <div
                                    key={l.name}
                                    className={`vip-progress-marker${achieved ? ' achieved' : ''}`}
                                    style={{ left: `${l.pct}%` }}
                                    title={l.name}
                                >
                                    {getVIPImg(l.name, 12)}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="vip-next-info">
                    {nextLevel
                        ? `${fiat.symbol}${Math.max(0, roundNiceFiat(nextLevel.minDeposit - totalDeposits, fiat.rate)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${t('profile.more_for')} ${nextLevel.name}`
                        : t('profile.max_level')
                    }
                </div>
            </div>

            <div className="profile-card" style={{ width: '100%', background: 'var(--bg-primary)', borderRadius: 12, padding: '12px 16px', boxSizing: 'border-box' }}>
                <div className="profile-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{t('profile.total_deposits')}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {fiat.symbol}{(totalDeposits * fiat.rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            <StarsToTonSection userId={userId} t={t} />
            <ReferralSection userId={userId} t={t} />
            <HistorySection transactions={transactions} fiat={fiat} t={t} />
            <FiatCurrencySection />
            <LanguageSection />
            <PromoSection addWinnings={addWinnings} showToast={showToast} t={t} userId={userId} />
        </div>
    )
}

export default ProfilePage
