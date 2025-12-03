"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

type AnimatedSectionProps = {
    id: string;
    className?: string;
    children: ReactNode;
    snapAlign?: "start" | "center";
};

export default function AnimatedSection({
                                            id,
                                            className = "",
                                            children,
                                            snapAlign = "start",
                                        }: AnimatedSectionProps) {
    const ref = useRef<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(element); // animate once
                }
            },
            {
                threshold: 0.15,
                rootMargin: "-10% 0px -10% 0px",
            }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const snapClass = snapAlign === "center" ? "snap-center" : "snap-start";

    return (
        <section
            id={id}
            ref={ref}
            className={`relative py-4 ${snapClass} ${className}`}
        >
            <div
                className={`transition-all duration-700 ease-out will-change-[opacity,transform] ${
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                }`}
            >
                {children}
            </div>
        </section>
    );
}