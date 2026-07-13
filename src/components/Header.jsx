import { Link, useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import FormattedBalance from './FormattedBalance'

function Header() {
    const navigate = useNavigate()
    const { balance, toasts, t, activeFiat } = useWallet()
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user

    const fiatBalance = balance * activeFiat.rate

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="logo-link">
                    <img src="/images/minilogorainbet.png" alt="Rainbet" className="logo-img" />
                </Link>
            </div>

            <div className="header-center">
                <div className="header-wallet">
                    <div className="wallet-balance-display">
                        <FormattedBalance value={fiatBalance} symbol={activeFiat.symbol} className="wallet-balance-amount" />
                    </div>
                    <button className="wallet-btn" onClick={() => navigate('/deposit')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="m 11.94 2.212 l -2.41 5.61 H 7.12 c -0.4 0 -0.79 0.03 -1.17 0.11 l 1 -2.4 l 0.04 -0.09 l 0.06 -0.16 c 0.03 -0.07 0.05 -0.13 0.08 -0.18 c 1.16 -2.69 2.46 -3.53 4.81 -2.89 Z M 18.731 8.09 l -0.02 -0.01 c -0.6 -0.17 -1.21 -0.26 -1.83 -0.26 h -6.26 l 2.25 -5.23 l 0.03 -0.07 c 0.14 0.05 0.29 0.12 0.44 0.17 l 2.21 0.93 c 1.23 0.51 2.09 1.04 2.62 1.68 c 0.09 0.12 0.17 0.23 0.25 0.36 c 0.09 0.14 0.16 0.28 0.2 0.43 c 0.04 0.09 0.07 0.17 0.09 0.26 c 0.15 0.51 0.16 1.09 0.02 1.74 Z M 18.288 9.52 c -0.45 -0.13 -0.92 -0.2 -1.41 -0.2 h -9.76 c -0.68 0 -1.32 0.13 -1.92 0.39 a 4.894 4.894 0 0 0 -2.96 4.49 v 1.95 c 0 0.24 0.02 0.47 0.05 0.71 c 0.22 3.18 1.92 4.88 5.1 5.09 c 0.23 0.03 0.46 0.05 0.71 0.05 h 7.8 c 3.7 0 5.65 -1.76 5.84 -5.26 c 0.01 -0.19 0.02 -0.39 0.02 -0.59 V 14.2 a 4.9 4.9 0 0 0 -3.47 -4.68 Z m -3.79 6.67 h -1.75 V 18 c 0 0.41 -0.34 0.75 -0.75 0.75 s -0.75 -0.34 -0.75 -0.75 v -1.81 h -1.75 a 0.749 0.749 0 1 1 0 -1.5 h 1.75 V 13 c 0 -0.41 0.34 -0.75 0.75 -0.75 s 0.75 0.34 0.75 0.75 v 1.69 h 1.75 a 0.749 0.749 0 1 1 0 1.5 Z" />
                        </svg>
                    </button>

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
