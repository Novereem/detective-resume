import type {Metadata} from "next";
import Link from "next/link";
import BackgroundFX from "@/components/ResumeWebsite/BackgroundFX";

export const metadata: Metadata = {
    title: "Detective Resume | Noah Overeem",
    description:
        "Choose between a quick CV overview or an immersive detective-room experience of Noah Overeem's resume.",
};

export default function Home() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-black text-zinc-100">
            <BackgroundFX/>

            <div
                className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                {/* Hero copy */}
                <header className="mb-10 space-y-4 text-center">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"/>
                        <span>Open to internships · graduating in 2026</span>
                    </p>

                    <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                        Noah{" "}
                        <span
                            className="bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Overeem
            </span>
                    </h1>

                    <p className="text-lg font-medium text-zinc-200 sm:text-xl">
                        Software engineer & UI/UX Designer
                    </p>

                    <p className="mx-auto max-w-2xl text-sm text-zinc-300 sm:text-base">
                        You can browse a fast, traditional resume or dive into an
                        interactive detective room that hides the same projects as a
                        playable experience.
                    </p>
                </header>

                {/* Choice cards */}
                <section className="grid w-full gap-6 md:grid-cols-2">
                    {/* Quick resume path */}
                    <div
                        className="group flex flex-col justify-between rounded-3xl border border-white/15 bg-white/[0.04] p-6 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur transition-transform duration-200 hover:-translate-y-1 hover:border-white/40 sm:p-7"
                    >
                        <div className="space-y-3">
                            <p className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                Recommended for recruiters in a hurry
                            </p>
                            <h2 className="text-xl font-semibold text-zinc-50">
                                Quick resume
                            </h2>
                            <p className="text-sm text-zinc-300">
                                A clean, scrollable CV with skills, featured projects and
                                experience. Optimised for skimming and sharing as a link or
                                PDF.
                            </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between text-sm font-semibold">
                            <div
                                className="mt-5 flex flex-col gap-2 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex gap-2">
                                    {/* EN resume */}
                                    <Link
                                        href="/en/resume"
                                        className="rounded-full bg-zinc-50 px-4 py-2 text-black transition hover:bg-white hover:shadow-md"
                                    >
                                        Open resume (EN)
                                    </Link>

                                    {/* NL resume */}
                                    <Link
                                        href="/nl/resume"
                                        className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-zinc-50 transition hover:border-white/30 hover:bg-white/10 active:scale-[0.98]"
                                    >
                                        Bekijk cv (NL)
                                    </Link>
                                </div>

                                <span className="text-xs text-zinc-400 group-hover:text-zinc-200">
                                    /resume
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Detective room path */}
                    <Link
                        href="/detective-room"
                        className="group flex flex-col justify-between rounded-3xl border border-white/15 bg-white/[0.03] p-6 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur transition-transform duration-200 hover:-translate-y-1 hover:border-violet-300/60 sm:p-7"
                    >
                        <div className="space-y-3">
                            <p className="inline-flex items-center rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-200">
                                For a more immersive experience
                            </p>
                            <h2 className="text-xl font-semibold text-zinc-50">
                                Detective experience
                            </h2>
                            <p className="text-sm text-zinc-300">
                                Explore a 3D detective room built with React Three Fiber.
                                Inspect objects, uncover puzzles and discover the same projects
                                through environmental storytelling.
                            </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between text-sm font-semibold">
                <span className="rounded-full bg-zinc-50 px-4 py-2 text-black transition group-hover:bg-white group-hover:shadow-md">
                    Enter detective room
                </span>
                <span className="text-xs text-zinc-400 group-hover:text-zinc-200">
                    /detective-room
                </span>
                        </div>
                    </Link>
                </section>

                <p className="mt-6 max-w-md text-center text-xs text-zinc-500">
                    Both paths show the same core information. Pick what fits your time
                    and curiosity best; you can always switch between them later.
                </p>
            </div>
        </main>
    );
}
