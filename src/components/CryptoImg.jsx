import { useState } from 'react'

const FALLBACK = { color: '#555', symbol: '?' }

export default function CryptoImg({ crypto, size = 32, className = '' }) {
    const [failed, setFailed] = useState(false)
    const c = crypto || FALLBACK

    if (failed) {
        return (
            <div className={className} style={{
                background: c.color,
                width: size,
                height: size,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: Math.round(size * 0.45),
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
            }}>
                {(c.symbol && c.symbol[0]) || '?'}
            </div>
        )
    }

    return (
        <img
            src={c.img}
            alt={c.symbol || ''}
            className={className}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
            }}
            onError={() => setFailed(true)}
        />
    )
}
