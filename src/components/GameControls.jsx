import { useState, useRef, useCallback, useEffect } from 'react'
import { Button, Space, Tooltip, Modal, Typography, Input, Divider, Tag } from 'antd'
import {
    SettingOutlined,
    ExpandOutlined,
    BarChartOutlined,
    SafetyCertificateOutlined,
    SoundOutlined,
    FullscreenExitOutlined,
    BugOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons'
import { useWallet } from '../context/WalletContext'

const { Text, Title, Paragraph } = Typography

const FAKE_HASH = 'a4b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8'
const FAKE_SEED = '5f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c'

function GameControls({
    gameName = 'Game',
    containerRef,
    onSettingsClick,
    onStatsClick,
    fairnessContent,
    debugMode,
    onDebugModeChange,
    soundEnabled: soundEnabledProp,
    onSoundChange,
    fairnessOpen,
    onFairnessOpen,
    hideFullscreen,
    children,
}) {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [localSoundEnabled, setLocalSoundEnabled] = useState(true)
    const [localDebugMode, setLocalDebugMode] = useState(false)
    const [localFairnessOpen, setLocalFairnessOpen] = useState(false)
    const [clientSeed, setClientSeed] = useState(FAKE_SEED)

    const soundEnabled = soundEnabledProp !== undefined ? soundEnabledProp : localSoundEnabled
    const isDebugMode = debugMode !== undefined ? debugMode : localDebugMode
    const fairnessModalOpen = fairnessOpen !== undefined ? fairnessOpen : localFairnessOpen
    const { t } = useWallet()

    const handleSoundToggle = () => {
        const next = !soundEnabled
        if (onSoundChange) onSoundChange(next)
        else setLocalSoundEnabled(next)
    }

    const handleDebugToggle = () => {
        const next = !isDebugMode
        if (onDebugModeChange) onDebugModeChange(next)
        else setLocalDebugMode(next)
    }

    const handleFairnessOpen = () => {
        if (onFairnessOpen) onFairnessOpen(true)
        else setLocalFairnessOpen(true)
    }

    const handleFairnessClose = () => {
        if (onFairnessOpen) onFairnessOpen(false)
        else setLocalFairnessOpen(false)
    }

    const toggleFullscreen = useCallback(() => {
        const el = containerRef?.current || document.documentElement
        if (!document.fullscreenElement) {
            el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
        }
    }, [containerRef])

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', handler)
        return () => document.removeEventListener('fullscreenchange', handler)
    }, [])

    return (
        <>
            <div className="game-controls-bar">
                <Space>
                    {onSettingsClick && (
                        <Tooltip title={t('controls.game_settings')}>
                            <Button
                                type="text"
                                icon={<SettingOutlined />}
                                className="control-btn"
                                onClick={onSettingsClick}
                            />
                        </Tooltip>
                    )}
                    {!hideFullscreen && (
                        <Tooltip title={isFullscreen ? t('controls.exit_fullscreen') : t('controls.fullscreen')}>
                            <Button
                                type="text"
                                icon={isFullscreen ? <FullscreenExitOutlined /> : <ExpandOutlined />}
                                className="control-btn"
                                onClick={toggleFullscreen}
                            />
                        </Tooltip>
                    )}
                    {onStatsClick && (
                        <Tooltip title={t('controls.statistics')}>
                            <Button
                                type="text"
                                icon={<BarChartOutlined />}
                                className="control-btn"
                                onClick={onStatsClick}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title={soundEnabled ? t('controls.mute') : t('controls.unmute')}>
                        <Button
                            type="text"
                            icon={<SoundOutlined />}
                            className={`control-btn ${soundEnabled ? '' : 'muted'}`}
                            onClick={handleSoundToggle}
                        />
                    </Tooltip>
                    <Tooltip title={isDebugMode ? t('controls.debug_disable') : t('controls.debug')}>
                        <Button
                            type="text"
                            icon={<BugOutlined />}
                            className={`control-btn ${isDebugMode ? 'active-debug' : ''}`}
                            style={{ color: isDebugMode ? '#1475e1' : undefined }}
                            onClick={handleDebugToggle}
                        />
                    </Tooltip>
                    {children}
                </Space>

                <span className="logo" style={{ color: 'var(--text-primary)' }}>{t('loading.title')}</span>

                <Button
                    type="text"
                    icon={<SafetyCertificateOutlined />}
                    className="fairness-btn"
                    onClick={handleFairnessOpen}
                >
                    {t('controls.fairness')}
                </Button>
            </div>

            {!onFairnessOpen && (
                <Modal
                    title={
                        <Space>
                            <SafetyCertificateOutlined style={{ color: '#1475e1' }} />
                            <span>{t('controls.provably_fair')}</span>
                        </Space>
                    }
                    open={fairnessModalOpen}
                    onCancel={handleFairnessClose}
                    footer={null}
                    width={480}
                    className="fairness-modal box-modal-3d"
                    centered
                    styles={{
                        content: { background: '#1a2c38', padding: 0 }
                    }}
                >
                    {fairnessContent || (
                        <>
                            <div className="fairness-header">
                                <Title level={5}>
                                    <CheckCircleOutlined style={{ marginRight: 8 }} />
                                    {t('controls.fairness_desc')}
                                </Title>
                                <Paragraph>{t('controls.fairness_desc_detail')}</Paragraph>
                            </div>

                            <div className="fairness-item">
                                <span className="fairness-label">{t('controls.server_seed')}</span>
                                <div className="fairness-value">
                                    <Text copyable={{ text: FAKE_HASH }} style={{ fontSize: 11, wordBreak: 'break-all' }}>
                                        {FAKE_HASH.slice(0, 24)}...
                                    </Text>
                                </div>
                            </div>

                            <div className="fairness-item">
                                <span className="fairness-label">{t('controls.client_seed')}</span>
                                <div className="fairness-value" style={{ display: 'flex', gap: 6 }}>
                                    <Input
                                        size="small"
                                        value={clientSeed}
                                        onChange={e => setClientSeed(e.target.value)}
                                        style={{ background: '#2f4553', border: 'none', color: '#fff', flex: 1, fontSize: 12 }}
                                    />
                                    <Button size="small" icon={<CheckCircleOutlined />} />
                                </div>
                            </div>

                            <div className="fairness-item">
                                <span className="fairness-label">{t('controls.nonce')}</span>
                                <div className="fairness-value">
                                    <Text style={{ background: 'rgba(47, 69, 83, 0.5)', padding: '4px 12px', borderRadius: 6, color: '#fff' }}>
                                        0
                                    </Text>
                                </div>
                            </div>

                            <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

                            <div className="fairness-item">
                                <span className="fairness-label">{t('controls.reveal_seed')}</span>
                                <div className="fairness-value">
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {t('controls.reveal_instruction')}
                                    </Text>
                                </div>
                            </div>
                        </>
                    )}
                </Modal>
            )}
        </>
    )
}

export default GameControls
