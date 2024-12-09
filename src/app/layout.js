import localFont from 'next/font/local';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

//clerk
import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs';

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900',
});

const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900',
});

export const metadata = {
    title: 'PseudoAI',
    description: 'Your AI Powered Interview Prep Tool',
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body
                    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                >
                    {children}
                    <Analytics />
                    <script
                        src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"
                        async
                    ></script>
                </body>
            </html>
        </ClerkProvider>
    );
}
