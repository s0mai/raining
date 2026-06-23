import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import ProfileModal from './ProfileModal'
import CryptoImg from './CryptoImg'

const cryptos = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', color: '#f7931a', img: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', color: '#627eea', img: 'https://cdn.worldvectorlogo.com/logos/ethereum-eth.svg' },
    { id: 'ton', name: 'Toncoin', symbol: 'TON', color: '#0088cc', img: 'https://cdn-icons-png.flaticon.com/256/12114/12114247.png' },
    { id: 'ltc', name: 'Litecoin', symbol: 'LTC', color: '#345d9d', img: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg' },
    { id: 'sol', name: 'Solana', symbol: 'SOL', color: '#9945ff', img: 'https://cryptologos.cc/logos/solana-sol-logo.svg' },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', color: '#26a17b', img: 'https://www.svgrepo.com/show/367256/usdt.svg' },
]

function Header() {
    const navigate = useNavigate()
    const { balance, toasts, totalDeposits } = useWallet()
    const [showCryptoDropdown, setShowCryptoDropdown] = useState(false)
    const [selectedCryptoId, setSelectedCryptoId] = useState('btc')
    const [profileOpen, setProfileOpen] = useState(false)
    const dropdownRef = useRef(null)
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    const selectedCrypto = cryptos.find(c => c.id === selectedCryptoId) || cryptos[0]

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

    function handleSelectCrypto(crypto) {
        setSelectedCryptoId(crypto.id)
        setShowCryptoDropdown(false)
    }

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
                        <CryptoImg crypto={selectedCrypto} size={18} className="wallet-balance-icon" />
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
                                    <div key={crypto.id} className={`crypto-dropdown-item${crypto.id === selectedCryptoId ? ' selected' : ''}`} onClick={() => handleSelectCrypto(crypto)}>
                                        <CryptoImg crypto={crypto} size={32} className="crypto-dropdown-icon" />
                                        <div className="crypto-dropdown-info">
                                            <span className="crypto-dropdown-name">{crypto.name}</span>
                                            <span className="crypto-dropdown-symbol">{crypto.symbol}</span>
                                        </div>
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
                                            <CryptoImg crypto={selectedCrypto} size={20} className="wallet-balance-icon" />
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
