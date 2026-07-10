// Central place to read environment variables.
// Everything that needs config imports from here, so we never scatter
// process.env reads across the codebase.
require('dotenv').config()

const config = {
  port: process.env.PORT || 5000,

  // AI layer — provider-agnostic. These come only from the environment.
  ai: {
    baseUrl: process.env.AI_BASE_URL,
    apiKey: process.env.AI_API_KEY,
    model: process.env.MODEL || 'auto',
  },

  // Used later, in Phase 6.
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
}

module.exports = config
