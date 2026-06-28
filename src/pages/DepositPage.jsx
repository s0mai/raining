import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { useWallet } from '../context/WalletContext'
import { useUserId } from '../context/UserContext'
import CryptoImg from '../components/CryptoImg'
import { cryptos } from '../data/cryptos'
import './DepositPage.css'

const COINGECKO_IDS = { btc: 'bitcoin', eth: 'ethereum', ton: 'the-open-network', ltc: 'litecoin', sol: 'solana', usdt: 'tether' }
const API_BASE = import.meta.env.VITE_API_URL || ''
const IS_DEV = import.meta.env.DEV
const PLATFORM_TON_WALLET = 'UQBbY_WYNPKoxPEplMIc6i_q_iJXzs4hpYU8G2WqYvZCr93W'

function DepositPage() {
    const { balance, balances, totalBalance, activeCurrency, updateBalance, syncBalance, showToast, addTransaction, deposit, setBalances, t } = useWallet()
    const { userId } = useUserId()
    const [tonConnectUI] = useTonConnectUI()
    const [selectedCrypto, setSelectedCrypto] = useState(null)
    const [activeTab, setActiveTab] = useState('deposit')
    const [copied, setCopied] = useState(false)
    const [withdrawAddress, setWithdrawAddress] = useState('')
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [withdrawError, setWithdrawError] = useState({})
    const [depositInfo, setDepositInfo] = useState(null)
    const [depositLoading, setDepositLoading] = useState(false)
    const [depositError, setDepositError] = useState('')
    const [tonConfirming, setTonConfirming] = useState(false)
    const [prices, setPrices] = useState({})
    const [depositUsd, setDepositUsd] = useState('')
    const [depositAmount, setDepositAmount] = useState('')
    const [bonusPopup, setBonusPopup] = useState(null)
    const prevBalRef = useRef(null)
    const bonusClaimedRef = useRef(false)

    useEffect(() => {
        if (userId && userId !== 'dev_user') {
            syncBalance(userId)
        }
    }, [userId])

    useEffect(() => {
        const FALLBACK_PRICES = { btc: 67000, eth: 3400, ton: 6.5, ltc: 85, sol: 140, usdt: 1 }
        setPrices(FALLBACK_PRICES)

        function fetchPrices() {
            const ids = Object.values(COINGECKO_IDS).join(',')
            fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
                .then(r => r.json())
                .then(data => {
                    const mapped = {}
                    let valid = true
                    for (const [key, val] of Object.entries(COINGECKO_IDS)) {
                        const p = data[val]?.usd
                        if (p) mapped[key] = p
                        else valid = false
                    }
                    if (valid) setPrices(mapped)
                })
                .catch(() => {})
        }

        fetchPrices()
        const interval = setInterval(fetchPrices, 60000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!selectedCrypto) {
            setDepositInfo(null)
            setDepositLoading(false)
            setDepositError('')
            setTonConfirming(false)
            setDepositUsd('')
        }
    }, [selectedCrypto])

    // Poll balance when a deposit address is shown and apply 100% bonus
    useEffect(() => {
        if (!depositInfo || depositInfo.status === 'finished' || depositInfo.status === 'expired') return
        const coin = selectedCrypto?.id
        prevBalRef.current = balances[coin] || 0
        bonusClaimedRef.current = false

        const interval = setInterval(async () => {
            if (!userId || userId === 'dev_user' || !coin) return
            try {
                const resp = await fetch(`${API_BASE}/api/balance?userId=${userId}`)
                if (resp.ok) {
                    const data = await resp.json()
                    if (data.balances) {
                        const newCoinBal = data.balances[coin] || 0
                        const prevCoinBal = prevBalRef.current
                        if (newCoinBal > prevCoinBal && !bonusClaimedRef.current) {
                            const diff = newCoinBal - prevCoinBal
                            bonusClaimedRef.current = true
                            setBonusPopup({ amount: diff, coin })
                            deposit(diff, coin)
                            showToast('win', '100% Deposit Bonus!', `+${diff.toFixed(2)} bonus credited`, 6000)
                        }
                        prevBalRef.current = newCoinBal
                        setBalances(data.balances)
                    }
                }
            } catch (e) { /* ignore */ }
        }, 5000)
        return () => clearInterval(interval)
    }, [depositInfo?.status, selectedCrypto?.id])

    const estimatedCrypto = selectedCrypto && prices[selectedCrypto.id] && depositUsd
        ? parseFloat(depositUsd) / prices[selectedCrypto.id]
        : null

    function handleUsdChange(val) {
        setDepositUsd(val)
        if (selectedCrypto && selectedCrypto.id === 'ton') {
            const tonVal = parseFloat(val) / (prices.ton || 0)
            setDepositAmount(tonVal ? tonVal.toFixed(6) : '')
        }
    }

    async function handleInitiateDeposit() {
        if (!selectedCrypto) return
        setDepositLoading(true)
        setDepositError('')
        setDepositInfo(null)

        if (IS_DEV) {
            setDepositError('Deposits require the Vercel backend deployment. Use https://raining-one.vercel.app to test deposits.')
            setDepositLoading(false)
            return
        }

        try {
            if (selectedCrypto.id === 'ton') {
                if (!tonConnectUI.connected) {
                    await tonConnectUI.openModal()
                    setDepositLoading(false)
                    return
                }
                const amount = parseFloat(depositAmount)
                if (isNaN(amount) || amount <= 0) {
                    throw new Error('Enter a valid amount')
                }
                const tx = {
                    validUntil: Math.floor(Date.now() / 1000) + 600,
                    messages: [
                        {
                            address: await fetchPlatformTonAddress(),
                            amount: (amount * 1e9).toString(),
                        },
                    ],
                }
                await tonConnectUI.sendTransaction(tx)
                setTonConfirming(true)
                setDepositInfo({ status: 'confirming', message: 'Transaction sent. Waiting for confirmation...' })
                trackTonTransaction(userId, amount)
            } else {
                const resp = await fetch(`${API_BASE}/api/create-deposit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        currency: selectedCrypto.id,
                        amount: depositUsd || undefined,
                    }),
                })
                const data = await resp.json()
                if (!resp.ok) {
                    throw new Error(data.error || 'Failed to create deposit')
                }
                setDepositInfo({
                    status: data.status || 'waiting',
                    address: data.address,
                    pay_amount: data.pay_amount,
                    pay_currency: data.pay_currency,
                    price_amount: data.price_amount,
                    payment_id: data.payment_id,
                    invoice_url: data.invoice_url,
                })
            }
        } catch (e) {
            setDepositError(e.message || 'Failed to initiate deposit')
        } finally {
            setDepositLoading(false)
        }
    }

    async function fetchPlatformTonAddress() {
        try {
            const resp = await fetch(`${API_BASE}/api/connect-ton`)
            const data = await resp.json()
            return data.address || PLATFORM_TON_WALLET
        } catch {
            return PLATFORM_TON_WALLET
        }
    }

    async function trackTonTransaction(userId, expectedAmount) {
        try {
            const resp = await fetch(`${API_BASE}/api/track-ton`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, expectedAmount }),
            })
            const data = await resp.json()
            if (data.confirmed) {
                syncBalance(userId)
                showToast('win', 'Deposit Confirmed', `+${data.amount} TON`, 5000)
            }
        } catch (e) {
            console.error('Failed to track TON tx:', e)
        }
    }

    function openModal(crypto) {
        setSelectedCrypto(crypto)
        setActiveTab('deposit')
        setCopied(false)
        setWithdrawAddress('')
        setWithdrawAmount('')
        setWithdrawError({})
        setDepositAmount('')
        setDepositUsd('')
        setDepositInfo(null)
        setDepositError('')
        setTonConfirming(false)
    }

    function handleCopy(text) {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    function handleWithdraw() {
        if (IS_DEV) {
            setWithdrawError({ address: 'Withdrawals require the Vercel backend. Use https://raining-one.vercel.app' })
            return
        }
        const errors = {}
        if (!withdrawAddress.trim()) {
            errors.address = t('deposit.address_empty')
        }
        const coinBalance = balances[selectedCrypto?.id] || 0
        const amount = parseFloat(withdrawAmount)
        if (isNaN(amount) || amount <= 0) {
            errors.amount = t('deposit.invalid_amount')
        } else if (amount > coinBalance) {
            errors.amount = t('deposit.exceeds_balance')
        }
        if (Object.keys(errors).length > 0) {
            setWithdrawError(errors)
            return
        }
        updateBalance(coinBalance - amount)
        addTransaction('withdraw', -amount, selectedCrypto.id)
        setSelectedCrypto(null)
        setWithdrawAddress('')
        setWithdrawAmount('')
        setWithdrawError({})
        showToast('win', 'Withdrawal Submitted', `-$${amount.toFixed(2)} ${selectedCrypto.symbol}`, 3000)
    }

    return (
        <div className="deposit-page">
            <div className="deposit-header">
                <Link to="/" className="deposit-back">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </Link>
                <h1>{t('deposit.title')}</h1>
            </div>
            <div className="deposit-balance">
                <span className="deposit-balance-label">{selectedCrypto ? `${selectedCrypto.name} ${t('deposit.balance')}` : t('deposit.total_balance')}</span>
                <span className="deposit-balance-amount">${selectedCrypto ? (balances[selectedCrypto.id] || 0).toFixed(2) : totalBalance.toFixed(2)}</span>
            </div>
            {!selectedCrypto && (
                <div className="deposit-bonus-banner">
                    <div className="deposit-bonus-banner-glow" />
                    <div className="deposit-bonus-banner-content">
                        <div className="deposit-bonus-banner-left">
                            <span className="deposit-bonus-banner-badge">100% BONUS</span>
                            <span className="deposit-bonus-banner-text">First deposit doubled!</span>
                        </div>
                        <span className="deposit-bonus-banner-arrow">→</span>
                    </div>
                </div>
            )}
            <div className="deposit-crypto-list">
                {cryptos.map(crypto => (
                    <div key={crypto.id} className="deposit-crypto-item" onClick={() => openModal(crypto)}>
                        <CryptoImg crypto={crypto} size={40} className="crypto-icon" />
                        <div className="deposit-crypto-info">
                            <span className="deposit-crypto-name">{crypto.name}</span>
                            <span className="deposit-crypto-symbol">{crypto.symbol}</span>
                        </div>
                        <span className="deposit-crypto-balance">${(balances[crypto.id] || 0).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {selectedCrypto && (
                <div className="deposit-modal-overlay" onClick={() => setSelectedCrypto(null)}>
                    <div className="deposit-modal" onClick={e => e.stopPropagation()}>
                        <div className="deposit-modal-header">
                            <div className="deposit-modal-crypto">
                                <CryptoImg crypto={selectedCrypto} size={28} className="crypto-icon" />
                                <span>{selectedCrypto.name} ({selectedCrypto.symbol})</span>
                            </div>
                            <button className="deposit-modal-close" onClick={() => setSelectedCrypto(null)}>✕</button>
                        </div>

                        <div className="deposit-tabs">
                            <button
                                className={`deposit-tab${activeTab === 'deposit' ? ' active' : ''}`}
                                onClick={() => setActiveTab('deposit')}
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                                </svg>
                                {t('deposit.tab_deposit')}
                            </button>
                            <button
                                className={`deposit-tab${activeTab === 'withdraw' ? ' active' : ''}`}
                                onClick={() => setActiveTab('withdraw')}
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5" />
                                    <polyline points="5 12 12 5 19 12" />
                                    <polyline points="2 19 22 19" />
                                </svg>
                                {t('deposit.tab_withdraw')}
                            </button>
                        </div>

                        {activeTab === 'deposit' && (
                            <div className="deposit-tab-content">
                                {!depositInfo && !tonConfirming && (
                                    <>
                                        <div className="deposit-box">
                                            <div className="deposit-amount-field">
                                                <label className="withdraw-label">{t('deposit.amount_usd')}</label>
                                                <div className="withdraw-amount-row">
                                                    <input
                                                        type="number"
                                                        className="withdraw-input"
                                                        placeholder={t('deposit.placeholder_amount')}
                                                        value={depositUsd}
                                                        onChange={e => handleUsdChange(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            {estimatedCrypto !== null && prices[selectedCrypto.id] > 0 && (
                                                <div className="deposit-estimate-row">
                                                    <span className="deposit-info-label">{t('deposit.estimated')} {selectedCrypto.symbol}</span>
                                                    <span className="deposit-estimate-value">~{estimatedCrypto.toFixed(6)}</span>
                                                </div>
                                            )}
                                            {selectedCrypto.id === 'ton' && (
                                                <div className="deposit-amount-field" style={{ marginTop: 8 }}>
                                                    <label className="withdraw-label">{t('deposit.enter_ton')}</label>
                                                    <input
                                                        type="number"
                                                        className="withdraw-input"
                                                        placeholder={t('deposit.placeholder_amount')}
                                                        value={depositAmount}
                                                        onChange={e => setDepositAmount(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className="deposit-action-btn"
                                            onClick={handleInitiateDeposit}
                                            disabled={depositLoading}
                                        >
                                            {depositLoading ? t('deposit.creating') : selectedCrypto.id === 'ton' ? (tonConnectUI.connected ? t('deposit.send_ton') : t('deposit.connect_wallet')) : t('deposit.generate_address')}
                                        </button>
                                        {depositError && <p className="deposit-error-msg">{depositError}</p>}
                                    </>
                                )}

                                {depositInfo && depositInfo.status !== 'finished' && depositInfo.status !== 'expired' && (
                                    <>
                                        {depositInfo.invoice_url && (
                                            <iframe
                                                src={depositInfo.invoice_url.replace(/\/\?/, '?')}
                                                className="deposit-iframe"
                                                title="NowPayments Payment"
                                                allow="payment"
                                            />
                                        )}
                                        {depositInfo.address ? (
                                            <>
                                                <div className="deposit-qr-container">
                                                    <QRCodeSVG
                                                        value={depositInfo.address}
                                                        size={140}
                                                        bgColor="#ffffff"
                                                        fgColor="#000000"
                                                        level="M"
                                                        includeMargin={false}
                                                        style={{ borderRadius: 8 }}
                                                    />
                                                </div>
                                                {depositInfo.pay_amount && (
                                                    <div className="deposit-info-row">
                                                        <span className="deposit-info-label">{t('deposit.send_exactly')}</span>
                                                        <span className="deposit-info-value">{depositInfo.pay_amount} {depositInfo.pay_currency}</span>
                                                    </div>
                                                )}
                                                {depositInfo.price_amount && (
                                                    <div className="deposit-info-row">
                                                        <span className="deposit-info-label">{t('deposit.value')}</span>
                                                        <span className="deposit-info-value">~${depositInfo.price_amount} USD</span>
                                                    </div>
                                                )}
                                                <div className="deposit-address-row">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={depositInfo.address}
                                                        className="deposit-address-input"
                                                    />
                                                    <button className="deposit-copy-btn" onClick={() => handleCopy(depositInfo.address)}>
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
                                                        <span>{copied ? t('deposit.copied') : t('deposit.copy')}</span>
                                                    </button>
                                                </div>
                                                <p className="deposit-address-hint">
                                                    Send only <strong>{depositInfo.pay_currency}</strong> to this address.
                                                </p>
                                            </>
                                        ) : (
                                            <p className="deposit-address-hint" style={{ textAlign: 'center', marginTop: 8 }}>
                                                Open the payment page above to complete your deposit.
                                            </p>
                                        )}
                                    </>
                                )}

                                {tonConfirming && (
                                    <div className="deposit-confirming">
                                        <div className="deposit-spinner" />
                                        <p>Transaction sent. Waiting for confirmation...</p>
                                        <p className="deposit-address-hint">Balance will update automatically once confirmed.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'withdraw' && (
                            <div className="deposit-tab-content">
                                <div className="deposit-box">
                                    <div className="withdraw-balance-ref">
                                        <span>{t('deposit.available_balance').replace('${symbol}', selectedCrypto.symbol)}</span>
                                        <span className="withdraw-balance-amount">${(balances[selectedCrypto.id] || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="withdraw-field">
                                        <label className="withdraw-label">{t('deposit.dest_address')}</label>
                                        <input
                                            type="text"
                                            className={`withdraw-input${withdrawError.address ? ' error' : ''}`}
                                            placeholder={t('deposit.enter_address').replace('${symbol}', selectedCrypto.symbol)}
                                            value={withdrawAddress}
                                            onChange={e => { setWithdrawAddress(e.target.value); setWithdrawError({ ...withdrawError, address: null }) }}
                                        />
                                        {withdrawError.address && <span className="withdraw-error-msg">{withdrawError.address}</span>}
                                    </div>
                                    <div className="withdraw-field">
                                        <label className="withdraw-label">{t('deposit.amount')}</label>
                                        <div className="withdraw-amount-row">
                                            <input
                                                type="number"
                                                className={`withdraw-input${withdrawError.amount ? ' error' : ''}`}
                                                placeholder={t('deposit.placeholder_amount')}
                                                value={withdrawAmount}
                                                onChange={e => { setWithdrawAmount(e.target.value); setWithdrawError({ ...withdrawError, amount: null }) }}
                                            />
                                            <button className="withdraw-max-btn" onClick={() => setWithdrawAmount((balances[selectedCrypto.id] || 0).toString())}>
                                                {t('deposit.max')}
                                            </button>
                                        </div>
                                        {withdrawError.amount && <span className="withdraw-error-msg">{withdrawError.amount}</span>}
                                    </div>
                                </div>
                                <button className="withdraw-confirm-btn" onClick={handleWithdraw}>
                                    {t('deposit.confirm_withdraw')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {bonusPopup && (
                <div className="deposit-bonus-popup-overlay" onClick={() => setBonusPopup(null)}>
                    <div className="deposit-bonus-popup" onClick={e => e.stopPropagation()}>
                        <div className="deposit-bonus-popup-icon">
                            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>
                        <h2 className="deposit-bonus-popup-title">100% Deposit Bonus!</h2>
                        <p className="deposit-bonus-popup-msg">
                            Your deposit of <strong>${bonusPopup.amount.toFixed(2)}</strong> has been matched!
                        </p>
                        <p className="deposit-bonus-popup-sub">+${bonusPopup.amount.toFixed(2)} bonus credited</p>
                        <button className="deposit-bonus-popup-btn" onClick={() => setBonusPopup(null)}>
                            Let's Play!
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DepositPage
