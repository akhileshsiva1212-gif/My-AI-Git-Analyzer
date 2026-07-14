// AI Repository Chat. Sends the extracted facts + the conversation to
// POST /api/chat, which routes through the single aiService on the backend.
import { useState, useRef, useEffect } from 'react'
import { apiPost } from '../services/api'
import Skeleton from './Skeleton'

const SUGGESTIONS = [
  'What does this project do?',
  'Explain the tech stack.',
  'How is the code organized?',
  'What database and auth does it use?',
]

export default function Chat({ facts }) {
  const [messages, setMessages] = useState([]) // { role, content }
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function ask(question) {
    if (!question || loading) return
    const nextMessages = [...messages, { role: 'user', content: question }]
    setMessages(nextMessages)
    setInput('')
    setError(null)
    setLoading(true)
    try {
      const { answer } = await apiPost('/chat', { facts, messages: nextMessages })
      setMessages((m) => [...m, { role: 'assistant', content: answer }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function send(e) {
    e.preventDefault()
    ask(input.trim())
  }

  return (
    <div className="neu-card flex h-[34rem] flex-col p-2">
      {/* Messages */}
      <div className="neu-scroll flex-1 space-y-3 overflow-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted">Try asking:</p>
            <div className="flex flex-wrap gap-2.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="neu-btn px-3.5 py-1.5 text-xs font-medium text-[color:var(--neu-text)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap px-4 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'neu-accent rounded-2xl'
                  : 'neu-inset rounded-2xl text-[color:var(--neu-text)]'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Shimmer "typing" bubble while waiting. */}
        {loading && (
          <div className="flex justify-start">
            <div className="neu-inset w-52 space-y-2 rounded-2xl px-4 py-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        )}
        {error && <p className="neu-inset px-3 py-2 text-sm text-rose-600">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-2 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="neu-input flex-1 px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="neu-accent px-5 py-2.5 text-sm font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  )
}
