import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SectionNav from "@/app/resume/SectionNav";
import AnimatedSection from "@/app/resume/AnimatedSection";
import BackgroundFX from "@/app/resume/BackgroundFX";
import ProjectsSection from "@/app/resume/ProjectsSection";
import { featuredProjects } from "@/app/resume/projects-data";
import EmailLink from "@/app/resume/EmailLink";

export const metadata: Metadata = {
    title: "Resume | Noah Overeem",
    description:
        "Quick CV for Noah Overeem – software engineer with a UX mindset, specialising in web, backend and gamified experiences.",
};

const navSections: { id: string; label: string }[] = [
    { id: "top", label: "Top" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "contact", label: "Contact" },
];

export default function ResumePage() {
    return (
        <main className="relative h-screen overflow-y-auto snap-y snap-mandatory text-zinc-100"
              id="resume-scroll-container">
            <BackgroundFX/>

            <nav className="pointer-events-none fixed left-4 top-4 z-20">
                <Link
                    href="/"
                    className="rounded-full border border-white/15 bg-white/5 pointer-events-auto inline-flex items-center gap-2 text-zinc-100 px-4 py-2 text-xs font-medium backdrop-blur transition hover:border-white/30 hover:bg-white/10 active:scale-[0.98] sm:text-sm"
                >
                    <span className="text-base sm:text-lg">←</span>
                    <span className="hidden sm:inline">Back to home</span>
                    <span className="sm:hidden">Home</span>
                </Link>
            </nav>

            <SectionNav sections={navSections}/>

            <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-32 px-4 pb-40 pt-4 sm:px-6 lg:px-8">
                <HeroSection/>
                <SnapshotSection/>
                <SkillsSection/>
                <ProjectsSection projects={featuredProjects} />
                <ExperienceSection/>
                <EducationSection/>
                <ContactSection/>
            </div>
        </main>
    );
}

function HeroSection() {
    return (
        <AnimatedSection
            id="top"
            className="space-y-8 min-h-screen flex flex-col justify-center"
        >
            <div
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-base font-medium text-zinc-300 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"/>
                <span>Open to internships · graduating in 2026</span>
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
                    Software Engineer & UI/UX Designer.
                </p>
                <p className="max-w-2xl text-base text-zinc-300 sm:text-lg">
                    I design and build digital products end-to-end: from user flows and prototypes to
                    tested, deployed code. I enjoy combining strong engineering practices with clear,
                    memorable user experiences.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                    <Link
                        href="/noah-overeem-cv.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-zinc-50 px-6 py-3 text-base font-semibold text-black shadow-sm transition hover:bg-white hover:shadow-lg active:scale-[0.98]"
                    >
                        Download CV (PDF)
                    </Link>
                    <Link
                        href="#contact"
                        className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-zinc-100 transition hover:border-white/30 hover:bg-white/10 active:scale-[0.98]"
                    >
                        Contact me
                    </Link>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400 sm:text-base">
                        <EmailLink className="transition hover:text-zinc-100">
                            noovereem@gmail.com
                        </EmailLink>
                        <span className="hidden text-zinc-500 sm:inline">·</span>
                        <Link
                            href="https://www.linkedin.com/in/noah-overeem-2028231b5"
                            target="_blank"
                            rel="noreferrer"
                            className="transition hover:text-zinc-100"
                        >
                            LinkedIn
                        </Link>
                        <span className="hidden text-zinc-500 sm:inline">·</span>
                        <Link
                            href="https://www.github.com/Novereem/"
                            target="_blank"
                            rel="noreferrer"
                            className="transition hover:text-zinc-100"
                        >
                            GitHub
                        </Link>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
}

function SnapshotSection() {
    return (
        <AnimatedSection
            id="about"
            snapAlign={"center"}
            className="rounded-3xl border border-white/10 bg-black/40 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-10"
        >
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-4 sm:max-w-xl">
                    <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        About
                    </h2>
                    <p className="text-base text-zinc-200 sm:text-lg">
                        I&apos;m a curious software engineer who likes turning complex problems into simple,
                        usable experiences. I work across the stack, where I care most about how people
                        actually interact with the product, and quality maintainable software.
                    </p>
                    <p className="text-base text-zinc-200 sm:text-lg">
                        I&apos;ve led multiple big group projects with real stakeholders as the main bridge between
                        design, development
                        and stakeholders needs, and I enjoy making sure everyone knows what we&apos;re building
                        and why.
                    </p>
                    <p className="text-base text-zinc-300 sm:text-lg">
                        Currently studying{" "}
                        <span className="font-medium">
                            HBO ICT &amp; Software Engineering at Fontys University
                        </span>{" "}
                        (graduating in 2026).
                    </p>
                </div>

                <div
                    className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-200 sm:text-base">
                    {/* Portrait + name */}
                    <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/20 bg-black/40">
                            <Image
                                src="/resume-images/posed.jpg"
                                alt="Portrait of Noah Overeem"
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-1 w-30">
                            <p className="text-sm font-semibold text-zinc-100">
                                Noah Overeem
                            </p>
                            <p className="text-xs text-zinc-400">
                                Software engineer · UI/UX Designer
                            </p>
                        </div>
                    </div>

                    {/* Snapshot / focus areas */}
                    <div className="border-t border-white/10 pt-4 space-y-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                Snapshot
                            </p>
                            <p className="mt-1">
                                Web &amp; backend development, game-inspired experiences, UX-driven
                                thinking.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                Focus areas
                            </p>
                            <ul className="mt-1 space-y-1.5">
                                <li>Interactive portfolios and storytelling experiences</li>
                                <li>Practical web tools (calendars, dashboards, soundboards)</li>
                                <li>Gamification and engagement mechanics</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
}

function SkillsSection() {
    return (
        <AnimatedSection
            id="skills"
            snapAlign={"center"}
            className="space-y-6">
            <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Skills
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                    <h3 className="text-base font-semibold text-zinc-50">Technical</h3>
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
                        Collaboration, leadership, software &amp; UX
                    </h3>
                    <ul className="mt-4 space-y-2 ml-5 text-base text-zinc-200 list-disc">
                        <li>1.5 years of experience as a project lead on group projects with real stakeholders such as Sanquin and LunarFlow.</li>
                        <li>Comfortable translating stakeholder needs into concrete tasks.</li>
                        <li>Planning using SCRUM methods with user stories, sprints and clear scope trade-offs.</li>
                        <li>Facilitating discussions between design and development teammates.</li>
                        <li>Creating wireframes, user flows and interactive prototypes before building.</li>
                        <li>Acted as a holistic troubleshooter, resolving functional business issues while simultaneously navigating complex team dynamics and individual concerns with discretion and empathy.</li>
                    </ul>
                </div>
            </div>
        </AnimatedSection>
    );
}


function ExperienceSection() {
    return (
        <AnimatedSection
            id="experience"
            snapAlign={"center"}
            className="space-y-6">
            <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Experience
            </h2>

            <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-base font-semibold text-zinc-50">
                            Store employee · Aldi
                        </h3>
                        <p className="text-sm text-zinc-400">2023 – Nov 2025</p>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">Retail · part-time</p>
                    <ul className="mt-2 ml-5 list-disc space-y-1.5 text-base text-zinc-200">
                        <li>Customer service, checkout and stocking in a hectic, understaffed and busy retail environment.</li>
                        <li>Working efficiently under time pressure and helping colleagues where needed, and working alongside team leaders to manage and plan tasks.</li>
                        <li>Building resilience and clear communication with a wide range of customers.</li>
                    </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-base font-semibold text-zinc-50">
                            IT support specialist · Studentaanhuis
                        </h3>
                        <p className="text-sm text-zinc-400">2021 – 2023</p>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">On-site &amp; remote IT support</p>
                    <ul className="mt-2 ml-5 list-disc space-y-1.5 text-base text-zinc-200">
                        <li>Helped customers with hardware, software and network issues at home.</li>
                        <li>Explained technical problems and solutions in clear, non-technical language.</li>
                        <li>Managed appointments independently and took responsibility for outcomes.</li>
                    </ul>
                </div>

                <p className="text-sm text-zinc-400 sm:text-base">
                    Earlier retail experience at Albert Heijn and Blokker (2019–2020) building customer
                    contact and teamwork skills.
                </p>
            </div>
        </AnimatedSection>
    );
}

function EducationSection() {
    return (
        <AnimatedSection
            id="education"
            snapAlign={"center"}
            className="space-y-6">
            <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Education
            </h2>

            <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-base font-semibold text-zinc-50">
                            HBO ICT &amp; Software Engineering
                        </h3>
                        <p className="text-sm text-zinc-400">2020 – expected 2026</p>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                        Fontys University of Applied Sciences, Eindhoven
                    </p>
                    <ul className="mt-2 ml-5 list-disc space-y-1.5 text-base text-zinc-200">
                        <li>Specialised in software engineering with a strong UX and design focus.</li>
                        <li>
                            Built projects ranging from backend-heavy APIs to interactive web experiences and
                            gamified concepts.
                        </li>
                    </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-base font-semibold text-zinc-50">
                            Havo – NT + Technasium
                        </h3>
                        <p className="text-sm text-zinc-400">2014 – 2019</p>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                        Johannes Fontanus College, Barneveld
                    </p>
                    <ul className="mt-2 ml-5 list-disc space-y-1.5 text-base text-zinc-200">
                        <li>Science &amp; technology track with extra project-based, technical courses.</li>
                    </ul>
                </div>
            </div>
        </AnimatedSection>
    );
}

function ContactSection() {
    return (
        <AnimatedSection
            id="contact"
            className="min-h-[70vh] flex items-center rounded-3xl border border-white/10 bg-black/40 p-8 text-base text-zinc-200 backdrop-blur sm:p-12"
        >
            <div className="flex w-full flex-col gap-6 justify-center">
                <div className="space-y-3 max-w-L">
                    <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        Contact
                    </h2>
                    <p>
                        Interested in working together, offering a graduation internship or chatting
                        about any of these projects? The fastest way to reach me is by email.
                    </p>
                    <p>
                        I&apos;m especially interested in roles around junior software engineer,
                        full-stack developer or UX-minded engineer, while growing as a project lead and adaptable communicator.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <EmailLink className="rounded-full bg-zinc-50 px-6 py-3 text-base font-semibold text-black shadow-sm transition hover:bg-white hover:shadow-lg active:scale-[0.98]">
                        Email Noah
                    </EmailLink>
                    <Link
                        href="https://www.linkedin.com/in/noah-overeem-2028231b5"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-zinc-100 shadow-sm transition hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
                    >
                        LinkedIn
                    </Link>
                    <Link
                        href="https://www.github.com/Novereem/"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-zinc-100 shadow-sm transition hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
                    >
                        GitHub
                    </Link>
                </div>
            </div>
        </AnimatedSection>
    );
}
