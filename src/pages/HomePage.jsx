import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import '../styles/home.css'

function AnimatedCount({ value }) {
    const [display, setDisplay] = useState(value)
    const [anim, setAnim] = useState('')
    const prevRef = useRef(value)

    useEffect(() => {
        if (value !== prevRef.current) {
            const dir = value > prevRef.current ? 'up' : 'down'
            setDisplay(prevRef.current)
            requestAnimationFrame(() => setAnim(`slide-${dir}`))
            prevRef.current = value
        }
    }, [value])

    return (
        <span className={`count-anim ${anim}`} onAnimationEnd={() => { setDisplay(value); setAnim('') }}>
            <span className="count-old">{display}</span>
            <span className="count-new">{value}</span>
        </span>
    )
}

const games = [
    {
        id: 'dice',
        nameKey: 'game.Dice',
        image: '/images/dice.png',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM5 19V5h14v14H5z" />
            </svg>
        ),
        path: '/dice',
        playersMin: 400,
        playersMax: 700,
    },
    {
        id: 'mines',
        nameKey: 'game.Mines',
        image: '/images/mines.png',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
        ),
        path: '/mines',
        playersMin: 200,
        playersMax: 400,
    },
    {
        id: 'limbo',
        nameKey: 'game.Limbo',
        image: '/images/limbo.png',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
        ),
        path: '/limbo',
        playersMin: 400,
        playersMax: 700,
    },
    {
        id: 'plinko',
        nameKey: 'game.Plinko',
        image: '/images/plinko.png',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 20h20L12 2zm0 4l6.5 12h-13L12 6z" />
            </svg>
        ),
        path: '/plinko',
        playersMin: 200,
        playersMax: 500,
    },
    {
        id: 'crash',
        nameKey: 'game.Crash',
        image: '/images/crash.png',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
        ),
        path: '/crash',
        playersMin: 100,
        playersMax: 300,
    },
]

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function HomePage() {
    const { t } = useWallet()
    const [players, setPlayers] = useState(() =>
        Object.fromEntries(games.map(g => [g.id, randInt(g.playersMin, g.playersMax)]))
    )

    useEffect(() => {
        const interval = setInterval(() => {
            setPlayers(prev => {
                const next = { ...prev }
                for (const g of games) {
                    const cur = next[g.id]
                    const step = randInt(-15, 15)
                    const newVal = Math.max(g.playersMin, Math.min(g.playersMax, cur + step))
                    next[g.id] = newVal
                }
                return next
            })
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="home-page-container">
            <div className="home-page-hero">
                <div className="hero-content">

                    <h1 style={{ lineHeight: '1.2' }}>{t('home.hero_title')}<br />
                        <span style={{ fontFamily: "'Dancing Script', cursive", color: '#00b4d8', fontSize: '1.2em', textShadow: '0 0 10px rgba(0, 180, 216, 0.4)' }}>Rainbet</span>
                    </h1>
                    <p className="hero-desc">{t('home.hero_desc')}</p>
                </div>
            </div>

            <div className="home-section">
                <div className="section-header">
                    <span style={{ display: 'inline-block', width: 42, height: 42, backgroundColor: '#5eaded', mask: 'url(/images/minilogorainbet.png) center/contain no-repeat', WebkitMask: 'url(/images/minilogorainbet.png) center/contain no-repeat', verticalAlign: 'middle' }}></span>
                    <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '32px', color: '#fff', margin: 0, fontWeight: 700 }}>{t('home.originals')}</h2>
                </div>

                <div className="stake-games-grid">
                    {games.map((game) => (
                        <Link
                            key={game.id}
                            to={game.comingSoon ? '#' : game.path}
                            className={`stake-card ${game.comingSoon ? 'is-coming-soon' : ''}`}
                        >
                            <div className="stake-card-image">
                                {game.image ? (
                                    <img src={game.image} alt={t(game.nameKey)} className="game-art-image" />
                                ) : (
                                    <div className="game-art-placeholder">
                                        {game.icon}
                                    </div>
                                )}
                                <div className="card-overlay">
                                    <div className="play-btn">
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="stake-card-players">
                                <span className="live-dot"></span>
                                <AnimatedCount value={players[game.id]} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default HomePage
