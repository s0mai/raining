import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import './WelcomeBonusPopup.css'

export default function WelcomeBonusPopup() {
    const [show, setShow] = useState(false)
    const navigate = useNavigate()
    const { totalDeposits } = useWallet()

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 800)
        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => {
        setShow(false)
    }

    const handleClaim = () => {
        setShow(false)
        navigate('/deposit')
    }

    if (!show || totalDeposits > 0) return null

    return (
        <div className="welcome-bonus-overlay" onClick={handleClose}>
            <div className="welcome-bonus-popup" onClick={e => e.stopPropagation()}>
                <button className="welcome-bonus-close" onClick={handleClose}>✕</button>

                <div className="welcome-bonus-image-wrap">
                    <div className="welcome-bonus-image-overlay" />
                    <img src="/images/popup_promocode.webp" alt="" className="welcome-bonus-image" />
                </div>

                <div className="welcome-bonus-body">
                    <h2 className="welcome-bonus-title">100% Deposit Bonus + $1000 Bonus</h2>
                    <p className="welcome-bonus-sub">Minimum deposit: $10</p>
                    <p className="welcome-bonus-sub">Use promo code <span className="welcome-bonus-code">WELCOME</span></p>

                    <button className="welcome-bonus-btn" onClick={handleClaim}>
                        Activate 100% Bonus
                    </button>
                </div>
            </div>
        </div>
    )
}
