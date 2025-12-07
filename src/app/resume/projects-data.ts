export type ProjectAction = {
    label: string;
    href: string;
};

export type Project = {
    id: string;
    title: string;
    role: string;
    period?: string;
    tagline: string;
    tech: string[];
    bullets: string[];
    /**
     * Grey text links next to the main "View project details" button
     * and also shown inside the project details overlay.
     */
    actions?: ProjectAction[];
    detailImage: string;
    detailBody: string[];
};

export const featuredProjects: Project[] = [
    {
        id: "detective-resume",
        title: "Detective Resume",
        role: "Solo developer & UX designer",
        period: "2025 Q3-4",
        tagline: "Interactive 3D resume website for recruiters and engineers.",
        tech: ["Next.js", "TypeScript", "React Three Fiber", "Three.js"],
        bullets: [
            "Designed a dual-path UX with a fast Quick CV and an optional immersive 3D detective room game.",
            "Implemented a low-poly detective room with custom engine, custom model renderer, and performance controls.",
            "Defined and tested measurable acceptance rules around recruiter speed, findability and performance.",
        ],
        actions: [
            {
                label: "Explore detective room",
                href: "/detective-room",
            },
            {
                label: "View GitHub",
                href: "https://github.com/Novereem/detective-resume",
            },
        ],
        detailImage: "/resume-images/projects/detective-resume.jpg",
        detailBody: [
            "The Detective Resume is an experimental 3D portfolio that lets recruiters either experience a fast CV path or explore a detective room with interactive puzzles.",
            "The concept started with the question: How different are a recruiter and a detective really? So in this experience the recruiter is put the shoes of a detective.",
            "The engine uses React Three Fiber as a base layer, adding in a custom modeling renderer, custom shaders and built in performance settings for the highest performance, even on slower office laptops.",
            "The concept was driven by clearly defined acceptance criteria around speed, findability of key information and technical stability.",
        ],
    },
    {
        id: "tabletop-tunes-2",
        title: "TableTopTunes 2",
        role: "Solo full-stack developer",
        period: "2024 Q3 - 2025 Q2",
        tagline: "Soundboard web app for tabletop RPGs and D&D sessions.",
        tech: [".NET 8 Web API", "TypeScript", "React", "MySQL", "Docker"],
        bullets: [
            "Redesigned the architecture with a .NET 8 API and MySQL without an ORM for faster iteration.",
            "Implemented authentication, scene management and file handling with a high-coverage backend test suite.",
            "Dockerized the backend and focused on non-functional requirements such as hosting, scaling and failure handling.",
        ],
        actions: [
            {
                label: "View GitHub",
                href: "https://github.com/Novereem/table-top-tunes2",
            },
        ],
        detailImage: "/resume-images/projects/tabletop-tunes-2.jpg",
        detailBody: [
            "TableTopTunes 2 is a reboot of my earlier soundboard version for tabletop role-play, this time with a cleaner API-first architecture.",
            "The concept started out from using already available tabletop role-play sound programs, which were priced highly on a monthly basis.",
            "This application allows the user to manage a custom soundboard with multiple scenes by uploading their own audio with fast speeds and high security.",
            "The backend is a .NET 8 Web API with explicit SQL instead of an ORM, making it easier to iterate on the domain model during development.",
            "Focus areas include logging, explicit but flexible error handling, clear SOC, and robust testing before deployment using Docker.",
        ],
    },
    {
        id: "lunarflow",
        title: "LunarFlow – Eclipse marketing calendar",
        role: "UX designer & team lead",
        period: "2025 Q1-2",
        tagline: "Planning tool concept for Eclipse Foundation’s marketing team.",
        tech: ["Figma", "Material Design 3", "Design systems"],
        bullets: [
            "Led UX design for a planning tool that connects marketing campaigns with 400+ open-source projects.",
            "Mapped stakeholder workflows and pains around multi-tool planning (Slack, GitLab, spreadsheets).",
            "Designed list, weekly and monthly calendar views with improved filtering, hierarchy and readability.",
        ],
        // No actions yet: only a "View project details" main button and static writeup.
        detailImage: "/resume-images/projects/lunarflow.jpg",
        detailBody: [
            "LunarFlow explores how Eclipse Foundation’s marketing team could plan campaigns across many open-source projects in one place.",
            "With over 400 open-source projects to market, spreadsheets and Slack didn't allow for clear communication with those projects and their teams.",
            "I led interviews and dug into their work flow to understand how work was currently spread over Slack, GitLab and spreadsheets, and which information people were missing.",
            "The concept applies Material Design 3, with a focus on hierarchy, filtering and clarity in dense calendar views.",
        ],
    },
    {
        id: "sanquin",
        title: "Sanquin blood donation app",
        role: "Frontend lead & team lead",
        period: "2024 Q3-4",
        tagline: "Gamified concept to motivate blood donors to donate more often.",
        tech: ["React Native", "Figma", "Component-driven UI"],
        bullets: [
            "Led the group project and coordinated requirements with stakeholders around donor journeys and gamification.",
            "Implemented key React Native screens and reusable components for donor type flows, community and rewards.",
            "Focused on aligning UI flows with stakeholder feedback while keeping the codebase maintainable and demo-ready.",
        ],
        // Also no external actions yet.
        detailImage: "/resume-images/projects/sanquin.jpg",
        detailBody: [
            "This group project for Sanquin focused on making blood donation feel more engaging and less abstract through ethical gamification and social encouragement.",
            "The concept balances point systems, badges and community aspects like making appointments with friends with the seriousness of blood donation and the different donor motivations.",
            "I acted as team lead and frontend lead, working together with designer teammates to create highly flexible UI components using React Native.",
            "These highly flexible UI components allowed for quick and easy adjustments with ever changing designs, allowing for quick iterations",
        ],
    },
];
