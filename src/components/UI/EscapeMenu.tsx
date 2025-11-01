'use client'
import React from 'react'
import { useSettings } from './SettingsProvider'

export default function EscapeMenu() {
    const {
        menuOpen, setMenuOpen,

        // Controls hint
        controlsHintVisible, setControlsHintVisible,
        controlsHintPosition, setControlsHintPosition,

        // Pixelization
        pixelateBase, pixelateSize, setPixelateSize,
        resetVisuals,

        // Mouse sensitivity
        mouseSensBase, mouseSensitivity, setMouseSensitivity,

        isInspecting,

        // Camera smoothing (damping)
        orientDampingBase, orientDamping, setOrientDamping,
    } = useSettings()

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return
            if (isInspecting) return
            setMenuOpen(!menuOpen)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [menuOpen, setMenuOpen, isInspecting])

    if (!menuOpen) return null

    const close = () => setMenuOpen(false)

    // Real ranges
    const minPx = 2
    const maxPx = Math.max(minPx, Math.round((pixelateBase + 3) * 100) / 100)
    const minSens = Math.max(0.0001, mouseSensBase / 4)
    const maxSens = mouseSensBase * 4
    const minDamp = Math.max(2, orientDampingBase * 0.6)
    const maxDamp = Math.max(minDamp + 1, orientDampingBase * 3.0)

    // UI 1..5 helpers
    const UI_MIN = 1, UI_MAX = 5
    const clamp = (n:number,a:number,b:number)=>Math.min(Math.max(n,a),b)
    const toUI = (real:number,min:number,max:number)=>{
        if (max<=min) return (UI_MIN+UI_MAX)/2
        const t=(real-min)/(max-min)
        return clamp(UI_MIN + t*(UI_MAX-UI_MIN), UI_MIN, UI_MAX)
    }
    const fromUI = (ui:number,min:number,max:number)=>{
        if (max<=min) return min
        const t=(ui-UI_MIN)/(UI_MAX-UI_MIN)
        return clamp(min + t*(max-min), min, max)
    }

    const pixelUI = toUI(pixelateSize, minPx, maxPx)
    const sensUI  = toUI(mouseSensitivity, minSens, maxSens)
    const smoothingUI = toUI(orientDamping, minDamp, maxDamp)

    // Resets
    const resetPixelizationToBase = () => setPixelateSize(clamp(pixelateBase, minPx, maxPx))
    const resetMouseSensitivityToBase = () => setMouseSensitivity(clamp(mouseSensBase, minSens, maxSens))
    const resetSmoothingToBase = ()=> setOrientDamping(clamp(orientDampingBase, minDamp, maxDamp))
    const resetAllToDefaults = () => {
        resetPixelizationToBase()
        resetMouseSensitivityToBase()
        resetVisuals()
    }

    return (
        <div role="dialog" aria-modal="true" aria-label="Game menu"
             style={{ position:'fixed', inset:0, zIndex:80, display:'grid', placeItems:'center' }}>
            <div onClick={close} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)' }} />
            <div
                style={{
                    position:'relative', width:'min(92vw, 520px)', borderRadius:0,
                    background:'rgba(18,18,18,0.9)', border:'1px solid rgba(255,255,255,0.08)',
                    boxShadow:'0 20px 60px rgba(0,0,0,0.5)', backdropFilter:'blur(6px)',
                    color:'white', padding:20
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header row with title + X button */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                    <h2 style={{ margin:0, fontSize:20, fontWeight:700 }}>Game Menu</h2>
                    <button onClick={close} aria-label="Close menu" style={iconBtn}>×</button>
                </div>

                <div style={{ marginTop:10, fontSize:13, opacity:0.85 }}>
                    Press <kbd style={kbd}>Esc</kbd> to close.
                </div>

                <section style={{marginTop: 18, display: 'grid', gap: 16}}>

                    {/* Controls Hint group */}
                    <div style={row}>
                        <div style={{fontWeight: 600, marginBottom: 6}}>Controls Hint</div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:8, marginBottom:10 }}>
                            {(['top-left','top-right','bottom-left','bottom-right'] as const).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setControlsHintPosition(c)}
                                    aria-pressed={controlsHintPosition === c}
                                    style={{
                                        ...btn,
                                        outline: controlsHintPosition === c ? '2px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.15)',
                                        background: controlsHintPosition === c ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                                    }}
                                >
                                    {labelForCorner(c)}
                                </button>
                            ))}
                        </div>
                        <label style={{display: 'flex', alignItems: 'center', gap: 10}}>
                            <input
                                type="checkbox"
                                checked={controlsHintVisible}
                                onChange={(e) => setControlsHintVisible(e.target.checked)}
                            />
                            <span style={{fontWeight: 600}}>Show Controls Hint</span>
                        </label>
                    </div>

                    {/* Pixelization slider */}
                    <div style={row}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                            <div>
                                <div style={{ fontWeight:600 }}>Pixelization</div>
                                <div style={{ opacity:0.65, fontSize:12, marginTop:2 }}>Higher = more pixelized</div>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ opacity:0.85, fontVariantNumeric:'tabular-nums' }}>{pixelUI.toFixed(1)}</div>
                                <button style={miniBtn} onClick={resetPixelizationToBase} title="Reset to default">Reset</button>
                            </div>
                        </div>
                        <input
                            type="range"
                            min={UI_MIN}
                            max={UI_MAX}
                            step={0.1}
                            value={pixelUI}
                            onChange={(e) => setPixelateSize(fromUI(parseFloat(e.target.value), minPx, maxPx))}
                            style={{ width:'100%', marginTop:10 }}
                        />
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, opacity:0.7, marginTop:6 }}>
                            <span>{UI_MIN}</span><span>{UI_MAX}</span>
                        </div>
                    </div>

                    {/* Mouse Sensitivity slider */}
                    <div style={row}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                            <div>
                                <div style={{ fontWeight:600 }}>Mouse Sensitivity</div>
                                <div style={{ opacity:0.65, fontSize:12, marginTop:2 }}>Higher = faster camera movement</div>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ opacity:0.85, fontVariantNumeric:'tabular-nums' }}>{sensUI.toFixed(1)}</div>
                                <button style={miniBtn} onClick={resetMouseSensitivityToBase} title="Reset to default">Reset</button>
                            </div>
                        </div>
                        <input
                            type="range"
                            min={UI_MIN}
                            max={UI_MAX}
                            step={0.1}
                            value={sensUI}
                            onChange={(e) => setMouseSensitivity(fromUI(parseFloat(e.target.value), minSens, maxSens))}
                            style={{ width:'100%', marginTop:10 }}
                        />
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, opacity:0.7, marginTop:6 }}>
                            <span>{UI_MIN}</span><span>{UI_MAX}</span>
                        </div>
                    </div>

                    {/* Camera Smoothing slider */}
                    <div style={row}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                            <div>
                                <div style={{ fontWeight:600 }}>Camera Smoothing</div>
                                <div style={{ opacity:0.65, fontSize:12, marginTop:2 }}>Higher = snappier</div>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ opacity:0.85, fontVariantNumeric:'tabular-nums' }}>{smoothingUI.toFixed(1)}</div>
                                <button style={miniBtn} onClick={resetSmoothingToBase} title="Reset to default">Reset</button>
                            </div>
                        </div>
                        <input
                            type="range"
                            min={UI_MIN}
                            max={UI_MAX}
                            step={0.1}
                            value={smoothingUI}
                            onChange={(e) => setOrientDamping(fromUI(parseFloat(e.target.value), minDamp, maxDamp))}
                            style={{ width:'100%', marginTop:10 }}
                        />
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, opacity:0.7, marginTop:6 }}>
                            <span>{UI_MIN}</span><span>{UI_MAX}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display:'flex', justifyContent:'space-between', gap:10 }}>
                        <button style={btn} onClick={resetAllToDefaults}>Reset to defaults</button>
                        <button style={btn} onClick={close}>Resume (Esc)</button>
                    </div>
                </section>
            </div>
        </div>
    )
}

const row: React.CSSProperties = {
    padding: 12,
    borderRadius: 0,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
}

const btn: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 0,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'white',
    fontSize: 13,
    cursor: 'pointer',
}

const miniBtn: React.CSSProperties = {
    padding: '6px 8px',
    borderRadius: 0,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: 'white',
    fontSize: 12,
    cursor: 'pointer',
}

const iconBtn: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 0,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: 'white',
    fontSize: 20,
    lineHeight: 1,
    cursor: 'pointer',
}

const kbd: React.CSSProperties = {
    padding: '2px 6px',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
}

function labelForCorner(c: string) {
    switch (c) {
        case 'top-left': return 'Top-Left'
        case 'top-right': return 'Top-Right'
        case 'bottom-left': return 'Bottom-Left'
        case 'bottom-right': return 'Bottom-Right'
        default: return c
    }
}
