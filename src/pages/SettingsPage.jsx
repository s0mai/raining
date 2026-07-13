import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import Header from '../components/Header'
import './DepositPage.css'
import './SettingsPage.css'

const LANG_COUNTRY = {
    en: 'US', hi: 'IN', ru: 'RU', id: 'ID', ur: 'PK', pt: 'PT',
    ar: 'SA', de: 'DE', fr: 'FR', es: 'ES', uz: 'UZ', fa: 'IR',
    kk: 'KZ', uk: 'UA', fil: 'PH',
}

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ru', label: 'Русский' },
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'ur', label: 'اردو' },
    { code: 'pt', label: 'Português' },
    { code: 'ar', label: 'العربية' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'uz', label: 'Oʻzbek' },
    { code: 'fa', label: 'فارسی' },
    { code: 'kk', label: 'Қазақ' },
    { code: 'uk', label: 'Українська' },
    { code: 'fil', label: 'Filipino' },
]

const FIAT_FLAGS = {
    USD: 'US', EUR: 'EU', GBP: 'GB', JPY: 'JP', CAD: 'CA',
    AUD: 'AU', BRL: 'BR', RUB: 'RU', INR: 'IN', IDR: 'ID',
    UZS: 'UZ', UAH: 'UA', PHP: 'PH', PKR: 'PK', IRR: 'IR',
    AFN: 'AF', KZT: 'KZ', TRY: 'TR',
}

function flagImg(countryCode) {
    return `/images/flags/circle-flags-gh-pages/flags/${countryCode.toLowerCase()}.svg`
}

function fiatFlagImg(code) {
    const cc = FIAT_FLAGS[code]
    return cc ? flagImg(cc) : flagImg('US')
}

export default function SettingsPage() {
    const { activeLang, setActiveLang, activeFiat, setActiveFiat, FIATS, t } = useWallet()
    const [langOpen, setLangOpen] = useState(false)
    const [fiatOpen, setFiatOpen] = useState(false)
    const langRef = useRef(null)
    const fiatRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        function handleClick(e) {
            if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
            if (fiatRef.current && !fiatRef.current.contains(e.target)) setFiatOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <div className="settings-page">
            <Header />
            <div className="deposit-nav-scroll" style={{ width: '100%', maxWidth: 400, margin: '0 auto', alignSelf: 'stretch' }}>
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
                <button className="dn-item" onClick={() => navigate('/withdraw')}>
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
                <button className="dn-item active" onClick={() => navigate('/settings')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M10.825 22q-.675 0-1.162-.45t-.588-1.1L8.85 18.8q-.325-.125-.612-.3t-.563-.375l-1.55.65q-.625.275-1.25.05t-.975-.8l-1.175-2.05q-.35-.575-.2-1.225t.675-1.075l1.325-1Q4.5 12.5 4.5 12.337v-.675q0-.162.025-.337l-1.325-1Q2.675 9.9 2.525 9.25t.2-1.225L3.9 5.975q.35-.575.975-.8t1.25.05l1.55.65q.275-.2.575-.375t.6-.3l.225-1.65q.1-.65.588-1.1T10.825 2h2.35q.675 0 1.163.45t.587 1.1l.225 1.65q.325.125.613.3t.562.375l1.55-.65q.625-.275 1.25-.05t.975.8l1.175 2.05q.35.575.2 1.225t-.675 1.075l-1.325 1q.025.175.025.338v.674q0 .163-.05.338l1.325 1q.525.425.675 1.075t-.2 1.225l-1.2 2.05q-.35.575-.975.8t-1.25-.05l-1.5-.65q-.275.2-.575.375t-.6.3l-.225 1.65q-.1.65-.587 1.1t-1.163.45zM12.05 15.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5" />
                    </svg>
                    <span>Settings</span>
                </button>
                <button className="dn-item" onClick={() => navigate('/affiliate')}>
                    <svg width="18" height="18" viewBox="0 0 30 30" fill="none">
                        <path d="M 24.5643 9.483 C 23.7293 9.48364 22.9237 9.77896 22.3019 10.3125 C 21.6801 10.8459 21.2857 11.5802 21.1941 12.3746 L 21.1925 12.3893 L 18.5665 13.062 C 18.1925 12.5987 17.692 12.2433 17.1202 12.0351 L 17.0971 12.0281 V 9.28704 C 18.3674 8.79636 19.2473 7.62605 19.2473 6.25822 C 19.2473 4.45881 17.7239 3 15.843 3 C 14.9402 3.00021 14.0745 3.34357 13.4362 3.95459 C 12.798 4.5656 12.4394 5.39422 12.4394 6.25822 C 12.4392 6.90739 12.6416 7.54182 13.0207 8.08016 C 13.3997 8.61849 13.9382 9.03618 14.5669 9.27966 L 14.5893 9.28743 V 11.9457 C 14.3035 12.0506 14.0354 12.1951 13.7934 12.3746 L 13.8007 12.3691 L 8.80794 9.76295 C 8.81318 9.66762 8.81318 9.5721 8.80794 9.47678 V 9.48378 C 8.80794 7.68398 7.2845 6.22556 5.40397 6.22556 C 4.50114 6.22566 3.63533 6.56898 2.99697 7.18001 C 2.35862 7.79103 2 8.61971 2 9.48378 C 2.00011 10.3478 2.35883 11.1765 2.99726 11.7874 C 3.63569 12.3984 4.50155 12.7416 5.40438 12.7416 C 6.23782 12.7416 7.04082 12.4418 7.65419 11.9018 L 7.65175 11.9037 L 12.4926 14.4582 C 12.4759 14.6413 12.4762 14.8254 12.4934 15.0084 L 12.4926 14.9967 C 12.4931 15.4341 12.5842 15.867 12.7608 16.2704 L 12.7522 16.2487 L 8.96962 19.7647 C 8.53371 19.5682 8.05803 19.4657 7.57619 19.4645 H 7.57538 L 7.51038 19.4637 C 7.06194 19.4637 6.61789 19.5483 6.2036 19.7125 C 5.7893 19.8768 5.41287 20.1175 5.09579 20.421 C 4.77872 20.7245 4.52722 21.0848 4.35564 21.4814 C 4.18407 21.8779 4.09579 22.3029 4.09584 22.7321 C 4.09584 23.1612 4.18418 23.5862 4.3558 23.9827 C 4.52742 24.3792 4.77897 24.7395 5.09608 25.043 C 5.41319 25.3464 5.78966 25.5871 6.20397 25.7514 C 6.61829 25.9156 7.06234 26 7.51078 26 C 7.95918 26 8.4032 25.9155 8.81747 25.7512 C 9.23174 25.587 9.60815 25.3463 9.92522 25.0428 C 10.2423 24.7394 10.4938 24.3791 10.6654 23.9826 C 10.837 23.5862 10.9253 23.1612 10.9253 22.7321 C 10.9394 22.2853 10.8521 21.8409 10.6694 21.4295 L 10.6775 21.4498 L 14.4597 17.9334 C 14.8945 18.1252 15.3678 18.2239 15.8466 18.2227 H 15.8547 C 16.7575 18.2226 17.6234 17.8793 18.2618 17.2682 C 18.9002 16.6572 19.2589 15.8285 19.2589 14.9644 C 19.2822 14.5278 19.2054 14.0924 19.0341 13.6841 Z" />
                    </svg>
                    <span>Affiliate Program</span>
                </button>
            </div>

            <div className="settings-sections">
                <div className="settings-section">
                    <h2 className="settings-section-title">Language</h2>
                    <p className="settings-section-desc">Choose your preferred language</p>
                    <div className="settings-select-wrapper" ref={langRef}>
                        <div
                            className="settings-select"
                            onClick={() => { setLangOpen(!langOpen); setFiatOpen(false) }}
                        >
                            <span className="settings-select-left">
                                <img src={flagImg(LANG_COUNTRY[activeLang] || 'US')} alt="" className="settings-flag" />
                                <span>{(LANGUAGES.find(l => l.code === activeLang) || {}).label || activeLang}</span>
                            </span>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                        {langOpen && (
                            <div className="settings-dropdown">
                                {LANGUAGES.map(l => (
                                    <div
                                        key={l.code}
                                        className={`settings-dropdown-item ${l.code === activeLang ? 'active' : ''}`}
                                        onClick={() => { setActiveLang(l.code); setLangOpen(false) }}
                                    >
                                        <img src={flagImg(LANG_COUNTRY[l.code] || 'US')} alt="" className="settings-flag" />
                                        <span>{l.label}</span>
                                        {l.code === activeLang && (
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="settings-check">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="settings-section">
                    <h2 className="settings-section-title">Currency</h2>
                    <p className="settings-section-desc">Choose your preferred fiat currency</p>
                    <div className="settings-select-wrapper" ref={fiatRef}>
                        <div
                            className="settings-select"
                            onClick={() => { setFiatOpen(!fiatOpen); setLangOpen(false) }}
                        >
                            <span className="settings-select-left">
                                <img src={fiatFlagImg(activeFiat.code)} alt="" className="settings-flag" />
                                <span>{activeFiat.label} ({activeFiat.symbol})</span>
                            </span>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: fiatOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                        {fiatOpen && (
                            <div className="settings-dropdown">
                                {FIATS.map(f => (
                                    <div
                                        key={f.code}
                                        className={`settings-dropdown-item ${f.code === activeFiat.code ? 'active' : ''}`}
                                        onClick={() => { setActiveFiat(f.code); setFiatOpen(false) }}
                                    >
                                        <img src={fiatFlagImg(f.code)} alt="" className="settings-flag" />
                                        <span>{f.label} ({f.symbol})</span>
                                        {f.code === activeFiat.code && (
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="settings-check">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
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
