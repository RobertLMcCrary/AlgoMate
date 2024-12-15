'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';

const ProgressPage = () => {
    const { user } = useUser();
    const [userProgress, setUserProgress] = useState({
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        solvedProblems: [],
    });
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUserProgress = async () => {
            if (user) {
                const response = await fetch(`/api/users/${user.id}`);
                const data = await response.json();

                setUserProgress({
                    totalSolved:
                        data.problemsSolved.easy +
                        data.problemsSolved.medium +
                        data.problemsSolved.hard,
                    easySolved: data.problemsSolved.easy,
                    mediumSolved: data.problemsSolved.medium,
                    hardSolved: data.problemsSolved.hard,
                    solvedProblems: data.solvedProblems,
                });
            }
        };

        const fetchAllUsers = async () => {
            const response = await fetch('/api/users');
            const data = await response.json();

            // Sort users by total problems solved
            const sortedUsers = data.sort((a, b) => {
                const totalA =
                    a.problemsSolved.easy +
                    a.problemsSolved.medium +
                    a.problemsSolved.hard;
                const totalB =
                    b.problemsSolved.easy +
                    b.problemsSolved.medium +
                    b.problemsSolved.hard;
                return totalB - totalA;
            });

            setAllUsers(sortedUsers);
        };

        fetchUserProgress();
        fetchAllUsers();
    }, [user]);

    const filteredUsers = allUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="items-center text-center">
                <main className="py-16 px-4 sm:px-8 md:px-16">
                    <h1 className="text-4xl font-bold text-center mb-8">
                        Your Progress
                    </h1>
                    <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">
                            Statistics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-bold">
                                    Total Problems Solved
                                </h3>
                                <p className="text-2xl">
                                    {userProgress.totalSolved}
                                </p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg text-green-400 font-bold">
                                    Easy Problems Solved
                                </h3>
                                <p className="text-2xl">
                                    {userProgress.easySolved}
                                </p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg text-yellow-400 font-bold">
                                    Medium Problems Solved
                                </h3>
                                <p className="text-2xl">
                                    {userProgress.mediumSolved}
                                </p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg text-red-400 font-bold">
                                    Hard Problems Solved
                                </h3>
                                <p className="text-2xl">
                                    {userProgress.hardSolved}
                                </p>
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold mt-6 mb-4">
                            Solved Problems
                        </h2>
                        <ul className="list-disc list-inside">
                            {userProgress.solvedProblems.length > 0 ? (
                                userProgress.solvedProblems.map(
                                    (problem, index) => (
                                        <li
                                            key={index}
                                            className="text-gray-300"
                                        >
                                            {problem.problemId} -{' '}
                                            {problem.difficulty}
                                        </li>
                                    )
                                )
                            ) : (
                                <li className="text-gray-300">
                                    No problems solved yet.
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Community Section */}
                    <div className="max-w-3xl mx-auto mt-12">
                        <h2 className="text-3xl font-bold mb-8">Leaderboard</h2>

                        {/* Search Bar */}
                        <div className="mb-8">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full max-w-md px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div className="grid gap-6">
                            {filteredUsers.map((user, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-800 p-6 rounded-lg shadow-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            {/* User Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                                                {user.imageUrl ? (
                                                    <Image
                                                        src={user.imageUrl}
                                                        alt={user.username}
                                                        width={48}
                                                        height={48}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                                                        {user.username[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-xl font-semibold">
                                                    {user.username}
                                                </h3>
                                                <p className="text-sm text-gray-400">
                                                    Rank #{index + 1}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                                            Total:{' '}
                                            {user.problemsSolved.easy +
                                                user.problemsSolved.medium +
                                                user.problemsSolved.hard}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-green-400">
                                            Easy: {user.problemsSolved.easy}
                                        </div>
                                        <div className="text-yellow-400">
                                            Medium: {user.problemsSolved.medium}
                                        </div>
                                        <div className="text-red-400">
                                            Hard: {user.problemsSolved.hard}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ProgressPage;
