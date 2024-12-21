'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

function LeaderboardPage() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
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

            setUsers(sortedUsers);
        };

        fetchUsers();
    }, []);

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto py-16 px-4">
                <h1 className="text-4xl font-bold text-center mb-8">
                    Leaderboard
                </h1>

                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="divide-y divide-gray-700">
                        {users.map((user, index) => {
                            const totalSolved =
                                user.problemsSolved.easy +
                                user.problemsSolved.medium +
                                user.problemsSolved.hard;

                            return (
                                <div
                                    key={user.clerkId}
                                    className="p-6 hover:bg-gray-700 transition"
                                >
                                    <div className="flex items-center gap-6">
                                        <span
                                            className={`text-2xl font-bold ${
                                                index === 0
                                                    ? 'text-yellow-400'
                                                    : index === 1
                                            }`}
                                        >
                                            #{index + 1}
                                        </span>

                                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                                            {user.imageUrl ? (
                                                <Image
                                                    src={user.imageUrl}
                                                    alt={user.username}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                user.username[0].toUpperCase()
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold">
                                                {user.username}
                                            </h3>

                                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                                <span className="text-green-400">
                                                    Easy:{' '}
                                                    {user.problemsSolved.easy}
                                                </span>
                                                <span className="text-yellow-400">
                                                    Medium:{' '}
                                                    {user.problemsSolved.medium}
                                                </span>
                                                <span className="text-red-400">
                                                    Hard:{' '}
                                                    {user.problemsSolved.hard}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold">
                                                {totalSolved}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                problems solved
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default LeaderboardPage;
