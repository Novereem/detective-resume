import './globals.css'
import {Metadata} from "next";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
    title: 'My Portfolio',
    description: 'Welcome to my interactive portfolio',
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <Analytics/>
            <body className="antialiased">
                {children}
                <SpeedInsights />
            </body>
        </html>
    );
}