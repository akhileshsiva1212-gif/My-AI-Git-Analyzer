// Single shared PrismaClient instance. Importing this everywhere avoids
// opening a new DB connection pool per file.
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = prisma
