"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import AnimatedSection from "@/app/resume/AnimatedSection";

type Project = {
    id: string;
    title: string;
    role: string;
    period?: string;
    tagline: string;
    tech: string[];
    bullets: string[];
    primaryLink: {
        label: string;
        href: string;
    };
    secondaryLinks?: {
        label: string;
        href: string;
    }[];
    detailCtaLabel?: string;
    detailImage: string;
    detailBody: string[];
};

interface ProjectsSectionProps {
    projects: Project[];
}

type OverlayState = "hidden" | "entering" | "visible" | "exiting";

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overlayState, setOverlayState] = useState<OverlayState>("hidden");
    const [mounted, setMounted] = useState(false);

    const activeProject = projects.find((p) => p.id === activeId) ?? null;

    useEffect(() => {
        setMounted(true);
    }, []);

    const openOverlay = (id: string) => {
        setActiveId(id);
        setOverlayState("entering");
    };

    const startCloseOverlay = () => {
        if (overlayState === "hidden" || overlayState === "exiting") return;
        setOverlayState("exiting");
    };

    // Handle enter/exit animation timing
    useEffect(() => {
        if (overlayState === "entering") {
            const raf = requestAnimationFrame(() => {
                setOverlayState("visible");
            });
            return () => cancelAnimationFrame(raf);
        }

        if (overlayState === "exiting") {
            const timeout = window.setTimeout(() => {
                setOverlayState("hidden");
                setActiveId(null);
            }, 200); // keep in sync with tailwind duration
            return () => window.clearTimeout(timeout);
        }
    }, [overlayState]);

    // Lock scroll inside the resume container while overlay is present
    useEffect(() => {
        const container = document.getElementById("resume-scroll-container");
        if (!container) return;

        if (overlayState === "hidden") {
            container.style.overflowY = "auto";
        } else {
            container.style.overflowY = "hidden";
        }

        return () => {
            container.style.overflowY = "auto";
        };
    }, [overlayState]);

    // Close on Escape
    useEffect(() => {
        if (overlayState === "hidden") return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                startCloseOverlay();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [overlayState]);

    const showOverlay = mounted && overlayState !== "hidden" && activeProject;

    const overlayOpacity =
        overlayState === "visible" ? "opacity-100" : "opacity-0";

    const panelTransform =
        overlayState === "visible"
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-2 scale-[0.97]";

    return (
        <AnimatedSection id="projects" className="space-y-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        Featured projects
                    </h2>
                    <p className="mt-1 text-base text-zinc-300">
                        A mix of solo builds and team projects I led.
                    </p>
                </div>
                <p className="text-sm text-zinc-500">
                    Info parity: the same projects appear in the detective room path.
                </p>
            </div>

            <div className="grid items-stretch gap-5 md:grid-cols-2 lg:gap-6">
                {projects.map((project) => (
                    <article
                        key={project.id}
                        className="group flex h-full flex-col rounded-2xl border border-white/10 bg-black/40 px-5 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur transition-transform duration-200 hover:-translate-y-1 hover:border-white/30 sm:px-6 sm:py-5"
                    >
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <h3 className="text-base font-semibold text-zinc-50">
                                {project.title}
                            </h3>
                            {project.period && (
                                <span className="text-sm text-zinc-400">
                                    {project.period}
                                </span>
                            )}
                        </div>

                        <p className="text-sm font-medium text-zinc-300">
                            {project.role}
                        </p>
                        <p className="mt-2 text-base text-zinc-300">
                            {project.tagline}
                        </p>

                        <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                            {project.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-2">
                                    <span className="mt-[5px] inline-block h-1 w-1 flex-none rounded-full bg-gradient-to-r from-sky-400 to-fuchsia-400" />
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                            {project.tech.map((tech) => (
                                <span
                                    key={tech}
                                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 flex flex-wrap items-center gap-3 text-sm font-semibold">
                            {(() => {
                                const isDetailsPrimary =
                                    project.id === "lunarflow" || project.id === "sanquin";
                                const detailsLabel = project.detailCtaLabel ?? "View details";

                                if (isDetailsPrimary) {
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => openOverlay(project.id)}
                                            className="rounded-full bg-zinc-50 px-4 py-2 text-black transition hover:bg-white hover:shadow-md active:scale-[0.98]"
                                        >
                                            {detailsLabel}
                                        </button>
                                    );
                                }

                                return (
                                    <>
                                        <Link
                                            href={project.primaryLink.href}
                                            className="rounded-full bg-zinc-50 px-4 py-2 text-black transition hover:bg-white hover:shadow-md active:scale-[0.98]"
                                        >
                                            {project.primaryLink.label}
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => openOverlay(project.id)}
                                            className="text-xs font-normal text-zinc-400 underline-offset-4 transition hover:text-zinc-100 hover:underline"
                                        >
                                            {detailsLabel}
                                        </button>

                                        {project.secondaryLinks?.map((link) => (
                                            <Link
                                                key={link.label}
                                                href={link.href}
                                                className="text-xs font-normal text-zinc-400 underline-offset-4 transition hover:text-zinc-100 hover:underline"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </>
                                );
                            })()}
                        </div>
                    </article>
                ))}
            </div>

            {showOverlay &&
                createPortal(
                    <div
                        className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${overlayOpacity}`}
                        onClick={startCloseOverlay}
                    >
                        <div
                            className={`relative mx-4 w-full max-w-4xl rounded-3xl border border-white/15 bg-black/90 p-6 text-sm text-zinc-200 shadow-2xl sm:p-8 transform transition-all duration-200 ${panelTransform}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={startCloseOverlay}
                                className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200 hover:border-white/40 hover:bg-white/10"
                            >
                                Close
                            </button>

                            <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)] md:items-start">
                                <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-900 md:mb-0">
                                    <Image
                                        src={activeProject.detailImage}
                                        alt={activeProject.title}
                                        fill
                                        sizes="(min-width: 1024px) 480px, 100vw"
                                        className="object-cover"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-zinc-50">
                                            {activeProject.title}
                                        </h3>
                                        <p className="text-xs text-zinc-400">
                                            {activeProject.role}
                                            {activeProject.period
                                                ? ` · ${activeProject.period}`
                                                : ""}
                                        </p>
                                    </div>

                                    <p className="text-sm text-zinc-300">
                                        {activeProject.tagline}
                                    </p>

                                    <div className="space-y-2">
                                        {activeProject.detailBody.map((paragraph) => (
                                            <p
                                                key={paragraph}
                                                className="text-sm text-zinc-200"
                                            >
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                                        {activeProject.tech.map((tech) => (
                                            <span
                                                key={tech}
                                                className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                                        <Link
                                            href={activeProject.primaryLink.href}
                                            className="rounded-full bg-zinc-50 px-4 py-2 text-black transition hover:bg-white hover:shadow-md active:scale-[0.98]"
                                        >
                                            {activeProject.primaryLink.label}
                                        </Link>
                                        {activeProject.secondaryLinks?.map((link) => (
                                            <Link
                                                key={link.label}
                                                href={link.href}
                                                className="text-zinc-300 underline-offset-4 transition hover:text-zinc-100 hover:underline"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </AnimatedSection>
    );
}
