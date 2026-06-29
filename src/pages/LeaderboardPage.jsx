import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useUserId } from '../context/UserContext'

const VIP_LEVELS = [
    { name: 'Bronze', minDeposit: 10 },
    { name: 'Silver', minDeposit: 50 },
    { name: 'Gold', minDeposit: 100 },
    { name: 'Platinum I', minDeposit: 250 },
    { name: 'Platinum II', minDeposit: 500 },
    { name: 'Platinum III', minDeposit: 1000 },
    { name: 'Platinum IV', minDeposit: 2500 },
    { name: 'Platinum V', minDeposit: 5000 },
    { name: 'Platinum VI', minDeposit: 10000 },
    { name: 'Diamond I', minDeposit: 25000 },
    { name: 'Diamond II', minDeposit: 50000 },
    { name: 'Diamond III', minDeposit: 100000 },
    { name: 'Diamond IV', minDeposit: 250000 },
    { name: 'Diamond V', minDeposit: 500000 },
    { name: 'Obsidian', minDeposit: 1000000 },
]

const VIP_ICONS = {
    Bronze: 'bronze', Silver: 'silver', Gold: 'gold',
    'Platinum I': 'platinum', 'Platinum II': 'platinum', 'Platinum III': 'platinum',
    'Platinum IV': 'platinum', 'Platinum V': 'platinum', 'Platinum VI': 'platinum',
    'Diamond I': 'diamond', 'Diamond II': 'diamond', 'Diamond III': 'diamond',
    'Diamond IV': 'diamond', 'Diamond V': 'diamond',
    Obsidian: 'infernal',
}

function getVIPLevel(score) {
    let level = VIP_LEVELS[0]
    for (let i = 0; i < VIP_LEVELS.length; i++) {
        if (score >= VIP_LEVELS[i].minDeposit) level = VIP_LEVELS[i]
        else break
    }
    return level
}

function getVIPImg(levelName, size = 16) {
    const icon = VIP_ICONS[levelName]
    if (!icon) return null
    return `/images/vip/${icon}.webp`
}

const API_BASE = import.meta.env.VITE_API_URL || ''

const RANK_STYLES = {
    1: { bg: 'linear-gradient(135deg, #ffd700, #daa520)', color: '#000' },
    2: { bg: 'linear-gradient(135deg, #c0c0c0, #909090)', color: '#000' },
    3: { bg: 'linear-gradient(135deg, #cd7f32, #a06520)', color: '#fff' },
}

function LeaderboardPage() {
    const navigate = useNavigate()
    const { t, activeFiat } = useWallet()
    const { userId } = useUserId()
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)

    function getAvatarUrl(entry) {
        if (entry.photoUrl) return entry.photoUrl
        const seed = encodeURIComponent(entry.displayName || 'Player')
        return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`
    }

    const fetchLeaderboard = useCallback(async () => {
        try {
            const resp = await fetch(`${API_BASE}/api/leaderboard?userId=${encodeURIComponent(userId || '')}`)
            if (resp.ok) {
                const data = await resp.json()
                setEntries(data.leaderboard || [])
            }
        } catch { /* ignore */ }
        setLoading(false)
    }, [userId])

    useEffect(() => {
        fetchLeaderboard()
        const interval = setInterval(fetchLeaderboard, 30000)
        return () => clearInterval(interval)
    }, [fetchLeaderboard])

    function getBadges(entry) {
        const badges = []
        if (entry.verified) badges.push('verified')
        if (entry.rank === 1) badges.push('top1')
        else if (entry.rank === 2) badges.push('top2')
        else if (entry.rank === 3) badges.push('top3')
        else if (entry.rank <= 100) badges.push('top100')
        return badges
    }

    return (
        <div className="profile-page" style={{
            maxWidth: 400,
            margin: '0 auto',
            padding: '24px 16px 80px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => navigate(-1)} style={{
                    background: 'var(--bg-tertiary)',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 14,
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 20, fontWeight: 700 }}>
                        {t('nav.leaderboard')}
                    </h2>
                    <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
                        Top depositors
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    Loading...
                </div>
            ) : entries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No entries yet
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {entries.map((entry) => {
                        const isMe = String(entry.userId) === String(userId)
                        const vip = getVIPLevel(entry.score)
                        const badges = getBadges(entry)
                        const rs = RANK_STYLES[entry.rank] || null

                        return (
                            <div key={entry.userId} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                background: isMe ? 'rgba(20, 117, 229, 0.1)' : 'var(--bg-primary)',
                                borderRadius: 10,
                                border: isMe ? '1px solid rgba(20, 117, 229, 0.3)' : '1px solid var(--border-color)',
                            }}>
                                <div style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    flexShrink: 0,
                                    background: rs ? rs.bg : 'var(--bg-tertiary)',
                                    color: rs ? rs.color : 'var(--text-secondary)',
                                }}>
                                    {entry.rank}
                                </div>

                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    background: 'var(--bg-tertiary)',
                                }}>
                                    <img src={getAvatarUrl(entry)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{
                                            color: 'var(--text-primary)',
                                            fontWeight: 600,
                                            fontSize: 14,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {entry.displayName}
                                        </span>
                                        {vip && (
                                            <img src={getVIPImg(vip.name)} alt={vip.name} title={vip.name} style={{ width: 14, height: 14, flexShrink: 0 }} />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                        {badges.map(b => (
                                            <img key={b} src={`/images/badges/${b}.png`} alt={b} title={b}
                                                style={{ width: 16, height: 16, objectFit: 'contain' }} />
                                        ))}
                                    </div>
                                </div>

                                <div style={{
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: 'var(--text-primary)',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                }}>
                                    {activeFiat.symbol}{entry.score.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default LeaderboardPage