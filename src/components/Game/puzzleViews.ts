import type { InspectState, TextPuzzle } from "@/components/Types/inspectModels"

const framed = (args: {
    width: number; height: number; border?: number
    textureUrl: string
    pixelSize?: number
    inspectDistance?: number
    puzzle: TextPuzzle
}): InspectState => ({
    kind: "framed",
    width: args.width,
    height: args.height,
    border: args.border ?? 0.01,
    textureUrl: args.textureUrl,
    textureFit: "stretch",
    pixelSize: args.pixelSize ?? 1,
    inspectDistance: args.inspectDistance ?? 0.4,
    puzzle: args.puzzle,
})

export const PUZZLE_VIEWS: Record<
    string,
    { kind: "framed"; state: InspectState; pinFrom?: "top-center" | "none"; rotateY180WhenPinned?: boolean }
> = {
    "puzzle-house": {
        kind: "framed",
        state: framed({
            width: 0.17,
            height: 0.2,
            textureUrl: "/textures/house_szn1.jpg",
            puzzle: {
                type: "text",
                id: "frame-code-desk",
                prompt: "What is the name of this popular medical drama from the 2000s?",
                answers: ["house", /house\s*md/i],
                normalize: "trim-lower",
                feedback: { correct: "Nice find!", incorrect: "Not quite—look closer." },
            },
        }),
        pinFrom: "top-center",
        rotateY180WhenPinned: true,
    },

    "puzzle-photo-clue": {
        kind: "framed",
        state: {
            kind: "framed",
            width: 0.20,
            height: 0.20,
            border: 0.012,
            textureUrl: "/textures/testimage.jpg",
            textureFit: "contain",
            pixelSize: 1,
            inspectDistance: 0.4,
            puzzle: {
                type: "text",
                id: "photo-red-circle",
                prompt: "Who is the person circled in red?",
                answers: ["john doe", /john\s+doe/i],
                normalize: "trim-lower",
                feedback: {correct: "Good eye.", incorrect: "Look again at the red circle."},
            },
        },
        pinFrom: "top-center",
        rotateY180WhenPinned: true,
    },

}