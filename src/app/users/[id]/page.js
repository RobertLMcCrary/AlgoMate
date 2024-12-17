'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

const UserProfilePage = () => {
    const { id } = useParams(); // Extract user ID from URL
    const [userData, setUserData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch(`/api/users/${id}`);
            const data = await response.json();
            setUserData(data);
        };

        if (id) {
            fetchUserData();
        }
    }, [id]);

    if (!userData) {
        return (
            <div className="text-white text-center mt-16">
                <p>Loading...</p>
            </div>
        );
    }

    const totalSolved =
        userData.problemsSolved.easy +
        userData.problemsSolved.medium +
        userData.problemsSolved.hard;

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto py-16 px-4 sm:px-8 md:px-16">
                <Link
                    href="/users"
                    className="flex items-center mb-8 text-purple-500 hover:text-purple-400 transition"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 mr-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                    </svg>
                    Back to Users
                </Link>

                {/* User Profile Info */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold">
                        {userData.username}&apos;s Profile
                    </h1>
                    <div className="flex items-center justify-center mt-6">
                        {userData.imageUrl ? (
                            <Image
                                src={userData.imageUrl}
                                alt={userData.username}
                                width={96}
                                height={96}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold">
                                {userData.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* User Statistics */}
                <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg font-bold">
                                Total Problems Solved
                            </h3>
                            <p className="text-2xl">{totalSolved}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg text-green-400 font-bold">
                                Easy Problems Solved
                            </h3>
                            <p className="text-2xl">
                                {userData.problemsSolved.easy}
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg text-yellow-400 font-bold">
                                Medium Problems Solved
                            </h3>
                            <p className="text-2xl">
                                {userData.problemsSolved.medium}
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg text-red-400 font-bold">
                                Hard Problems Solved
                            </h3>
                            <p className="text-2xl">
                                {userData.problemsSolved.hard}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
