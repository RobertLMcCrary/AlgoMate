'use client';
import React from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

function Dashboard() {
    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            {/* Main Content */}
            <main className="flex-grow p-8">
                <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>

                {/* Stats Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard
                        title="Problems Solved"
                        value="0"
                        description="Keep pushing forward!"
                    />
                    <StatCard
                        title="Hints Used"
                        value="0"
                        description="Great job staying focused!"
                    />
                    <StatCard
                        title="AI Assistance"
                        value="0"
                        description="Let AI guide your journey."
                    />
                </section>

                {/* Feature Highlights */}
                <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-12">
                    <h3 className="text-2xl font-bold mb-4">
                        Unlock PseudoAI Pro
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Coming soon: Mock interview video calls, live
                        collaboration, and AI-powered insights.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/pro">
                            <span className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-500 transition">
                                Learn More
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Quick Access Section */}
                <section>
                    <h3 className="text-3xl font-bold mb-6">Quick Access</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <QuickAccessCard
                            title="Start Solving"
                            description="Dive into LeetCode problems."
                            href="/problems"
                        />
                        <QuickAccessCard
                            title="Track Progress"
                            description="See your performance over time."
                            href="/progress"
                        />
                        <QuickAccessCard
                            title="Upgrade to Pro"
                            description="Unlock exclusive features."
                            href="/pro"
                        />
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
