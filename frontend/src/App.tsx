import { useState } from 'react'
import ChatPanel from './components/chat/ChatPanel'
import MapView from './components/map/MapView'
import AlertBanner from './components/dashboard/AlertBanner'
import './index.css'
import 'leaflet/dist/leaflet.css'

function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatExpanded, setChatExpanded] = useState(false)

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-background">
      {/* Top Alert Banner */}
      <AlertBanner />

      {/* Main Content - Map is always full screen */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map - Full screen base layer */}
        <MapView />

        {/* Mobile: Bottom Sheet Chat */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-[1000] transition-all duration-300 ease-in-out ${
            chatOpen
              ? chatExpanded
                ? 'h-[85%]'
                : 'h-[50%]'
              : 'h-0'
          }`}
        >
          {chatOpen && (
            <div className="h-full flex flex-col bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
              {/* Drag Handle */}
              <button
                onClick={() => {
                  if (chatExpanded) {
                    setChatExpanded(false)
                  } else {
                    setChatExpanded(true)
                  }
                }}
                className="flex justify-center py-2 cursor-grab active:cursor-grabbing"
              >
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </button>

              {/* Close button */}
              <button
                onClick={() => {
                  setChatOpen(false)
                  setChatExpanded(false)
                }}
                className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl z-10"
              >
                ✕
              </button>

              {/* Chat content */}
              <div className="flex-1 overflow-hidden">
                <ChatPanel />
              </div>
            </div>
          )}
        </div>

        {/* Floating Chat Button (when chat is closed) */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="absolute bottom-6 right-6 z-[1000] bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-all"
            aria-label="Open ORCA chat"
          >
            <span className="text-2xl">🐋</span>
          </button>
        )}

        {/* Location Button */}
        <button
          className="absolute top-4 right-4 z-[999] bg-white rounded-lg shadow-lg p-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          aria-label="My location"
          onClick={() => {
            navigator.geolocation?.getCurrentPosition(
              (pos) => {
                // TODO: Pan map to user location
                console.log(pos.coords.latitude, pos.coords.longitude)
              },
              () => alert('Location access denied')
            )
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>

        {/* App Title Overlay */}
        <div className="absolute top-4 left-4 z-[999]">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2">
            <h1 className="text-sm font-bold text-blue-700 flex items-center gap-1.5">
              🐋 MarineSpace
            </h1>
            <p className="text-[10px] text-gray-500">ORCA Marine Intelligence</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
