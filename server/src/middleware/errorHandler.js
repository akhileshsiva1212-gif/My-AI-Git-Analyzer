// Error-handling middleware. Central place to turn thrown errors into JSON.
// Services throw Error objects with an optional `.status`; we honor it.
function errorHandler(err, _req, res, _next) {
  const status = err.status || 500
  if (status >= 500) console.error(err) // log unexpected errors
  res.status(status).json({ error: err.message || 'Something went wrong.' })
}

// 404 for unknown API routes.
function notFound(_req, res) {
  res.status(404).json({ error: 'Not found.' })
}

module.exports = { errorHandler, notFound }
