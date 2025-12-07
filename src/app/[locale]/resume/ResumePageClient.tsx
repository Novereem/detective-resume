"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionNav from "@/components/ResumeWebsite/SectionNav";
import AnimatedSection from "@/components/ResumeWebsite/AnimatedSection";
import BackgroundFX from "@/components/ResumeWebsite/BackgroundFX";
import ProjectsSection from "@/components/ResumeWebsite/ProjectsSection";
import { featuredProjects } from "@/components/ResumeWebsite/projects-data";
import EmailLink from "@/components/ResumeWebsite/EmailLink";

export default function ResumePageClient() {
    {
        const t = useTranslations("Resume");

        const navSections: { id: string; label: string }[] = [
            {id: "top", label: t("nav.top")},
            {id: "about", label: t("nav.about")},
            {id: "skills", label: t("nav.skills")},
            {id: "projects", label: t("nav.projects")},
            {id: "experience", label: t("nav.experience")},
            {id: "education", label: t("nav.education")},
            {id: "contact", label: t("nav.contact")},
        ];

        return (
            <main
                className="relative h-screen overflow-y-auto snap-y snap-mandatory text-zinc-100"
                id="resume-scroll-container"
            >
                <BackgroundFX/>

                {/* Back to home */}
                <nav className="pointer-events-none fixed left-4 top-4 z-20">
                    <Link
                        href="/"
                        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-100 backdrop-blur transition hover:border-white/30 hover:bg-white/10 active:scale-[0.98] sm:text-sm"
                    >
                        <span className="text-base sm:text-lg">←</span>
                        <span className="hidden sm:inline">
                        {t("nav.backToHomeLong")}
                    </span>
                                    <span className="sm:hidden">
                        {t("nav.backToHomeShort")}
                    </span>
                    </Link>
                </nav>

                <SectionNav sections={navSections}/>

                <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-32 px-4 pb-40 pt-4 sm:px-6 lg:px-8">
                    <HeroSection/>
                    <SnapshotSection/>
                    <SkillsSection/>
                    <ProjectsSection projects={featuredProjects}/>
                    <ExperienceSection/>
                    <EducationSection/>
                    <ContactSection/>
                </div>
            </main>
        );
    }

    function HeroSection() {
        const tHero = useTranslations("Resume.hero");
        const tContact = useTranslations("Resume.contact");

        return (
            <AnimatedSection
                id="top"
                className="flex min-h-screen flex-col justify-center space-y-8"
            >
                <div
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-base font-medium text-zinc-300 backdrop-blur">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"/>
                    <span>{tHero("badge")}</span>
                </div>

                <div className="space-y-6">
                    <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                        Noah{" "}
                        <span
                            className="bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Overeem
                    </span>
                    </h1>
                    <p className="text-xl font-medium text-zinc-200 sm:text-2xl">
                        {tHero("subtitle")}
                    </p>
                    <p className="max-w-2xl text-base text-zinc-300 sm:text-lg">
                        {tHero("description")}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/noah-overeem-cv.pdf"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-zinc-50 px-6 py-3 text-base font-semibold text-black shadow-sm transition hover:bg-white hover:shadow-lg active:scale-[0.98]"
                        >
                            {tHero("downloadCv")}
                        </Link>
                        <Link
                            href="#contact"
                            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-zinc-100 transition hover:border-white/30 hover:bg-white/10 active:scale-[0.98]"
                        >
                            {tHero("contactCta")}
                        </Link>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-400 sm:text-base">
                            <EmailLink className="transition hover:text-zinc-100">
                                {tHero("emailLabel")}
                            </EmailLink>
                            <span className="hidden text-zinc-500 sm:inline">·</span>
                            <Link
                                href="https://www.linkedin.com/in/noah-overeem-2028231b5"
                                target="_blank"
                                rel="noreferrer"
                                className="transition hover:text-zinc-100"
                            >
                                {tContact("linkedinLabel")}
                            </Link>
                            <span className="hidden text-zinc-500 sm:inline">·</span>
                            <Link
                                href="https://www.github.com/Novereem/"
                                target="_blank"
                                rel="noreferrer"
                                className="transition hover:text-zinc-100"
                            >
                                {tContact("githubLabel")}
                            </Link>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        );
    }

    function SnapshotSection() {
        const t = useTranslations("Resume.about");

        return (
            <AnimatedSection
                id="about"
                snapAlign="center"
                className="rounded-3xl border border-white/10 bg-black/40 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-10"
            >
                <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-4 sm:max-w-xl">
                        <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                            {t("heading")}
                        </h2>
                        <p className="text-base text-zinc-200 sm:text-lg">
                            {t("body1")}
                        </p>
                        <p className="text-base text-zinc-200 sm:text-lg">
                            {t("body2")}
                        </p>
                        <p className="text-base text-zinc-300 sm:text-lg">
                            {t("body3")}
                        </p>
                    </div>

                    <div
                        className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-200 sm:text-base">
                        {/* Portrait + name */}
                        <div className="flex items-center gap-4">
                            <div
                                className="relative h-20 w-20 overflow-hidden rounded-full border border-white/20 bg-black/40">
                                <Image
                                    src="/resume-images/posed.jpg"
                                    alt={t("portraitAlt")}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="w-30 space-y-1">
                                <p className="text-sm font-semibold text-zinc-100">
                                    {t("cardName")}
                                </p>
                                <p className="text-xs text-zinc-400">
                                    {t("cardRole")}
                                </p>
                            </div>
                        </div>

                        {/* Snapshot / focus areas */}
                        <div className="space-y-3 border-t border-white/10 pt-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                    {t("snapshotLabel")}
                                </p>
                                <p className="mt-1">{t("snapshotText")}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                    {t("focusLabel")}
                                </p>
                                <ul className="mt-1 space-y-1.5">
                                    <li>{t("focusBullet1")}</li>
                                    <li>{t("focusBullet2")}</li>
                                    <li>{t("focusBullet3")}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        );
    }

    function SkillsSection() {
        const t = useTranslations("Resume.skills");

        return (
            <AnimatedSection
                id="skills"
                snapAlign="center"
                className="space-y-6"
            >
                <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    {t("heading")}
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                        <h3 className="text-base font-semibold text-zinc-50">
                            {t("technicalHeading")}
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-200">
                            {[
                                "C#",
                                ".NET 8 Web API",
                                "Docker",
                                "CI/CD",
                                "TypeScript",
                                "JavaScript",
                                "React",
                                "Next.js",
                                "React Native",
                                "SQL / MySQL",
                                "Git & GitHub",
                            ].map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                                >
                                {skill}
                            </span>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                        <h3 className="text-base font-semibold text-zinc-50">
                            {t("collabHeading")}
                        </h3>
                        <ul className="ml-5 mt-4 list-disc space-y-2 text-base text-zinc-200">
                            <li>{t("collabBullet1")}</li>
                            <li>{t("collabBullet2")}</li>
                            <li>{t("collabBullet3")}</li>
                            <li>{t("collabBullet4")}</li>
                            <li>{t("collabBullet5")}</li>
                            <li>{t("collabBullet6")}</li>
                        </ul>
                    </div>
                </div>
            </AnimatedSection>
        );
    }

    function ExperienceSection() {
        const t = useTranslations("Resume.experience");

        return (
            <AnimatedSection
                id="experience"
                snapAlign="center"
                className="space-y-6"
            >
                <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    {t("heading")}
                </h2>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-base font-semibold text-zinc-50">
                                {t("aldiTitle")}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {t("aldiPeriod")}
                            </p>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                            {t("aldiSubtitle")}
                        </p>
                        <ul className="ml-5 mt-2 list-disc space-y-1.5 text-base text-zinc-200">
                            <li>{t("aldiBullet1")}</li>
                            <li>{t("aldiBullet2")}</li>
                            <li>{t("aldiBullet3")}</li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-base font-semibold text-zinc-50">
                                {t("sahTitle")}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {t("sahPeriod")}
                            </p>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                            {t("sahSubtitle")}
                        </p>
                        <ul className="ml-5 mt-2 list-disc space-y-1.5 text-base text-zinc-200">
                            <li>{t("sahBullet1")}</li>
                            <li>{t("sahBullet2")}</li>
                            <li>{t("sahBullet3")}</li>
                        </ul>
                    </div>

                    <p className="text-sm text-zinc-400 sm:text-base">
                        {t("earlierExperience")}
                    </p>
                </div>
            </AnimatedSection>
        );
    }

    function EducationSection() {
        const t = useTranslations("Resume.education");

        return (
            <AnimatedSection
                id="education"
                snapAlign="center"
                className="space-y-6"
            >
                <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    {t("heading")}
                </h2>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-base font-semibold text-zinc-50">
                                {t("fontysTitle")}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {t("fontysPeriod")}
                            </p>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                            {t("fontysSubtitle")}
                        </p>
                        <ul className="ml-5 mt-2 list-disc space-y-1.5 text-base text-zinc-200">
                            <li>{t("fontysBullet1")}</li>
                            <li>{t("fontysBullet2")}</li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-base font-semibold text-zinc-50">
                                {t("havoTitle")}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {t("havoPeriod")}
                            </p>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                            {t("havoSubtitle")}
                        </p>
                        <ul className="ml-5 mt-2 list-disc space-y-1.5 text-base text-zinc-200">
                            <li>{t("havoBullet1")}</li>
                        </ul>
                    </div>
                </div>
            </AnimatedSection>
        );
    }

    function ContactSection() {
        const t = useTranslations("Resume.contact");

        return (
            <AnimatedSection
                id="contact"
                className="flex min-h-[70vh] items-center rounded-3xl border border-white/10 bg-black/40 p-8 text-base text-zinc-200 backdrop-blur sm:p-12"
            >
                <div className="flex w-full flex-col justify-center gap-6">
                    <div className="max-w-L space-y-3">
                        <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                            {t("heading")}
                        </h2>
                        <p>{t("body1")}</p>
                        <p>{t("body2")}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <EmailLink
                            className="rounded-full bg-zinc-50 px-6 py-3 text-base font-semibold text-black shadow-sm transition hover:bg-white hover:shadow-lg active:scale-[0.98]">
                            {t("emailCta")}
                        </EmailLink>
                        <Link
                            href="https://www.linkedin.com/in/noah-overeem-2028231b5"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-zinc-100 shadow-sm transition hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
                        >
                            {t("linkedinLabel")}
                        </Link>
                        <Link
                            href="https://www.github.com/Novereem/"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-zinc-100 shadow-sm transition hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
                        >
                            {t("githubLabel")}
                        </Link>
                    </div>
                </div>
            </AnimatedSection>
        );
    }
}