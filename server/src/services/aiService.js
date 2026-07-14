// The ONLY place in the app that talks to the AI provider.
// Provider-agnostic: everything comes from env (AI_BASE_URL, AI_API_KEY, MODEL).
// Swapping providers later = change env values (and, at most, this one file).
const config = require('../lib/config')

// Sends a chat-completion request in the common OpenAI-compatible shape.
// `MODEL=auto` is passed straight through so a FreeModel endpoint can pick.
async function askAI({ system, messages }) {
  if (!config.ai.baseUrl || !config.ai.apiKey) {
    const err = new Error('AI is not configured. Set AI_BASE_URL and AI_API_KEY in server/.env.')
    err.status = 503
    throw err
  }

  const fullMessages = []
  if (system) fullMessages.push({ role: 'system', content: system })
  fullMessages.push(...messages)

  let res
  try {
    res = await fetch(`${config.ai.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.ai.model, // "auto" => provider selects the model
        messages: fullMessages,
          max_tokens: 1000,
      }),
    })
  } catch (cause) {
    const err = new Error('Could not reach the AI provider.')
    err.status = 502
    err.cause = cause
    throw err
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const err = new Error(`AI provider error (${res.status}): ${body.slice(0, 300)}`)
    err.status = 502
    throw err
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    const err = new Error('AI provider returned no content.')
    err.status = 502
    throw err
  }
  return content
}

module.exports = { askAI }
