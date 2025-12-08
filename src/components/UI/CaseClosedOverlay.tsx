'use client';
import React from 'react';
import { useGameState } from '@/components/Game/state';

const OVERLAY_Z = 1300;
const ANIM_MS = 520;
const CASE_CLOSED_DELAY_MS = 1500;

function CaseClosedStamp({ ready }: { ready: boolean }) {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 18px 6px',
                borderRadius: 4,
                border: '2px solid rgba(248,113,113,0.96)',
                color: 'rgba(248,113,113,0.98)',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.7)',
                background:
                    'radial-gradient(circle at 30% 20%, rgba(248,250,252,0.12), transparent 45%)',
                textShadow:
                    '0 0.5px 0 rgba(127,29,29,0.6), 0.4px 0.8px 0 rgba(127,29,29,0.5)',
                opacity: ready ? 1 : 0,
                animation: ready
                    ? 'caseClosed-stamp-pop 540ms cubic-bezier(.22,.9,.32,1.2) 0.12s both'
                    : 'none',
            }}
        >
            CASE&nbsp;CLOSED
        </div>
    );
}

export function CaseClosedOverlay() {
    const { puzzlesConfig, puzzleStatus } = useGameState();

    const [open, setOpen] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const hasTriggeredRef = React.useRef(false);
    const triggerTimeoutRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        const entries = Object.entries(puzzlesConfig);
        if (!entries.length) return;

        const total = entries.length;
        const solved = entries.reduce(
            (acc, [id]) => acc + (puzzleStatus[id as keyof typeof puzzleStatus]?.solved ? 1 : 0),
            0
        );

        const allSolved = total > 0 && solved === total;

        if (allSolved && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;

            if (triggerTimeoutRef.current !== null) {
                clearTimeout(triggerTimeoutRef.current);
            }

            triggerTimeoutRef.current = window.setTimeout(() => {
                setOpen(true);
            }, CASE_CLOSED_DELAY_MS);
        }
    }, [puzzlesConfig, puzzleStatus]);

    React.useEffect(() => {
        return () => {
            if (triggerTimeoutRef.current !== null) {
                clearTimeout(triggerTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (open) {
            const id = requestAnimationFrame(() => setVisible(true));
            return () => cancelAnimationFrame(id);
        } else {
            const t = setTimeout(() => setVisible(false), ANIM_MS);
            return () => clearTimeout(t);
        }
    }, [open]);

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, []);

    if (!open && !visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: OVERLAY_Z,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: open ? 'auto' : 'none',
                background: visible ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0)',
                backdropFilter: visible ? 'blur(10px) brightness(0.85)' : 'blur(0px) brightness(1)',
                WebkitBackdropFilter: visible ? 'blur(10px) brightness(0.85)' : 'blur(0px) brightness(1)',
                transition: `background ${ANIM_MS}ms ease, backdrop-filter ${ANIM_MS}ms ease`,
            }}
            onClick={handleClose}
        >
            {/* Confetti sits behind the card */}
            <ConfettiLayer active={visible} />

            {/* Card */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    zIndex: 1,
                    width: 'min(560px, 90vw)',
                    padding: '24px 24px 20px',
                    borderRadius: 18,
                    background: 'rgba(10,10,10,0.96)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    boxShadow: '0 24px 70px rgba(0,0,0,0.7)',
                    color: '#f5f5f5',
                    transform: visible
                        ? 'translateY(0) scale(1)'
                        : 'translateY(26px) scale(0.96)',
                    opacity: visible ? 1 : 0,
                    transition: `opacity ${ANIM_MS}ms ease, transform ${ANIM_MS}ms cubic-bezier(.22,.8,.36,1)`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 18,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                    }}
                >
                    <CaseClosedStamp ready={visible} />

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close case closed screen"
                        style={{
                            flexShrink: 0,
                            width: 26,
                            height: 26,
                            borderRadius: 999,
                            border: '1px solid rgba(255,255,255,0.3)',
                            background: 'rgba(255,255,255,0.04)',
                            color: '#f9f9f9',
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                        }}
                    >
                    <span
                        style={{
                            transform: 'translateY(-1px)',
                        }}
                    >
                        ×
                    </span>
                    </button>
                </div>

                {/* Heading + copy */}
                <div style={{display: 'grid', gap: 8}}>
                    <h2
                        style={{
                            fontSize: 28,
                            lineHeight: 1.2,
                            fontWeight: 650,
                        }}
                    >
                        You cracked the case!
                    </h2>
                    <p
                        style={{
                            fontSize: 15,
                            lineHeight: 1.5,
                            color: 'rgba(249,249,249,0.82)',
                        }}
                    >
                        Thanks for exploring this detective room. If you think I might fit
                        your team, you can grab my CV or reach out right away.
                    </p>
                </div>

                {/* Primary actions */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        marginTop: 4,
                    }}
                >
                    <a
                        href="/noah-overeem-cv.pdf"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            flexShrink: 0,
                            padding: '10px 18px',
                            borderRadius: 999,
                            background: '#f4f4f5',
                            color: '#020617',
                            fontWeight: 600,
                            fontSize: 14,
                            textDecoration: 'none',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                            cursor: 'pointer',
                        }}
                    >
                        Download my CV
                    </a>

                    <a
                        href="mailto:your-email@example.com"
                        style={{
                            flexShrink: 0,
                            padding: '10px 18px',
                            borderRadius: 999,
                            border: '1px solid rgba(255,255,255,0.24)',
                            background: 'rgba(255,255,255,0.04)',
                            color: '#f9fafb',
                            fontWeight: 600,
                            fontSize: 14,
                            textDecoration: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Email me
                    </a>

                    <button
                        type="button"
                        onClick={handleClose}
                        style={{
                            marginLeft: 'auto',
                            padding: '10px 14px',
                            borderRadius: 999,
                            border: 'none',
                            background: 'transparent',
                            color: 'rgba(248,250,252,0.7)',
                            fontSize: 13,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                        }}
                    >
                        Keep exploring the room
                    </button>
                </div>

                {/* Secondary links */}
                <div
                    style={{
                        marginTop: 4,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        fontSize: 13,
                        color: 'rgba(209,213,219,0.9)',
                    }}
                >
                    <a
                        href="https://www.linkedin.com/in/noah-overeem-2028231b5"
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        LinkedIn
                    </a>
                    <span style={{ opacity: 0.45 }}>·</span>
                    <a
                        href="https://www.github.com/Novereem/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}

const CONFETTI_STYLE_ID = 'case-closed-confetti-styles';

function ensureConfettiStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(CONFETTI_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = CONFETTI_STYLE_ID;
    style.textContent = `
@keyframes caseClosed-confetti-fall {
  0%   { transform: translate3d(0,-12vh,0); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translate3d(0,110vh,0); opacity: 0; }
}
@keyframes caseClosed-confetti-spin {
  0%   { transform: rotate3d(0,0,1,0deg); }
  100% { transform: rotate3d(0,0,1,360deg); }
}
@keyframes caseClosed-stamp-pop {
  0% {
    transform: translate3d(-4px,-10px,0) rotate(-14deg) scale(0.72);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  70% {
    transform: translate3d(0,0,0) rotate(-8deg) scale(1.06);
  }
  100% {
    transform: translate3d(0,0,0) rotate(-8deg) scale(1);
    opacity: 1;
  }
}
`;
    document.head.appendChild(style);
}

type ConfettiPiece = {
    id: number;
    left: number;
    delay: number;
    duration: number;
    size: number;
    color: string;
};

const CONFETTI_COLORS = [
    '#f97316',
    '#22c55e',
    '#38bdf8',
    '#e11d48',
    '#a855f7',
    '#eab308',
];

function ConfettiLayer({ active }: { active: boolean }) {
    React.useEffect(() => {
        ensureConfettiStyles();
    }, []);

    const [pieces] = React.useState<ConfettiPiece[]>(() =>
        Array.from({ length: 70 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 0.8,
            duration: 3 + Math.random() * 1.6,
            size: 6 + Math.random() * 7,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        }))
    );

    if (!active) return null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        >
            {pieces.map((p) => (
                <span
                    key={p.id}
                    style={{
                        position: 'absolute',
                        top: '-12px',
                        left: `${p.left}%`,
                        opacity: 0,
                        animation: `caseClosed-confetti-fall ${p.duration}s cubic-bezier(.25,.8,.25,1) ${p.delay}s forwards`,
                    }}
                >
                    <span
                        style={{
                            display: 'block',
                            width: p.size,
                            height: p.size * 0.45 + 3,
                            borderRadius: 2,
                            background: p.color,
                            transform: `rotate(${Math.random() * 360}deg)`,
                            animation: `caseClosed-confetti-spin ${p.duration}s linear ${p.delay}s forwards`,
                        }}
                    />
                </span>
            ))}
        </div>
    );
}
