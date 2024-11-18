'use client';
import { useState } from 'react';

export default function ProblemPage() {
    const [pseudoCode, setPseudoCode] = useState('');

    const handleGeneratePseudoCode = () => {
        // Simulated pseudocode generation
        setPseudoCode(
            `1. Create a hash map to store numbers and their indices.
        2. Iterate through the array:
            - For each number, calculate the complement (target - number).
            - If the complement exists in the hash map, return indices.
        3. Otherwise, add the number and its index to the hash map.`
        );
    };

    return (
        <div className="bg-gray-900 min-h-screen text-gray-200 flex">
            {/* Problem Section */}
            <div className="w-1/4 bg-gray-800 p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-purple-400">Two Sum</h2>
                <p className="mt-4">
                    Given an array of integers <code>nums</code> and an integer{' '}
                    <code>target</code>, return indices of the two numbers such
                    that they add up to <code>target</code>.
                </p>
                <h3 className="mt-6 text-lg font-semibold">Constraints:</h3>
                <ul className="list-disc list-inside mt-2">
                    <li>Each input would have exactly one solution.</li>
                    <li>You may not use the same element twice.</li>
                </ul>
                <h3 className="mt-6 text-lg font-semibold">Example:</h3>
                <pre className="bg-gray-700 p-4 rounded mt-2">
                    Input: nums = [2, 7, 11, 15], target = 9 Output: [0, 1]
                </pre>
            </div>

            {/* Code Editor Section */}
            <div className="w-1/2 bg-gray-800 p-6">
                <h2 className="text-xl font-bold text-purple-400">
                    Code Editor
                </h2>
                <textarea
                    className="w-full h-96 bg-gray-900 text-gray-200 p-4 rounded-lg border border-gray-700 resize-none"
                    placeholder="Write your code here..."
                ></textarea>
                <button className="mt-4 bg-purple-700 text-white px-6 py-2 rounded shadow hover:bg-purple-600 transition">
                    Run Code
                </button>
            </div>

            {/* AI Chat Section */}
            <div className="w-1/4 bg-gray-800 p-6 flex flex-col">
                <h2 className="text-xl font-bold text-purple-400">
                    AI Assistant
                </h2>
                <div className="flex-grow mt-4 overflow-y-auto bg-gray-900 p-4 rounded border border-gray-700">
                    {pseudoCode ? (
                        <pre className="text-gray-300">{pseudoCode}</pre>
                    ) : (
                        <p className="text-gray-400">
                            Ask for hints or pseudocode here.
                        </p>
                    )}
                </div>
                <button
                    onClick={handleGeneratePseudoCode}
                    className="mt-4 bg-purple-700 text-white px-6 py-2 rounded shadow hover:bg-purple-600 transition"
                >
                    Generate Pseudo Code
                </button>
            </div>
        </div>
    );
}
