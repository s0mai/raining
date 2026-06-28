import { useState, useRef, useEffect, useCallback } from 'react'
import { InputNumber, Button } from 'antd'
import BetInput from '../BetInput'
import { useWallet } from '../../context/WalletContext'
import GameControls from '../GameControls'
import useSound from '../../hooks/useSound'
import { cryptos } from '../../data/cryptos'
import './LimboGame.css'

function LimboGame() {
    const { balance, placeBet, addWinnings, showToast, activeCurrency, t } = useWallet()
    const selectedCrypto = cryptos.find(c => c.id === activeCurrency) || cryptos[0]
    const [betAmount, setBetAmount] = useState(1)
    const [target, setTarget] = useState(2)
    const [targetInput, setTargetInput] = useState('2')
    const [playing, setPlaying] = useState(false)
    const [multiplier, setMultiplier] = useState(0)
    const [crashed, setCrashed] = useState(false)
    const [cashedOut, setCashedOut] = useState(false)
    const intervalRef = useRef(null)
    const crashPointRef = useRef(0)
    const cashedOutRef = useRef(false)
    const activeBetRef = useRef(0)
    const resultSoundPlayedRef = useRef(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const sound = useSound(soundEnabled)
    const [betMode, setBetMode] = useState('manual')
    const [autoBetInput, setAutoBetInput] = useState(10)
    const [autoBetsLeft, setAutoBetsLeft] = useState(null)
    const autoBetIntervalRef = useRef(null)
    const betAmountRef = useRef(betAmount)
    const targetRef = useRef(target)
    betAmountRef.current = betAmount
    targetRef.current = target

    const winChance = Math.max(0.01, Math.min(99.99, 96 / target))

    const startGame = useCallback(() => {
        if (playing || betAmount <= 0 || betAmount > balance) return
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (autoBetIntervalRef.current) clearTimeout(autoBetIntervalRef.current)
        placeBet(betAmount)
        sound.play('bet')
        sound.play('limboTick', { loop: true })
        activeBetRef.current = betAmount
        setPlaying(true)
        setCrashed(false)
        setCashedOut(false)
        cashedOutRef.current = false
        resultSoundPlayedRef.current = false
        setMultiplier(1)

        crashPointRef.current = Math.max(1, 0.96 / Math.random())
        const canCashout = crashPointRef.current >= target
        const startTime = Date.now()

        intervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000
            const current = Math.pow(Math.E, elapsed * 1.5)
            setMultiplier(current)

            if (current >= target && !cashedOutRef.current && canCashout) {
                cashedOutRef.current = true
                setCashedOut(true)
                activeBetRef.current = 0
                const winAmount = betAmount * target
                addWinnings(winAmount)
                showToast('win', t('game.cashed_out'), `+$${(winAmount - betAmount).toFixed(2)} at ${target.toFixed(2)}×`, 3000)
            }

            if (current >= crashPointRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
                setMultiplier(crashPointRef.current)
                setCrashed(true)
                setPlaying(false)
                activeBetRef.current = 0
                showToast('loss', t('game.crashed'), `-$${betAmount.toFixed(2)}`, 3000)
            }
        }, 30)
    }, [playing, betAmount, balance, target, placeBet, sound, addWinnings, showToast, t])

    useEffect(() => {
        if (crashed || cashedOut) {
            sound.stop('limboTick')
        }
        if (resultSoundPlayedRef.current) return
        if (crashed && !cashedOut) {
            resultSoundPlayedRef.current = true
            sound.play('limboLose')
        } else if (cashedOut) {
            resultSoundPlayedRef.current = true
            sound.play('win')
        }
    }, [crashed, cashedOut])

    useEffect(() => {
        if (!crashed && !cashedOut) return
        if (betMode === 'auto' && autoBetsLeft > 1) {
            if (autoBetIntervalRef.current) return
            autoBetIntervalRef.current = setTimeout(() => {
                autoBetIntervalRef.current = null
                setAutoBetsLeft(prev => prev - 1)
                startGame()
            }, 1500)
        }
    }, [crashed, cashedOut, betMode, autoBetsLeft, startGame])

    useEffect(() => {
        setTargetInput(target.toFixed(2))
    }, [target])

    const soundRef = useRef(sound)
    soundRef.current = sound
    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current)
            clearTimeout(autoBetIntervalRef.current)
            if (activeBetRef.current > 0) {
                addWinnings(activeBetRef.current)
                activeBetRef.current = 0
            }
        }
    }, [addWinnings])

    const getStatusText = () => {
        if (!playing && !crashed && !cashedOut) return t('limbo.place_bet')
        if (cashedOut) return `${t('limbo.cashed_at')} ${target.toFixed(2)}×`
        if (crashed) return `${t('limbo.crashed_at')} ${multiplier.toFixed(2)}×`
        return null
    }

    const getMultiplierColor = () => {
        if (cashedOut) return 'var(--color-positive)'
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
                            <button
                                className={`bet-mode-tab ${betMode === 'manual' ? 'active' : ''}`}
                                onClick={() => setBetMode('manual')}
                            >
                                {t('game.manual')}
                            </button>
                            <button
                                className={`bet-mode-tab ${betMode === 'auto' ? 'active' : ''}`}
                                onClick={() => setBetMode('auto')}
                            >
                                {t('game.auto')}
                            </button>
                        </div>

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

                        {betMode === 'auto' && (
                            <div className="form-group">
                                <div className="form-header">
                                    <label className="form-label">{t('game.num_bets')}</label>
                                </div>
                                <div className="input-row">
                                    <InputNumber
                                        value={autoBetInput}
                                        onChange={setAutoBetInput}
                                        min={0}
                                        max={1000}
                                        controls={false}
                                    />
                                </div>
                            </div>
                        )}

                        {betMode === 'auto' && autoBetsLeft > 0 ? (
                            <>
                            <button className="bet-button" disabled>
                                {t('game.auto_betting')} ({autoBetsLeft} {t('game.left')})
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => {
                                    setAutoBetsLeft(0)
                                    clearTimeout(autoBetIntervalRef.current)
                                }}
                            >
                                {t('limbo.stop')}
                            </button>
                            </>
                        ) : betMode === 'auto' ? (
                            <button
                                onClick={() => {
                                    if (autoBetInput <= 0) return
                                    setAutoBetsLeft(autoBetInput)
                                    startGame()
                                }}
                                className="bet-button"
                                disabled={autoBetInput <= 0 || betAmount <= 0 || betAmount > balance}
                            >
                                {t('limbo.start_auto')}
                            </button>
                        ) : playing ? (
                            <button className="bet-button" disabled>
                                {t('game.rolling')}
                            </button>
                        ) : (
                            <button onClick={startGame} className="bet-button" disabled={betAmount <= 0 || betAmount > balance}>
                                {t('game.bet')}
                            </button>
                        )}

                        <div className="form-group">
                            <div className="form-header">
                                <label className="form-label">{t('game.target_multiplier')}</label>
                            </div>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    value={targetInput}
                                    onChange={e => {
                                        const raw = e.target.value
                                        setTargetInput(raw)
                                        if (raw !== '' && raw !== '.' && raw !== '-') {
                                            const num = parseFloat(raw)
                                            if (!isNaN(num)) setTarget(Math.max(1, num))
                                        }
                                    }}
                                    onBlur={() => {
                                        const num = parseFloat(targetInput)
                                        if (isNaN(num) || num < 1) {
                                            setTarget(1)
                                            setTargetInput('1.00')
                                        } else {
                                            const clamped = Math.max(1, num)
                                            setTarget(clamped)
                                            setTargetInput(clamped.toFixed(2))
                                        }
                                    }}
                                    min={1}
                                    step="any"
                                    className="bet-input"
                                    disabled={playing}
                                />
                                <span className="multiplier-suffix">×</span>
                            </div>
                            <input
                                type="range"
                                min={100}
                                max={10000}
                                value={Math.round(target * 100)}
                                onChange={e => setTarget(parseFloat(e.target.value) / 100)}
                                className="limbo-slider"
                                disabled={playing}
                            />
                            <div className="limbo-slider-labels">
                                <span>1.00×</span>
                                <span>100×</span>
                            </div>
                        </div>

                        <div className="win-chance-display">
                            {t('game.win_chance')}: <span className="win-chance-value">{winChance.toFixed(5)}%</span>
                        </div>
                    </div>
                </div>
                <GameControls gameName="Limbo" soundEnabled={soundEnabled} onSoundChange={setSoundEnabled} />
            </div>
        </div>
    )
}

export default LimboGame
