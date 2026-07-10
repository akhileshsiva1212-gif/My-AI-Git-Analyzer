// AI Repository Chat (Phase 5). Sends the extracted facts + the conversation
// to POST /api/chat, which routes through the single aiService on the backend.
import { useState, useRef, useEffect } from 'react'
import { apiPost } from '../services/api'

export default function Chat({ facts }) {
  const [messages, setMessages] = useState([]) // { role, content }
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(e) {
    e.preventDefault()
    const question = input.trim()
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

  const suggestions = [
    'What does this project do?',
    'Explain the tech stack.',
    'How is the code organized?',
    'What database and auth does it use?',
  ]

  return (
    <div className="flex h-[32rem] flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-800">💬 Ask about this repository</h3>
        <p className="text-xs text-gray-400">Answers are grounded in the extracted facts.</p>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200"
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
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-400">Thinking…</div>
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-gray-100 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}
