import { PartMaterialOverride } from '@/components/Models/Generic/ModelGroup'

export const deskMaterials: Record<string, PartMaterialOverride> = {
    top: { textureUrl: '/textures/vintage_clear_plywood.jpg', roughness: 0.8, metalness: 0.05 },
    leg: { textureUrl: '/textures/clear_metal.jpg', roughness: 0.4, metalness: 0.85 },
}

export const mugMaterials: Record<string, PartMaterialOverride> = {
    body:   { textureUrl: '/textures/ceramic_white.jpg', roughness: 0.6, metalness: 0.0 },
    handle: { textureUrl: '/textures/rainbow_metal.jpg', roughness: 0.6, metalness: 0.0 },
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
    spine:      { textureUrl: '/textures/fabric_leather_brown.jpg', color: '#ffffff', roughness: 0.88, metalness: 0.0 },
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