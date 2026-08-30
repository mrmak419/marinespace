import { useState, useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import MessageBubble from './MessageBubble'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🐋 Welcome to MarineSpace!\n\nI\'m ORCA, your marine intelligence assistant. Ask me about:\n• Fishing zones & PFZ advisories\n• Weather & sea conditions\n• Safety alerts & cyclone warnings\n• Tides & ocean currents\n• Route planning\n\nTry: "Is it safe to go fishing near Vizag tomorrow?"',
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

    // TODO: Connect to backend SSE stream in Phase 3
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⏳ Agent system not connected yet. Real AI responses coming in Phase 3.\n\nThis will fetch data from INCOIS, ISRO MOSDAC, IMD, and Open-Meteo to give you a comprehensive answer.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
            Analyzing marine data...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - sticky at bottom */}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}
