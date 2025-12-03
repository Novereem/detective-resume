"use client";

import { useEffect, useRef, useState } from "react";

type Pos = { x: number; y: number };

export default function BackgroundFX() {
    // Actual position used for the gradient (follows with delay)
    const [pos, setPos] = useState<Pos>({ x: 50, y: 50 });
    // Target position set directly by pointer
    const targetRef = useRef<Pos>({ x: 50, y: 50 });

    // Track pointer and update target position
    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (event.clientX / innerWidth) * 100;
            const y = (event.clientY / innerHeight) * 100;
            targetRef.current = { x, y };
        };

        window.addEventListener("pointermove", handlePointerMove);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
        };
    }, []);

    // Animation loop: ease current pos towards target pos
    useEffect(() => {
        let frame: number;

        const animate = () => {
            setPos((prev) => {
                const target = targetRef.current;
                const dx = target.x - prev.x;
                const dy = target.y - prev.y;

                // Lerp factor: smaller = more delay, larger = snappier
                const lerp = 0.08;

                // If very close, stop moving to avoid tiny updates
                if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
                    return prev;
                }

                return {
                    x: prev.x + dx * lerp,
                    y: prev.y + dy * lerp,
                };
            });

            frame = requestAnimationFrame(animate);
        };

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, []);

    const mouseGradient = `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(129, 140, 248, 0.35), transparent 85%)`;

    const baseGradient =
        "radial-gradient(circle at top left, rgba(244, 114, 182, 0.25), transparent 60%), " +
        "radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.2), transparent 55%)";

    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
            {/* Wavy animated gradient, reacts to smoothed mouse position */}
            <div
                className="absolute inset-[-10%] animate-pulseWaves opacity-70"
                style={{
                    backgroundImage: `${mouseGradient}, ${baseGradient}`,
                    filter: "blur(32px)",
                }}
            />
            {/* Subtle vignette so edges stay dark and content readable */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0),_rgba(0,0,0,0.95))]" />
        </div>
    );
}
