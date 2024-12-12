'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProgressPage = () => {
    const [userProgress, setUserProgress] = useState({
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        solvedProblems: [],
    });

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
                                            {problem.language}
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
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ProgressPage;
