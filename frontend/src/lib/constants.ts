// Map defaults
export const MAP_CENTER: [number, number] = [20.5937, 78.9629] // Center of India
export const MAP_ZOOM = 5
export const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.0, 65.0],   // Southwest corner
  [35.0, 98.0],  // Northeast corner
]

// Safety thresholds
export const SAFETY_THRESHOLDS = {
  waveHeight: { safe: 1.5, caution: 3.0 },     // meters
  windSpeed: { safe: 20, caution: 35 },          // knots
  windGusts: { safe: 30, caution: 45 },          // knots
  visibility: { safe: 5000, caution: 1000 },     // meters
} as const

// API base URL - defaults to relative path in dev (handled by Vite proxy), or custom URL in production
export const API_BASE_URL = import.meta.env.VITE_API_URL || ''
