import { readdir, readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const root = process.argv[2] ?? process.cwd()
const ignoreDirs = new Set(['.git', 'node_modules', 'coverage', 'dist', '.turbo', '.cache'])
const isBinary = /(\.png$|\.jpg$|\.jpeg$|\.gif$|\.ico$|\.zip$|\.jar$|\.woff2$|\.ttf$|\.woff$)/i

async function discoverFiles(directory) {
  const found = []
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name === '.git') continue
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue
      found.push(...await discoverFiles(join(directory, entry.name)))
      continue
    }
    if (entry.isFile() && !isBinary.test(entry.name)) {
      found.push(join(directory, entry.name))
    }
  }
  return found
}

let files
try {
  files = execFileSync('git', ['-C', root, 'ls-files'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().split(/\r?\n/).filter(Boolean)
  if (files.length === 0) throw new Error('git index returned no files')
  files = files.map((entry) => join(root, entry))
} catch {
  files = await discoverFiles(root)
}
const pattern = /(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})/
for (const file of files) {
  const text = await readFile(file, 'utf8').catch(() => '')
  if (pattern.test(text)) throw new Error(`Potential secret detected in ${file}`)
}
console.log(`Secret scan checked ${files.length} files.`)
