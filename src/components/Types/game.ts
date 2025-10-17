import { ANCHOR } from "@/components/Game/anchors"

export type Vec3 = [number, number, number]

export type DrawerKey =
    | "leftTop" | "leftMiddle" | "leftBottom"
    | "rightTop" | "rightMiddle" | "rightBottom"

export type AnchorKey = keyof typeof ANCHOR

declare const __brandPuzzleId: unique symbol
declare const __brandSecretFileId: unique symbol

export type PuzzleId = string & { [__brandPuzzleId]: true }
export type SecretFileId = string & { [__brandSecretFileId]: true }