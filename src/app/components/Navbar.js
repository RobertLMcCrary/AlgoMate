'use client';
import React from 'react';
import Link from 'next/link';
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
    UserProfile,
} from '@clerk/nextjs';

function Navbar() {
    return (
        <nav className="bg-gradient-to-r from-blue-500 to-purple-700 p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/">
                    <span className="text-2xl font-bold text-white hover:text-gray-200 transition">
                        PseudoAI
                    </span>
                </Link>

                {/* Navigation Links if signed in */}
                <SignedIn>
                    <div className="space-x-6 flex items-center">
                        <Link href="/">
                            <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                Dashboard
                            </span>
                        </Link>
                        <Link href="/problems">
                            <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                Problems
                            </span>
                        </Link>
                        <Link href="/pricing">
                            <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                Pricing
                            </span>
                        </Link>
                        <Link href="/contact">
                            <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                Contact
                            </span>
                        </Link>
                        <UserButton />
                    </div>
                </SignedIn>

                {/* Navigation Links if signed out */}
                <SignedOut>
                    <div className="space-x-6 flex items-center">
                        <Link href="/">
                            <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                Home
                            </span>
                        </Link>
                        <Link href="/about">
                            <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                About
                            </span>
                        </Link>
                        <Link href="/pricing">
                            <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                Pricing
                            </span>
                        </Link>
                        <Link href="/contact">
                            <span className="text-white text-lg font-medium hover:text-gray-300 transition">
                                Contact
                            </span>
                        </Link>
                        <SignInButton className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition">
                            Sign In
                        </SignInButton>
                    </div>
                </SignedOut>
            </div>
        </nav>
    );
}

export default Navbar;
