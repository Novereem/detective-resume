import type { Metadata } from "next";
import ResumePageClient from "./ResumePageClient";

export const metadata: Metadata = {
    title: "Resume | Noah Overeem",
    description:
        "Quick CV for Noah Overeem – software engineer with a UX mindset, specialising in web, backend and gamified experiences.",
};

export default function ResumePage() {
    return <ResumePageClient />;
}
