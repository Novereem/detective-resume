'use client';

import dynamic from 'next/dynamic';
import {red} from "next/dist/lib/picocolors";

// Dynamically import the component without SSR
const DetectiveRoom = dynamic(() => import('@/components/DetectiveRoom'), {
    ssr: false,
    loading: () => <p>Loading detective room...</p>,
});

export default function DetectiveRoomPage() {
    return <DetectiveRoom/>
}