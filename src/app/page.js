'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

//components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './dashboard/page';

//clerk
import { SignUpButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

function Home() {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <SignedIn>
                <Dashboard />
            </SignedIn>
            <SignedOut>
                <header className="bg-gradient-to-r from-blue-500 to-purple-700 py-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Ace Your Interviews with AI
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-8">
                        Solve LeetCode problems like a pro, with AI-generated
                        hints and music to keep you focused.
                    </p>
                    <div className="flex justify-center items-center gap-4">
                        <SignUpButton className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition">
                            Sign Up Now
                        </SignUpButton>
                        <Link href="/about">
                            <span className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-500 transition">
                                Learn More
                            </span>
                        </Link>
                    </div>
                </header>
                <main className="py-16 px-4 sm:px-8 md:px-16">
                    <section className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">
                            Why Choose Us?
                        </h2>
                        <p className="text-gray-400">
                            Our platform helps you break through mental blocks
                            with:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                            <FeatureCard
                                title="AI-Generated Hints"
                                description="Get smart suggestions and pseudo-code to overcome tricky problems."
                                icon="/ai-icon.svg"
                            />
                            <FeatureCard
                                title="Focus Mode"
                                description="Background music to keep you in the zone."
                                icon="/music-icon.svg"
                            />
                            <FeatureCard
                                title="Interview Readiness"
                                description="Practice lock-in sessions to simulate real interviews."
                                icon="/interview-icon.svg"
                            />
                        </div>
                    </section>

                    {/* Coming Soon Section */}
                    <section className="bg-gradient-to-r from-blue-500 to-purple-700 text-white py-12 px-6 rounded-lg shadow-lg mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Coming Soon: PseudoAI Pro
                        </h2>
                        <p className="text-xl text-gray-200 mb-6">
                            Take your interview prep to the next level with
                            **PseudoAI Pro**. Collaborate live with others,
                            tackle mock interviews with video calling and chat,
                            and solve problems together in real time!
                        </p>
                        <div className="flex justify-center font-bold text-xl">
                            <ul className="list-disc text-left space-y-4">
                                <li className="ml-6 text-gray-100">
                                    <span className="font-medium">
                                        Mock Interviews:
                                    </span>{' '}
                                    Practice with video calling and real-time
                                    chat.
                                </li>
                                <li className="ml-6 text-gray-100">
                                    <span className="font-medium">
                                        Live Collaboration:
                                    </span>{' '}
                                    Join rooms to solve problems together.
                                </li>
                                <li className="ml-6 text-gray-100">
                                    <span className="font-medium">
                                        Exclusive Insights:
                                    </span>{' '}
                                    AI-enhanced feedback on your performance.
                                </li>
                            </ul>
                        </div>
                        <div className="flex justify-center mt-8">
                            <Link
                                href="/pricing"
                                className="cursor-pointer bg-gray-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-700 transition"
                            >
                                Learn More
                            </Link>
                        </div>
                    </section>

                    {/* Sign Up Call to action */}
                    <section className="bg-gray-800 py-12 px-4 rounded-lg shadow-lg text-center">
                        <h3 className="text-2xl font-semibold mb-4">
                            Ready to Level Up?
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Join other users already mastering coding
                            interviews.
                        </p>

                        <SignUpButton className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-500 transition">
                            Get Started for Free
                        </SignUpButton>
                    </section>
                </main>
            </SignedOut>
            <Footer />
        </div>
    );
}

function FeatureCard({ title, description, icon }) {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <Image
                src={icon}
                alt={title}
                width={60}
                height={60}
                className="mx-auto mb-4"
            />
            <h4 className="text-xl font-semibold">{title}</h4>
            <p className="text-gray-400 mt-2">{description}</p>
        </div>
    );
}

export default Home;
