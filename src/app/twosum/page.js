'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from 'codemirror';

export default function ProblemPage() {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUserInput = async (e) => {
        e.preventDefault();
        if (userInput.trim()) {
            const newMessage = { role: 'user', content: userInput };
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);
            setUserInput('');
            setLoading(true);

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ messages: updatedMessages }),
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                if (data && data.output) {
                    setResponse(data.output);
                } else {
                    throw new Error('Received an empty or invalid response');
                }
            } catch (error) {
                console.error('Error:', error);
                setResponse('Something went wrong. Please try again.');
            }

            setLoading(false);
        }
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
            <div className="w-[50vw] bg-gray-800 p-6 h-[100vh]">
                <h2 className="text-xl font-bold text-purple-400">
                    Code Editor
                </h2>
                <textarea
                    className="w-full h-[50vh] bg-gray-900 text-gray-200 p-4 rounded-lg border border-gray-700 resize-none"
                    placeholder="Write your code here..."
                ></textarea>
                <button className="mt-4 bg-purple-700 text-white px-6 py-2 rounded shadow hover:bg-purple-600 transition">
                    Run Code
                </button>
            </div>

            {/* AI Chat Section */}
            <div className="w-1/4 bg-gray-800 p-6 flex flex-col h-[100vh]">
                <h2 className="text-xl font-bold text-purple-400">
                    AI Assistant
                </h2>
                <div className="flex-grow mt-4 overflow-y-auto bg-gray-900 p-4 rounded border border-gray-700 break-words whitespace-pre-wrap">
                    {response ? (
                        <pre className="text-gray-300">{response}</pre>
                    ) : (
                        <p className="text-gray-400">
                            Ask for hints or pseudocode here.
                        </p>
                    )}
                </div>
                <form onSubmit={handleUserInput} className="mt-4">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="w-full p-2 rounded border border-gray-700 text-gray-200 bg-gray-800"
                        placeholder="Ask something..."
                    />
                    <button
                        type="submit"
                        className="mt-2 w-full bg-purple-700 text-white px-4 py-2 rounded shadow hover:bg-purple-600 transition"
                    >
                        {loading ? 'Thinking...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
}
