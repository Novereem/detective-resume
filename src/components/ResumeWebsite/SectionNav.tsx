"use client";

import { useEffect, useRef, useState, MouseEvent } from "react";

type SectionInfo = { id: string; label: string };

interface SectionNavProps {
    sections: SectionInfo[];
}

export default function SectionNav({ sections }: SectionNavProps) {
    const [activeId, setActiveId] = useState<string>("top");
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [lineOffsets, setLineOffsets] = useState<{ top: number; bottom: number } | null>(
        null
    );

    // Scrollspy based on scroll-snap container: pick section whose center is
    // closest to the container's center.
    useEffect(() => {
        const scrollContainer = document.getElementById("resume-scroll-container");
        if (!scrollContainer) return;

        const sectionEls = sections
            .map((s) => ({
                id: s.id,
                el: document.getElementById(s.id) as HTMLElement | null,
            }))
            .filter((x) => x.el !== null) as { id: string; el: HTMLElement }[];

        const handleScroll = () => {
            if (!sectionEls.length) return;

            const containerRect = scrollContainer.getBoundingClientRect();
            const containerCenter = containerRect.top + containerRect.height / 2;

            let closestId = sectionEls[0].id;
            let minDistance = Number.POSITIVE_INFINITY;

            for (const { id, el } of sectionEls) {
                const rect = el.getBoundingClientRect();
                const sectionCenter = rect.top + rect.height / 2;
                const distance = Math.abs(sectionCenter - containerCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestId = id;
                }
            }

            setActiveId(closestId);
        };

        handleScroll();

        scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);

        return () => {
            scrollContainer.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [sections]);

    // Measure first/last dot centers so the line doesn't "overshoot"
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateLine = () => {
            const dots = container.querySelectorAll<HTMLElement>("[data-nav-dot]");
            if (!dots.length) return;

            const first = dots[0].getBoundingClientRect();
            const last = dots[dots.length - 1].getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const firstCenter = first.top + first.height / 2;
            const lastCenter = last.top + last.height / 2;

            setLineOffsets({
                top: firstCenter - containerRect.top,
                bottom: containerRect.bottom - lastCenter,
            });
        };

        updateLine();

        window.addEventListener("resize", updateLine);
        window.addEventListener("orientationchange", updateLine);
        return () => {
            window.removeEventListener("resize", updateLine);
            window.removeEventListener("orientationchange", updateLine);
        };
    }, [sections]);

    const handleClick =
        (section: SectionInfo) => (e: MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();

            // Mark active immediately
            setActiveId(section.id);

            const scrollContainer = document.getElementById("resume-scroll-container");
            const targetEl = document.getElementById(section.id);
            if (!scrollContainer || !targetEl) return;

            const containerRect = scrollContainer.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();

            // Scroll so the section's current position becomes the reference;
            // CSS scroll-snap will finish the alignment (start/center) depending
            // on the section's snapAlign.
            const offset =
                targetRect.top - containerRect.top + scrollContainer.scrollTop;

            scrollContainer.scrollTo({
                top: offset,
                behavior: "smooth",
            });
        };

    return (
        <nav className="pointer-events-none fixed inset-y-0 right-4 z-20 hidden lg:flex items-center">
            <div className="pointer-events-auto flex flex-col items-start">
                <div ref={containerRef} className="relative flex flex-col items-start gap-4">
                    {lineOffsets && (
                        <div
                            className="absolute left-[0.45rem] w-px bg-white/10"
                            style={{ top: lineOffsets.top, bottom: lineOffsets.bottom }}
                        />
                    )}

                    {sections.map((section) => {
                        const isActive = activeId === section.id;

                        return (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                onClick={handleClick(section)}
                                className="group relative flex items-center gap-3"
                            >
                                <span
                                    data-nav-dot
                                    className="relative flex h-4 w-4 items-center justify-center"
                                >
                                    <span
                                        className={
                                            "h-1.5 w-1.5 rounded-full transition " +
                                            (isActive
                                                ? "bg-white"
                                                : "bg-white/50 group-hover:bg-white")
                                        }
                                    />
                                    <span
                                        className={
                                            "absolute inset-0 rounded-full border border-white/20 transition " +
                                            (isActive
                                                ? "opacity-100"
                                                : "opacity-0 group-hover:opacity-100")
                                        }
                                    />
                                </span>
                                <span
                                    className={
                                        "text-xs transition " +
                                        (isActive
                                            ? "text-zinc-100"
                                            : "text-zinc-400 group-hover:text-zinc-100")
                                    }
                                >
                                    {section.label}
                                </span>
                            </a>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
