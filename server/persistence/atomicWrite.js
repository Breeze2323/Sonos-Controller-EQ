import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

export async function atomicWriteJson(targetPath, value) {
  const directory = path.dirname(targetPath)
  const basename = path.basename(targetPath)
  const temporaryPath = path.join(directory, `.${basename}.${process.pid}.tmp`)
  const backupPath = `${targetPath}.previous`
  const serialized = `${JSON.stringify(value, null, 2)}\n`

  await mkdir(directory, { recursive: true })

  try {
    await writeFile(temporaryPath, serialized, { encoding: 'utf8', flag: 'wx' })
    const handle = await open(temporaryPath, 'r')
    await handle.sync()
    await handle.close()

    try {
      const existing = await readFile(targetPath)
      await writeFile(backupPath, existing, { flag: 'w' })
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }

    await rename(temporaryPath, targetPath)
    return { ok: true, targetPath, backupPath }
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => {})
    throw error
  }
}
