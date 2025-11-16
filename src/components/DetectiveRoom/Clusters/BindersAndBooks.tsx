import React from 'react'
import { Book } from '@/components/Models/Decoration/Book'
import { Binder } from '@/components/Models/Decoration/Binder'
import { ANCHOR } from '@/components/Game/anchors'
import {
    binderMaterials,
    bookMaterials,
} from '@/components/Materials/detectiveRoomMats'
import {useQuality} from "@/components/Settings/QualityContext";

type RcFocus = (anchor: (typeof ANCHOR)[keyof typeof ANCHOR]) => (e: React.MouseEvent) => void

export function BindersAndBooksCluster({ rcFocus }: { rcFocus: RcFocus }) {
    const quality = useQuality()

    return (
        <>
            <group onContextMenu={rcFocus(ANCHOR.book1)} userData={{movable: true, anchorKey: 'book1'}}>
                <Book
                    position={ANCHOR.book1.position}
                    rotation={ANCHOR.book1.rotation}
                    materialsById={{
                        ...bookMaterials,
                        coverFront: {...bookMaterials.coverFront, color: '#611919', roughness: 0.9},
                        coverBack: {...bookMaterials.coverBack, color: '#5e1b2d', roughness: 0.9},
                        spine: {...bookMaterials.spine, color: '#451414', roughness: 0.88},
                    }}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                    size={[0.13, 0.03, 0.2]}
                    spineThickness={0.012}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.book2)} userData={{movable: true, anchorKey: 'book2'}}>
                <Book
                    position={ANCHOR.book2.position}
                    rotation={ANCHOR.book2.rotation}
                    materialsById={bookMaterials}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                    sizeMultiplier={1.1}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.book3)} userData={{movable: true, anchorKey: 'book3'}}>
                <Book
                    position={ANCHOR.book3.position}
                    rotation={ANCHOR.book3.rotation}
                    materialsById={{
                        ...bookMaterials,
                        coverFront: {...bookMaterials.coverFront, color: '#5a1961', roughness: 0.9},
                        coverBack: {...bookMaterials.coverBack, color: '#451b5e', roughness: 0.9},
                        spine: {...bookMaterials.spine, color: '#391445', roughness: 0.88},
                    }}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                    size={[0.14, 0.03, 0.2]}
                    spineThickness={0.012}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.book4)} userData={{movable: true, anchorKey: 'book4'}}>
                <Book
                    position={ANCHOR.book4.position}
                    rotation={ANCHOR.book4.rotation}
                    materialsById={{
                        ...bookMaterials,
                        coverFront: {...bookMaterials.coverFront, color: '#613d19', roughness: 0.9},
                        coverBack: {...bookMaterials.coverBack, color: '#5e3f1b', roughness: 0.9},
                        spine: {...bookMaterials.spine, color: '#453a14', roughness: 0.88},
                    }}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                    size={[0.13, 0.04, 0.2]}
                    spineThickness={0.012}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.book5)} userData={{movable: true, anchorKey: 'book5'}}>
                <Book
                    position={ANCHOR.book5.position}
                    rotation={ANCHOR.book5.rotation}
                    materialsById={{
                        ...bookMaterials,
                        coverFront: {...bookMaterials.coverFront, color: '#254e8c', roughness: 0.9},
                        coverBack: {...bookMaterials.coverBack, color: '#1b385e', roughness: 0.9},
                        spine: {...bookMaterials.spine, color: '#142445', roughness: 0.88},
                    }}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                    size={[0.13, 0.03, 0.23]}
                    spineThickness={0.012}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.book6)} userData={{movable: true, anchorKey: 'book6'}}>
                <Book
                    position={ANCHOR.book6.position}
                    rotation={ANCHOR.book6.rotation}
                    materialsById={{
                        ...bookMaterials,
                        coverFront: {...bookMaterials.coverFront, color: '#5c5c5c', roughness: 0.9},
                        coverBack: {...bookMaterials.coverBack, color: '#5a5a5a', roughness: 0.9},
                        spine: {...bookMaterials.spine, color: '#333333', roughness: 0.88},
                    }}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                    size={[0.13, 0.034, 0.2]}
                    spineThickness={0.012}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.book7)} userData={{movable: true, anchorKey: 'book7'}}>
                <Book
                    position={ANCHOR.book7.position}
                    rotation={ANCHOR.book7.rotation}
                    materialsById={{
                        ...bookMaterials,
                        coverFront: {...bookMaterials.coverFront, color: '#611919', roughness: 0.9},
                        coverBack: {...bookMaterials.coverBack, color: '#5e1b2d', roughness: 0.9},
                        spine: {...bookMaterials.spine, color: '#451414', roughness: 0.88},
                    }}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                    size={[0.13, 0.03, 0.21]}
                    spineThickness={0.012}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.binder1)} userData={{movable: true, anchorKey: 'binder1'}}>
                <Binder
                    position={ANCHOR.binder1.position}
                    rotation={ANCHOR.binder1.rotation}
                    materialsById={{
                        ...binderMaterials,
                        coverFront: {...binderMaterials.coverFront, color: '#304a7a'},
                        coverBack: {...binderMaterials.coverBack, color: '#334e80'},
                        spine: {...binderMaterials.spine, color: '#263a60'},
                        ring: {...binderMaterials.ring, color: '#f3f3f3'},
                    }}
                    paperFill={0.9}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.binder2)} userData={{movable: true, anchorKey: 'binder2'}}>
                <Binder
                    position={ANCHOR.binder2.position}
                    rotation={ANCHOR.binder2.rotation}
                    materialsById={{
                        ...binderMaterials,
                        coverFront: {...binderMaterials.coverFront, color: '#6d1f1f'},
                        coverBack: {...binderMaterials.coverBack, color: '#6d1f1f'},
                        spine: {...binderMaterials.spine, color: '#4f1616'},
                        ring: {...binderMaterials.ring, color: '#f3f3f3'},
                    }}
                    paperFill={0.7}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                />
            </group>

            {/*<group onContextMenu={rcFocus(ANCHOR.binder3)} userData={{movable: true, anchorKey: 'binder3'}}>*/}
            {/*    <Binder*/}
            {/*        position={ANCHOR.binder3.position}*/}
            {/*        rotation={ANCHOR.binder3.rotation}*/}
            {/*        materialsById={{*/}
            {/*            ...binderMaterials,*/}
            {/*            coverFront: {...binderMaterials.coverFront, color: '#1f5c3a'},*/}
            {/*            coverBack: {...binderMaterials.coverBack, color: '#1f5c3a'},*/}
            {/*            spine: {...binderMaterials.spine, color: '#104326'},*/}
            {/*            ring: {...binderMaterials.ring, color: '#f3f3f3'},*/}
            {/*        }}*/}
            {/*        paperFill={0.4}*/}
            {/*        disableOutline*/}
            {/*        inspectDisableOutline*/}
            {/*        inspectPixelSize={3}*/}
            {/*    />*/}
            {/*</group>*/}

            {/*<group onContextMenu={rcFocus(ANCHOR.binder4)} userData={{movable: true, anchorKey: 'binder4'}}>*/}
            {/*    <Binder*/}
            {/*        position={ANCHOR.binder4.position}*/}
            {/*        rotation={ANCHOR.binder4.rotation}*/}
            {/*        materialsById={{*/}
            {/*            ...binderMaterials,*/}
            {/*            coverFront: {...binderMaterials.coverFront, color: '#1f5c3a'},*/}
            {/*            coverBack: {...binderMaterials.coverBack, color: '#1f5c3a'},*/}
            {/*            spine: {...binderMaterials.spine, color: '#104326'},*/}
            {/*            ring: {...binderMaterials.ring, color: '#f3f3f3'},*/}
            {/*        }}*/}
            {/*        paperFill={0.4}*/}
            {/*        disableOutline*/}
            {/*        inspectDisableOutline*/}
            {/*        inspectPixelSize={3}*/}
            {/*    />*/}
            {/*</group>*/}

            {/*<group onContextMenu={rcFocus(ANCHOR.binder5)} userData={{movable: true, anchorKey: 'binder5'}}>*/}
            {/*    <Binder*/}
            {/*        position={ANCHOR.binder5.position}*/}
            {/*        rotation={ANCHOR.binder5.rotation}*/}
            {/*        materialsById={{*/}
            {/*            ...binderMaterials,*/}
            {/*            coverFront: {...binderMaterials.coverFront, color: '#1f5c3a'},*/}
            {/*            coverBack: {...binderMaterials.coverBack, color: '#1f5c3a'},*/}
            {/*            spine: {...binderMaterials.spine, color: '#104326'},*/}
            {/*            ring: {...binderMaterials.ring, color: '#f3f3f3'},*/}
            {/*        }}*/}
            {/*        paperFill={0.4}*/}
            {/*        disableOutline*/}
            {/*        inspectDisableOutline*/}
            {/*        inspectPixelSize={3}*/}
            {/*    />*/}
            {/*</group>*/}

            <group onContextMenu={rcFocus(ANCHOR.binder6)} userData={{movable: true, anchorKey: 'binder6'}}>
                <Binder
                    position={ANCHOR.binder6.position}
                    rotation={ANCHOR.binder6.rotation}
                    materialsById={{
                        ...binderMaterials,
                        coverFront: {...binderMaterials.coverFront, color: '#1f5c3a'},
                        coverBack: {...binderMaterials.coverBack, color: '#1f5c3a'},
                        spine: {...binderMaterials.spine, color: '#104326'},
                        ring: {...binderMaterials.ring, color: '#f3f3f3'},
                    }}
                    paperFill={0.4}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.binder7)} userData={{movable: true, anchorKey: 'binder7'}}>
                <Binder
                    position={ANCHOR.binder7.position}
                    rotation={ANCHOR.binder7.rotation}
                    materialsById={{
                        ...binderMaterials,
                        coverFront: {...binderMaterials.coverFront, color: '#1f5c3a'},
                        coverBack: {...binderMaterials.coverBack, color: '#1f5c3a'},
                        spine: {...binderMaterials.spine, color: '#104326'},
                        ring: {...binderMaterials.ring, color: '#f3f3f3'},
                    }}
                    paperFill={0.4}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.binder8)} userData={{movable: true, anchorKey: 'binder8'}}>
                <Binder
                    position={ANCHOR.binder8.position}
                    rotation={ANCHOR.binder8.rotation}
                    materialsById={{
                        ...binderMaterials,
                        coverFront: {...binderMaterials.coverFront, color: '#1f5c3a'},
                        coverBack: {...binderMaterials.coverBack, color: '#1f5c3a'},
                        spine: {...binderMaterials.spine, color: '#104326'},
                        ring: {...binderMaterials.ring, color: '#f3f3f3'},
                    }}
                    paperFill={0.4}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.binder9)} userData={{movable: true, anchorKey: 'binder9'}}>
                <Binder
                    position={ANCHOR.binder9.position}
                    rotation={ANCHOR.binder9.rotation}
                    materialsById={{
                        ...binderMaterials,
                        coverFront: {...binderMaterials.coverFront, color: '#1f5c3a'},
                        coverBack: {...binderMaterials.coverBack, color: '#1f5c3a'},
                        spine: {...binderMaterials.spine, color: '#104326'},
                        ring: {...binderMaterials.ring, color: '#f3f3f3'},
                    }}
                    paperFill={0.4}
                    disableOutline
                    inspectDisableOutline
                    inspectPixelSize={3}
                />
            </group>

            {/*<group onContextMenu={rcFocus(ANCHOR.binder20)} userData={{movable: true, anchorKey: 'binder20'}}>*/}
            {/*    <Binder*/}
            {/*        position={ANCHOR.binder20.position}*/}
            {/*        rotation={ANCHOR.binder20.rotation}*/}
            {/*        materialsById={{*/}
            {/*            ...binderMaterials,*/}
            {/*            coverFront: {...binderMaterials.coverFront, color: '#262626'},*/}
            {/*            coverBack: {...binderMaterials.coverBack, color: '#262626'},*/}
            {/*            spine: {...binderMaterials.spine, color: '#141414'},*/}
            {/*            ring: {...binderMaterials.ring, color: '#f3f3f3'},*/}
            {/*        }}*/}
            {/*        paperFill={0.15}*/}
            {/*        disableOutline*/}
            {/*        inspectDisableOutline*/}
            {/*        inspectPixelSize={3}*/}
            {/*    />*/}
            {/*</group>*/}
        </>
    )
}
