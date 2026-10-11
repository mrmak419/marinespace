import { useState, useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import { API_BASE_URL } from '@/lib/constants'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  data?: {
    location?: string
    safety_assessment?: {
      level: 'SAFE' | 'CAUTION' | 'DANGEROUS'
      score: number
      reasons: string[]
      recommendations: string[]
    }
    metrics?: {
      wave_height_m: number
      wind_speed_knots: number
      wind_gusts_knots: number
      sst_c: number
      sea_state: string
      condition: string
      tide: string
    }
    pfz_zones?: any[]
    sources?: string[]
  }
}

const QUICK_PROMPTS = [
  "🌊 Is it safe near Vizag tomorrow?",
  "🐟 Where are the nearest PFZ spots from Chennai?",
  "⚠️ Any cyclone or high wave alerts?",
  "🧭 Sea conditions near Kochi harbor",
]

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🐋 **Welcome to MarineSpace!**\n\nI am **ORCA**, your intelligent marine assistant for Indian coastal waters.\n\nAsk me about:\n• **Sea Safety & Hazard Assessments**\n• **Potential Fishing Zones (PFZ)**\n• **Real-time Waves, Winds & Currents**\n• **Maritime Boundary (IMBL) Geofencing**\n\nTap a quick query below or type your question:',
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "No response received.",
        timestamp: new Date(),
        data: data,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Error fetching marine intelligence: ${err.message}. Please check backend connection.`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 border-b border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar bg-slate-50/80">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-full shadow-xs transition-colors shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user'
          const meta = message.data

          return (
            <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200 shadow-xs'
                }`}
              >
                {/* Safety Badge Card (if assistant returned safety evaluation) */}
                {meta?.safety_assessment && (
                  <div className="mb-2.5 p-2 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {meta.location || 'Marine Sector'} Assessment
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          meta.safety_assessment.level === 'SAFE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : meta.safety_assessment.level === 'CAUTION'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {meta.safety_assessment.level} ({meta.safety_assessment.score}/100)
                      </span>
                    </div>

                    {/* Key Marine Metrics Grid */}
                    {meta.metrics && (
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] text-slate-600">
                        <div className="bg-slate-50 p-1 rounded text-center">
                          <div className="text-[10px] text-slate-400">Waves</div>
                          <div className="font-semibold text-slate-800">{meta.metrics.wave_height_m}m</div>
                        </div>
                        <div className="bg-slate-50 p-1 rounded text-center">
                          <div className="text-[10px] text-slate-400">Winds</div>
                          <div className="font-semibold text-slate-800">{meta.metrics.wind_speed_knots} kn</div>
                        </div>
                        <div className="bg-slate-50 p-1 rounded text-center">
                          <div className="text-[10px] text-slate-400">SST</div>
                          <div className="font-semibold text-slate-800">{meta.metrics.sst_c}°C</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Citations Footer */}
                {meta?.sources && meta.sources.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500">
                    <strong>Sources:</strong> {meta.sources.join(' • ')}
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-[10px] mt-1.5 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                  {message.timestamp.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 px-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
            ORCA is analyzing satellite & sea conditions...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}
