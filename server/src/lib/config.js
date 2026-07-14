// Central place to read environment variables.
// Everything that needs config imports from here, so we never scatter
// process.env reads across the codebase.
require('dotenv').config()

const config = {
  port: process.env.PORT || 5000,

  // AI layer — provider-agnostic. These come only from the environment.
 ai: {
  baseUrl: process.env.AI_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  model: process.env.AI_MODEL || 'google/gemini-2.5-flash',
},

  // Database + auth.
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,

  // Google OAuth — only the Client ID is needed (ID-token verification flow).
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
}

module.exports = config
