// Entry point: starts the HTTP server.
const app = require('./app')
const config = require('./lib/config')

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
})
