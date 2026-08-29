import { useState } from 'react'
import ChatPanel from './components/chat/ChatPanel'
import MapView from './components/map/MapView'
import AlertBanner from './components/dashboard/AlertBanner'
import './index.css'
import 'leaflet/dist/leaflet.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Top Alert Banner */}
      <AlertBanner />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Panel - Left Side */}
        <div className={`${
          sidebarOpen ? 'w-[420px]' : 'w-0'
        } transition-all duration-300 flex-shrink-0 border-r border-border overflow-hidden`}>
          <ChatPanel />
        </div>

        {/* Map - Right Side */}
        <div className="flex-1 relative">
          {/* Toggle sidebar button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors"
            title={sidebarOpen ? 'Hide chat' : 'Show chat'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <MapView />
        </div>
      </div>
    </div>
  )
}

export default App
