import { useState, useRef, useEffect } from 'react'
import { Button } from 'antd'
import BetInput from '../BetInput'
import { useWallet } from '../../context/WalletContext'
import ProvablyFair from '../../utils/ProvablyFair'
import GameControls from '../GameControls'
import useSound from '../../hooks/useSound'
import { cryptos } from '../../data/cryptos'
import '../PlinkoGame/Sidebar.css'
import './DiceGame.css'

function DiceGame() {
    const { balance, placeBet, addWinnings, showToast, activeCurrency, activeFiat, t, isLuckBoosted, incrementWinstreak, resetWinstreak, isForceLoss } = useWallet()
    const selectedCrypto = cryptos.find(c => c.id === activeCurrency) || cryptos[0]
    const [betAmount, setBetAmount] = useState(1)
    const [target, setTarget] = useState(50)
    const [rollDirection, setRollDirection] = useState('under')
    const [rolling, setRolling] = useState(false)
    const [result, setResult] = useState(null)
    const [fairnessData, setFairnessData] = useState({ serverSeedHash: '...', clientSeed: '...', nonce: 0 })
    const [clientSeedInput, setClientSeedInput] = useState('')
    const [verifyModal, setVerifyModal] = useState(false)
    const [verifyServerSeed, setVerifyServerSeed] = useState('')
    const [verifyClientSeed, setVerifyClientSeed] = useState('')
    const [verifyNonce, setVerifyNonce] = useState('')
    const [verifyOutput, setVerifyOutput] = useState(null)
    const [verifying, setVerifying] = useState(false)
    const activeBetRef = useRef(0)
    const pfRef = useRef(null)
    const fadeTimerRef = useRef(null)
    const cubeRef = useRef(null)
    const cubeVisibleRef = useRef(false)
    const innerRef = useRef(null)
    const scoreRef = useRef(null)
    const animTimerRef = useRef(null)
    const [editMultiplier, setEditMultiplier] = useState(null)
    const [editWinChance, setEditWinChance] = useState(null)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const sound = useSound(soundEnabled)
    const rollingRef = useRef(false)

    const isUnder = rollDirection === 'under'
    const winChance = isUnder ? target : (99.99 - target)
    const effectiveWinChance = Math.max(0.01, Math.min(99.99, winChance))
    const multiplier = ((100 / effectiveWinChance) * 0.96)

    useEffect(() => {
        const pf = new ProvablyFair()
        pf.waitReady().then(() => {
            pfRef.current = pf
            pf.getFairnessData().then(setFairnessData)
            setClientSeedInput(pf.clientSeed)
        })
        return () => {
            if (activeBetRef.current > 0) {
                addWinnings(activeBetRef.current)
                activeBetRef.current = 0
            }
            if (animTimerRef.current) clearTimeout(animTimerRef.current)
            if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
        }
    }, [addWinnings])

    useEffect(() => {
        setEditMultiplier(null)
        setEditWinChance(null)
    }, [target, rollDirection])

    function refreshFairness() {
        const pf = pfRef.current
        if (pf) pf.getFairnessData().then(setFairnessData)
    }

    function handleDirectionChange(dir) {
        if (rolling) return
        setRollDirection(dir)
        setTarget(prev => 100 - prev)
    }

    function handleSliderChange(val) {
        if (rolling) return
        setTarget(val)
        if (fadeTimerRef.current) {
            clearTimeout(fadeTimerRef.current)
            fadeTimerRef.current = null
        }
    }

    function handleMultiplierInput(val) {
        if (rolling) return
        const parsed = parseFloat(val)
        if (isNaN(parsed) || parsed <= 0) return
        const wc = 100 / (parsed / 0.96)
        const clamped = Math.max(0.01, Math.min(99.99, wc))
        const newTarget = isUnder ? Math.round(clamped) : Math.round(99.99 - clamped)
        setTarget(Math.max(2, Math.min(98, newTarget)))
    }

    function handleRollInput(val) {
        if (rolling) return
        const parsed = parseFloat(val)
        if (isNaN(parsed)) return
        setTarget(Math.max(2, Math.min(98, Math.round(parsed))))
    }

    function handleWinChanceInput(val) {
        if (rolling) return
        const parsed = parseFloat(val)
        if (isNaN(parsed) || parsed <= 0) return
        const clamped = Math.max(0.01, Math.min(99.99, parsed))
        const newTarget = isUnder ? Math.round(clamped) : Math.round(99.99 - clamped)
        setTarget(Math.max(2, Math.min(98, newTarget)))
    }

    async function handleRoll() {
        const cryptoBet = betAmount / activeFiat.rate
        if (rollingRef.current || rolling || betAmount <= 0 || cryptoBet > balance || !pfRef.current || activeBetRef.current > 0) return
        rollingRef.current = true

        if (fadeTimerRef.current) {
            clearTimeout(fadeTimerRef.current)
            fadeTimerRef.current = null
        }
        if (animTimerRef.current) {
            clearTimeout(animTimerRef.current)
            animTimerRef.current = null
        }

        setRolling(true)
        setResult(null)
        placeBet(cryptoBet)
        sound.play('bet')
        sound.play('diceRolling')
        activeBetRef.current = cryptoBet

        const pf = pfRef.current
        const currentNonce = pf.nonce
        const rawResult = await pf.getResult()
        let roll = Math.floor(rawResult * 10000) / 100
        refreshFairness()

        let won = isUnder ? roll < target : roll > target
        if (isLuckBoosted && !won && Math.random() < 0.7) {
            roll = isUnder ? Math.random() * target : target + Math.random() * (100 - target)
            won = true
        }
        if (won && isForceLoss()) {
            roll = isUnder
                ? Math.max(target, Math.floor(Math.random() * (100 - target) + target))
                : Math.floor(Math.random() * target)
            won = false
        }
        const newResult = { roll, won }
        setResult(newResult)

        if (innerRef.current) {
            innerRef.current.classList.remove('popping')
        }
        if (scoreRef.current) {
            scoreRef.current.classList.remove('visible')
        }

        const cube = cubeRef.current
        if (cube) {
                    const cubePos = Math.min(95, Math.max(0, roll))
                    if (cubeVisibleRef.current) {
                                cube.style.transition = 'left 0.6s ease'
                                cube.style.left = cubePos + '%'
                            } else {
                                cube.style.transition = 'none'
                                const offsetPos = Math.max(0, cubePos - 5)
                                cube.style.left = offsetPos + '%'
                                cube.style.opacity = '0'
                                void cube.offsetHeight
                                cube.style.transition = 'left 0.6s ease, opacity 0.4s ease'
                                cube.style.left = cubePos + '%'
                                cube.style.opacity = '1'
                                cubeVisibleRef.current = true
                            }
        }

        if (won) {
            const cryptoWin = cryptoBet * multiplier
            addWinnings(cryptoWin)
            sound.play('win')
            showToast('win', t('game.you_won'), t('crash.win_desc').replace('{amount}', () => `${activeFiat.symbol}${(betAmount * (multiplier - 1)).toFixed(2)}`).replace('{multiplier}', multiplier.toFixed(2)), 3000)
            incrementWinstreak()
        } else {
            sound.play('limboLose', { overlap: true })
            showToast('loss', t('game.you_lost'), t('game.loss_desc').replace('{amount}', () => `${activeFiat.symbol}${betAmount.toFixed(2)}`), 3000)
            resetWinstreak()
        }

        setRolling(false)
        rollingRef.current = false
        activeBetRef.current = 0

        animTimerRef.current = setTimeout(() => {
            if (innerRef.current) {
                innerRef.current.classList.add('popping')
            }
            animTimerRef.current = setTimeout(() => {
                if (innerRef.current) {
                    innerRef.current.classList.remove('popping')
                }
                if (scoreRef.current) {
                    scoreRef.current.classList.add('visible')
                }
                animTimerRef.current = null
                fadeTimerRef.current = setTimeout(() => {
                    if (cube) {
                        cube.style.transition = 'opacity 0.3s ease'
                        cube.style.opacity = '0'
                        cubeVisibleRef.current = false
                    }
                    fadeTimerRef.current = null
                }, 3000)
            }, 300)
        }, 600)
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('info', t('game.copied_clipboard'), '', 1500)
        })
    }

    async function handleVerify() {
        if (!verifyServerSeed || !verifyClientSeed || !verifyNonce) return
        setVerifying(true)
        setVerifyOutput(null)
        try {
            const result = await ProvablyFair.verify(
                verifyServerSeed.trim(),
                verifyClientSeed.trim(),
                parseInt(verifyNonce)
            )
            const roll = Math.floor(result.result * 10000) / 100
            setVerifyOutput({ roll, hash: result.hash, serverSeedHash: result.serverSeedHash })
        } catch (e) {
            setVerifyOutput({ error: t('game.verification_failed') })
        }
        setVerifying(false)
    }

    function openVerifyModal(item) {
        setVerifyServerSeed('')
        setVerifyClientSeed(item?.clientSeed || fairnessData.clientSeed || '')
        setVerifyNonce(item ? String(item.nonce) : String(fairnessData.nonce))
        setVerifyOutput(null)
        setVerifyModal(true)
    }

    return (
        <>
        <div className="dice-game-page">
            <div className="dice-main">
                <div className="dice-container">
                    <div className="dice-display">
                        <div className={`dice-slider-container${result ? (result.won ? ' glow-win' : ' glow-loss') : ''}`}>
                            <div className="dice-slider-labels">
                                <span>0</span>
                                <span>25</span>
                                <span>50</span>
                                <span>75</span>
                                <span>100</span>
                            </div>
                            <div className="dice-slider-track-outer">
                                <div className="dice-float-area">
                                    <div
                                        ref={cubeRef}
                                        className="dice-float-cube"
                                        style={{ left: '50%', opacity: 0 }}
                                    >
                                        <div ref={innerRef} className="dice-float-inner">
                                            <img src="/images/diceanimation.svg" className="dice-cube-svg" />
                                            {result && (
                                                <div ref={scoreRef} className={`dice-score ${result.won ? 'won' : 'lost'}`}>
                                                    {result.roll.toFixed(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min={2}
                                    max={98}
                                    value={target}
                                    onChange={e => handleSliderChange(parseInt(e.target.value))}
                                    className={`dice-slider-large ${rollDirection === 'under' ? 'dir-under' : 'dir-over'}`}
                                    disabled={rolling}
                                    style={{
                                        background: `linear-gradient(to right, ${rollDirection === 'under' ? '#00e701' : '#ff4444'} ${(target/100)*100}%, ${rollDirection === 'under' ? '#ff4444' : '#00e701'} ${(target/100)*100}%)`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="dice-info-box">
                            <div className="dice-info-section">
                                <div className="dice-info-label">{t('game.multiplier')}</div>
                                <input
                                    className="dice-info-input"
                                    inputMode="decimal"
                                    value={editMultiplier !== null ? editMultiplier : multiplier.toFixed(4)}
                                    onChange={e => setEditMultiplier(e.target.value)}
                                    onBlur={e => { handleMultiplierInput(e.target.value); setEditMultiplier(null) }}
                                    onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                                    disabled={rolling}
                                />
                            </div>
                            <div className="dice-info-section">
                                <div className="dice-info-label">{t('dice.roll_dir')} {rollDirection === 'under' ? t('dice.roll_under') : t('dice.roll_over')}</div>
                                <div className="dice-info-roll-row">
                                    <input
                                        className="dice-info-input dice-info-input-roll"
                                        inputMode="numeric"
                                        value={target}
                                        onChange={e => handleRollInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                                        disabled={rolling}
                                    />
                                    <button
                                        className="dice-dir-btn"
                                        onClick={() => handleDirectionChange(rollDirection === 'under' ? 'over' : 'under')}
                                        disabled={rolling}
                                    >
                                        <img src="/images/change.svg" alt={t('dice.change_alt')} className="dice-change-icon" />
                                    </button>
                                </div>
                            </div>
                            <div className="dice-info-section">
                                <div className="dice-info-label">{t('game.win_chance')}</div>
                                <input
                                    className="dice-info-input"
                                    inputMode="decimal"
                                    value={editWinChance !== null ? editWinChance : effectiveWinChance.toFixed(2)}
                                    onChange={e => handleWinChanceInput(e.target.value)}
                                    onBlur={e => { handleWinChanceInput(e.target.value); setEditWinChance(null) }}
                                    onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                                    disabled={rolling}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="sidebar">
                            <div className="form-group">
                                <div className="form-header">
                                    <label className="form-label">{t('game.bet_amount')}</label>
                                </div>
                                <div className="input-row">
                                    <BetInput
                                        value={betAmount}
                                        onChange={setBetAmount}
                                        min={0}
                                        crypto={selectedCrypto}
                                    />
                                    <Button.Group>
                                        <Button onClick={() => setBetAmount(prev => Math.max(0, prev / 2))}>½</Button>
                                        <Button onClick={() => setBetAmount(prev => prev * 2)}>2×</Button>
                                    </Button.Group>
                                </div>
                            </div>

                            <button onClick={handleRoll} className="bet-button" disabled={rolling || betAmount <= 0 || betAmount > balance || !pfRef.current}>
                                {rolling ? t('game.rolling') : t('game.bet')}
                            </button>

                            </div>
                    </div>
                </div>
                <GameControls gameName="Dice" soundEnabled={soundEnabled} onSoundChange={setSoundEnabled} />
            </div>

            {verifyModal && (
                <div className="dice-verify-overlay" onClick={() => setVerifyModal(false)}>
                    <div className="dice-verify-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="dice-verify-title">{t('dice.verify_roll')}</div>
                            <button className="dice-verify-close" onClick={() => setVerifyModal(false)}>✕</button>
                        </div>
                        <div className="dice-verify-group">
                            <label className="dice-verify-label">{t('dice.server_seed')}</label>
                            <input className="dice-verify-input" value={verifyServerSeed} onChange={e => setVerifyServerSeed(e.target.value)} placeholder={t('dice.paste_server')} />
                        </div>
                        <div className="dice-verify-group">
                            <label className="dice-verify-label">{t('dice.client_seed')}</label>
                            <input className="dice-verify-input" value={verifyClientSeed} onChange={e => setVerifyClientSeed(e.target.value)} placeholder={t('dice.client_seed_used')} />
                        </div>
                        <div className="dice-verify-group">
                            <label className="dice-verify-label">{t('dice.nonce')}</label>
                            <input className="dice-verify-input" value={verifyNonce} onChange={e => setVerifyNonce(e.target.value)} placeholder={t('dice.nonce_num')} type="number" />
                        </div>
                        <button className="dice-verify-submit" onClick={handleVerify} disabled={verifying}>
                            {verifying ? t('dice.verifying') : t('dice.verify')}
                        </button>
                        {verifyOutput && (
                            <div className={`dice-verify-result ${verifyOutput.error ? 'invalid' : 'valid'}`}>
                                {verifyOutput.error ? (
                                    verifyOutput.error
                                ) : (
                                    <>
                                        {t('game.roll')}: <strong>{verifyOutput.roll.toFixed(2)}</strong>
                                        <span className="verify-hash">{t('game.hmac')}: {verifyOutput.hash.slice(0, 16)}...</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default DiceGame
