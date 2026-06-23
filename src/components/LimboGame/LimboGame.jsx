import { useState, useRef, useEffect } from 'react'
import { InputNumber, Button } from 'antd'
import { useWallet } from '../../context/WalletContext'
import GameControls from '../GameControls'
import './LimboGame.css'

function LimboGame() {
    const { balance, placeBet, addWinnings, showToast } = useWallet()
    const [betAmount, setBetAmount] = useState(1)
    const [target, setTarget] = useState(2)
    const [playing, setPlaying] = useState(false)
    const [multiplier, setMultiplier] = useState(0)
    const [crashed, setCrashed] = useState(false)
    const [cashedOut, setCashedOut] = useState(false)
    const intervalRef = useRef(null)
    const crashPointRef = useRef(0)
    const cashedOutRef = useRef(false)
    const activeBetRef = useRef(0)

    const winChance = Math.max(0.01, Math.min(99.99, 96 / target))

    const startGame = () => {
        if (playing || betAmount <= 0 || betAmount > balance) return
        if (intervalRef.current) clearInterval(intervalRef.current)
        placeBet(betAmount)
        activeBetRef.current = betAmount
        setPlaying(true)
        setCrashed(false)
        setCashedOut(false)
        cashedOutRef.current = false
        setMultiplier(1)

        crashPointRef.current = Math.max(1, 0.96 / Math.random())
        const startTime = Date.now()

        intervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000
            const current = Math.pow(Math.E, elapsed * 1.2)
            setMultiplier(current)

            if (current >= target && !cashedOutRef.current) {
                cashedOutRef.current = true
                setCashedOut(true)
                activeBetRef.current = 0
                const winAmount = betAmount * target
                addWinnings(winAmount)
                showToast('win', 'Cashed Out!', `+₿${(winAmount - betAmount).toFixed(2)} at ${target.toFixed(2)}×`, 3000)
            }

            if (current >= crashPointRef.current) {
                clearInterval(intervalRef.current)
                setMultiplier(crashPointRef.current)
                setCrashed(true)
                setPlaying(false)
                activeBetRef.current = 0
                if (!cashedOutRef.current) {
                    showToast('loss', 'Crashed!', `-₿${betAmount.toFixed(2)}`, 3000)
                }
            }
        }, 30)
    }

    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current)
            if (activeBetRef.current > 0) {
                addWinnings(activeBetRef.current)
                activeBetRef.current = 0
            }
        }
    }, [])

    const getStatusText = () => {
        if (!playing && !crashed && !cashedOut) return 'Place your bet'
        if (cashedOut) return `Cashed out at ${target.toFixed(2)}×`
        if (crashed) return `Crashed at ${multiplier.toFixed(2)}×`
        return null
    }

    const getMultiplierColor = () => {
        if (cashedOut) return 'var(--accent-green)'
        if (crashed) return 'var(--accent-red)'
        return 'var(--text-primary)'
    }

    return (
        <div className="limbo-game-page">
            <div className="limbo-main">
                <div className="limbo-container">
                    <div className="limbo-display">
                        <div className="limbo-multiplier-value" style={{ color: getMultiplierColor() }}>
                            {playing || crashed || cashedOut ? `${multiplier.toFixed(2)}×` : `${target.toFixed(2)}×`}
                        </div>
                        <div className="limbo-status">{getStatusText()}</div>
                    </div>
                    <div className="limbo-sidebar">
                        <div className="bet-mode-tabs">
                            <button className="bet-mode-tab active">Manual</button>
                            <button className="bet-mode-tab">Auto</button>
                        </div>

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

                        {playing ? (
                            <button className="bet-button" disabled>
                                Rolling...
                            </button>
                        ) : (
                            <button onClick={startGame} className="bet-button" disabled={betAmount <= 0 || betAmount > balance}>
                                Bet
                            </button>
                        )}

                        <div className="form-group">
                            <div className="form-header">
                                <label className="form-label">Target Multiplier</label>
                            </div>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    value={target}
                                    onChange={e => setTarget(Math.max(1.01, parseFloat(e.target.value) || 1))}
                                    min={1.01}
                                    step="any"
                                    className="bet-input"
                                    disabled={playing}
                                />
                                <span className="multiplier-suffix">×</span>
                            </div>
                            <input
                                type="range"
                                min={101}
                                max={1000}
                                value={Math.round(target * 100)}
                                onChange={e => setTarget(parseFloat(e.target.value) / 100)}
                                className="limbo-slider"
                                disabled={playing}
                            />
                            <div className="limbo-slider-labels">
                                <span>1.01×</span>
                                <span>10×</span>
                            </div>
                        </div>

                        <div className="win-chance-display">
                            Win Chance: <span className="win-chance-value">{winChance.toFixed(5)}%</span>
                        </div>
                    </div>
                </div>
                <GameControls gameName="Limbo" />
            </div>
        </div>
    )
}

export default LimboGame
