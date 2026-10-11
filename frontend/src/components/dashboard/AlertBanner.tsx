import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/constants'

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [dismissed, setDismissed] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/alerts/`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.alerts && data.alerts.length > 0) {
          setAlerts(data.alerts)
        }
      })
      .catch((err) => console.warn('Could not fetch alerts:', err))
  }, [])

  useEffect(() => {
    if (alerts.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [alerts])

  if (dismissed || alerts.length === 0) return null

  const activeAlert = alerts[currentIndex]

  return (
    <div className="bg-amber-600 text-white px-3 py-1.5 text-xs flex items-center justify-between shadow-md z-[1001] transition-all">
      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="font-bold bg-amber-800 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">
          {activeAlert.source || 'ADVISORY'}
        </span>
        <span className="font-medium truncate">
          {activeAlert.title}: {activeAlert.details}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="ml-3 text-amber-200 hover:text-white shrink-0 px-1"
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  )
}
