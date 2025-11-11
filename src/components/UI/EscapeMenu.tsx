'use client'
import React from 'react'
import { useSettings } from './SettingsProvider'

type TabKey = 'controls' | 'video'

export default function EscapeMenu() {
    const {
        menuOpen, setMenuOpen,
        controlsHintVisible, setControlsHintVisible,
        controlsHintPosition, setControlsHintPosition,
        pixelateBase, pixelateSize, setPixelateSize, resetVisuals,
        mouseSensBase, mouseSensitivity, setMouseSensitivity,
        isInspecting,
        orientDampingBase, orientDamping, setOrientDamping,
        shadowsEnabled, setShadowsEnabled, shadowQuality, setShadowQuality,
        resetControlsToDefaults, resetVideoToDefaults,
    } = useSettings()

    const [tab, setTab] = React.useState<TabKey>('controls')

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

    const minPx = 2
    const maxPx = Math.max(minPx, Math.round((pixelateBase + 3) * 100) / 100)
    const minSens = Math.max(0.0001, mouseSensBase / 4)
    const maxSens = mouseSensBase * 4
    const minDamp = Math.max(2, orientDampingBase * 0.6)
    const maxDamp = Math.max(minDamp + 1, orientDampingBase * 3.0)

    const UI_MIN = 1, UI_MAX = 5
    const clamp = (n:number,a:number,b:number)=>Math.min(Math.max(n,a),b)
    const toUI = (real:number,min:number,max:number)=>{
        if (max<=min) return (UI_MIN+UI_MAX)/2
        const t=(real-min)/(max-min)
        return clamp(UI_MIN + t*(UI_MAX-UI_MAX?0:0), UI_MIN, UI_MAX) // keep structure; replaced below
    }

    const toUIReal = (real:number,min:number,max:number)=>{
        if (max<=min) return (UI_MIN+UI_MAX)/2
        const t=(real-min)/(max-min)
        return clamp(UI_MIN + t*(UI_MAX-UI_MIN), UI_MIN, UI_MAX)
    }
    const fromUI = (ui:number,min:number,max:number)=>{
        if (max<=min) return min
        const t=(ui-UI_MIN)/(UI_MAX-UI_MIN)
        return clamp(min + t*(max-min), min, max)
    }

    const pixelUI = toUIReal(pixelateSize, minPx, maxPx)
    const sensUI  = toUIReal(mouseSensitivity, minSens, maxSens)
    const smoothingUI = toUIReal(orientDamping, minDamp, maxDamp)

    const resetPixelizationToBase = () => setPixelateSize(clamp(pixelateBase, minPx, maxPx))
    const resetMouseSensitivityToBase = () => setMouseSensitivity(clamp(mouseSensBase, minSens, maxSens))
    const resetSmoothingToBase = ()=> setOrientDamping(clamp(orientDampingBase, minDamp, maxDamp))

    const PANEL_W = 'min(92vw, 560px)'
    const PANEL_H = 'min(90vh, 800px)'

    return (
        <div role="dialog" aria-modal="true" aria-label="Game menu"
             style={{ position:'fixed', inset:0, zIndex:80, display:'grid', placeItems:'center' }}>
            <div onClick={close} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)' }} />
            <div
                style={{
                    position:'relative',
                    width: PANEL_W,
                    height: PANEL_H,
                    background:'rgba(18,18,18,0.9)',
                    border:'1px solid rgba(255,255,255,0.08)',
                    boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
                    backdropFilter:'blur(6px)',
                    color:'white',
                    padding:20,
                    display:'flex',
                    flexDirection:'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                    <h2 style={{ margin:0, fontSize:20, fontWeight:700 }}>Game Menu</h2>
                    <button onClick={close} aria-label="Close menu" style={iconBtn}>×</button>
                </div>
                <div style={{ marginTop:10, fontSize:13, opacity:0.85 }}>
                    Press <kbd style={kbd}>Esc</kbd> to close.
                </div>

                <div role="tablist" aria-label="Settings sections"
                     style={{ display:'flex', gap:8, marginTop:14, borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:8 }}>
                    {(['controls','video'] as TabKey[]).map(k => (
                        <button
                            key={k}
                            role="tab"
                            aria-selected={tab===k}
                            onClick={()=>setTab(k)}
                            style={{
                                ...tabBtn,
                                background: tab===k ? 'rgba(255,255,255,0.10)' : 'transparent',
                                borderColor: tab===k ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)'
                            }}
                        >
                            {k === 'controls' ? 'Controls' : 'Video Settings'}
                        </button>
                    ))}
                </div>

                <div style={{ marginTop:14, flex:1, overflowY:'auto', paddingRight:4, display:'grid', gap:16, alignContent:'start', alignItems:'start' }}>
                    {tab === 'controls' ? (
                        <section style={group} role="tabpanel" aria-labelledby="controls">
                            <div style={groupTitle}>Game Controls</div>

                            <div style={row}>
                                <div style={{fontWeight: 600, marginBottom: 6}}>Controls Hint</div>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:8, marginBottom:10 }}>
                                    {(['top-left','top-right','bottom-left','bottom-right'] as const).map(c => (
                                        <button key={c}
                                                onClick={() => setControlsHintPosition(c)}
                                                aria-pressed={controlsHintPosition === c}
                                                style={{
                                                    ...btn,
                                                    outline: controlsHintPosition === c ? '2px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.15)',
                                                    background: controlsHintPosition === c ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                                                }}>
                                            {labelForCorner(c)}
                                        </button>
                                    ))}
                                </div>
                                <label style={{display:'flex', alignItems:'center', gap:10}}>
                                    <input type="checkbox" checked={controlsHintVisible} onChange={(e)=>setControlsHintVisible(e.target.checked)} />
                                    <span style={{fontWeight:600}}>Show Controls Hint</span>
                                </label>
                            </div>

                            <div style={row}>
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10}}>
                                    <div>
                                        <div style={{fontWeight:600}}>Mouse Sensitivity</div>
                                        <div style={{opacity:0.65, fontSize:12, marginTop:2}}>Higher = faster camera movement</div>
                                    </div>
                                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                                        <div style={{opacity:0.85, fontVariantNumeric:'tabular-nums'}}>{toUIReal(mouseSensitivity, minSens, maxSens).toFixed(1)}</div>
                                        <button style={miniBtn} onClick={resetMouseSensitivityToBase} title="Reset to default">Reset</button>
                                    </div>
                                </div>
                                <input type="range" min={UI_MIN} max={UI_MAX} step={0.1} value={toUIReal(mouseSensitivity, minSens, maxSens)}
                                       onChange={(e)=>setMouseSensitivity(fromUI(parseFloat(e.target.value), minSens, maxSens))}
                                       style={{ width:'100%', marginTop:10 }} />
                                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, opacity:0.7, marginTop:6 }}>
                                    <span>{UI_MIN}</span><span>{UI_MAX}</span>
                                </div>
                            </div>

                            <div style={row}>
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10}}>
                                    <div>
                                        <div style={{fontWeight:600}}>Camera Smoothing</div>
                                        <div style={{opacity:0.65, fontSize:12, marginTop:2}}>Higher = snappier</div>
                                    </div>
                                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                                        <div style={{opacity:0.85, fontVariantNumeric:'tabular-nums'}}>{toUIReal(orientDamping, minDamp, maxDamp).toFixed(1)}</div>
                                        <button style={miniBtn} onClick={resetSmoothingToBase} title="Reset to default">Reset</button>
                                    </div>
                                </div>
                                <input type="range" min={UI_MIN} max={UI_MAX} step={0.1} value={toUIReal(orientDamping, minDamp, maxDamp)}
                                       onChange={(e)=>setOrientDamping(fromUI(parseFloat(e.target.value), minDamp, maxDamp))}
                                       style={{ width:'100%', marginTop:10 }} />
                                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, opacity:0.7, marginTop:6 }}>
                                    <span>{UI_MIN}</span><span>{UI_MAX}</span>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section style={group} role="tabpanel" aria-labelledby="video">
                            <div style={groupTitle}>Video Settings</div>

                            <div style={row}>
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10}}>
                                    <div>
                                        <div style={{fontWeight:600}}>Pixelization</div>
                                        <div style={{opacity:0.65, fontSize:12, marginTop:2}}>Higher = more pixelized</div>
                                    </div>
                                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                                        <div style={{opacity:0.85, fontVariantNumeric:'tabular-nums'}}>{toUIReal(pixelateSize, minPx, maxPx).toFixed(1)}</div>
                                        <button style={miniBtn} onClick={resetPixelizationToBase} title="Reset to default">Reset</button>
                                    </div>
                                </div>
                                <input type="range" min={UI_MIN} max={UI_MAX} step={0.1} value={toUIReal(pixelateSize, minPx, maxPx)}
                                       onChange={(e)=>setPixelateSize(fromUI(parseFloat(e.target.value), minPx, maxPx))}
                                       style={{ width:'100%', marginTop:10 }} />
                                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, opacity:0.7, marginTop:6 }}>
                                    <span>{UI_MIN}</span><span>{UI_MAX}</span>
                                </div>
                            </div>

                            <div style={row}>
                                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10}}>
                                    <div>
                                        <div style={{fontWeight:600}}>Shadows</div>
                                        <div style={{opacity:0.65, fontSize:12, marginTop:2}}>Lower quality = faster</div>
                                    </div>
                                    <label style={{display:'flex', alignItems:'center', gap:8}}>
                                        <input type="checkbox" checked={shadowsEnabled} onChange={e=>setShadowsEnabled(e.target.checked)} />
                                        <span style={{fontWeight:600}}>Enable</span>
                                    </label>
                                </div>

                                <div style={{ marginTop:10, display:'flex', gap:10, opacity: shadowsEnabled ? 1 : 0.5 }}>
                                    {(['low','medium','high'] as const).map(q => (
                                        <button key={q}
                                                onClick={()=> setShadowQuality(q)}
                                                aria-pressed={shadowQuality===q}
                                                style={{ ...btn, outline: shadowQuality===q ? '2px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.15)' }}
                                                disabled={!shadowsEnabled}>
                                            {q[0].toUpperCase()+q.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <div style={{display:'flex', justifyContent:'space-between', gap:10, paddingTop:8, borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                    <button
                        style={btn}
                        onClick={() => (tab === 'controls' ? resetControlsToDefaults() : resetVideoToDefaults())}
                    >
                        Reset {tab} to default
                    </button>
                    <button style={btn} onClick={close}>Resume (Esc)</button>
                </div>
            </div>
        </div>
    )
}

const row: React.CSSProperties = {
    padding: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
}

const group: React.CSSProperties = {
    padding: 12,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.09)',
    display: 'grid',
    gap: 12,
    alignContent:'start',
    alignItems:'start',
    gridAutoRows:'min-content'
}

const groupTitle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 2,
    opacity: 0.95,
}

const btn: React.CSSProperties = {
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'white',
    fontSize: 13,
    cursor: 'pointer',
    marginTop: '10px'
}

const miniBtn: React.CSSProperties = {
    padding: '6px 8px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: 'white',
    fontSize: 12,
    cursor: 'pointer',
}

const iconBtn: React.CSSProperties = {
    width: 34,
    height: 34,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: 'white',
    fontSize: 20,
    lineHeight: 1,
    cursor: 'pointer',
}

const tabBtn: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: 13,
    color: 'white',
    border: '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer',
    marginBottom: '8px'
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