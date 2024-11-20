'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import problems from '../../data/problems.json' // Import the JSON file
import { useEffect } from 'react';
import Footer from '../components/Footer';

export default function ProblemsPage() {

    return (
        <div className="bg-gray-900 h-[100vh] text-gray-200">
            {/* Header */}
            <Navbar />

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <div className="flex flex-wrap items-center gap-4">
                    <select className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-200">
                        <option value="">All Topics</option>
                        <option value="Arrays">Arrays</option>
                        <option value="Hashing">Hashing</option>
                        <option value="Two Pointers">Two Pointers</option>
                        <option value="String">String</option>
                    </select>
                    <select className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-200">
                        <option value="">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                    <button className="bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-600 transition">
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Problems List */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-purple-700 text-white">
                            <tr>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Difficulty</th>
                                <th className="px-4 py-3">Topic</th>
                                <th className="px-4 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map((problem) => (
                                <tr
                                    key={problem.id}
                                    className="border-b border-gray-700 hover:bg-gray-700"
                                >
                                    <td className="px-4 py-3">
                                        {problem.title}
                                    </td>
                                    <td
                                        className={`px-4 py-3 ${
                                            problem.difficulty === 'Easy'
                                                ? 'text-green-400'
                                                : problem.difficulty ===
                                                  'Medium'
                                                ? 'text-yellow-400'
                                                : 'text-red-400'
                                        }`}
                                    >
                                        {problem.difficulty}
                                    </td>
                                    <td className="px-4 py-3">
                                        {problem.topics}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/problems/${problem.id}`}
                                            className="text-purple-400 hover:underline"
                                        >
                                            View Problem
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
