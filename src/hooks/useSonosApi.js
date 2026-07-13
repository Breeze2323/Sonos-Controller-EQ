import { useState, useCallback } from 'react'

/**
 * Routes all Sonos API calls through the Vite dev-server proxy at /sonos-proxy.
 * This avoids CORS entirely — the browser calls localhost, Node.js forwards
 * the request to the Sonos API on the local network.
 */
function proxyUrl(targetUrl) {
  return `/sonos-proxy?url=${encodeURIComponent(targetUrl)}`
}

async function apiGet(targetUrl) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 9000)
  try {
    const res = await fetch(proxyUrl(targetUrl), { signal: controller.signal })
    clearTimeout(timeout)
    return res
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

export function useSonosApi() {
  const [applying, setApplying] = useState(false)
  const [testing, setTesting] = useState(false)
  const [fetchingSettings, setFetchingSettings] = useState(false)

  const buildBase = (config) => `http://${config.host}:${config.port}`

  const testConnection = useCallback(async (config) => {
    setTesting(true)
    const url = `${buildBase(config)}/${encodeURIComponent(config.room)}/state`
    try {
      const res = await apiGet(url)
      if (res.status === 502) {
        let body = ''
        try { body = await res.text() } catch {}
        const msg = (body.includes('ENOTFOUND') || body.includes('getaddrinfo'))
          ? `Host not found: "${config.host}" — check the IP address.`
          : `Connection refused — is node-sonos-http-api running on ${config.host}:${config.port}?`
        return { ok: false, message: msg }
      }
      if (res.status === 504) {
        return { ok: false, message: `Connection timed out — check host/port.` }
      }
      if (res.ok || res.status < 500) {
        return { ok: true, message: 'Connected successfully' }
      }
      return { ok: false, message: `Server returned ${res.status}` }
    } catch (err) {
      if (err.name === 'AbortError') {
        return { ok: false, message: 'Request timed out (9s)' }
      }
      return { ok: false, message: err.message || 'Unknown error' }
    } finally {
      setTesting(false)
    }
  }, [])

  const applyProfile = useCallback(async (config, profile) => {
    setApplying(true)
    void config
    setApplying(false)
    return { ok: false, previewOnly: true, code: 'LIVE_SONOS_WRITES_DISABLED', message: `"${profile.name}" was previewed; live Sonos writes are disabled.`, results: [], liveAudioProcessed: false }
  }, [])

  const fetchCurrentSettings = useCallback(async (config) => {
    setFetchingSettings(true)
    const base = buildBase(config)
    const room = encodeURIComponent(config.room)
    try {
      const res = await apiGet(`${base}/${room}/state`)
      if (!res.ok && res.status >= 500) {
        return { ok: false, message: `Failed to fetch state (${res.status})` }
      }
      const data = await res.json()
      const eq = data.equalizer || {}
      return {
        ok: true,
        settings: {
          volume: typeof data.volume === 'number' ? data.volume : 40,
          bass: typeof eq.bass === 'number' ? eq.bass : 0,
          treble: typeof eq.treble === 'number' ? eq.treble : 0,
          nightMode: !!eq.nightMode,
          subwooferEnabled: typeof eq.subEnabled === 'boolean' ? eq.subEnabled : false,
          subwooferGain: typeof eq.subGain === 'number' ? eq.subGain : 0,
        },
      }
    } catch (err) {
      if (err.name === 'AbortError') return { ok: false, message: 'Request timed out' }
      return { ok: false, message: err.message || 'Unknown error' }
    } finally {
      setFetchingSettings(false)
    }
  }, [])

  return { applying, testing, fetchingSettings, testConnection, applyProfile, fetchCurrentSettings }
}
