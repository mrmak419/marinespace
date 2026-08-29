interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div
          className={`text-[10px] mt-1 ${
            isUser ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {message.timestamp.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}
