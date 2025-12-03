import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SectionNav from "@/app/resume/SectionNav";
import AnimatedSection from "@/app/resume/AnimatedSection";
import BackgroundFX from "@/app/resume/BackgroundFX";
import ProjectsSection from "@/app/resume/ProjectsSection";

export const metadata: Metadata = {
    title: "Resume | Noah Overeem",
    description:
        "Quick CV for Noah Overeem – software engineer with a UX mindset, specialising in web, backend and gamified experiences.",
};

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

const featuredProjects: Project[] = [
    {
        id: "detective-resume",
        title: "Detective Resume",
        role: "Solo developer & UX designer",
        period: "2024 – 2025",
        tagline: "Interactive 3D resume website for recruiters and engineers.",
        tech: ["Next.js", "TypeScript", "React Three Fiber", "Three.js"],
        bullets: [
            "Designed a dual-path UX with a fast Quick CV and an optional immersive 3D detective room game.",
            "Implemented a low-poly detective room with custom models, outlines and performance controls.",
            "Defined and tested measurable acceptance rules around recruiter speed, findability and performance.",
        ],
        primaryLink: {
            label: "Explore detective room",
            href: "/detective-room",
        },
        secondaryLinks: [
            {
                label: "View GitHub",
                href: "https://github.com/Novereem/detective-resume",
            },
        ],
        detailCtaLabel: "View project details",
        detailImage: "/resume-images/projects/detective-resume.jpg",
        detailBody: [
            "The Detective Resume is an experimental 3D portfolio that lets recruiters either skim a fast CV path or explore a detective room with interactive puzzles.",
            "Each scene and object is built with React Three Fiber and custom shaders, while still keeping performance good enough for mid-range laptops.",
            "The concept was driven by clearly defined acceptance criteria around speed, findability of key information and technical stability.",
        ],
    },
    {
        id: "tabletop-tunes-2",
        title: "TableTopTunes 2",
        role: "Solo full-stack developer",
        period: "2025 – present",
        tagline: "Soundboard web app for tabletop RPGs and D&D sessions.",
        tech: [".NET 8 Web API", "TypeScript", "React / (new frontend)", "MySQL", "Docker"],
        bullets: [
            "Redesigned the architecture with a .NET 8 API and MySQL without an ORM for faster iteration.",
            "Implemented authentication, scene management and file handling with a high-coverage backend test suite.",
            "Dockerized the backend and focused on non-functional requirements such as hosting, scaling and failure handling.",
        ],
        primaryLink: {
            label: "View code",
            href: "https://github.com/Novereem/table-top-tunes2",
        },
        secondaryLinks: [
            {
                label: "",
                href: "#",
            },
        ],
        detailCtaLabel: "View project details",
        detailImage: "/resume-images/projects/tabletop-tunes-2.jpg",
        detailBody: [
            "TableTopTunes 2 is a reboot of my earlier soundboard for tabletop role-play, this time with a cleaner API-first architecture.",
            "The backend is a .NET 8 Web API with explicit SQL instead of an ORM, making it easier to iterate on the domain model during development.",
            "Focus areas include logging, error handling, deployment with Docker and thinking about how this would eventually be hosted on a small server.",
        ],
    },
    {
        id: "lunarflow",
        title: "LunarFlow – Eclipse marketing calendar",
        role: "UX designer & team lead",
        period: "2025",
        tagline: "Planning tool concept for Eclipse Foundation’s marketing team.",
        tech: ["Figma", "Material Design 3", "Design systems"],
        bullets: [
            "Led UX design for a planning tool that connects marketing campaigns with 400+ open-source projects.",
            "Mapped stakeholder workflows and pains around multi-tool planning (Slack, GitLab, spreadsheets).",
            "Designed list, weekly and monthly calendar views with improved filtering, hierarchy and readability.",
        ],
        primaryLink: {
            label: "View design case",
            href: "#",
        },
        detailCtaLabel: "View design case",
        detailImage: "/resume-images/projects/lunarflow.jpg",
        detailBody: [
            "LunarFlow explores how Eclipse Foundation’s marketing team could plan campaigns across many open-source projects in one place.",
            "I led workshops and interviews to understand how work was currently spread over Slack, GitLab and spreadsheets, and which information people were missing.",
            "The concept applies Material Design 3, with a focus on hierarchy, filtering and clarity in dense calendar views.",
        ],
    },
    {
        id: "sanquin",
        title: "Sanquin blood donation app",
        role: "Frontend lead & team lead",
        period: "2024",
        tagline: "Gamified concept to motivate blood donors to donate more often.",
        tech: ["React Native", "Figma", "Component-driven UI"],
        bullets: [
            "Led the group project and coordinated requirements with stakeholders around donor journeys and gamification.",
            "Implemented key React Native screens and reusable components for donor type flows, community and rewards.",
            "Focused on aligning UI flows with stakeholder feedback while keeping the codebase maintainable and demo-ready.",
        ],
        primaryLink: {
            label: "View project summary",
            href: "#",
        },
        detailCtaLabel: "View project summary",
        detailImage: "/resume-images/projects/sanquin.jpg",
        detailBody: [
            "This group project for Sanquin focused on making blood donation feel more engaging and less abstract through gamification.",
            "I acted as team lead and frontend lead, translating stakeholder input into concrete flows and React Native screens.",
            "The concept balances point systems, badges and community aspects with the seriousness of blood donation and the different donor motivations.",
        ],
    },
];

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
                <ProjectsSection projects={featuredProjects}/>
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
                        <Link
                            href="mailto:noovereem@gmail.com"
                            className="transition hover:text-zinc-100"
                        >
                            noovereem@gmail.com
                        </Link>
                        <span className="hidden text-zinc-500 sm:inline">·</span>
                        <Link
                            href="https://www.linkedin.com/in/noah-overeem-2028231b5"
                            className="transition hover:text-zinc-100"
                        >
                            LinkedIn
                        </Link>
                        <span className="hidden text-zinc-500 sm:inline">·</span>
                        <Link
                            href="https://www.github.com/Novereem/"
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
                        I&apos;ve led multiple big group projects with real stakeholders as the main bridge between design, development
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

                <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-200 sm:text-base">
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
                        <li>Experienced group project lead on Sanquin and LunarFlow.</li>
                        <li>
                            Comfortable translating stakeholder needs into concrete flows, screens and
                            tasks.
                        </li>
                        <li>Planning work with user stories, sprints and clear scope trade-offs.</li>
                        <li>Facilitating discussions between design and development teammates.</li>
                        <li>Creating wireframes, user flows and interactive prototypes before building.</li>
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
                        <li>Customer service, checkout and stocking in a hectic and busy retail environment.</li>
                        <li>Working efficiently under time pressure and helping colleagues where needed.</li>
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
                        full-stack developer or UX-minded engineer.
                    </p>
                </div>

                {/* Buttons row, same idea as in HeroSection */}
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="mailto:noovereem@gmail.com"
                        className="rounded-full bg-zinc-50 px-6 py-3 text-base font-semibold text-black shadow-sm transition hover:bg-white hover:shadow-lg active:scale-[0.98]"
                    >
                        Email Noah
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/noah-overeem-2028231b5"
                        className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-zinc-100 shadow-sm transition hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
                    >
                        LinkedIn
                    </Link>
                    <Link
                        href="https://www.github.com/Novereem/"
                        className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-zinc-100 shadow-sm transition hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
                    >
                        GitHub
                    </Link>
                </div>
            </div>
        </AnimatedSection>
    );
}
