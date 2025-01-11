'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

function Dashboard() {
    const { id } = useParams();
    const { user } = useUser();
    const [userData, setUserData] = useState(null);
    const [problemCount, setProblemCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                const userResponse = await fetch(`/api/users/${user.id}`);
                const userData = await userResponse.json();
                setUserData(userData);

                const countResponse = await fetch('/api/problems/count');
                const countData = await countResponse.json();
                setProblemCount(countData.count);
            }
        };

        fetchData();
    }, [user?.id]);

    const totalSolved = userData
        ? (userData.problemsSolved?.easy || 0) +
        (userData.problemsSolved?.medium || 0) +
        (userData.problemsSolved?.hard || 0)
        : 0;

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <main className="flex-grow p-12">
                <section className="text-center mb-12">
                    <h2 className="text-5xl font-extrabold text-white mb-4">
                        Welcome Back!
                    </h2>
                    <p className="text-lg text-gray-300 max-w-lg mx-auto">
                        Ready to solve some problems and take your skills to the
                        next level? We&apos;re here to help.
                    </p>
                </section>

                <div className="flex justify-between gap-8 mb-12">
                    <section className="bg-gray-800 p-8 rounded-3xl shadow-xl w-full md:w-1/2 hover:bg-gray-700 transition">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-3xl font-bold text-gray-100">
                                Featured Problem: Two Sum
                            </h3>
                            <div className="flex flex-col items-end">
                                <span className="bg-green-600 px-4 py-2 rounded-full text-sm">
                                    Easy
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-300 mb-6">
                            Given an array of integers `nums` and a target
                            integer `target`, return indices of the two numbers
                            that add up to target.
                        </p>
                        <Link href="/problems/two-sum">
                            <span className="text-green-400 hover:text-green-300 font-semibold text-xl">
                                Solve Now →
                            </span>
                        </Link>
                    </section>

                    <section className="bg-gray-800 p-8 rounded-3xl shadow-xl w-full md:w-1/2 hover:bg-gray-700 transition">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-3xl font-bold text-gray-100">
                                Your Progress
                            </h3>
                            <div className="flex flex-col items-end">
                                <span className="bg-purple-600 px-4 py-2 rounded-full text-sm">
                                    {totalSolved} Solved
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Easy</span>
                                <span className="text-green-400">
                                    {userData?.problemsSolved?.easy || 0} solved
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Medium</span>
                                <span className="text-yellow-400">
                                    {userData?.problemsSolved?.medium || 0}{' '}
                                    solved
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Hard</span>
                                <span className="text-red-400">
                                    {userData?.problemsSolved?.hard || 0} solved
                                </span>
                            </div>
                        </div>
                        <Link href="/problems" className="block mt-6">
                            <span className="text-purple-400 hover:text-purple-300 font-semibold text-xl">
                                View All Problems →
                            </span>
                        </Link>
                    </section>
                </div>

                {/* Connect with Users Section */}
                <section className="bg-gray-800 py-12 px-6 rounded-3xl shadow-lg text-center mb-16 hover:bg-gray-700 transition">
                    <h2 className="text-3xl font-bold mb-4">
                        Connect with Fellow Coders
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Explore profiles, track progress, and see how you rank
                        against other developers in our community.
                    </p>
                    <div className="flex justify-center gap-6">
                        <Link
                            href="/users"
                            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-500 transition"
                        >
                            Explore Users
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-500 transition"
                        >
                            View Leaderboard
                        </Link>
                    </div>
                </section>

                <section className="bg-gray-800 p-8 rounded-3xl shadow-xl mb-12 hover:bg-gray-700 transition">
                    <h3 className="text-3xl font-bold text-gray-100 mb-6">
                        Unlock PseudoAI Pro Features
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Get ready for mock interview video calls, live
                        collaboration, and AI-driven insights.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/pricing">
                            <span className="bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-500 transition text-xl">
                                Learn More
                            </span>
                        </Link>
                    </div>
                </section>

                <section className="bg-gray-800 p-8 rounded-3xl shadow-xl hover:bg-gray-700 transition">
                    <h3 className="text-3xl font-bold text-gray-100 mb-6">
                        Check Out Our Blog
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Learn about coding interview strategies, problem-solving
                        techniques, and stay updated with the latest tech
                        trends.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/community">
                            <span className="bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-500 transition text-xl">
                                Read Our Blog
                            </span>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}

function QuickAccessCard({ title, description, href }) {
    return (
        <Link href={href}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center hover:bg-gray-700 transition cursor-pointer">
                <h4 className="text-xl font-bold text-gray-100 mb-2">
                    {title}
                </h4>
                <p className="text-gray-400">{description}</p>
            </div>
        </Link>
    );
}

function StatCard({ title, value, description }) {
    return (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h4 className="text-xl font-bold mb-2">{title}</h4>
            <p className="text-4xl font-bold text-green-500 mb-2">{value}</p>
            <p className="text-gray-400">{description}</p>
        </div>
    );
}

export default Dashboard;
