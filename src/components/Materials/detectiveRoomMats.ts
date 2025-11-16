import { PartMaterialOverride } from '@/components/Models/Generic/ModelGroup'

export const deskMaterials: Record<string, PartMaterialOverride> = {
    top: { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.8, metalness: 0.05 },
    leg: { textureUrl: '/textures/clear_metal.jpg', roughness: 0.4, metalness: 0.85 },
}

export const mugMaterials: Record<string, PartMaterialOverride> = {
    body:   { textureUrl: '/textures/ceramic_white.jpg', roughness: 0.6, metalness: 0.0 },
    handle: { textureUrl: '/textures/ceramic_white.jpg', color: '#ffffff',roughness: 0.6, metalness: 0.0 },
    wallOuter: { color: '#ffffff',roughness: 0, metalness: 0.0 },
    wallInner: { textureUrl: '/textures/ceramic_white.jpg', color: '#ffffff',roughness: 0, metalness: 0.0 },
    bottomInner: { textureUrl: '/textures/ceramic_white.jpg', color: '#ffffff',roughness: 0, metalness: 0.0 },
    bottom: { textureUrl: '/textures/testimage.jpg', color: '#ffffff',roughness: 0, metalness: 0.0 },
}

export const corkBoardMaterials: Record<string, PartMaterialOverride> = {
    board: { textureUrl: '/textures/cork.jpg', roughness: 1.0, metalness: 0.0 },
    frame: { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 1.0, metalness: 0.0 },
}

export const metalCabinetMaterials: Record<string, PartMaterialOverride> = {
    panel: { textureUrl: '/textures/clear_metal.jpg', roughness: 0.5, metalness: 0.65 },
    kick:  { textureUrl: '/textures/clear_metal.jpg', roughness: 0.4, metalness: 0.75 },
}

export const metalDrawerMaterials: Record<string, PartMaterialOverride> = {
    drawerFront: { textureUrl: '/textures/clear_metal.jpg', roughness: 0.5, metalness: 0.65 },
    drawerBox:   { textureUrl: '/textures/clear_metal.jpg', roughness: 0.55, metalness: 0.55 },
    handle:      { textureUrl: '/textures/clear_metal.jpg', roughness: 0.25, metalness: 0.9 },
}

export const metalDeskTopMaterials: Record<string, PartMaterialOverride> = {
    surface: { ...deskMaterials.top },
    rim:     { textureUrl: '/textures/clear_metal.jpg', roughness: 0, metalness: 0.85 },
}

export const secretFileMaterials: Record<string, PartMaterialOverride> = {
    coverFront: { textureUrl: '/textures/top_secret.jpg', roughness: 0.85, metalness: 0.0 },
    coverBack:  { textureUrl: '/textures/top_secret.jpg', roughness: 0.85, metalness: 0.0 },

    paper1: { textureUrl: '/textures/paper_collages_whites.jpg', roughness: 0.95, metalness: 0.0 },
    paper2: { textureUrl: '/textures/paper_collages_whites.jpg', roughness: 0.95, metalness: 0.0 },
}

export const coatRackMaterials: Record<string, PartMaterialOverride> = {
    pole:   { textureUrl: '/textures/clear_metal.jpg', roughness: 0.35, metalness: 0.85 },
    ring:   { textureUrl: '/textures/clear_metal.jpg', roughness: 0.30, metalness: 0.85 },
    leg:    { textureUrl: '/textures/clear_metal.jpg', roughness: 0.35, metalness: 0.85 },
    hook:   { textureUrl: '/textures/clear_metal.jpg', roughness: 0.30, metalness: 0.85 },
    foot:   { textureUrl: '/textures/clear_metal.jpg', roughness: 0.35, metalness: 0.85 },
    cap:    { textureUrl: '/textures/clear_metal.jpg', roughness: 0.25, metalness: 0.85 },
}

export const detectiveHatMaterials: Record<string, PartMaterialOverride> = {
    felt:   { textureUrl: '/textures/felt_beige.jpg', roughness: 1.0, metalness: 0.0 },
    ribbon: { textureUrl: '/textures/fabric_leather_brown.jpg', roughness: 0.9, metalness: 0.0 },
}

export const bookMaterials: Record<string, PartMaterialOverride> = {
    coverFront: { textureUrl: '/textures/leather_white.jpg', color: '#ffffff', roughness: 0.9, metalness: 0.0,},
    coverBack:  { textureUrl: '/textures/leather_white.jpg', color: '#ffffff', roughness: 0.9, metalness: 0.0 },
    spine:      { textureUrl: '/textures/leather_white.jpg', color: '#ffffff', roughness: 0.88, metalness: 0.0 },
    pages:      { textureUrl: '/textures/paper_collages_whites.jpg', roughness: 0.95, metalness: 0.0 },
}

export const clockMaterials: Record<string, PartMaterialOverride> = {
    frame_0: { color: '#0d0f12', roughness: 0.6, metalness: 0.0 },
    frame_fill_0: { color: '#0d0f12', roughness: 0.6, metalness: 0.0 },
    frame_1: { color: '#0d0f12', roughness: 0.6, metalness: 0.0 },
    frame_fill_1: { color: '#0d0f12', roughness: 0.6, metalness: 0.0 },
    frame_2: { color: '#0d0f12', roughness: 0.6, metalness: 0.0 },
    frame_fill_2: { color: '#0d0f12', roughness: 0.6, metalness: 0.0 },
    backPlate: { color: '#0d0f12', roughness: 0.65, metalness: 0.0 },

    face: { textureUrl: '/textures/clock.jpg', color: '#f4f2ea', roughness: 0.95, metalness: 0.0, },

    glass: { color: '#ffffff', roughness: 0.0, metalness: 0.0, },

    handMinute: { color: '#101010', roughness: 0.6, metalness: 0.0 },
    handHour:   { color: '#101010', roughness: 0.6, metalness: 0.0 },
    centerCap:  { color: '#d2b886', roughness: 0.4, metalness: 0.2 },
}

export const plantPotMaterials: Record<string, PartMaterialOverride> = {
    potBody:    { textureUrl: '/textures/ceramic.jpg', color: '#d7d3ce', roughness: 0.9, metalness: 0.02 },
    potLipOuter:{ textureUrl: '/textures/ceramic.jpg', color: '#9f9f9f', roughness: 0.9, metalness: 0.02 },
    potBase:    { textureUrl: '/textures/ceramic.jpg', color: '#acacac', roughness: 0.9, metalness: 0.02 },
    soil:       { textureUrl: '/textures/dirt.jpg', roughness: 1.0, metalness: 0.0 },

    culm: { textureUrl:   '/textures/bamboo.jpg', color: '#e6e6e6', roughness: 0.65, metalness: 0.0, },

    leaf: { textureUrl: '/textures/leaf_bamboo.jpg', color: '#3f6d32', roughness: 0.7, metalness: 0.0, },
}

export const cardboardMaterials: Record<string, PartMaterialOverride> = {
    bottom:  { textureUrl: '/textures/cardboard.jpg', roughness: 0.95, metalness: 0.0 },
    wall:    { textureUrl: '/textures/cardboard.jpg', roughness: 0.95, metalness: 0.0 },
    lidTop:  { textureUrl: '/textures/cardboard.jpg', roughness: 0.95, metalness: 0.0 },
    lidSide: { textureUrl: '/textures/cardboard.jpg', roughness: 0.95, metalness: 0.0 },
}

export const trashBinMaterials = {
    rimTop:    { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.3, metalness: 1 },
    rimBottom: { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.35, metalness: 1 },
    ring:      { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.35, metalness: 0.85 },
    wire:      { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.35, metalness: 0.85 },
    base:      { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.45, metalness: 1  },
}

export const cigarMaterials = {
    body:    { textureUrl: '/textures/cigar_wrapper.jpg', roughness: 0.9,  metalness: 0.02 },
    headCap: { textureUrl: '/textures/cigar_wrapper.jpg', roughness: 0.88, metalness: 0.02 },
    footCap: { textureUrl: '/textures/cigar_wrapper.jpg', roughness: 0.9,  metalness: 0.02 },
    footFlat:{ textureUrl: '/textures/burning_ash.jpg', roughness: 0, metalness: 0.0 },
    band:    { textureUrl: '/textures/gold_foil.jpg',    roughness: 0.6,  metalness: 0.15 },
}

export const ashTrayWoodMaterials = {
    baseBlock: { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    topPlate:  { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    bowl:      { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    bowlFloor: { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    restLip_0: { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    restLip_1: { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
}

export const woodBlindsMaterials: Record<string, PartMaterialOverride> = {
    head:   { textureUrl: '/textures/dark_planks.jpg', roughness: 0.95, metalness: 0.02 },
    bottom: { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    slat:   { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    tape:   { textureUrl: '/textures/stainless_steel.jpg', roughness: 1.0, metalness: 0.0, color: '#d8d2c6' },
}

export const rectWindowMaterials: Record<string, PartMaterialOverride> = {
    surround: { textureUrl: '/textures/dark_planks.jpg', roughness: 1.0, metalness: 0.0 },
    frame:    { textureUrl: '/textures/ceramic.jpg',  color: '#858585', roughness: 0.85, metalness: 0.05 },
    glass:    { color: '#777777', roughness: 0.0, metalness: 0.0 }
}

export const wallCutoutMaterials: Record<string, PartMaterialOverride> = {
    panel: { textureUrl: '/textures/wallpaper_red.jpg', color: '#ffffff', roughness: 1, metalness: 0 },
}

export const binderMaterials: Record<string, PartMaterialOverride> = {
    coverFront: { textureUrl: '/textures/clear_metal.jpg', roughness: 0.9,  metalness: 0.0 },
    coverBack:  { textureUrl: '/textures/clear_metal.jpg', roughness: 0.9,  metalness: 0.0 },
    spine:      { textureUrl: '/textures/clear_metal.jpg', roughness: 0.9,  metalness: 0.0 },

    paper:      { textureUrl: '/textures/written_letter.jpg', roughness: 0.97, metalness: 0.0 },
    spineLabel: { textureUrl: '/textures/paper_collages_whites.jpg', roughness: 0.96, metalness: 0.0, color: '#ffffff' },

    ring:      { roughness: 0.1, metalness: 0.9, color: '#ffffff' },
    spineRing: { roughness: 0.35, metalness: 0.9, color: '#ffffff' },
}

export const bookshelfMaterials: Record<string, PartMaterialOverride> = {
    side:   { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    top:    { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    bottom: { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    shelf:  { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.95, metalness: 0.02 },
    back:   { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.98, metalness: 0.01 },
}

export const magnifierMaterials: Record<string, PartMaterialOverride> = {
    ring:   { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.35, metalness: 1 },
    neck:   { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.35, metalness: 1 },
    handle: { textureUrl: '/textures/clear_metal.jpg', color: '#111111', roughness: 0.85, metalness: 0.1 },
    lens:   { color: '#f5f7ff', roughness: 0, metalness: 0, transparent: true, opacity: 0.05, depthWrite: false },
}

export const staplerMaterials: Record<string, PartMaterialOverride> = {
    baseBody: { color: '#050608', roughness: 0.9, metalness: 0.02 },
    backBlock: { color: '#050608', roughness: 0.9, metalness: 0.02 },
    topBody: { color: '#050608', roughness: 0.92, metalness: 0.03 },
    metalRail: { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.35, metalness: 0 },
    frontFoot: { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.4, metalness: 1 },
    hingePin: { textureUrl: '/textures/clear_metal.jpg', roughness: 0.3, metalness: 1 },
}

export const penMaterials: Record<string, PartMaterialOverride> = {
    body:  { textureUrl: '/textures/clear_metal.jpg',roughness: 0.9, metalness: 0.08 },
    tip:   { textureUrl: '/textures/clear_metal.jpg', roughness: 0.9, metalness: 0.1 },
    tail:  { textureUrl: '/textures/clear_metal.jpg', roughness: 0.92, metalness: 0.06 },
    clip:  { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.3, metalness: 1 },
}

export const paperclipMaterials: Record<string, PartMaterialOverride> = {
    outerLoop: { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.3, metalness: 1 },
    innerLoop: { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.3, metalness: 1 },
}

export const globeMaterials: Record<string, PartMaterialOverride> = {
    globe: {
        textureUrl: '/textures/globe_earth.jpg',
        roughness: 0.9,
        metalness: 0.0,
    },
    ring:      { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.35, metalness: 1 },
    topCap:    { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.4, metalness: 1 },
    bottomCap: { textureUrl: '/textures/stainless_steel.jpg', roughness: 0.4, metalness: 1 },
    stand:     { textureUrl: '/textures/clear_metal.jpg', roughness: 0.4, metalness: 1 },
    arm:       { textureUrl: '/textures/clear_metal.jpg', roughness: 0.4, metalness: 1 },
    base:      { textureUrl: '/textures/clear_metal.jpg', roughness: 0.4, metalness: 1 },
}