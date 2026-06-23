import { useState } from 'react'

export default function CryptoImg({ crypto, size = 32, className = '' }) {
    const [failed, setFailed] = useState(false)

    if (failed) {
        return (
            <div className={className} style={{
                background: crypto.color,
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
                {crypto.symbol[0]}
            </div>
        )
    }

    return (
        <img
            src={crypto.img}
            alt={crypto.symbol}
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
