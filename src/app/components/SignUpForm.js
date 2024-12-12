'use client';
import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';

export default function SignUpPage() {
    const { isLoaded, signUp } = useSignUp();
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoaded) return;

        try {
            const result = await signUp.create({
                emailAddress,
                password,
                username,
            });

            // Create user in Neo4j
            const neo4jResponse = await fetch('/api/auth/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clerkId: result.createdUserId,
                    email: emailAddress,
                    username: username,
                }),
            });

            const neo4jResult = await neo4jResponse.json();
            console.log('User created in Neo4j:', neo4jResult);

            // Handle successful signup (redirect, etc.)
        } catch (error) {
            console.error('Signup error:', error);
        }
    };

    const handleOAuthSignUp = async (OAuthStrategy) => {
        try {
            const result = await signUp.create({
                strategy: strategy,
            });

            // Create user in Neo4j after OAuth signup
            const neo4jResponse = await fetch('/api/auth/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clerkId: result.createdUserId,
                    email: result.emailAddress,
                    username: result.username,
                }),
            });

            const neo4jResult = await neo4jResponse.json();
            console.log('User created in Neo4j:', neo4jResult);
        } catch (error) {
            console.error('OAuth Signup error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4 py-12 w-[100vw]">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="px-6 py-8">
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
                        Create Your PseudoAI Account
                    </h2>

                    {/* OAuth Buttons */}
                    <div className="space-y-4 mb-6">
                        <button
                            onClick={() => handleOAuthSignUp('oauth_google')}
                            className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md px-6 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            <svg
                                className="w-6 h-6 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 48 48"
                            >
                                <path
                                    fill="#4285F4"
                                    d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.42 6.64v5.52h7.11c4.16-3.83 6.57-9.47 6.57-16.17z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M11.68 28.18c-.54-1.62-.85-3.37-.85-5.18s.31-3.56.85-5.18v-5.7H4.34A23.933 23.933 0 0 0 0 24c0 3.86.93 7.5 2.59 10.7l7.09-5.52z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.29 29.93 1 24 1 15.4 1 7.96 5.93 4.34 14.3l7.34 5.7c1.74-5.2 6.59-9.05 12.32-9.05z"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        <button
                            onClick={() => handleOAuthSignUp('oauth_microsoft')}
                            className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md px-6 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            <svg
                                className="w-6 h-6 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 23 23"
                            >
                                <path fill="#F3F3F3" d="M0 0h23v23H0z" />
                                <path fill="#F35325" d="M1 1h10v10H1z" />
                                <path fill="#81BC06" d="M12 1h10v10H12z" />
                                <path fill="#05A6F0" d="M1 12h10v10H1z" />
                                <path fill="#FFBA08" d="M12 12h10v10H12z" />
                            </svg>
                            Continue with Microsoft
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Email Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            placeholder="Email address"
                            required
                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Sign Up
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <a
                                href="/sign-in"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Log in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
