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