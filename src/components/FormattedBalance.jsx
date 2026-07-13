export function formatBalance(value) {
  const parts = value.toFixed(2).split('.');
  const intNum = parseInt(parts[0]);
  const formattedInt = intNum >= 10000
    ? intNum.toLocaleString('en-US')
    : intNum.toString();
  return { int: formattedInt, dec: parts[1] };
}

export default function FormattedBalance({ value, symbol, className }) {
  const { int, dec } = formatBalance(value);
  return (
    <span className={className}>
      {symbol}{int}<span style={{ color: 'var(--text-secondary)' }}>.{dec}</span>
    </span>
  );
}
