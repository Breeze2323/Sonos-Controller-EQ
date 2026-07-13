export const REW_AUDIT_SCHEMA_VERSION = 1
const MAX_AUDIT_ENTRIES = 50

export function createRewAuditEntry(preview, createdAt = new Date().toISOString()) {
  if (!preview?.ok || typeof preview.importHash !== 'string' || !Array.isArray(preview.filters)) {
    throw new TypeError('A successful REW preview is required')
  }
  return {
    schemaVersion: REW_AUDIT_SCHEMA_VERSION,
    id: `rew-${preview.importHash.slice(0, 16)}`,
    createdAt,
    importHash: preview.importHash,
    preampDb: preview.preampDb ?? null,
    filterCount: preview.filters.length,
    filters: structuredClone(preview.filters),
    applied: false,
    liveAudioProcessed: false,
  }
}

export function appendRewAudit(existing, preview, createdAt) {
  const entry = createRewAuditEntry(preview, createdAt)
  const prior = Array.isArray(existing) ? existing.filter((item) => item?.id !== entry.id) : []
  return [...prior, entry].slice(-MAX_AUDIT_ENTRIES)
}
