// components/UI/SettingsProvider.tsx
'use client'
import React from 'react'

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

type SettingsState = {
    menuOpen: boolean
    setMenuOpen: (v: boolean) => void

    controlsHintVisible: boolean
    setControlsHintVisible: (v: boolean) => void
    controlsHintPosition: Corner
    setControlsHintPosition: (c: Corner) => void

    pixelateBase: number
    setPixelateBase: (n: number) => void
    pixelateSize: number
    setPixelateSize: (n: number) => void
    initializePixelBase: (runtimeDefault: number) => void
    resetVisuals: () => void

    mouseSensBase: number
    setMouseSensBase: (n: number) => void
    mouseSensitivity: number
    setMouseSensitivity: (n: number) => void
    initializeMouseSensitivity: (runtimeDefault: number) => void

    isInspecting: boolean
    setIsInspecting: (v: boolean) => void

    orientDampingBase: number;
    setOrientDampingBase: (n:number)=>void;
    orientDamping: number;
    setOrientDamping:(n:number)=>void;
    initializeOrientDamping:(n:number)=>void;
}

const Ctx = React.createContext<SettingsState | null>(null)

const VISIBLE_KEY = 'controls.visible'
const POSITION_KEY = 'controls.position'

const PX_BASE_KEY = 'pixel.base.v2'
const PX_SIZE_KEY = 'pixel.size.v2'

const SENS_BASE_KEY = 'mouse.sens.base.v1'
const SENS_VAL_KEY  = 'mouse.sens.v1'

const ORIENT_BASE_KEY = 'cam.smooth.base.v1'
const ORIENT_VAL_KEY  = 'cam.smooth.v1'

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = React.useState(false)

    const [controlsHintVisible, setControlsHintVisible] = React.useState(true)
    const [controlsHintPosition, setControlsHintPosition] = React.useState<Corner>('bottom-left')

    const [pixelateBase, setPixelateBase] = React.useState<number>(2.7)
    const [pixelateSize, setPixelateSize] = React.useState<number>(2.7)

    const [mouseSensBase, setMouseSensBase] = React.useState<number>(0.0022)
    const [mouseSensitivity, setMouseSensitivity] = React.useState<number>(0.0022)

    const loadedRef = React.useRef(false)
    const hadBaseRef = React.useRef(false)
    const hadSizeRef = React.useRef(false)

    const hadSensBaseRef = React.useRef(false)
    const hadSensValRef  = React.useRef(false)

    const [isInspecting, setIsInspecting] = React.useState(false)

    const [orientDampingBase, setOrientDampingBase] = React.useState<number>(10)
    const [orientDamping, setOrientDamping] = React.useState<number>(10)

    const hadOrientBaseRef = React.useRef(false)
    const hadOrientValRef  = React.useRef(false)

    React.useEffect(() => {
        const v = localStorage.getItem(VISIBLE_KEY)
        if (v !== null) setControlsHintVisible(v === '1')

        const p = localStorage.getItem(POSITION_KEY) as Corner | null
        if (p) setControlsHintPosition(p)

        const pb = localStorage.getItem(PX_BASE_KEY)
        const ps = localStorage.getItem(PX_SIZE_KEY)
        if (pb !== null) {
            const base = parseFloat(pb)
            if (Number.isFinite(base)) {
                setPixelateBase(base)
                hadBaseRef.current = true
            }
        }
        if (ps !== null) {
            const size = parseFloat(ps)
            if (Number.isFinite(size)) {
                setPixelateSize(size)
                hadSizeRef.current = true
            }
        }

        const sb = localStorage.getItem(SENS_BASE_KEY)
        const sv = localStorage.getItem(SENS_VAL_KEY)
        if (sb !== null) {
            const n = parseFloat(sb)
            if (Number.isFinite(n)) { setMouseSensBase(n); hadSensBaseRef.current = true }
        }
        if (sv !== null) {
            const n = parseFloat(sv)
            if (Number.isFinite(n)) { setMouseSensitivity(n); hadSensValRef.current = true }
        }
        loadedRef.current = true

        {
            const ob = localStorage.getItem(ORIENT_BASE_KEY)
            const ov = localStorage.getItem(ORIENT_VAL_KEY)
            if (ob !== null) { const n = parseFloat(ob); if (Number.isFinite(n)) { setOrientDampingBase(n); hadOrientBaseRef.current = true } }
            if (ov !== null) { const n = parseFloat(ov); if (Number.isFinite(n)) { setOrientDamping(n);      hadOrientValRef.current  = true } }
        }

    }, [])

    React.useEffect(() => { if (loadedRef.current) localStorage.setItem(VISIBLE_KEY, controlsHintVisible ? '1' : '0') }, [controlsHintVisible])
    React.useEffect(() => { if (loadedRef.current) localStorage.setItem(POSITION_KEY, controlsHintPosition) }, [controlsHintPosition])

    React.useEffect(() => { if (loadedRef.current) localStorage.setItem(PX_BASE_KEY, String(pixelateBase)) }, [pixelateBase])
    React.useEffect(() => { if (loadedRef.current) localStorage.setItem(PX_SIZE_KEY, String(pixelateSize)) }, [pixelateSize])

    React.useEffect(() => { if (loadedRef.current) localStorage.setItem(SENS_BASE_KEY, String(mouseSensBase)) }, [mouseSensBase])
    React.useEffect(() => { if (loadedRef.current) localStorage.setItem(SENS_VAL_KEY, String(mouseSensitivity)) }, [mouseSensitivity])

    React.useEffect(() => { if (loadedRef.current) localStorage.setItem(ORIENT_BASE_KEY, String(orientDampingBase)) }, [orientDampingBase])
    React.useEffect(() => { if (loadedRef.current) localStorage.setItem(ORIENT_VAL_KEY,  String(orientDamping))     }, [orientDamping])

    React.useEffect(() => {
        document.documentElement.style.overflow = menuOpen ? 'hidden' : ''
    }, [menuOpen])

    const initializePixelBase = React.useCallback((runtimeDefault: number) => {
        if (!loadedRef.current) return
        if (!hadBaseRef.current) {
            setPixelateBase(runtimeDefault)
            hadBaseRef.current = true
        }
        if (!hadSizeRef.current) {
            setPixelateSize(runtimeDefault)
            hadSizeRef.current = true
        }
    }, [])

    const resetVisuals = React.useCallback(() => {
        localStorage.removeItem(PX_BASE_KEY)
        localStorage.removeItem(PX_SIZE_KEY)
        hadBaseRef.current = false
        hadSizeRef.current = false

        // Fallback Values
        setPixelateBase(2.7)
        setPixelateSize(2.7)
    }, [])

    const initializeMouseSensitivity = React.useCallback((runtimeDefault: number) => {
        if (!loadedRef.current) return
        if (!hadSensBaseRef.current) {
            setMouseSensBase(runtimeDefault)
            hadSensBaseRef.current = true
        }
        if (!hadSensValRef.current) {
            setMouseSensitivity(runtimeDefault)
            hadSensValRef.current = true
        }
    }, [])

    const initializeOrientDamping = React.useCallback((runtimeDefault: number) => {
        if (!loadedRef.current) return
        if (!hadOrientBaseRef.current) { setOrientDampingBase(runtimeDefault); hadOrientBaseRef.current = true }
        if (!hadOrientValRef.current)  { setOrientDamping(runtimeDefault);     hadOrientValRef.current  = true }
    }, [])

    const value: SettingsState = {
        menuOpen, setMenuOpen,
        controlsHintVisible, setControlsHintVisible,
        controlsHintPosition, setControlsHintPosition,
        pixelateBase, setPixelateBase,
        pixelateSize, setPixelateSize,
        initializePixelBase,
        resetVisuals,
        mouseSensBase, setMouseSensBase,
        mouseSensitivity, setMouseSensitivity,
        initializeMouseSensitivity,
        isInspecting,
        setIsInspecting,
        orientDampingBase, initializeOrientDamping, setOrientDampingBase, setOrientDamping, orientDamping
    }

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSettings() {
    const v = React.useContext(Ctx)
    if (!v) throw new Error('useSettings must be used within SettingsProvider')
    return v
}