import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
    title: "Detective Resume | Noah Overeem",
    description:
        "Choose between a quick CV overview or an immersive detective-room experience of Noah Overeem's resume.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <Analytics />
                {children}
                <SpeedInsights />
            </body>
        </html>
    );
}
