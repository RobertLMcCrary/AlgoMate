'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

function Dashboard() {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch(`/api/users/${id}`);
            const data = await response.json();
            setUserData(data);
        };
        fetchUserData();
    }, [id]);

    // Only calculate totalSolved if userData is available
    const totalSolved = userData
        ? (userData.problemsSolved?.easy || 0) +
          (userData.problemsSolved?.medium || 0) +
          (userData.problemsSolved?.hard || 0)
        : 0;

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <main className="flex-grow p-12">
                {/* Welcome Section */}
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
                    {/* Featured Problem Section */}
                    <section className="bg-gray-800 p-8 rounded-3xl shadow-xl w-full md:w-1/2 hover:bg-gray-700 transition">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-3xl font-bold text-gray-100">
                                Featured Problem: Two Sum
                            </h3>
                            <span className="bg-green-600 px-4 py-2 rounded-full text-sm">
                                Easy
                            </span>
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

                    {/* Stats & Progress Section */}
                    <section className="bg-gray-800 p-8 rounded-3xl text-center shadow-xl w-full md:w-1/2 hover:bg-gray-700 transition">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-4">
                            Total Problems Solved
                        </h1>
                        <p className="text-4xl md:text-5xl font-extrabold text-green-500 mb-2">
                            {totalSolved}
                        </p>
                        <p className="text-sm md:text-lg text-gray-300">
                            All problems solved, from Easy to Hard.
                        </p>
                    </section>
                </div>

                {/* Upcoming Features Section */}
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

                {/* Community Section */}
                <section className="bg-gray-800 p-8 rounded-3xl shadow-xl hover:bg-gray-700 transition">
                    <h3 className="text-3xl font-bold text-gray-100 mb-6">
                        Join Our Open-Source Community
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Contribute to the community, share your solutions, and
                        grow together with fellow developers.
                    </p>
                    <div className="flex justify-center gap-6">
                        <a
                            href="https://github.com/RobertLMcCrary/PseudoAI.git"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-500 transition text-xl"
                        >
                            Contribute
                        </a>
                        <Link href="/community">
                            <span className="text-blue-500 hover:underline text-xl">
                                Check out our Blog.
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
