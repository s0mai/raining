import { useState, useRef, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useUserId } from '../context/UserContext'
import { cryptos } from '../data/cryptos'
import Header from '../components/Header'
import CryptoImg from '../components/CryptoImg'
import { formatBalance } from '../components/FormattedBalance'
import './DepositPage.css'
import '../components/DepositAddressFlow.css'
import './WithdrawPage.css'

function WithdrawPage() {
    const navigate = useNavigate()
    const { syncBalance, totalBalance, activeFiat, showToast } = useWallet()
    const { userId } = useUserId()
    const [selectedCoin, setSelectedCoin] = useState(null)
    const [selectedNetwork, setSelectedNetwork] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [walletAddress, setWalletAddress] = useState('')
    const [comment, setComment] = useState('')
    const [amount, setAmount] = useState('')
    const dropdownRef = useRef(null)

    useEffect(() => {
        if (userId && userId !== 'dev_user') syncBalance(userId)
    }, [userId])

    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        document.addEventListener('touchstart', handleClick)
        return () => {
            document.removeEventListener('mousedown', handleClick)
            document.removeEventListener('touchstart', handleClick)
        }
    }, [])

    useEffect(() => {
        setSelectedNetwork(selectedCoin?.networks?.[0]?.id || null)
    }, [selectedCoin])

    const filteredCoins = cryptos.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )

    function handleCoinSelect(coin) {
        setSelectedCoin(coin)
        setDropdownOpen(false)
        setSearchQuery('')
    }

    function handleMax() {
        if (totalBalance > 0) {
            setAmount(String(totalBalance))
        }
    }

    function handleWithdraw() {
        if (!selectedCoin) {
            showToast('error', 'Error', 'Please select a cryptocurrency', 3000)
            return
        }
        if (!walletAddress) {
            showToast('error', 'Error', 'Please enter a wallet address', 3000)
            return
        }
        if (!amount || parseFloat(amount) <= 0) {
            showToast('error', 'Error', 'Please enter a valid amount', 3000)
            return
        }
        showToast('win', 'Withdrawal Submitted', `Your ${selectedCoin.symbol} withdrawal is being processed`, 5000)
    }

    const { int: balInt, dec: balDec } = formatBalance(totalBalance)
    const hasNetworks = selectedCoin?.networks?.length > 1

    return (
        <div className="withdraw-page">
            <Header />
            <div className="deposit-nav-scroll">
                <button className="dn-item" onClick={() => navigate('/profile')}>
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
                <button className="dn-item active" onClick={() => navigate('/withdraw')}>
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
                <button className="dn-item" onClick={() => navigate('/settings')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M10.825 22q-.675 0-1.162-.45t-.588-1.1L8.85 18.8q-.325-.125-.612-.3t-.563-.375l-1.55.65q-.625.275-1.25.05t-.975-.8l-1.175-2.05q-.35-.575-.2-1.225t.675-1.075l1.325-1Q4.5 12.5 4.5 12.337v-.675q0-.162.025-.337l-1.325-1Q2.675 9.9 2.525 9.25t.2-1.225L3.9 5.975q.35-.575.975-.8t1.25.05l1.55.65q.275-.2.575-.375t.6-.3l.225-1.65q.1-.65.588-1.1T10.825 2h2.35q.675 0 1.163.45t.587 1.1l.225 1.65q.325.125.613.3t.562.375l1.55-.65q.625-.275 1.25-.05t.975.8l1.175 2.05q.35.575.2 1.225t-.675 1.075l-1.325 1q.025.175.025.338v.674q0 .163-.05.338l1.325 1q.525.425.675 1.075t-.2 1.225l-1.2 2.05q-.35.575-.975.8t-1.25-.05l-1.5-.65q-.275.2-.575.375t-.6.3l-.225 1.65q-.1.65-.587 1.1t-1.163.45zM12.05 15.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5" />
                    </svg>
                    <span>Settings</span>
                </button>
            </div>
            <div className="deposit-body">
                <div className="deposit-address-flow">
                    <div className="daf-card">
                        <div className="daf-column daf-column-connected">
                            <h2 className="daf-section-title">1. Select Crypto to Withdraw</h2>
                            <div className="daf-dropdown" ref={dropdownRef}>
                                <button className="daf-dropdown-trigger" onClick={() => setDropdownOpen(p => !p)}>
                                    {selectedCoin ? (
                                        <div className="daf-dropdown-selected">
                                            <CryptoImg crypto={selectedCoin} size={21} />
                                            <span className="daf-coin-name">{selectedCoin.name}</span>
                                            <span className="daf-coin-ticker">{selectedCoin.symbol}</span>
                                        </div>
                                    ) : (
                                        <span className="daf-placeholder">Select a cryptocurrency</span>
                                    )}
                                    <svg className={`daf-chevron${dropdownOpen ? ' open' : ''}`} viewBox="0 0 16 10" width="16" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 2L8 8L14 2" />
                                    </svg>
                                </button>
                                {dropdownOpen && (
                                    <div className="daf-dropdown-panel">
                                        <div className="daf-search">
                                            <svg className="daf-search-icon" width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9.625 17.125C13.491 17.125 16.625 13.991 16.625 10.125C16.625 6.25901 13.491 3.125 9.625 3.125C5.75901 3.125 2.625 6.25901 2.625 10.125C2.625 13.991 5.75901 17.125 9.625 17.125Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M18.375 18.875L14.875 15.375" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <input className="daf-search-input" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                        </div>
                                        <div className="daf-list">
                                            {filteredCoins.length === 0 && <div className="daf-list-empty">No results found</div>}
                                            {filteredCoins.map(c => (
                                                <div key={c.id} className={`daf-item${selectedCoin?.id === c.id ? ' selected' : ''}`} onClick={() => handleCoinSelect(c)}>
                                                    <div className="daf-item-left">
                                                        <CryptoImg crypto={c} size={21} />
                                                        <span className="daf-item-name">{c.name}</span>
                                                        <span className="daf-item-ticker">{c.symbol}</span>
                                                    </div>
                                                    {selectedCoin?.id === c.id && <div className="daf-item-badge">Selected</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {hasNetworks && (
                            <div className="daf-network-section">
                                <div className="daf-network-label">2. Select Network</div>
                                <div className="daf-network-buttons">
                                    {(selectedCoin?.networks || []).map(net => (
                                        <button
                                            key={net.id}
                                            className={`daf-network-btn${selectedNetwork === net.id ? ' active' : ''}`}
                                            onClick={() => setSelectedNetwork(net.id)}
                                        >
                                            {net.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            )}

                            <div className="daf-panel">
                                <div>
                                    <div className="daf-payment-label">{hasNetworks ? '3' : '2'}. Enter Wallet Address</div>
                                    <div className="daf-address-bar">
                                        <div className="daf-address-input-wrap">
                                            <input
                                                className="daf-address-input"
                                                placeholder="Enter the recipient's wallet address"
                                                value={walletAddress}
                                                onChange={e => setWalletAddress(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="daf-network-section">
                                        <div className="daf-payment-label">
                                            {hasNetworks ? '4' : '3'}. Type a Comment <span className="w-optional">(optional)</span>
                                        </div>
                                        <div className="daf-address-bar">
                                            <div className="daf-address-input-wrap">
                                                <input
                                                    className="daf-address-input"
                                                    placeholder="Comment"
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-amount-section">
                                        <div className="daf-payment-label">
                                            {hasNetworks ? '5' : '4'}. Enter Withdrawal Amount
                                            <div className="w-balance-display">
                                                <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                                                    <path d="m11.94 2.212-2.41 5.61H7.12c-.4 0-.79.03-1.17.11l1-2.4.04-.09.06-.16c.03-.07.05-.13.08-.18 1.16-2.69 2.46-3.53 4.81-2.89ZM18.731 8.09l-.02-.01c-.6-.17-1.21-.26-1.83-.26h-6.26l2.25-5.23.03-.07c.14.05.29.12.44.17l2.21.93c1.23.51 2.09 1.04 2.62 1.68.09.12.17.23.25.36.09.14.16.28.2.43.04.09.07.17.09.26.15.51.16 1.09.02 1.74Z" fill="currentColor" />
                                                    <path d="M18.288 9.52c-.45-.13-.92-.2-1.41-.2h-9.76c-.68 0-1.32.13-1.92.39a4.894 4.894 0 0 0-2.96 4.49v1.95c0 .24.02.47.05.71.22 3.18 1.92 4.88 5.1 5.09.23.03.46.05.71.05h7.8c3.7 0 5.65-1.76 5.84-5.26.01-.19.02-.39.02-.59V14.2a4.9 4.9 0 0 0-3.47-4.68Zm-5.01 5.98c.46.16 1.08.5 1.08 1.56 0 .91-.71 1.64-1.59 1.64h-.25v.22c0 .29-.23.52-.52.52-.29 0-.52-.23-.52-.52v-.22h-.09c-.96 0-1.75-.81-1.75-1.81 0-.29.23-.52.52-.52.29 0 .52.23.52.52 0 .42.32.77.71.77h.09v-1.69l-.76-.27c-.46-.16-1.08-.5-1.08-1.56 0-.91.71-1.64 1.59-1.64h.25v-.22c0-.29.23-.52.52-.52.29 0 .52.23.52.52v.22h.09c.96 0 1.75.81 1.75 1.81 0 .29-.23.52-.52.52-.29 0-.52-.23-.52-.52 0-.42-.32-.77-.71-.77h-.09v1.69l.76.27Z" fill="currentColor" />
                                                    <path d="M10.68 14.14c0 .42.12.48.38.58l.42.15v-1.33h-.25c-.31 0-.55.27-.55.6Z" fill="currentColor" />
                                                </svg>
                                                <span>{activeFiat.symbol}{balInt}<span className="w-balance-dec">.{balDec}</span></span>
                                            </div>
                                        </div>
                                        <div className="w-amount-row">
                                            <div className="daf-address-bar w-amount-bar">
                                                <div className="daf-address-input-wrap">
                                                    <input
                                                        className="daf-address-input w-amount-input"
                                                        placeholder="100"
                                                        value={amount}
                                                        onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                                    />
                                                    <span className="w-amount-suffix">{activeFiat.symbol}</span>
                                                </div>
                                            </div>
                                            <button className="w-max-btn" onClick={handleMax}>Max</button>
                                        </div>
                                    </div>

                                    <button className="w-submit" onClick={handleWithdraw}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                            <path d="m 11.94 2.212 l -2.41 5.61 H 7.12 c -0.4 0 -0.79 0.03 -1.17 0.11 l 1 -2.4 l 0.04 -0.09 l 0.06 -0.16 c 0.03 -0.07 0.05 -0.13 0.08 -0.18 c 1.16 -2.69 2.46 -3.53 4.81 -2.89 Z M 18.731 8.09 l -0.02 -0.01 c -0.6 -0.17 -1.21 -0.26 -1.83 -0.26 h -6.26 l 2.25 -5.23 l 0.03 -0.07 c 0.14 0.05 0.29 0.12 0.44 0.17 l 2.21 0.93 c 1.23 0.51 2.09 1.04 2.62 1.68 c 0.09 0.12 0.17 0.23 0.25 0.36 c 0.09 0.14 0.16 0.28 0.2 0.43 c 0.04 0.09 0.07 0.17 0.09 0.26 c 0.15 0.51 0.16 1.09 0.02 1.74 Z M 18.288 9.52 c -0.45 -0.13 -0.92 -0.2 -1.41 -0.2 h -9.76 c -0.68 0 -1.32 0.13 -1.92 0.39 a 4.894 4.894 0 0 0 -2.96 4.49 v 1.95 c 0 0.24 0.02 0.47 0.05 0.71 c 0.22 3.18 1.92 4.88 5.1 5.09 c 0.23 0.03 0.46 0.05 0.71 0.05 h 7.8 c 3.7 0 5.65 -1.76 5.84 -5.26 c 0.01 -0.19 0.02 -0.39 0.02 -0.59 V 14.2 a 4.9 4.9 0 0 0 -3.47 -4.68 Z m -3.79 7.23 h -5 c -0.41 0 -0.75 -0.34 -0.75 -0.75 s 0.34 -0.75 0.75 -0.75 h 5 c 0.41 0 0.75 0.34 0.75 0.75 s -0.34 0.75 -0.75 0.75 Z" fill="currentColor" />
                                        </svg>
                                        <span>Withdraw {selectedCoin ? selectedCoin.symbol : ''}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <nav className="bottom-nav">
                <NavLink to="/leaderboard" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
                    <img src="/images/leaderboardicon.svg" alt="" className="bottom-nav-icon" />
                    <span className="bottom-nav-label">Leaderboard</span>
                </NavLink>
                <NavLink to="/" end className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
                    <img src="/images/games.svg" alt="" className="bottom-nav-icon" />
                    <span className="bottom-nav-label">Games</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
                    <img src="/images/user.svg" alt="" className="bottom-nav-icon" />
                    <span className="bottom-nav-label">Profile</span>
                </NavLink>
            </nav>
        </div>
    )
}

export default WithdrawPage
