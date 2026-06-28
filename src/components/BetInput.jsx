import { useState, useEffect } from 'react'
import CryptoImg from './CryptoImg'

export default function BetInput({
  value,
  onChange,
  placeholder = '0',
  disabled = false,
  className = '',
  style = {},
  min,
  max,
  crypto,
  id,
  ...rest
}) {
  const [focused, setFocused] = useState(false)
  const [localValue, setLocalValue] = useState(() => value !== undefined ? String(value) : '')

  useEffect(() => {
    if (value !== undefined) setLocalValue(String(value))
  }, [value])

  const handleChange = (e) => {
    const raw = e.target.value
    setLocalValue(raw)
    if (raw === '' || raw === '.' || raw === '-' || raw === 'e') {
      return
    }
    const num = Number(raw)
    if (!isNaN(num)) {
      onChange(num)
    }
  }

  const displayValue = focused ? localValue : (value ?? '')
  const prefixLeft = 12
  const circleSize = 20
  const gap = 6
  const dollarWidth = 10
  const padRight = 12
  const prefixWidth = crypto
    ? prefixLeft + circleSize + gap + dollarWidth + 6
    : prefixLeft + dollarWidth + 6

  return (
    <div
      className={className}
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '8px',
        background: '#2a3f4d',
        border: 'none',
        outline: 'none',
        minHeight: '44px',
        transform: disabled
          ? 'none'
          : focused
            ? 'translateY(-2px)'
            : 'translateY(-4px)',
        boxShadow: disabled
          ? 'none'
          : focused
            ? '0 2px 0 rgba(0,231,1,0.5), 0 2px 6px rgba(0,0,0,0.2)'
            : '0 4px 0 rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'default',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${prefixLeft}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: `${gap}px`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {crypto && (
          <CryptoImg crypto={crypto} size={20} />
        )}
        <span
          style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: 1,
          }}
        >
          $
        </span>
      </div>
      <input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-primary)',
          fontSize: '14px',
          fontWeight: 600,
          padding: `12px ${padRight}px 12px ${prefixWidth}px`,
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'text',
          caretColor: 'var(--text-primary)',
          lineHeight: 1.4,
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
