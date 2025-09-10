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