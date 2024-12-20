'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

function UsersPage() {
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch('/api/users');
            const data = await response.json();
            setAllUsers(data);
        };

        fetchUsers();
    }, []);

    const filteredUsers = allUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto py-16 px-4 sm:px-8 md:px-16">
                <h1 className="text-4xl font-bold text-center mb-8">Users</h1>

                {/* Search Bar */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* Users List */}
                <div className="grid gap-6">
                    {filteredUsers.map((user) => (
                        <Link
                            key={user.clerkId}
                            href={`/users/${user.clerkId}`}
                        >
                            <div className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                                        {user.imageUrl ? (
                                            <Image
                                                src={user.imageUrl}
                                                alt={user.username}
                                                width={20}
                                                height={20}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            user.username[0].toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {user.username}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {`Total Solved: ${
                                                user.problemsSolved.easy +
                                                user.problemsSolved.medium +
                                                user.problemsSolved.hard
                                            }`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UsersPage;
