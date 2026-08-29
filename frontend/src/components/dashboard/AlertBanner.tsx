import { useState } from 'react'

export default function AlertBanner() {
  const [dismissed, setDismissed] = useState(false)

  // TODO: Fetch real alerts from backend
  const hasAlert = false

  if (dismissed || !hasAlert) return null

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-sm flex items-center justify-between">
      <span>⚠️ High Wave Alert active for Andhra Pradesh coast — INCOIS Advisory</span>
      <button onClick={() => setDismissed(true)} className="ml-4 hover:text-amber-100">
        ✕
      </button>
    </div>
  )
}
