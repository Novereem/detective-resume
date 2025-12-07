export type ProjectActionKey = "explore" | "github";

export type ProjectAction = {
    key: ProjectActionKey;
    href: string;
};

export type ProjectId =
    | "detective-resume"
    | "tabletop-tunes-2"
    | "lunarflow"
    | "sanquin";

export type Project = {
    id: ProjectId;
    period?: string;
    tech: string[];
    actions?: ProjectAction[];
    detailImage: string;
};

export const featuredProjects: Project[] = [
    {
        id: "detective-resume",
        period: "2025 Q3-4",
        tech: ["Next.js", "TypeScript", "React Three Fiber", "Three.js"],
        actions: [
            {
                key: "explore",
                href: "/detective-room",
            },
            {
                key: "github",
                href: "https://github.com/Novereem/detective-resume",
            },
        ],
        detailImage: "/resume-images/projects/detective-resume.jpg",
    },
    {
        id: "tabletop-tunes-2",
        period: "2024 Q3 - 2025 Q2",
        tech: [".NET 8 Web API", "TypeScript", "React", "MySQL", "Docker"],
        actions: [
            {
                key: "github",
                href: "https://github.com/Novereem/table-top-tunes2",
            },
        ],
        detailImage: "/resume-images/projects/tabletop-tunes-2.jpg",
    },
    {
        id: "lunarflow",
        period: "2025 Q1-2",
        tech: ["Figma", "Material Design 3", "Design systems"],
        detailImage: "/resume-images/projects/lunarflow.jpg",
    },
    {
        id: "sanquin",
        period: "2024 Q3-4",
        tech: ["React Native", "Figma", "Component-driven UI"],
        detailImage: "/resume-images/projects/sanquin.jpg",
    },
];
