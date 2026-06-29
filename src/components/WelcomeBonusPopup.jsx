import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import './WelcomeBonusPopup.css'

const VISITED_KEY = 'stake_has_visited'

export default function WelcomeBonusPopup() {
    const [show, setShow] = useState(false)
    const navigate = useNavigate()
    const { t } = useWallet()

    useEffect(() => {
        const hasVisited = (() => {
            try { return localStorage.getItem(VISITED_KEY) } catch { return null }
        })()
        if (hasVisited) return
        const timer = setTimeout(() => setShow(true), 800)
        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => {
        setShow(false)
    }

    const handleClaim = () => {
        try { localStorage.setItem(VISITED_KEY, '1') } catch {}
        setShow(false)
        navigate('/deposit')
    }

    if (!show) return null

    return (
        <div className="welcome-bonus-overlay" onClick={handleClose}>
            <div className="welcome-bonus-popup" onClick={e => e.stopPropagation()}>
                <button className="welcome-bonus-close" onClick={handleClose}>✕</button>

                <div className="welcome-bonus-icon">
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#1475e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </div>

                <h2 className="welcome-bonus-title">{t('bonus.title')}</h2>
                <p className="welcome-bonus-msg">{t('bonus.subtitle')}</p>
                <p className="welcome-bonus-sub">{t('bonus.description')}</p>

                <button className="welcome-bonus-btn" onClick={handleClaim}>
                    {t('bonus.claim')}
                </button>
            </div>
        </div>
    )
}
