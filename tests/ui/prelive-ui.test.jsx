import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import DspPanel from '../../src/components/DspPanel.jsx'
import NativeControls from '../../src/components/NativeControls.jsx'

describe('pre-live UI policy', () => {
  test('DSP panel exposes sandbox-only controls and editable parametric draft', () => {
    render(<DspPanel activeProfile={null} />)
    expect(screen.getByText(/no live audio path/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Add filter' }))
    expect(screen.getByLabelText('Filter 1 frequency')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Select an active profile/i }).disabled).toBe(true)
  })

  test('native controls render write actions disabled before capability discovery', () => {
    render(<NativeControls room="Living Room" />)
    expect(screen.getAllByRole('button', { name: 'Write disabled' }).length).toBeGreaterThan(5)
    for (const button of screen.getAllByRole('button', { name: 'Write disabled' })) expect(button.disabled).toBe(true)
  })
})
