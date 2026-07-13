import { useMemo, useState } from 'react'
import { createFlatGraphicEq } from '../lib/dsp/graphicEq'
import { assessHeadroom } from '../lib/dsp/headroom'
import { estimateResponse } from '../lib/dsp/response'

function initialConfiguration() {
  return { schemaVersion: 1, enabled: true, preampDb: -6, graphicEq: { bands: createFlatGraphicEq(15) }, parametricEq: { filters: [] } }
}

async function post(path, body) {
  const response = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  return response.json()
}

export default function DspPanel() {
  const [configuration, setConfiguration] = useState(initialConfiguration)
  const [mode, setMode] = useState(15)
  const [result, setResult] = useState(null)
  const response = useMemo(() => estimateResponse(configuration), [configuration])
  const headroom = useMemo(() => assessHeadroom(configuration), [configuration])

  const setModeBands = (nextMode) => {
    setMode(nextMode)
    setConfiguration((current) => ({ ...current, graphicEq: { bands: createFlatGraphicEq(nextMode) } }))
  }
  const setBandGain = (index, gainDb) => setConfiguration((current) => ({ ...current, graphicEq: { bands: current.graphicEq.bands.map((band, bandIndex) => bandIndex === index ? { ...band, gainDb } : band) } }))
  const stage = async () => setResult(await post('/api/dsp/stage', configuration))
  const applySandbox = async () => setResult(await post('/api/dsp/apply', configuration))
  const toggleBypass = async () => setResult(await post('/api/dsp/bypass', { enabled: configuration.enabled }))

  return (
    <section className="settings-page" aria-label="DSP equalizer">
      <div className="settings-section">
        <div className="settings-section-title">DSP laboratory</div>
        <div className="settings-card" style={{ gap: 12 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Electrical filter estimate only. Staging and apply target the configured sandbox/mock adapter; no live audio path is claimed or changed.</div>
          <label className="toggle-row"><span>Enable DSP configuration</span><input type="checkbox" checked={configuration.enabled} onChange={(event) => setConfiguration((current) => ({ ...current, enabled: event.target.checked }))} /></label>
          <label>Graphic bands <select value={mode} onChange={(event) => setModeBands(Number(event.target.value))}><option value={15}>15-band</option><option value={31}>31-band</option></select></label>
          <label>Preamp {configuration.preampDb} dB<input type="range" min="-60" max="0" value={configuration.preampDb} onChange={(event) => setConfiguration((current) => ({ ...current, preampDb: Number(event.target.value) }))} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))', gap: 8 }}>
            {configuration.graphicEq.bands.map((band, index) => <label key={band.frequencyHz} style={{ fontSize: 11 }}>{band.frequencyHz} Hz<input aria-label={`${band.frequencyHz} Hz gain`} type="range" min="-12" max="12" value={band.gainDb} onChange={(event) => setBandGain(index, Number(event.target.value))} /><span>{band.gainDb} dB</span></label>)}
          </div>
          <div aria-live="polite" style={{ fontSize: 12, color: headroom.sufficient ? 'var(--success, #4caf50)' : 'var(--warning, #e6a23c)' }}>Headroom: {headroom.sufficient ? 'sufficient' : 'reduce preamp'}; recommended {headroom.recommendedPreampDb} dB; clipping risk {response.clippingRisk}.</div>
          <div role="img" aria-label="Estimated EQ response" style={{ display: 'flex', alignItems: 'end', height: 76, gap: 2, borderBottom: '1px solid var(--border)' }}>{response.points.map((point) => <span key={point.frequencyHz} title={`${point.frequencyHz} Hz: ${point.magnitudeDb.toFixed(1)} dB`} style={{ flex: 1, height: `${Math.min(100, Math.abs(point.magnitudeDb) * 7 + 2)}%`, background: point.magnitudeDb >= 0 ? 'var(--accent-primary)' : 'var(--text-muted)', opacity: 0.75 }} />)}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="btn btn-secondary" onClick={stage}>Stage safely</button><button className="btn btn-primary" onClick={applySandbox}>Apply to sandbox/mock</button><button className="btn btn-secondary" onClick={toggleBypass}>Bypass sandbox/mock</button></div>
          {result && <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>}
        </div>
      </div>
    </section>
  )
}
