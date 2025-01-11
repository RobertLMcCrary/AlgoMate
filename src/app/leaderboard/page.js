'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

function LeaderboardPage() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 50;

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch('/api/users');
            const data = await response.json();

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

    // Filter users based on search query
    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto py-16 px-4">
                <h1 className="text-4xl font-bold text-center mb-8">
                    Leaderboard
                </h1>

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500"
                    />
                </div>

                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="divide-y divide-gray-700">
                        {currentUsers.map((user, index) => {
                            const totalSolved =
                                user.problemsSolved.easy +
                                user.problemsSolved.medium +
                                user.problemsSolved.hard;
                            const globalRank =
                                users.findIndex(
                                    (u) => u.clerkId === user.clerkId
                                ) + 1;

                            return (
                                <div
                                    key={user.clerkId}
                                    className="p-6 hover:bg-gray-700 transition"
                                >
                                    <div className="flex items-center gap-6">
                                        <span
                                            className={`text-2xl font-bold ${
                                                globalRank === 1
                                                    ? 'text-yellow-400'
                                                    : globalRank === 2
                                                    ? 'text-gray-400'
                                                    : globalRank === 3
                                                    ? 'text-amber-700'
                                                    : ''
                                            }`}
                                        >
                                            #{globalRank}
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

                {/* Pagination Controls */}
                <div className="mt-6 flex justify-center gap-2">
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default LeaderboardPage;
