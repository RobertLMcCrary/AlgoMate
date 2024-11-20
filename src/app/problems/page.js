'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import problems from '../../data/problems.json';
import { useEffect, useState, useCallback } from 'react';
import Footer from '../components/Footer';

export default function ProblemsPage() {
    const [filteredProblems, setFilteredProblems] = useState(problems);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const allTopics = [...new Set(problems.flatMap(problem =>
        problem.topics.split(', ')
    ))].sort();

    // Apply filters and search
    const applyFilters = useCallback(() => {
        let result = [...problems];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(problem =>
                problem.title.toLowerCase().includes(query) ||
                problem.topics.toLowerCase().includes(query)
            );
        }

        if (selectedTopic) {
            result = result.filter(problem =>
                problem.topics.includes(selectedTopic)
            );
        }

        if (selectedDifficulty) {
            result = result.filter(problem =>
                problem.difficulty === selectedDifficulty
            );
        }

        setFilteredProblems(result);
    }, [searchQuery, selectedTopic, selectedDifficulty])

    // Reset all filters and search
    const resetFilters = () => {
        setSelectedTopic('');
        setSelectedDifficulty('');
        setSearchQuery('');
        setFilteredProblems(problems);
    };

    useEffect(() => {
        applyFilters();
    }, [selectedTopic, selectedDifficulty, searchQuery, applyFilters])

    return (
        <div className="bg-gray-900 min-h-screen text-gray-200">
            <Navbar />

            {/* Search and Filters Section */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search problems by title or topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-purple-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <select 
                        className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-200"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                    >
                        <option value="">All Topics</option>
                        {allTopics.map(topic => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>

                    <select 
                        className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-200"
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                    >
                        <option value="">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>

                    <button 
                        onClick={resetFilters}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition"
                    >
                        Reset Filters
                    </button>

                    <span className="ml-auto text-gray-400">
                        Showing {filteredProblems.length} of {problems.length} problems
                    </span>
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
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProblems.length > 0 ? (
                                filteredProblems.map((problem) => (
                                    <tr
                                        key={problem.id}
                                        className="border-b border-gray-700 hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">
                                            {problem.title}
                                        </td>
                                        <td className={`px-4 py-3 ${
                                            problem.difficulty === 'Easy'
                                                ? 'text-green-400'
                                                : problem.difficulty === 'Medium'
                                                ? 'text-yellow-400'
                                                : 'text-red-400'
                                        }`}>
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                                        No problems found matching the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}