import { useState, useEffect } from 'react'
import {
    InputNumber,
    Button,
    Typography,
    Card,
    Switch,
    Tooltip,
    Slider
} from 'antd'
import {
    ThunderboltOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons'
import { useWallet } from '../../context/WalletContext'
import BetInput from '../BetInput'
import CryptoImg from '../CryptoImg'
import { cryptos } from '../../data/cryptos'

const { Text } = Typography

function BettingPanel({ phase, betPlaced, multiplier, onBet, onCashout, onCancelBet }) {
    const { activeCurrency, activeFiat, t } = useWallet()
    const selectedCrypto = cryptos.find(c => c.id === activeCurrency) || cryptos[0]
    const [activeTab, setActiveTab] = useState('manual')
    const [betAmount, setBetAmount] = useState(1)
    const [cashoutAt, setCashoutAt] = useState(2.00)
    const [autoCashout, setAutoCashout] = useState(true)

    // Calculate profit
    const profit = betAmount * (cashoutAt - 1)

    // Auto Cashout Logic
    useEffect(() => {
        if (phase === 'running' && betPlaced && autoCashout) {
            if (multiplier >= cashoutAt) {
                onCashout()
            }
        }
    }, [multiplier, phase, betPlaced, autoCashout, cashoutAt, onCashout])

    const handleBetClick = () => {
        if (phase === 'waiting') {
            if (betPlaced) {
                onCancelBet?.()
            } else if (betAmount > 0) {
                onBet(betAmount)
            }
        } else if (phase === 'running' && betPlaced) {
            onCashout()
        }
    }

    const getButtonText = () => {
        if (phase === 'waiting' && betPlaced) {
            return t('game.cancel')
        }
        if (phase === 'running' && betPlaced) {
            return `${t('crash.cash_out_btn')} ${activeFiat.symbol}${(betAmount * multiplier).toFixed(2)}`
        }
        return t('game.bet')
    }

    const getButtonClass = () => {
        if (phase === 'running' && betPlaced && !autoCashout) return 'bet-button cashout-btn'
        return 'bet-button'
    }

    return (
        <div className="betting-panel-3d">
            {/* 3D Tabs */}
            <div className="bet-mode-tabs">
                <button
                    className={`bet-mode-tab ${activeTab === 'manual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manual')}
                >
                    {t('game.manual')}
                </button>
                <button
                    className={`bet-mode-tab ${activeTab === 'auto' ? 'active' : ''}`}
                    onClick={() => setActiveTab('auto')}
                >
                    {t('game.auto')}
                </button>
            </div>

            {activeTab === 'manual' ? (
                <div className="bet-form">
                    {/* Bet Amount */}
                    <div className="form-group">
                        <div className="form-header">
                            <label className="form-label" style={{ margin: 0 }}>{t('game.bet_amount')}</label>
                            <Text type="secondary" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><CryptoImg crypto={selectedCrypto} size={12} /> {activeFiat.symbol}{Number(betAmount || 0).toFixed(2)}</Text>
                        </div>
                        <div className="input-row">
                            <BetInput
                                value={betAmount}
                                onChange={setBetAmount}
                                min={0}
                                crypto={selectedCrypto}
                            />
                            <Button.Group>
                                <Button onClick={() => setBetAmount(prev => Math.max(0, prev / 2))}>{t('game.half')}</Button>
                                <Button onClick={() => setBetAmount(prev => prev * 2)}>{t('game.double')}</Button>
                            </Button.Group>
                        </div>
                    </div>

                    {/* Bet Button */}
                    <button
                        onClick={handleBetClick}
                        className={getButtonClass()}
                        disabled={
                            (phase === 'running' && !betPlaced) ||
                            (phase === 'running' && betPlaced && autoCashout)
                        }
                    >
                        <ThunderboltOutlined style={{ marginRight: 6 }} />
                        {getButtonText()}
                    </button>

                    {/* Cashout At */}
                    <div className="form-group">
                        <div className="form-header">
                            <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                {t('game.auto_cashout')}
                                <Tooltip title={t('game.auto_cashout_hint')}>
                                    <QuestionCircleOutlined style={{ marginLeft: 6, cursor: 'pointer', color: '#b1b6c6' }} />
                                </Tooltip>
                            </label>
                            <Switch
                                size="small"
                                checked={autoCashout}
                                onChange={setAutoCashout}
                                className="crash-switch"
                                disabled={phase === 'running'}
                            />
                        </div>
                        <InputNumber
                            value={cashoutAt}
                            onChange={setCashoutAt}
                            min={1.01}
                            max={1000}
                            step={0.1}
                            precision={2}
                            disabled={!autoCashout || phase === 'running'}
                            style={{ width: '100%' }}
                            addonAfter={<span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>×</span>}
                        />
                    </div>

                    {/* Profit Display - 3D Card Style */}
                    <div className="profit-card-3d">
                        <div className="form-header" style={{ marginBottom: 4 }}>
                            <label className="form-label" style={{ margin: 0 }}>{t('game.profit_on_win')}</label>
                        </div>
                        <Text strong style={{ color: '#00e701', fontSize: 16, fontFamily: "'Courier New', monospace", display: 'flex', alignItems: 'center', gap: 4 }}>
                            +<CryptoImg crypto={selectedCrypto} size={12} />{activeFiat.symbol}{profit.toFixed(2)}
                        </Text>
                    </div>
                </div>
            ) : (
                <div className="bet-form">
                    <Card size="small" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', borderRadius: 10 }}>
                        <Text type="secondary">
                            {t('game.auto_betting')}
                        </Text>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default BettingPanel

