import { Metadata } from 'next'
import DetectiveRoomClient from './DetectiveRoomClient'

export const metadata: Metadata = {
    title: 'Detective Room',
    description: 'Interact with the detective room to uncover clues about my professional skills and experience.',
}

export default function Page() {
    return <DetectiveRoomClient />
}