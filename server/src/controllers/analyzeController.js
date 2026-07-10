// Analyze controller. Runs the facts pipeline and, if the caller is logged in,
// saves the result so it appears in their history (Phase 6).
const { analyzeRepository } = require('../services/analyzeService')
const prisma = require('../lib/prisma')

// POST /api/analyze  { repoUrl }
async function analyze(req, res, next) {
  try {
    const { repoUrl } = req.body || {}
    const result = await analyzeRepository(repoUrl)

    // If authenticated, persist a copy for "Previous Analyses".
    if (req.user?.sub) {
      try {
        const saved = await prisma.analysis.create({
          data: {
            userId: req.user.sub,
            repoUrl: result.repo.url,
            repoOwner: result.repo.owner,
            repoName: result.repo.name,
            data: result,
          },
        })
        result.savedId = saved.id
      } catch (e) {
        // Saving is best-effort; never fail the analysis because of the DB.
        console.error('Could not save analysis:', e.message)
      }
    }

    res.json(result)
  } catch (err) {
    next(err)
  }
}

// GET /api/analyses  -> current user's saved analyses (metadata only)
async function listAnalyses(req, res, next) {
  try {
    const items = await prisma.analysis.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: 'desc' },
      select: { id: true, repoUrl: true, repoOwner: true, repoName: true, createdAt: true },
    })
    res.json({ analyses: items })
  } catch (err) {
    next(err)
  }
}

// GET /api/analyses/:id  -> one saved analysis (full data), if it's the user's
async function getAnalysis(req, res, next) {
  try {
    const item = await prisma.analysis.findFirst({
      where: { id: req.params.id, userId: req.user.sub },
    })
    if (!item) return res.status(404).json({ error: 'Analysis not found.' })
    res.json(item)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/analyses/:id
async function deleteAnalysis(req, res, next) {
  try {
    const result = await prisma.analysis.deleteMany({
      where: { id: req.params.id, userId: req.user.sub },
    })
    if (result.count === 0) return res.status(404).json({ error: 'Analysis not found.' })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { analyze, listAnalyses, getAnalysis, deleteAnalysis }
