"use client";

import React from "react";

type EmailLinkProps = {
    children?: React.ReactNode;
    className?: string;
    email?: string;
};

const DEFAULT_EMAIL = "noovereem@gmail.com";

export default function EmailLink({
                                      children,
                                      className,
                                      email = DEFAULT_EMAIL,
                                  }: EmailLinkProps) {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (
            event.button !== 0 ||
            event.metaKey ||
            event.altKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.defaultPrevented
        ) {
            return;
        }

        event.preventDefault();
        window.open(`mailto:${email}`, "_blank");
    };

    return (
        <a
            href={`mailto:${email}`}
            onClick={handleClick}
            className={className}
        >
            {children ?? email}
        </a>
    );
}
