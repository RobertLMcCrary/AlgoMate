import Link from 'next/link';
import Navbar from '../components/Navbar';

const problems = [
    {
        id: 1,
        title: 'Two Sum',
        difficulty: 'Easy',
        topic: 'Arrays',
    },
    {
        id: 2,
        title: 'Binary Tree Inorder Traversal',
        difficulty: 'Medium',
        topic: 'Trees',
    },
    {
        id: 3,
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Hard',
        topic: 'Strings',
    },
];

export default function ProblemsPage() {
    return (
        <div className="bg-gray-900 min-h-screen py-8 text-gray-200">
            {/* Header */}
            <Navbar />

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto px-4n mt-8">
                <div className="flex flex-wrap items-center gap-4">
                    <select className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-200">
                        <option value="">All Topics</option>
                        <option value="Arrays">Arrays</option>
                        <option value="Trees">Trees</option>
                        <option value="Strings">Strings</option>
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
                                        {problem.topic}
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
