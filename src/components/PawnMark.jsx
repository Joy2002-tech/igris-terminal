export default function PawnMark({ size = 20, color = 'var(--acc2)' }) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="5" r="4" fill={color} />
      <path d="M6.5 9.5H11.5L13 15H5L6.5 9.5Z" fill={color} />
      <path d="M3.5 17H14.5L16 22.5H2L3.5 17Z" fill={color} />
      <rect x="1" y="23.5" width="16" height="2.2" rx="1.1" fill={color} />
    </svg>
  )
}
