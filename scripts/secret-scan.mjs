import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean)
const pattern = /(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})/
for (const file of files) {
  const text = await readFile(file, 'utf8').catch(() => '')
  if (pattern.test(text)) throw new Error(`Potential secret detected in ${file}`)
}
console.log(`Secret scan checked ${files.length} tracked files.`)
