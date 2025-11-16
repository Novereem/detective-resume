import React from 'react'
import { ANCHOR } from '@/components/Game/anchors'
import { LightBulb } from '@/components/Models/Functional/LightBulb'
import { useSettings } from '@/components/Settings/SettingsProvider'

type RcFocus = (anchor: (typeof ANCHOR)[keyof typeof ANCHOR]) => (e: React.MouseEvent) => void

export function LightsCluster({ rcFocus }: { rcFocus: RcFocus }) {
    const { shadowsEnabled, shadowPreset } = useSettings()

    return (
        <>
            <group onContextMenu={rcFocus(ANCHOR.bulb)} userData={{ movable: true, anchorKey: 'bulb' }}>
                <LightBulb
                    position={ANCHOR.bulb.position}
                    rotation={[0, 0, Math.PI]}
                    materialsById={{
                        base: { color: '#b8bcc2', metalness: 0.85, roughness: 0.3 },
                        tip: { color: '#c5c9cf', metalness: 0.9, roughness: 0.2 },
                        collar: { color: '#ededed', metalness: 0.05, roughness: 0.65 },
                        neck: { color: '#dcdcdc', metalness: 0.0, roughness: 0.9 },
                        postL: { color: '#b9bcc0' },
                        postR: { color: '#b9bcc0' },
                        filament: { color: '#ffcc55' },
                    }}
                    disableOutline
                    inspectDisableOutline
                    enableLight
                    castShadow={shadowsEnabled}
                    shadowMapSize={shadowPreset.mapSize}
                    shadowRadius={shadowPreset.radius}
                    shadowBias={shadowPreset.bias}
                    shadowNormalBias={shadowPreset.normalBias}
                    shadowCameraNear={0.1}
                    shadowCameraFar={4.8}
                    inspectPixelSize={3}
                    lightIntensity={2}
                />
            </group>

            <group
                onContextMenu={rcFocus(ANCHOR.outsideLight1)}
                userData={{ movable: true, anchorKey: 'outsideLight1' }}
            >
                <LightBulb
                    position={ANCHOR.outsideLight1.position}
                    rotation={ANCHOR.outsideLight1.rotation}
                    materialsById={{
                        base: { color: '#b8bcc2', metalness: 0.85, roughness: 0.3 },
                        tip: { color: '#c5c9cf', metalness: 0.9, roughness: 0.2 },
                        collar: { color: '#ededed', metalness: 0.05, roughness: 0.65 },
                        neck: { color: '#dcdcdc', metalness: 0.0, roughness: 0.9 },
                        postL: { color: '#b9bcc0' },
                        postR: { color: '#b9bcc0' },
                        filament: { color: '#ffcc55' },
                    }}
                    disableOutline
                    inspectDisableOutline
                    enableLight
                    castShadow={shadowsEnabled}
                    shadowMapSize={shadowPreset.mapSize}
                    shadowRadius={shadowPreset.radius}
                    shadowBias={shadowPreset.bias}
                    shadowNormalBias={shadowPreset.normalBias}
                    shadowCameraNear={0.1}
                    shadowCameraFar={4.8}
                    lightColor="#d0f5ff"
                    lightIntensity={1}
                />
            </group>
        </>
    )
}
