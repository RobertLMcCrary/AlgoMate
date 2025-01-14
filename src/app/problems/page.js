'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useUser } from '@clerk/nextjs';

export default function ProblemsPage() {
    const [problems, setProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [showSolved, setShowSolved] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useUser();
    const [userSolvedProblems, setUserSolvedProblems] = useState([]);

    //fetching problems
    useEffect(() => {
        const fetchData = async () => {
            const problemsResponse = await fetch('/api/problems');
            const problemsData = await problemsResponse.json();
            setProblems(problemsData);
            setFilteredProblems(problemsData);

            if (user?.id) {
                const userResponse = await fetch(`/api/users/${user.id}`);
                const userData = await userResponse.json();
                setUserSolvedProblems(userData.solvedProblems || []);
            }
        };
        fetchData();
    }, [user?.id]);

    //fetching solved problems
    useEffect(() => {
        const fetchData = async () => {
            const problemsResponse = await fetch('/api/problems');
            const problemsData = await problemsResponse.json();
            setProblems(problemsData);
            setFilteredProblems(problemsData);

            if (user?.id) {
                const userResponse = await fetch(`/api/users/${user.id}`);
                const userData = await userResponse.json();
                setUserSolvedProblems(userData.solvedProblems || []);
            }
        };
        fetchData();
    }, [user?.id]);

    //limiting # of problems on each page
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 15;

    // Calculate pagination values
    const indexOfLastProblem = currentPage * problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
    const currentProblems = filteredProblems.slice(
        indexOfFirstProblem,
        indexOfLastProblem
    );
    const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

    const allTopics = [
        ...new Set(
            problems.flatMap((problem) =>
                typeof problem.topics === 'string'
                    ? problem.topics.split(', ')
                    : []
            )
        ),
    ].sort();

    const applyFilters = useCallback(() => {
        let result = [...problems];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (problem) =>
                    problem.title.toLowerCase().includes(query) ||
                    problem.topics.toLowerCase().includes(query)
            );
        }

        if (selectedTopic) {
            result = result.filter((problem) =>
                problem.topics.includes(selectedTopic)
            );
        }

        if (selectedDifficulty) {
            result = result.filter(
                (problem) => problem.difficulty === selectedDifficulty
            );
        }

        // Add solved filter
        if (showSolved === 'solved') {
            result = result.filter((problem) =>
                userSolvedProblems.some(
                    (solved) => solved.problemId === problem.id
                )
            );
        } else if (showSolved === 'unsolved') {
            result = result.filter(
                (problem) =>
                    !userSolvedProblems.some(
                        (solved) => solved.problemId === problem.id
                    )
            );
        }

        setFilteredProblems(result);
    }, [
        problems,
        searchQuery,
        selectedTopic,
        selectedDifficulty,
        showSolved,
        userSolvedProblems,
    ]);

    const resetFilters = () => {
        setSelectedTopic('');
        setSelectedDifficulty('');
        setSearchQuery('');
        setFilteredProblems(problems);
    };

    useEffect(() => {
        applyFilters();
    }, [selectedTopic, selectedDifficulty, searchQuery, applyFilters]);

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-white mb-8">Problems</h1>

                <div className="mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search problems by title or topic..."
                        className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
                    />
                </div>

                <div className="flex gap-4 mb-6">
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
                    >
                        <option value="All">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>

                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
                    >
                        <option value="">All Topics</option>
                        {allTopics.map((topic) => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>

                    <select
                        value={showSolved}
                        onChange={(e) => setShowSolved(e.target.value)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
                    >
                        <option value="all">All Problems</option>
                        <option value="solved">Solved</option>
                        <option value="unsolved">Unsolved</option>
                    </select>
                </div>

                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full text-white">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left">Title</th>
                                <th className="px-6 py-3 text-left">
                                    Difficulty
                                </th>
                                <th className="px-6 py-3 text-left">Topics</th>
                                <th className="px-6 py-3 text-left"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {currentProblems.map((problem) => (
                                <tr
                                    key={problem._id}
                                    className="hover:bg-gray-700 transition-colors"
                                >
                                    <td className="px-4 py-3 flex items-center gap-2">
                                        {userSolvedProblems.some(
                                            (solved) =>
                                                solved.problemId === problem.id
                                        ) && (
                                            <span className="text-green-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </span>
                                        )}
                                        {problem.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm ${
                                                problem.difficulty === 'Easy'
                                                    ? 'bg-green-600'
                                                    : problem.difficulty ===
                                                      'Medium'
                                                    ? 'bg-yellow-600'
                                                    : 'bg-red-600'
                                            }`}
                                        >
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
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

                    <div className="flex justify-between items-center mt-4 px-4 py-4 border-t border-gray-700">
                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600 transition"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>

                        <span className="text-gray-400">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600 transition"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
