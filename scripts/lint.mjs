import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const roots = ['server', 'src', 'scripts', 'tests']
const files = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) await walk(fullPath)
    else if (/\.(mjs|js)$/.test(entry.name)) files.push(fullPath)
  }
}

for (const root of roots) await walk(root)

for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

console.log(`Syntax checked ${files.length} JavaScript files.`)
