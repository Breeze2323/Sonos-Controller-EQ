import { access } from 'node:fs/promises'

const required = [
  'AGENTS.md',
  'AUTONOMY.md',
  'docs/ARCHITECTURE.md',
  'docs/ROADMAP.md',
  'docs/AUDIO_PATHS.md',
  'docs/SAFETY_AND_ROLLBACK.md',
  'server/services/dsp/DspAdapter.js',
  'server/services/dsp/MockDspAdapter.js',
  'scripts/windows/Test-DspReadiness.ps1',
]

const missing = []
for (const file of required) {
  try { await access(file) } catch { missing.push(file) }
}

if (missing.length) {
  console.error(`Missing required project files:\n${missing.join('\n')}`)
  process.exit(1)
}

console.log(`Verified ${required.length} required project files.`)
