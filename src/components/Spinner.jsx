export default function Spinner({ size = 24, className = '' }) {
  const dimension = typeof size === 'number' ? `${size}px` : size
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 ${className}`}
      style={{ width: dimension, height: dimension }}
      aria-label="Loading"
    />
  )
}
