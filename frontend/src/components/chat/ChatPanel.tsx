import { useState } from 'react'
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
      content: '🐋 Welcome to MarineSpace! I\'m ORCA, your marine intelligence assistant.\n\nAsk me anything about:\n• Fishing zones & PFZ advisories\n• Weather & sea conditions\n• Safety alerts & warnings\n• Tides & ocean currents\n• Route planning\n\nTry: "Is it safe to go fishing near Vizag tomorrow?"',
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // TODO: Connect to backend SSE stream
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⏳ Backend not connected yet. This will be replaced with real AI responses in Phase 3.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-blue-600 to-cyan-500">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          🐋 MarineSpace
        </h1>
        <p className="text-xs text-blue-100">ORCA Marine Intelligence</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-pulse flex gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            Analyzing marine data...
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}
