import type { MoveRequest } from '@/components/Types/room'

export function requestZoomPeek(
    setMoveReq: (req: MoveRequest) => void,
    to: MoveRequest,
    back: MoveRequest,
    ms = 200
) {
    setMoveReq(to)
    setTimeout(() => setMoveReq(back), ms)
}