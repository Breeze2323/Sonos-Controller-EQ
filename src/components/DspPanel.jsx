import { useMemo, useState } from 'react'
import { createFlatGraphicEq } from '../lib/dsp/graphicEq'
import { assessHeadroom } from '../lib/dsp/headroom'
import { estimateResponse } from '../lib/dsp/response'
import { DEFAULT_SOURCE_COVERAGE } from '../../shared/domain/sourceCoverage'

const PRESETS = {
  flat: () => initialConfiguration(),
  speech: () => ({ ...initialConfiguration(), preampDb: -5, parametricEq: { filters: [{ id: 'speech-presence', enabled: true, type: 'peak', frequencyHz: 2500, gainDb: 2, q: 1.2 }] } }),
  night: () => ({ ...initialConfiguration(), preampDb: -10, parametricEq: { filters: [{ id: 'night-bass', enabled: true, type: 'low_shelf', frequencyHz: 120, gainDb: -3, q: 0.8 }] } }),
}

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
  const [rewText, setRewText] = useState('')
  const [rewPreview, setRewPreview] = useState(null)
  const [slotA, setSlotA] = useState(null)
  const [slotB, setSlotB] = useState(null)
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
  const previewRew = async () => setRewPreview(await post('/api/rew/parse', { text: rewText }))
  const importRewDraft = () => {
    if (!rewPreview?.ok) return
    setConfiguration((current) => ({ ...current, preampDb: rewPreview.preampDb ?? current.preampDb, parametricEq: { filters: rewPreview.filters } }))
    setResult({ ok: true, importedToDraft: true, applied: false, liveAudioProcessed: false, importHash: rewPreview.importHash })
  }
  const addFilter = () => setConfiguration((current) => ({ ...current, parametricEq: { filters: [...current.parametricEq.filters, { id: `filter-${Date.now()}`, enabled: true, type: 'peak', frequencyHz: 1000, gainDb: 0, q: 1 }] } }))
  const updateFilter = (index, updates) => setConfiguration((current) => ({ ...current, parametricEq: { filters: current.parametricEq.filters.map((filter, filterIndex) => filterIndex === index ? { ...filter, ...updates } : filter) } }))
  const deleteFilter = (index) => setConfiguration((current) => ({ ...current, parametricEq: { filters: current.parametricEq.filters.filter((_, filterIndex) => filterIndex !== index) } }))
  const loadPreset = (name) => setConfiguration(PRESETS[name]())

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
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span style={{ fontSize: 12 }}>Presets:</span>{Object.keys(PRESETS).map((name) => <button key={name} className="btn btn-secondary" onClick={() => loadPreset(name)}>{name}</button>)}<button className="btn btn-secondary" onClick={() => setSlotA(structuredClone(configuration))}>Save A</button><button className="btn btn-secondary" onClick={() => setSlotB(structuredClone(configuration))}>Save B</button><button className="btn btn-secondary" disabled={!slotA} onClick={() => setConfiguration(structuredClone(slotA))}>Load A</button><button className="btn btn-secondary" disabled={!slotB} onClick={() => setConfiguration(structuredClone(slotB))}>Load B</button></div>
          {result && <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>}
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-section-title">Parametric filters</div>
        <div className="settings-card" style={{ gap: 8 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>These filters are part of the local draft and the estimated response only.</div>
          {configuration.parametricEq.filters.map((filter, index) => <div key={filter.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr)) auto', gap: 6, alignItems: 'center' }}><select aria-label={`Filter ${index + 1} type`} value={filter.type} onChange={(event) => updateFilter(index, { type: event.target.value })}><option value="peak">Peak</option><option value="low_shelf">Low shelf</option><option value="high_shelf">High shelf</option><option value="notch">Notch</option></select><input aria-label={`Filter ${index + 1} frequency`} type="number" min="10" max="24000" value={filter.frequencyHz} onChange={(event) => updateFilter(index, { frequencyHz: Number(event.target.value) })} /><input aria-label={`Filter ${index + 1} gain`} type="number" min="-24" max="12" step="0.1" value={filter.gainDb} onChange={(event) => updateFilter(index, { gainDb: Number(event.target.value) })} /><input aria-label={`Filter ${index + 1} Q`} type="number" min="0.1" max="30" step="0.1" value={filter.q} onChange={(event) => updateFilter(index, { q: Number(event.target.value) })} /><label>On<input type="checkbox" checked={filter.enabled} onChange={(event) => updateFilter(index, { enabled: event.target.checked })} /></label><button className="btn btn-secondary" onClick={() => deleteFilter(index)}>Remove</button></div>)}
          <button className="btn btn-secondary" onClick={addFilter}>Add filter</button>
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-section-title">REW filter import</div>
        <div className="settings-card" style={{ gap: 10 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Paste a REW Equalizer APO filter export to validate and preview it. Importing changes only this local draft.</div>
          <textarea aria-label="REW filter text" value={rewText} onChange={(event) => setRewText(event.target.value)} placeholder={'Preamp: -4 dB\nFilter 1: ON PK Fc 100 Hz Gain 3 dB Q 1.4'} rows={5} style={{ width: '100%', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-secondary" onClick={previewRew}>Preview REW filters</button><button className="btn btn-primary" disabled={!rewPreview?.ok} onClick={importRewDraft}>Import into draft</button></div>
          {rewPreview && <div aria-live="polite" style={{ fontSize: 12 }}>{rewPreview.ok ? `${rewPreview.filters.length} filters validated; hash ${rewPreview.importHash.slice(0, 12)}…` : rewPreview.errors?.map((error) => `Line ${error.line}: ${error.message}`).join('; ')}</div>}
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-section-title">Source coverage</div>
        <div className="settings-card" style={{ gap: 6 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Status is evidence-based; expected and unknown are not claims of DSP processing.</div>
          {Object.entries(DEFAULT_SOURCE_COVERAGE).map(([source, state]) => <div key={source} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>{source}</span><span>{state.replaceAll('_', ' ')}</span></div>)}
        </div>
      </div>
    </section>
  )
}
