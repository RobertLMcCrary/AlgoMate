'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

function UsersPage() {
    const { user } = useUser();
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/users');
            const data = await response.json();
            setAllUsers(data);

            // Auto-select current user's profile
            if (user?.id) {
                handleUserSelect(user.id);
            }
        };

        fetchData();
    }, [user?.id]);

    const handleUserSelect = async (userId) => {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();

        //update rank
        await fetch(`/api/users/${userId}`, { method: 'PUT' });

        // Fetch problem titles for each solved problem
        const solvedProblemsWithTitles = await Promise.all(
            userData.solvedProblems.map(async (problem) => {
                const problemResponse = await fetch(
                    `/api/problems/${problem.problemId}`
                );
                const problemData = await problemResponse.json();
                return {
                    ...problem,
                    title: problemData.title,
                };
            })
        );

        setSelectedUser({
            ...userData,
            solvedProblems: solvedProblemsWithTitles,
        });
    };

    const filteredUsers = allUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="flex h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <div className="w-80 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="space-y-2">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.clerkId}
                                onClick={() => handleUserSelect(user.clerkId)}
                                className={`p-3 rounded-lg cursor-pointer transition ${
                                    selectedUser?.clerkId === user.clerkId
                                        ? 'bg-purple-600'
                                        : 'hover:bg-gray-700'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg font-bold">
                                        {user.imageUrl ? (
                                            <Image
                                                src={user.imageUrl}
                                                alt={user.username}
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            user.username[0].toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            {user.username}
                                        </h3>
                                        <h3 className="font-semibold">
                                            {user.rank}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {`${
                                                user.problemsSolved.easy +
                                                user.problemsSolved.medium +
                                                user.problemsSolved.hard
                                            } problems solved`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {selectedUser ? (
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center mb-4">
                                    {selectedUser.imageUrl ? (
                                        <Image
                                            src={selectedUser.imageUrl}
                                            alt={selectedUser.username}
                                            width={96}
                                            height={96}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold">
                                            {selectedUser.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-4xl font-bold">
                                    {selectedUser.username}
                                </h1>
                                <h1 className="text-4xl font-bold">
                                    {selectedUser.rank}
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-800 p-6 rounded-lg">
                                    <h3 className="text-lg font-bold">
                                        Total Problems Solved
                                    </h3>
                                    <p className="text-2xl">
                                        {selectedUser.problemsSolved.easy +
                                            selectedUser.problemsSolved.medium +
                                            selectedUser.problemsSolved.hard}
                                    </p>
                                </div>
                                <div className="bg-gray-800 p-6 rounded-lg">
                                    <h3 className="text-lg text-green-400 font-bold">
                                        Easy Problems Solved
                                    </h3>
                                    <p className="text-2xl">
                                        {selectedUser.problemsSolved.easy}
                                    </p>
                                </div>
                                <div className="bg-gray-800 p-6 rounded-lg">
                                    <h3 className="text-lg text-yellow-400 font-bold">
                                        Medium Problems Solved
                                    </h3>
                                    <p className="text-2xl">
                                        {selectedUser.problemsSolved.medium}
                                    </p>
                                </div>
                                <div className="bg-gray-800 p-6 rounded-lg">
                                    <h3 className="text-lg text-red-400 font-bold">
                                        Hard Problems Solved
                                    </h3>
                                    <p className="text-2xl">
                                        {selectedUser.problemsSolved.hard}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-2xl font-bold mb-4">
                                    Solved Problems
                                </h2>
                                <div className="bg-gray-800 rounded-lg overflow-hidden">
                                    {selectedUser.solvedProblems?.length > 0 ? (
                                        <div className="divide-y divide-gray-700">
                                            {selectedUser.solvedProblems.map(
                                                (problem, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-4 hover:bg-gray-700 transition"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Link
                                                                    href={`/problems/${problem.problemId}`}
                                                                >
                                                                    <span className="text-lg font-medium text-blue-400 hover:text-blue-300">
                                                                        {
                                                                            problem.title
                                                                        }
                                                                    </span>
                                                                </Link>
                                                                <p className="text-sm text-gray-400">
                                                                    Solved on{' '}
                                                                    {new Date(
                                                                        problem.solvedAt
                                                                    ).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-sm ${
                                                                    problem.difficulty ===
                                                                    'Easy'
                                                                        ? 'bg-green-600'
                                                                        : problem.difficulty ===
                                                                          'Medium'
                                                                        ? 'bg-yellow-600'
                                                                        : 'bg-red-600'
                                                                }`}
                                                            >
                                                                {
                                                                    problem.difficulty
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-400">
                                            No problems solved yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <p className="text-xl">
                                Select a user to view their stats
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UsersPage;
