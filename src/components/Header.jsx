import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import ProfileModal from './ProfileModal'

const cryptos = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: '#f7931a', balance: 0.0000 },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: '⟠', color: '#627eea', balance: 0.0000 },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: '₮', color: '#26a17b', balance: 0.00 },
    { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '◎', color: '#9945ff', balance: 0.00 },
    { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', icon: 'Ð', color: '#c2a633', balance: 0.00 },
    { id: 'xrp', name: 'Ripple', symbol: 'XRP', icon: '✕', color: '#23292f', balance: 0.00 },
    { id: 'ada', name: 'Cardano', symbol: 'ADA', icon: '₳', color: '#0033ad', balance: 0.00 },
    { id: 'ton', name: 'Toncoin', symbol: 'TON', icon: '⬡', color: '#0088cc', balance: 0.00 },
    { id: 'ltc', name: 'Litecoin', symbol: 'LTC', icon: 'Ł', color: '#345d9d', balance: 0.00 },
]

const BtcIcon = ({ size = 20, fontSize = 12 }) => (
    <div style={{
        width: size,
        height: size,
        minWidth: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #f7931a, #ffb347)',
        color: '#fff',
        fontWeight: 800,
        fontSize: fontSize,
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
        lineHeight: 1,
    }}>₿</div>
)

function Header() {
    const navigate = useNavigate()
    const { balance, toasts, totalDeposits } = useWallet()
    const [showCryptoDropdown, setShowCryptoDropdown] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const dropdownRef = useRef(null)
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowCryptoDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const formattedBalance = balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="logo-link">
                    <img src="/images/rainbetlogo.webp" alt="Rainbet" className="logo-img" />
                </Link>
            </div>

            <div className="header-center">
                <div className="header-wallet">
                    <div className="wallet-balance-display" onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}>
                        <BtcIcon size={18} fontSize={11} />
                        <span className="wallet-balance-amount">{formattedBalance}</span>
                        <span className="wallet-dropdown-toggle">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M7 10l5 5 5-5z" />
                            </svg>
                        </span>
                    </div>
                    <button className="wallet-btn" onClick={() => navigate('/deposit')}>
                        Wallet
                    </button>

                    {showCryptoDropdown && (
                        <div className="crypto-dropdown" ref={dropdownRef}>
                            <div className="crypto-dropdown-header">
                                <h4>Select Currency</h4>
                                <button className="wallet-close-btn" onClick={() => setShowCryptoDropdown(false)}>
                                    ✕
                                </button>
                            </div>
                            <div className="crypto-dropdown-list">
                                {cryptos.map(crypto => (
                                    <div key={crypto.id} className="crypto-dropdown-item" onClick={() => setShowCryptoDropdown(false)}>
                                        <div className="crypto-dropdown-icon" style={{ background: crypto.color }}>
                                            {crypto.icon}
                                        </div>
                                        <div className="crypto-dropdown-info">
                                            <span className="crypto-dropdown-name">{crypto.name}</span>
                                            <span className="crypto-dropdown-symbol">{crypto.symbol}</span>
                                        </div>
                                        <span className="crypto-dropdown-balance">{crypto.balance.toFixed(crypto.id === 'btc' ? 4 : 2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {toasts.length > 0 && (
                        <div className="wallet-toast-container">
                            {toasts.map(toast => (
                                <div key={toast.id} className={`wallet-toast wallet-toast-${toast.type}`}>
                                    <div className="wallet-toast-icon">
                                        {toast.type === 'bet' && (
                                            <BtcIcon size={20} fontSize={11} />
                                        )}
                                        {toast.type === 'win' && (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00e701" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                        {toast.type === 'loss' && (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ed4245" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        )}
                                        {toast.type === 'error' && (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f7931a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="wallet-toast-content">
                                        <span className="wallet-toast-title">{toast.title}</span>
                                        <span className="wallet-toast-desc">{toast.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="header-right">
                <button className="profile-pic-btn" onClick={() => setProfileOpen(true)} title="Profile">
                    {tgUser?.photo_url ? (
                        <img src={tgUser.photo_url} alt="" className="profile-pic-img" />
                    ) : (
                        <div className="profile-pic-placeholder">
                            {(tgUser?.first_name || 'P')[0].toUpperCase()}
                        </div>
                    )}
                </button>

            </div>
            <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} totalDeposits={totalDeposits} />
        </header>
    )
}

export default Header
