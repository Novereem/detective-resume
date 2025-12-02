import './globals.css'
import {Metadata} from "next";

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
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}