'use client';
import React from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

function Dashboard() {
    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <main className="flex-grow p-8">
                <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>

                {/* Featured Problem of the Day */}
                <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold">Solve Your First Problem</h3>
                        <span className="bg-green-600 px-3 py-1 rounded-full text-sm">Easy</span>
                    </div>
                    <p className="text-gray-300 mb-4">
                        Two Sum: Given an array of integers nums and an integer target, return indices of the two numbers...
                    </p>
                    <Link href="/problems/two-sum">
                        <span className="text-green-400 hover:text-green-300 font-semibold">
                            Solve Now →
                        </span>
                    </Link>
                </section>

                {/* Feature Highlights */}
                <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                    <h3 className="text-2xl font-bold mb-4">
                        Unlock PseudoAI Pro
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Coming soon: Mock interview video calls, live
                        collaboration, and AI-powered insights.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/pricing">
                            <span className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-500 transition">
                                Learn More
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Learning Paths */}
                <section className="mb-8">
                    <h3 className="text-3xl font-bold mb-6">Learning Paths</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h4 className="text-xl font-bold mb-3">Arrays & Strings</h4>
                            <div className="bg-gray-700 w-full h-2 rounded-full mb-3">
                                <div className="bg-green-500 w-1/3 h-2 rounded-full"></div>
                            </div>
                            <Link href="/path/arrays">
                                <span className="text-green-400 hover:text-green-300">Continue Learning →</span>
                            </Link>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h4 className="text-xl font-bold mb-3">Dynamic Programming</h4>
                            <div className="bg-gray-700 w-full h-2 rounded-full mb-3">
                                <div className="bg-green-500 w-1/4 h-2 rounded-full"></div>
                            </div>
                            <Link href="/path/dp">
                                <span className="text-green-400 hover:text-green-300">Start Learning →</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Quick Access Section */}
                <section>
                    <h3 className="text-3xl font-bold mb-6">Quick Access</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <QuickAccessCard
                            title="Practice Problems"
                            description="Browse our collection of coding challenges."
                            href="/problems"
                        />
                        <QuickAccessCard
                            title="Interview Prep"
                            description="Get ready for technical interviews."
                            href="/interview-prep"
                        />
                        <QuickAccessCard
                            title="Learning Resources"
                            description="Access tutorials and guides."
                            href="/resources"
                        />
                    </div>
                </section>

                {/* Community Section */}
                <section className="mt-8">
                    <h3 className="text-3xl font-bold mb-6">Community Updates</h3>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-bold">Join Our Discord</h4>
                            <span className="bg-indigo-600 px-3 py-1 rounded-full text-sm">New</span>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Connect with fellow developers, share solutions, and get help from the community.
                        </p>
                        <a
                            href="https://discord.gg/yourlink"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-500 transition"
                        >
                            Join Community
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
}

function StatCard({ title, value, description }) {
    return (
        <div className="bg-gray-800 p-6 rounded-lg text-center shadow-lg">
            <h4 className="text-xl font-bold mb-2">{title}</h4>
            <p className="text-4xl font-bold text-green-500 mb-2">{value}</p>
            <p className="text-gray-400">{description}</p>
        </div>
    );
}

function QuickAccessCard({ title, description, href }) {
    return (
        <Link href={href}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center hover:bg-gray-700 transition cursor-pointer">
                <h4 className="text-xl font-bold mb-2">{title}</h4>
                <p className="text-gray-400">{description}</p>
            </div>
        </Link>
    );
}

export default Dashboard;
