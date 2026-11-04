// Fallback silhouette for a character or mood with no art yet.
export function Silhouette({ id, hue = '#7a5cc7' }) {
  const g = `pt-${id}`
  return (
    <svg viewBox="0 0 250 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hue} stopOpacity=".9" />
          <stop offset="1" stopColor="#0d004d" stopOpacity=".95" />
        </linearGradient>
      </defs>
      <circle cx="125" cy="130" r="58" fill={`url(#${g})`} />
      <path d="M25 360c0-90 45-150 100-150s100 60 100 150z" fill={`url(#${g})`} />
    </svg>
  )
}
