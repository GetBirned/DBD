import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import spotifyRouter from './spotify.js'
import steamRouter from './steam.js'
import psnRouter from './psn.js'
import githubRouter from './github.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

const app = express()
const PORT = process.env.PORT || 3000

app.use('/api/spotify', spotifyRouter)
app.use('/api/steam', steamRouter)
app.use('/api/psn', psnRouter)
app.use('/api/github', githubRouter)

app.use(express.static(distDir))

// SPA fallback: any non-API route serves index.html so client-side routing works.
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
