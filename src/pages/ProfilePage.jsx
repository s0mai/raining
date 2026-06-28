import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useUser } from '../hooks/useUser'
import '../components/ProfileModal.css'

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
    const referralLink = userId
        ? `t.me/rainbetoriginalbot?start=REF${userId}`
        : 't.me/rainbetoriginalbot?start=PLAYER'

    const [count, setCount] = useState(() => {
        try { return parseInt(localStorage.getItem('stake_referral_count')) || 0 } catch { return 0 }
    })
    const [bonus, setBonus] = useState(() => {
        try { return parseFloat(localStorage.getItem('stake_referral_bonus')) || 0 } catch { return 0 }
    })
    const [copied, setCopied] = useState(false)

    function handleCopy() {
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <div className="profile-card">
            <div className="profile-card-header">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                <span>{t('profile.referral')}</span>
            </div>
            <div className="profile-card-body">
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
                <div className="referral-stats">
                    <span className="referral-stat">
                        <span className="referral-stat-num">{count}</span> people referred
                    </span>
                    <span className="referral-stat-divider">•</span>
                    <span className="referral-stat">
                        <span className="referral-stat-num">${bonus.toFixed(2)}</span> bonus earned
                    </span>
                </div>
            </div>
        </div>
    )
}

function PromoSection({ addWinnings, showToast, t }) {
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
            setMessage('Code already used')
            return
        }

        const promo = PROMO_CODES[trimmed]
        if (promo) {
            addWinnings(promo.bonus)
            const newApplied = [...appliedCodes, trimmed]
            setAppliedCodes(newApplied)
            try { localStorage.setItem('stake_applied_promos', JSON.stringify(newApplied)) } catch { }
            setStatus('success')
            setMessage(`Code applied! +$${promo.bonus}`)
            if (showToast) showToast('win', 'Promo Applied!', `+$${promo.bonus} bonus`, 3000)
        } else {
            setStatus('error')
            setMessage('Invalid or expired code')
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
                        placeholder="Enter promo code"
                        value={code}
                        onChange={e => { setCode(e.target.value); setStatus(null); setMessage('') }}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="promo-submit-btn" onClick={handleSubmit}>Apply</button>
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
            <div className="profile-card">
                <div className="profile-card-header">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                <span>{t('profile.history')}</span>
            </div>
            <div className="profile-card-body">
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
                    {t('profile.no_transactions')}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-card">
            <div className="profile-card-header">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{t('profile.history')}</span>
            </div>
            <div className="profile-card-body" style={{ maxHeight: 280, overflowY: 'auto' }}>
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
            </div>
        </div>
    )
}

function FiatCurrencySection() {
    const { activeFiat, setActiveFiat, FIATS } = useWallet()
    const [fiatCode, setFiatCode] = useState(activeFiat.code)

    function handleChange(e) {
        const code = e.target.value
        setFiatCode(code)
        setActiveFiat(code)
    }

    return (
        <div className="profile-card">
            <div className="profile-card-header">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>Currency</span>
            </div>
            <div className="profile-card-body">
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
            </div>
        </div>
    )
}

function LanguageSection() {
    const { activeLang, setActiveLang, t } = useWallet()
    const [language, setLanguage] = useState(activeLang)

    function handleSelect(code) {
        setLanguage(code)
        setActiveLang(code)
    }

    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    useEffect(() => {
        function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <div className="profile-card">
            <div className="profile-card-header">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>Language</span>
            </div>
            <div className="profile-card-body" ref={ref} style={{ position: 'relative' }}>
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
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                        background: 'var(--bg-secondary)', borderRadius: 8, marginTop: 4,
                        maxHeight: 200, overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
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
        </div>
    )
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

    return (
        <div className="profile-page" style={{
            maxWidth: 400,
            margin: '0 auto',
            padding: '24px 16px 80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
        }}>
            <button onClick={() => navigate(-1)} style={{
                alignSelf: 'flex-start',
                background: 'var(--bg-tertiary)',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 14,
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
            }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                {t('profile.back')}
            </button>
            {photoUrl ? (
                <img src={photoUrl} alt="" className="profile-avatar" />
            ) : (
                <div className="profile-avatar-placeholder">
                    {displayName[0].toUpperCase()}
                </div>
            )}

            <div className="profile-name">{displayName}</div>

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

            <div className="vip-progress-section">
                <div className="vip-progress-label">
                    <span>{level ? level.name : t('profile.unranked')}</span>
                    <span>{nextLevel ? nextLevel.name : 'Bronze'}</span>
                </div>
                <div className="vip-progress-bar">
                    <div
                        className={`vip-progress-fill${isObsidian ? ' obsidian' : ''}`}
                        style={{
                            width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                            background: isObsidian ? undefined : progressColor,
                        }}
                    />
                </div>
                <div className="vip-next-info">
                    {nextLevel
                        ? `${fiat.symbol}${((nextLevel.minDeposit - totalDeposits) * fiat.rate).toLocaleString()} ${t('profile.more_for')} ${nextLevel.name}`
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

            <ReferralSection userId={userId} t={t} />
            <HistorySection transactions={transactions} fiat={fiat} t={t} />
            <FiatCurrencySection />
            <LanguageSection />
            <PromoSection addWinnings={addWinnings} showToast={showToast} t={t} />
        </div>
    )
}

export default ProfilePage
