import { useState, useEffect, useRef } from 'react'
import { useWallet } from '../context/WalletContext'
import './ProfileModal.css'

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

function ShieldSVG({ color, size = 24 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
            <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11 5.17-.85 9-5.75 9-11V7l-9-5z" />
        </svg>
    )
}

function CrystalSVG({ color, facets, size = 24 }) {
    const lines = []
    if (facets >= 1) lines.push({ x1: 12, y1: 2, x2: 12, y2: 22 })
    if (facets >= 2) lines.push({ x1: 4, y1: 12, x2: 20, y2: 12 })
    if (facets >= 3) lines.push({ x1: 7, y1: 5, x2: 17, y2: 19 })
    if (facets >= 4) lines.push({ x1: 17, y1: 5, x2: 7, y2: 19 })
    if (facets >= 5) lines.push({ x1: 4, y1: 8, x2: 20, y2: 16 })
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round">
            <polygon points="12,2 20,12 12,22 4,12" />
            {lines.map((l, i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />)}
        </svg>
    )
}

function DiamondSVG({ color, tier, size = 24 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round">
            <polygon points="12,2 22,12 12,22 2,12" />
            {tier >= 2 && <polygon points="12,4 16,8 12,12 8,8" fill={color} fillOpacity="0.3" />}
            {tier >= 3 && <polygon points="12,6 14,8 12,10 10,8" fill={color} fillOpacity="0.5" />}
            {tier >= 4 && (
                <>
                    <line x1="12" y1="2" x2="12" y2="6" strokeWidth="1.5" />
                    <line x1="8" y1="4" x2="10" y2="7" strokeWidth="1.5" />
                    <line x1="16" y1="4" x2="14" y2="7" strokeWidth="1.5" />
                </>
            )}
            {tier >= 5 && (
                <>
                    <circle cx="12" cy="3" r="1.5" fill={color} fillOpacity="0.6" />
                    <line x1="12" y1="1" x2="12" y2="2" strokeWidth="2" />
                </>
            )}
        </svg>
    )
}

function ObsidianSVG({ color, size = 24 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" className="obsidian-svg-icon">
            <polygon points="12,1 19,6 21,13 17,21 12,23 7,21 3,13 5,6" />
            <polygon points="12,4 16,8 17,13 14,18 12,19 10,18 7,13 8,8" fill={color} fillOpacity="0.2" />
            <line x1="12" y1="4" x2="12" y2="19" strokeWidth="0.8" stroke={color} strokeOpacity="0.4" />
            <line x1="8" y1="8" x2="16" y2="8" strokeWidth="0.8" stroke={color} strokeOpacity="0.4" />
        </svg>
    )
}

function getVIPSVG(levelName, size = 24) {
    switch (levelName) {
        case 'Bronze': return <ShieldSVG color="#cd7f32" size={size} />
        case 'Silver': return <ShieldSVG color="#c0c0c0" size={size} />
        case 'Gold': return <ShieldSVG color="#ffd700" size={size} />
        case 'Platinum I': return <CrystalSVG color="#8ea4b8" facets={1} size={size} />
        case 'Platinum II': return <CrystalSVG color="#7a90a8" facets={2} size={size} />
        case 'Platinum III': return <CrystalSVG color="#667c94" facets={3} size={size} />
        case 'Platinum IV': return <CrystalSVG color="#526880" facets={4} size={size} />
        case 'Platinum V': return <CrystalSVG color="#3e5470" facets={5} size={size} />
        case 'Platinum VI': return <CrystalSVG color="#2a4060" facets={6} size={size} />
        case 'Diamond I': return <DiamondSVG color="#b0e0e6" tier={1} size={size} />
        case 'Diamond II': return <DiamondSVG color="#87ceeb" tier={2} size={size} />
        case 'Diamond III': return <DiamondSVG color="#5fcdee" tier={3} size={size} />
        case 'Diamond IV': return <DiamondSVG color="#40e0d0" tier={4} size={size} />
        case 'Diamond V': return <DiamondSVG color="#00ffff" tier={5} size={size} />
        case 'Obsidian': return <ObsidianSVG color="#6b3fa0" size={size} />
        default: return null
    }
}

function ReferralSection({ userId }) {
    const referralLink = userId
        ? `t.me/StakeClassicsBot?start=REF${userId}`
        : 't.me/StakeClassicsBot?start=PLAYER'

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
                <span>Referral Program</span>
            </div>
            <div className="profile-card-body">
                <div className="referral-link-row">
                    <span className="referral-link-text">{referralLink}</span>
                    <button className="referral-copy-btn" onClick={handleCopy}>
                        {copied ? (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e701" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

function PromoSection({ addWinnings, showToast }) {
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
                <span>Promo Codes</span>
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

function ProfileModal({ open, onClose, totalDeposits }) {
    const { addWinnings, showToast } = useWallet()
    const [user, setUser] = useState(null)

    useEffect(() => {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
        setUser(tgUser || null)
    }, [])

    if (!open) return null

    const { level, nextLevel } = getVIPInfo(totalDeposits)
    const userId = user?.id
    const displayName = user?.first_name
        ? user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.first_name
        : 'Player'
    const photoUrl = user?.photo_url

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
        <div className="profile-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                <button className="profile-close" onClick={onClose}>✕</button>

                {photoUrl ? (
                    <img src={photoUrl} alt="" className="profile-avatar" />
                ) : (
                    <div className="profile-avatar-placeholder">
                        {displayName[0].toUpperCase()}
                    </div>
                )}

                <div className="profile-name">{displayName}</div>

                <div className="vip-large-badge">
                    {level ? getVIPSVG(level.name, 72) : getVIPSVG('Bronze', 72)}
                </div>

                {level ? (
                    <div className="vip-badge" style={{ background: level.name === 'Obsidian' ? 'linear-gradient(135deg, #2d1b4e, #4a2a7a)' : level.gradient }}>
                        <span className="vip-badge-icon">{getVIPSVG(level.name, 18)}</span>
                        <span style={{ color: level.name.startsWith('Diamond') || level.name === 'Obsidian' ? '#fff' : '#000' }}>
                            {level.name}
                        </span>
                    </div>
                ) : (
                    <div className="vip-badge" style={{ background: 'var(--bg-tertiary)' }}>
                        <span className="vip-badge-icon">{getVIPSVG('Bronze', 18)}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>No Level</span>
                    </div>
                )}

                <div className="vip-progress-section">
                    <div className="vip-progress-label">
                        <span>{level ? level.name : 'Start'}</span>
                        <span>{nextLevel ? nextLevel.name : 'MAX'}</span>
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
                            ? `$${(nextLevel.minDeposit - totalDeposits).toLocaleString()} more for ${nextLevel.name}`
                            : 'Maximum level reached'
                        }
                    </div>
                </div>

                <div className="profile-card" style={{ width: '100%', background: 'var(--bg-primary)', borderRadius: 12, padding: '12px 16px', boxSizing: 'border-box' }}>
                    <div className="profile-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Total Deposits</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                            ${totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <ReferralSection userId={userId} />
                <PromoSection addWinnings={addWinnings} showToast={showToast} />
            </div>
        </div>
    )
}

export default ProfileModal