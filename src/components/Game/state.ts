import { GameState } from "./state.logic"
export const gameState = new GameState()

import * as React from "react"
export function useGameState() {
    const [, force] = React.useReducer(x => x + 1, 0)
    React.useEffect(() => gameState.subscribe(force), [])
    return gameState.snapshot
}

export function useGameActions() {
    return gameState
}