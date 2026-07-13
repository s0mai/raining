import { useState, useRef, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useWallet } from '../context/WalletContext'
import CryptoImg from './CryptoImg'
import './DepositAddressFlow.css'

export default function DepositAddressFlow({ address, coin, coins, onCoinChange, selectedNetwork: networkProp, onNetworkChange }) {
    const { totalDeposits } = useWallet()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [copied, setCopied] = useState(false)
    const [qrExpanded, setQrExpanded] = useState(false)
    const [internalNetwork, setInternalNetwork] = useState(coin?.networks?.[0]?.id || null)
    const dropdownRef = useRef(null)

    const selectedNetwork = networkProp !== undefined ? networkProp : internalNetwork

    function handleNetworkChange(netId) {
        if (onNetworkChange) {
            onNetworkChange(netId)
        } else {
            setInternalNetwork(netId)
        }
    }

    useEffect(() => {
        const defaultNet = coin?.networks?.[0]?.id || null
        if (onNetworkChange) {
            onNetworkChange(defaultNet)
        } else {
            setInternalNetwork(defaultNet)
        }
    }, [coin])

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

    const filteredCoins = coins.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )

    function handleCopy() {
        if (!address) return
        navigator.clipboard.writeText(address).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const hasNetworks = coin?.networks?.length > 1

    return (
        <div className="deposit-address-flow">
            <div className="daf-card">
                <div className="daf-column daf-column-connected">
                    <h2 className="daf-section-title">
                        1. Select Crypto to Deposit
                        {totalDeposits === 0 && <span className="daf-bonus-tag">+100%</span>}
                    </h2>
                    <div className="daf-dropdown" ref={dropdownRef}>
                        <button
                            className="daf-dropdown-trigger"
                            onClick={() => setDropdownOpen(p => !p)}
                        >
                            {coin ? (
                                <div className="daf-dropdown-selected">
                                    <CryptoImg crypto={coin} size={21} />
                                    <span className="daf-coin-name">{coin.name}</span>
                                    <span className="daf-coin-ticker">{coin.symbol}</span>
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
                                        <path d="M9.625 17.125C13.491 17.125 16.625 13.991 16.625 10.125C16.625 6.25901 13.491 3.125 9.625 3.125C5.75901 3.125 2.625 6.25901 2.625 10.125C2.625 13.991 5.75901 17.125 9.625 17.125Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M18.375 18.875L14.875 15.375" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                     <input className="daf-search-input" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                </div>
                                <div className="daf-list">
                                    {filteredCoins.length === 0 && <div className="daf-list-empty">No results found</div>}
                                    {filteredCoins.map(c => (
                                        <div
                                            key={c.id}
                                            className={`daf-item${coin?.id === c.id ? ' selected' : ''}`}
                                            onClick={() => { onCoinChange?.(c); setDropdownOpen(false); setSearchQuery('') }}
                                        >
                                            <div className="daf-item-left">
                                                <CryptoImg crypto={c} size={21} />
                                                <span className="daf-item-name">{c.name}</span>
                                                <span className="daf-item-ticker">{c.symbol}</span>
                                            </div>
                                            {coin?.id === c.id && <div className="daf-item-badge">Selected</div>}
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
                            {(coin?.networks || []).map(net => (
                                <button
                                    key={net.id}
                                    className={`daf-network-btn${selectedNetwork === net.id ? ' active' : ''}`}
                                    onClick={() => handleNetworkChange(net.id)}
                                >
                                    {net.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    )}

                    <div className="daf-panel">
                        <div>
                            <div className="daf-payment-label">{hasNetworks ? '3' : '2'}. Make Payment to your {coin ? coin.symbol : '...'} address</div>

                            <div className="daf-address-bar">
                                <div className="daf-address-input-wrap">
                                    <input
                                        type="text"
                                        readOnly
                                        value={address || ''}
                                        className="daf-address-input"
                                        placeholder="No address available"
                                    />
                                </div>
                                <button
                                    className="daf-copy-btn"
                                    onClick={handleCopy}
                                    disabled={!address}
                                    title="Copy address"
                                >
                                    <div className={`daf-tooltip${copied ? ' visible' : ''}`}>
                                        <div className="daf-tooltip-inner">Copied!</div>
                                        <svg className="daf-tooltip-arrow" width="19" height="10" viewBox="0 0 19 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.7 8.93333C9.1 9.46667 9.9 9.46667 10.3 8.93333L17.3 -0.4C17.7944 -1.05924 17.324 -2 16.5 -2H2.5C1.67595 -2 1.20557 -1.05924 1.7 -0.4L8.7 8.93333Z" fill="currentColor" />
                                        </svg>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none">
                                        <path d="M16 12.9v4.2c0 3.5-1.4 4.9-4.9 4.9H6.9C3.4 22 2 20.6 2 17.1v-4.2C2 9.4 3.4 8 6.9 8h4.2c3.5 0 4.9 1.4 4.9 4.9Z" fill="currentColor" />
                                        <path d="M17.1 2h-4.2C9.817 2 8.37 3.094 8.07 5.739c-.064.553.395 1.011.952 1.011H11.1c4.2 0 6.15 1.95 6.15 6.15v2.078c0 .557.457 1.015 1.01.952C20.907 15.63 22 14.183 22 11.1V6.9C22 3.4 20.6 2 17.1 2Z" fill="currentColor" />
                                    </svg>
                                </button>
                            </div>

                            <div className="daf-qr-toggle-section">
                                <div className="daf-qr-toggle-title">QR Code</div>
                                <div className={`daf-qr-toggle-btn${qrExpanded ? ' open' : ''}`}>
                                    <button className="daf-qr-toggle-btn-inner" onClick={() => setQrExpanded(p => !p)}>
                                        <span>{qrExpanded ? 'Hide QR Code' : 'Show QR Code'}</span>
                                        <svg className={`daf-qr-toggle-chevron${qrExpanded ? ' open' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11 1.5L6 6.5L1 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                                {qrExpanded && (
                                    <div className="daf-qr-toggle-body">
                                        <div className="daf-qr-area">
                                            <div className={`daf-qr-box${address ? ' has-qr' : ''}`}>
                                                {address ? (
                                                    <QRCodeSVG
                                                        value={address}
                                                        size={108}
                                                        bgColor="#ffffff"
                                                        fgColor="#000000"
                                                        level="H"
                                                        includeMargin={false}
                                                    />
                                                ) : (
                                                    <div style={{ width: 108, height: 108, background: 'var(--bg-secondary)', borderRadius: 10 }} />
                                                )}
                                            </div>
                                        </div>
                                        {coin && (
                                            <div className="daf-qr-toggle-footer">
                                                <div className="daf-panel-coin">
                                                    <CryptoImg crypto={coin} size={21} />
                                                    <span>{coin.name}</span>
                                                    <span className="daf-coin-ticker">{coin.symbol}</span>
                                                </div>
                                                <div className="daf-selected-badge">Selected</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="daf-info-panel">
                            <div className="daf-info-row">
                                <span>Network</span>
                                <span className="daf-info-row-value">
                                    {coin ? (coin.networks?.find(n => n.id === selectedNetwork)?.name || coin.symbol) : '...'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
