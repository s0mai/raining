import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
    CloseOutlined,
    BugOutlined
} from '@ant-design/icons'
import { Button, Typography } from 'antd'
import BetInput from '../BetInput'
const { Text } = Typography

import { useWallet } from '../../context/WalletContext'
import ProvablyFair from '../../utils/ProvablyFair'
import GameControls from '../GameControls'
import useSound from '../../hooks/useSound'
import CryptoImg from '../CryptoImg'
import { cryptos } from '../../data/cryptos'
import './MinesGame.css'

const HOUSE_EDGE = 0.99;

const calculateMultiplier = (mines, hits) => {
    if (hits === 0) return 1.00;
    let mult = 1;
    for (let i = 0; i < hits; i++) {
        mult *= (25 - i) / (25 - mines - i);
    }
    return mult * HOUSE_EDGE;
};

function MinesGame() {
    const { balance, placeBet, addWinnings, showToast, activeCurrency, t } = useWallet();
    const [isPlaying, setIsPlaying] = useState(false);
    const [betAmount, setBetAmount] = useState(1);
    const [minesCount, setMinesCount] = useState(3);
    const [revealedTiles, setRevealedTiles] = useState([]);
    const [mineLocations, setMineLocations] = useState([]);
    const [gameOverState, setGameOverState] = useState(null)
    const selectedCrypto = cryptos.find(c => c.id === activeCurrency) || cryptos[0]

    const [soundEnabled, setSoundEnabled] = useState(true);
    const sound = useSound(soundEnabled)

    const [isDebugMode, setIsDebugMode] = useState(false);
    const [debugData, setDebugData] = useState(null);

    const fairnessRef = useRef(null);
    const activeBetRef = useRef(0);
    const debugWidgetRef = useRef(null);
    const dragHandlersRef = useRef({ move: null, up: null });
    const audioCtxRef = useRef(null);

    useEffect(() => {
        const pf = new ProvablyFair();
        fairnessRef.current = pf;
    }, []);

    useEffect(() => {
        const pf = fairnessRef.current;
        if (isDebugMode && pf && pf._hashReady && !isPlaying) {
            pf.peekMinesPositions(minesCount).then(data => {
                setDebugData(data);
            }).catch(err => console.error('Peek info error:', err));
        }
    }, [isDebugMode, minesCount, isPlaying]);

    const handleDebugDragStart = useCallback((e) => {
        if (!debugWidgetRef.current) return;
        const rect = debugWidgetRef.current.getBoundingClientRect();
        const offset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        let isDragging = true;

        const onMove = (evt) => {
            if (!isDragging || !debugWidgetRef.current) return;
            const maxX = window.innerWidth - debugWidgetRef.current.offsetWidth;
            const maxY = window.innerHeight - debugWidgetRef.current.offsetHeight;
            debugWidgetRef.current.style.left = `${Math.max(0, Math.min(evt.clientX - offset.x, maxX))}px`;
            debugWidgetRef.current.style.top = `${Math.max(0, Math.min(evt.clientY - offset.y, maxY))}px`;
            debugWidgetRef.current.style.right = 'auto';
            debugWidgetRef.current.style.bottom = 'auto';
            debugWidgetRef.current.style.transform = 'none';
        };
        const onUp = () => { isDragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); dragHandlersRef.current = { move: null, up: null }; };
        dragHandlersRef.current = { move: onMove, up: onUp };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, []);

    useEffect(() => {
        return () => {
            if (activeBetRef.current > 0) {
                addWinnings(activeBetRef.current);
                activeBetRef.current = 0;
            }
            if (dragHandlersRef.current.move) document.removeEventListener('mousemove', dragHandlersRef.current.move);
            if (dragHandlersRef.current.up) document.removeEventListener('mouseup', dragHandlersRef.current.up);
        };
    }, [addWinnings]);

    // Audio setup
    const playSound = (type) => {
        if (type === 'gem') sound.play('minesGem')
        else if (type === 'bomb') sound.play('minesBomb')
    }

    const playWinWithReverb = useCallback(() => {
        if (!soundEnabled) return
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
            }
            const ctx = audioCtxRef.current
            ctx.resume()

            fetch('/sounds/Win.mp3')
                .then(r => r.arrayBuffer())
                .then(buf => ctx.decodeAudioData(buf))
                .then(audioBuf => {
                    const sr = ctx.sampleRate
                    const length = sr * 1.5
                    const impulse = ctx.createBuffer(2, length, sr)
                    for (let ch = 0; ch < 2; ch++) {
                        const data = impulse.getChannelData(ch)
                        for (let i = 0; i < length; i++) {
                            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3)
                        }
                    }

                    const convolver = ctx.createConvolver()
                    convolver.buffer = impulse

                    const source = ctx.createBufferSource()
                    source.buffer = audioBuf

                    source.connect(convolver)
                    convolver.connect(ctx.destination)
                    source.start(0)
                })
                .catch(() => sound.play('win'))
        } catch {
            sound.play('win')
        }
    }, [soundEnabled])

    const currentMultiplier = useMemo(() => {
        return calculateMultiplier(minesCount, revealedTiles.length);
    }, [minesCount, revealedTiles.length]);

    const potentialWin = useMemo(() => {
        return betAmount * currentMultiplier;
    }, [betAmount, currentMultiplier]);

    const handleBetAmountChange = (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;
        setBetAmount(val);
    };

    const handleBetAmountHalf = () => setBetAmount(prev => Math.max(0, prev / 2));
    const handleBetAmountDouble = () => setBetAmount(prev => prev * 2);

    const handleMinesChange = (e) => {
        const count = parseInt(e.target.value, 10);
        if (count >= 1 && count <= 24) {
            setMinesCount(count);
        }
    };

    const startGame = async () => {
        if (betAmount <= 0) return;
        if (balance < betAmount) {
            showToast('error', t('game.insufficient_balance'), `You need $${betAmount.toFixed(2)}`);
            return;
        }

        placeBet(betAmount);
        activeBetRef.current = betAmount;

        // Generate mines using provably fair system
        const pf = fairnessRef.current;
        if (!pf) return;
        const result = await pf.generateMinesPositions(minesCount);
        const mines = new Set(result.minePositions);

        setMineLocations(Array.from(mines));
        setRevealedTiles([]);
        setGameOverState(null);
        setIsPlaying(true);
        showToast('bet', t('game.game_started'), `$${betAmount.toFixed(2)} bet placed`);
        sound.play('bet')
    };

    const endGame = (reason) => {
        activeBetRef.current = 0;
        setIsPlaying(false);
        setGameOverState(reason);
        if (reason === 'win') {
            const profit = potentialWin - betAmount;
            addWinnings(potentialWin);
            playWinWithReverb();
            showToast('win', t('game.cashed_out'), `+$${profit.toFixed(2)} at ${currentMultiplier.toFixed(2)}×`, 4000);
        } else if (reason === 'loss') {
            sound.play('limboLose');
            showToast('loss', t('mines.boom'), `-$${betAmount.toFixed(2)}`, 3000);
        }
    };

    const cashout = () => {
        if (!isPlaying || revealedTiles.length === 0) return;
        endGame('win');
    };

    const pickRandom = () => {
        if (!isPlaying) return;
        const unrevealedSafe = [];
        for (let i = 0; i < 25; i++) {
            if (!revealedTiles.includes(i)) {
                unrevealedSafe.push(i);
            }
        }
        if (unrevealedSafe.length > 0) {
            const randomPick = unrevealedSafe[Math.floor(Math.random() * unrevealedSafe.length)];
            handleTileClick(randomPick);
        }
    };

    const handleTileClick = (index) => {
        if (!isPlaying || revealedTiles.includes(index) || gameOverState) return;

        if (mineLocations.includes(index)) {
            // Hit a mine (BOMB)
            setRevealedTiles(prev => [...prev, index]);
            playSound('bomb');
            endGame('loss');
        } else {
            // Hit a gem
            const newRevealed = [...revealedTiles, index];
            setRevealedTiles(newRevealed);
            playSound('gem');

            // Check if user found all gems
            if (newRevealed.length === 25 - minesCount) {
                // Auto win
                setIsPlaying(false);
                setGameOverState('win');
                const finalMult = calculateMultiplier(minesCount, newRevealed.length);
                const finalWin = betAmount * finalMult;
                const profit = finalWin - betAmount;
                addWinnings(finalWin);

                showToast('win', t('mines.all_gems'), `+$${profit.toFixed(2)} at ${finalMult.toFixed(2)}×`, 4000);
            }
        }
    };

    const renderGrid = () => {
        const tiles = [];
        for (let i = 0; i < 25; i++) {
            const isRevealed = revealedTiles.includes(i);
            const isMine = mineLocations.includes(i);
            const isGameOver = !isPlaying && gameOverState;

            let statusClass = '';
            let content = null;

            if (isRevealed) {
                statusClass = `revealed ${isMine ? 'bomb-tile' : 'gem-tile'}`;
                content = isMine ? (
                    <>
                        <img src="/images/mines/bomb.svg" alt={t('mines.bomb')} className="reveal-anim" />
                        <img src="/images/mines/bomb_effect.gif" alt={t('mines.explosion')} className="bomb-effect" />
                    </>
                ) : (
                    <img src="/images/mines/diamond.svg" alt={t('mines.gem')} className="reveal-anim" />
                );
            } else if (isGameOver) {
                // Show remaining tiles semi-transparently
                statusClass = `revealed game-over-reveal`;
                content = isMine ? (
                    <img src="/images/mines/bomb.svg" alt={t('mines.bomb')} style={{ filter: 'grayscale(100%) opacity(0.5)' }} />
                ) : (
                    <img src="/images/mines/diamond.svg" alt={t('mines.gem')} style={{ filter: 'grayscale(100%) opacity(0.5)' }} />
                );
            }

            tiles.push(
                <button
                    key={i}
                    className={`mine-tile ${statusClass} ${(!isPlaying || isRevealed) ? 'inactive' : ''}`}
                    onClick={() => {
                        if (!isPlaying || isRevealed) return;
                        handleTileClick(i);
                    }}

                >
                    <div className="mine-tile-inner">
                        {content}
                    </div>
                </button>
            );
        }
        return tiles;
    };

    return (
        <div className="mines-game">
            <div className="game-container">
                {/* Sidebar Controls */}
                <div className="mines-sidebar">
                    <div className="mines-sidebar-content">
                        <div className="mines-bet-panel">
                            {/* Bet Amount */}
                            <div className="form-group">
                                <div className="form-header">
                                    <label className="form-label" style={{ margin: 0 }}>{t('game.bet_amount')}</label>
                                    <Text type="secondary" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <CryptoImg crypto={selectedCrypto} size={14} /> ${(betAmount ?? 0).toFixed(2)}
                                    </Text>
                                </div>
                                <div className="input-row">
                                    <BetInput
                                        value={betAmount === 0 ? null : betAmount}
                                        onChange={(val) => setBetAmount(Math.max(0, isNaN(Number(val)) ? 0 : Number(val)))}
                                        min={0}
                                        disabled={isPlaying}
                                        style={{ flex: 1 }}
                                        crypto={selectedCrypto}
                                    />
                                    <Button.Group className="dino-btn-group">
                                        <Button
                                            onClick={handleBetAmountHalf}
                                            disabled={isPlaying}
                                        >
                                            ½
                                        </Button>
                                        <Button
                                            onClick={handleBetAmountDouble}
                                            disabled={isPlaying}
                                        >
                                            2×
                                        </Button>
                                    </Button.Group>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!isPlaying ? (
                                <button className="btn-bet-mines" onClick={startGame}>
                                    {t('game.bet')}
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="btn-bet-mines"
                                        onClick={cashout}
                                        disabled={revealedTiles.length === 0}
                                    >
                                        {t('game.cashout')}
                                    </button>
                                    <button
                                        className="btn-random-pick"
                                        onClick={pickRandom}
                                    >
                                        {t('game.random_pick')}
                                    </button>
                                </>
                            )}

                            {/* Mines Selection */}
                            <div className="form-group">
                                <label className="form-label">{t('game.mines_label')}</label>
                                <div className="mines-select-wrapper">
                                    <select
                                        className="mines-select"
                                        value={minesCount}
                                        onChange={handleMinesChange}
                                        disabled={isPlaying}
                                    >
                                        {[...Array(24)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Gems Display */}
                            <div className="form-group">
                                <label className="form-label">{t('game.gems_label')}</label>
                                <div className="input-with-controls">
                                    <input
                                        type="text"
                                        className="mines-input"
                                        value={25 - minesCount}
                                        readOnly
                                        disabled={isPlaying}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: 'auto' }}>
                                <div className="form-header">
                                    <label className="form-label" style={{ margin: 0 }}>{t('game.total_payout')} ({currentMultiplier.toFixed(2)}×)</label>
                                </div>
                                <div className="input-with-controls">
                                    <input
                                        type="text"
                                        className="mines-input"
                                        value={revealedTiles.length > 0 ? potentialWin.toFixed(8) : betAmount.toFixed(8)}
                                        readOnly
                                    />
                                    <div className="mines-input-addon">
                                        <div className="btc-icon-small"><CryptoImg crypto={selectedCrypto} size={14} /></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Game Display Wrapper */}
                <div className="mines-display-wrapper">
                    <div className="mines-display">
                        <div className="mines-grid">
                            {renderGrid()}
                        </div>
                    </div>

                    {/* Debug Overlay */}
                    {isDebugMode && debugData && (
                        <div className="fixed-widget debug-widget fade-in-scale" ref={debugWidgetRef}>
                            <div className="widget-header debug-widget-header" onMouseDown={handleDebugDragStart}>
                                <div className="widget-title">
                                    <BugOutlined style={{ color: '#1475e1', fontSize: 18 }} />
                                    <span style={{ color: '#1475e1' }}>{t('mines.fairness_debug')}</span>
                                </div>
                                <div className="widget-actions">
                                    <button className="widget-btn-icon" onMouseDown={(e) => e.stopPropagation()} onClick={() => setIsDebugMode(false)}>
                                        <CloseOutlined />
                                    </button>
                                </div>
                            </div>
                            <div className="widget-content debug-widget-content">
                                <div className="debug-row">
                                    <span className="debug-label">{t('mines.next_hash')}</span>
                                    <span className="debug-value">{debugData.hash.substring(0, 16)}...</span>
                                </div>
                                <div className="debug-row">
                                    <span className="debug-label">{t('mines.client_seed_label')}</span>
                                    <span className="debug-value">{debugData.clientSeed?.substring(0, 10)}...</span>
                                </div>
                                <div className="debug-row">
                                    <span className="debug-label">{t('mines.next_nonce')}</span>
                                    <span className="debug-value">{debugData.nonce}</span>
                                </div>
                                <div className="debug-target">
                                    {t('mines.mines_field')}: <span className="target-bin">{minesCount}</span>
                                    <div style={{ fontSize: 13, color: '#fff', marginTop: 4, textShadow: 'none' }}>
                                        {t('mines.positions')}: <span style={{ color: '#ff4d4f' }}>[{debugData.minePositions.join(', ')}]</span>
                                    </div>
                                </div>
                                <div className="mines-debug-grid">
                                    {Array.from({ length: 25 }, (_, i) => (
                                        <div key={i} className={`mines-debug-cell ${debugData.minePositions.includes(i) ? 'is-mine' : 'is-gem'}`}>
                                            {debugData.minePositions.includes(i) ? '💣' : '💎'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <GameControls
                        gameName="Mines"
                        debugMode={isDebugMode}
                        onDebugModeChange={setIsDebugMode}
                        soundEnabled={soundEnabled}
                        onSoundChange={setSoundEnabled}
                    />
                </div>
            </div>

        </div>
    );
}

export default MinesGame;
