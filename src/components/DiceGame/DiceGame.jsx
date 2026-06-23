import { useState, useRef, useEffect } from 'react'
import { InputNumber, Button } from 'antd'
import { useWallet } from '../../context/WalletContext'
import ProvablyFair from '../../utils/ProvablyFair'
import GameControls from '../GameControls'
import '../PlinkoGame/Sidebar.css'
import './DiceGame.css'

function DiceGame() {
    const { balance, placeBet, addWinnings, showToast } = useWallet()
    const [betAmount, setBetAmount] = useState(1)
    const [target, setTarget] = useState(50)
    const [rollDirection, setRollDirection] = useState('under')
    const [rolling, setRolling] = useState(false)
    const [result, setResult] = useState(null)
    const [history, setHistory] = useState([])
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

    const isUnder = rollDirection === 'under'
    const winChance = isUnder ? (target - 1) : (100 - target - 1)
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
        }
    }, [])

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
        const newTarget = isUnder ? Math.round(clamped + 1) : Math.round(100 - clamped - 1)
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
        const newTarget = isUnder ? Math.round(clamped + 1) : Math.round(100 - clamped - 1)
        setTarget(Math.max(2, Math.min(98, newTarget)))
    }

    async function handleRoll() {
        if (rolling || betAmount <= 0 || betAmount > balance || !pfRef.current) return

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
        placeBet(betAmount)
        activeBetRef.current = betAmount

        const pf = pfRef.current
        const currentNonce = pf.nonce
        const rawResult = await pf.getResult()
        const roll = Math.floor(rawResult * 10000) / 100
        refreshFairness()

        const won = isUnder ? roll < target : roll > target
        activeBetRef.current = 0
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
            if (cubeVisibleRef.current) {
                cube.style.transition = 'left 0.6s ease'
                cube.style.left = roll + '%'
            } else {
                cube.style.transition = 'none'
                const offsetPos = Math.max(0, roll - 5)
                cube.style.left = offsetPos + '%'
                cube.style.opacity = '0'
                void cube.offsetHeight
                cube.style.transition = 'left 0.6s ease, opacity 0.4s ease'
                cube.style.left = roll + '%'
                cube.style.opacity = '1'
                cubeVisibleRef.current = true
            }
        }

        const fd = fairnessData
        setHistory(prev => [{
            roll, won, direction: rollDirection, target,
            betAmount, multiplier,
            serverSeedHash: fd.serverSeedHash,
            clientSeed: pf.clientSeed,
            nonce: currentNonce,
        }, ...prev].slice(0, 50))

        if (won) {
            const winAmount = betAmount * multiplier
            addWinnings(winAmount)
            showToast('win', 'You Won!', `+₿${(winAmount - betAmount).toFixed(2)} at ${multiplier.toFixed(2)}×`, 3000)
        } else {
            showToast('loss', 'You Lost', `-₿${betAmount.toFixed(2)}`, 3000)
        }

        setRolling(false)

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
            showToast('info', 'Copied!', '', 1500)
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
            setVerifyOutput({ error: 'Verification failed' })
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
                                        background: `linear-gradient(to right, ${rollDirection === 'under' ? '#ff4444' : '#00e701'} ${(target/100)*100}%, ${rollDirection === 'under' ? '#00e701' : '#ff4444'} ${(target/100)*100}%)`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="dice-info-box">
                            <div className="dice-info-section">
                                <div className="dice-info-label">Multiplier</div>
                                <input
                                    className="dice-info-input"
                                    value={editMultiplier !== null ? editMultiplier : multiplier.toFixed(4)}
                                    onChange={e => setEditMultiplier(e.target.value)}
                                    onBlur={e => { handleMultiplierInput(e.target.value); setEditMultiplier(null) }}
                                    onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                                    disabled={rolling}
                                />
                            </div>
                            <div className="dice-info-section">
                                <div className="dice-info-label">Roll {rollDirection === 'under' ? 'Under' : 'Over'}</div>
                                <div className="dice-info-roll-row">
                                    <input
                                        className="dice-info-input dice-info-input-roll"
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
                                        <img src="/images/change.svg" alt="Change" className="dice-change-icon" />
                                    </button>
                                </div>
                            </div>
                            <div className="dice-info-section">
                                <div className="dice-info-label">Win Chance</div>
                                <input
                                    className="dice-info-input"
                                    value={editWinChance !== null ? editWinChance : effectiveWinChance.toFixed(2)}
                                    onChange={e => setEditWinChance(e.target.value)}
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
                                    <label className="form-label">Bet Amount</label>
                                </div>
                                <div className="input-row">
                                    <InputNumber
                                        value={betAmount}
                                        onChange={setBetAmount}
                                        min={0}
                                        addonBefore={<div className="btc-icon" style={{ background: 'linear-gradient(135deg, #f7931a, #ffb347)' }}>₿</div>}
                                        controls={false}
                                    />
                                    <Button.Group>
                                        <Button onClick={() => setBetAmount(prev => Math.max(0, prev / 2))}>½</Button>
                                        <Button onClick={() => setBetAmount(prev => prev * 2)}>2×</Button>
                                    </Button.Group>
                                </div>
                            </div>

                            <button onClick={handleRoll} className="bet-button" disabled={rolling || betAmount <= 0 || betAmount > balance || !pfRef.current}>
                                {rolling ? 'Rolling...' : 'Roll'}
                            </button>

                            <div className="form-group">
                                <div className="dice-history-header">Recent Rolls</div>
                                <div className="dice-history">
                                    {history.length === 0 ? (
                                        <div className="dice-history-empty">No rolls yet</div>
                                    ) : (
                                        history.map((item, i) => (
                                            <div key={i} className="dice-history-item">
                                                <div className="dice-history-left">
                                                    <span className={`dice-history-roll ${item.won ? 'win' : 'loss'}`}>
                                                        {item.roll.toFixed(2)}
                                                    </span>
                                                    <span className="dice-history-direction">
                                                        {item.direction === 'under' ? '↓' : '↑'} {item.target}.00
                                                    </span>
                                                </div>
                                                <div className="dice-history-right">
                                                    <span className="dice-history-payout">
                                                        {item.won ? '+' : ''}{(item.betAmount * item.multiplier).toFixed(2)}
                                                    </span>
                                                    <button className="dice-history-verify" onClick={() => openVerifyModal(item)} title="Verify">
                                                        ✓
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            </div>
                    </div>
                </div>
                <GameControls gameName="Dice" />
            </div>

            {verifyModal && (
                <div className="dice-verify-overlay" onClick={() => setVerifyModal(false)}>
                    <div className="dice-verify-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="dice-verify-title">🛡️ Verify Roll</div>
                            <button className="dice-verify-close" onClick={() => setVerifyModal(false)}>✕</button>
                        </div>
                        <div className="dice-verify-group">
                            <label className="dice-verify-label">Server Seed</label>
                            <input className="dice-verify-input" value={verifyServerSeed} onChange={e => setVerifyServerSeed(e.target.value)} placeholder="Paste revealed server seed" />
                        </div>
                        <div className="dice-verify-group">
                            <label className="dice-verify-label">Client Seed</label>
                            <input className="dice-verify-input" value={verifyClientSeed} onChange={e => setVerifyClientSeed(e.target.value)} placeholder="Client seed used" />
                        </div>
                        <div className="dice-verify-group">
                            <label className="dice-verify-label">Nonce</label>
                            <input className="dice-verify-input" value={verifyNonce} onChange={e => setVerifyNonce(e.target.value)} placeholder="Nonce number" type="number" />
                        </div>
                        <button className="dice-verify-submit" onClick={handleVerify} disabled={verifying}>
                            {verifying ? 'Verifying...' : 'Verify'}
                        </button>
                        {verifyOutput && (
                            <div className={`dice-verify-result ${verifyOutput.error ? 'invalid' : 'valid'}`}>
                                {verifyOutput.error ? (
                                    verifyOutput.error
                                ) : (
                                    <>
                                        Roll: <strong>{verifyOutput.roll.toFixed(2)}</strong>
                                        <span className="verify-hash">HMAC: {verifyOutput.hash.slice(0, 16)}...</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DiceGame
