import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import CryptoImg from './CryptoImg'
import { cryptos } from '../data/cryptos'

function Header() {
    const navigate = useNavigate()
    const { balance, balances, activeCurrency, setActiveCurrency, toasts, t, activeFiat } = useWallet()
    const [showCryptoDropdown, setShowCryptoDropdown] = useState(false)
    const dropdownRef = useRef(null)
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    const selectedCrypto = cryptos.find(c => c.id === activeCurrency) || cryptos[0]

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowCryptoDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fiatBalance = balance * activeFiat.rate
    const formattedBalance = fiatBalance.toLocaleString('en-US', {
        minimumFractionDigits: fiatBalance >= 100 ? 0 : 2,
        maximumFractionDigits: 2,
    })

    function handleSelectCrypto(crypto) {
        setActiveCurrency(crypto.id)
        setShowCryptoDropdown(false)
    }

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="logo-link">
                    <img src="/images/minilogorainbet.png" alt="Rainbet" className="logo-img" />
                </Link>
            </div>

            <div className="header-center">
                <div className="header-wallet">
                    <div className="wallet-balance-display" onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}>
                        <span className="wallet-balance-amount">{activeFiat.symbol}{formattedBalance}</span>
                        <CryptoImg crypto={selectedCrypto} size={24} className="wallet-balance-icon" />
                        <span className="wallet-dropdown-toggle">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </span>
                    </div>
                    <button className="wallet-btn" onClick={() => navigate('/deposit')}>
                        {t('nav.wallet')}
                    </button>

                    {showCryptoDropdown && (
                        <div className="crypto-dropdown" ref={dropdownRef}>
                            <div className="crypto-dropdown-header">
                                <h4>{t('nav.select_currency')}</h4>
                                <button className="wallet-close-btn" onClick={() => setShowCryptoDropdown(false)}>
                                    ✕
                                </button>
                            </div>
                            <div className="crypto-dropdown-list">
                                {cryptos.map(crypto => (
                                    <div key={crypto.id} className={`crypto-dropdown-item${crypto.id === activeCurrency ? ' selected' : ''}`} onClick={() => handleSelectCrypto(crypto)}>
                                        <CryptoImg crypto={crypto} size={32} className="crypto-dropdown-icon" />
                                        <div className="crypto-dropdown-info">
                                            <span className="crypto-dropdown-name">{crypto.name}</span>
                                            <span className="crypto-dropdown-symbol">{activeFiat.symbol}{(balances[crypto.id] || 0).toFixed(2)}</span>
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
                <button className="profile-pic-btn" onClick={() => navigate('/profile')} title={t('nav.profile')}>
                    {tgUser?.photo_url ? (
                        <img src={tgUser.photo_url} alt="" className="profile-pic-img" />
                    ) : (
                        <div className="profile-pic-placeholder">
                            {(tgUser?.first_name || 'P')[0].toUpperCase()}
                        </div>
                    )}
                </button>

            </div>
        </header>
    )
}

export default Header
