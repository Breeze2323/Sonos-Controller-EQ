import { useState } from 'react'

const CONTROL_LABELS = {
  loudness: 'Loudness', subEnabled: 'Subwoofer enabled', subGain: 'Subwoofer gain', surroundEnabled: 'Surround enabled', surroundTvLevel: 'Surround TV level', surroundMusicLevel: 'Surround music level', surroundMusicMode: 'Surround music mode', nightMode: 'Night mode', speechEnhancement: 'Speech enhancement', dialogSyncDelay: 'TV dialog-sync delay',
}

export default function NativeControls({ room }) {
  const [capabilities, setCapabilities] = useState(null)
  const [status, setStatus] = useState('Capability discovery is optional and read-only.')

  const discover = async () => {
    if (!room?.trim()) return setStatus('Enter a room name in Connection settings before discovery.')
    setStatus('Checking read-only capability metadata…')
    try {
      const response = await fetch(`/api/sonos/capabilities?room=${encodeURIComponent(room)}`)
      const value = await response.json()
      if (!response.ok) throw new Error(value.error?.message || 'Capability request failed')
      setCapabilities(value)
      setStatus('Read-only capability metadata loaded. All writes remain disabled.')
    } catch (error) { setStatus(`Capability discovery unavailable: ${error.message}`) }
  }

  return (
    <div className="settings-card" style={{ gap: 10 }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Native controls are capability-gated. This interface never sends a setting change; live Sonos writes require a later explicit approval gate.</div>
      <button className="btn btn-secondary" onClick={discover}>Read capabilities</button>
      <div aria-live="polite" style={{ fontSize: 12 }}>{status}</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {Object.entries(CONTROL_LABELS).map(([key, label]) => {
          const control = capabilities?.controls?.[key]
          return <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><span style={{ fontSize: 13 }}>{label}</span><span style={{ fontSize: 11, color: control?.state === 'supported' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{control?.state ?? 'not probed'}</span><button className="btn btn-secondary" disabled title="Live writes are disabled by policy">Write disabled</button></div>
        })}
      </div>
    </div>
  )
}
