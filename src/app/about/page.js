'use client';
import React from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaLightbulb, FaEyeSlash, FaStar } from 'react-icons/fa';

function About() {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <header className="bg-gradient-to-r from-blue-500 to-purple-700 py-16 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    About PseudoAI
                </h1>
                <p className="text-lg md:text-xl text-gray-200">
                    Your partner in mastering coding interviews.
                </p>
            </header>
            <main className="py-16 px-4 sm:px-8 md:px-16">
                <section className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">
                        A Smarter Way to Prepare
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        At PseudoAI, we believe that true mastery comes from
                        understanding the journey to the solution. Our tools are
                        designed to guide you step-by-step, helping you uncover
                        insights and build confidence without giving away the
                        answer.
                    </p>
                </section>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        title="Guided Problem Solving"
                        description="Receive hints tailored to your current progress to nudge you toward the right path."
                        Icon={FaLightbulb}
                    />
                    <FeatureCard
                        title="No Spoilers"
                        description="Instead of revealing the solution, we offer pseudo-code and explanations to help you learn effectively."
                        Icon={FaEyeSlash}
                    />
                    <FeatureCard
                        title="Interview Confidence"
                        description="Practice under realistic conditions with tools that mimic the pressure of real interviews."
                        Icon={FaStar}
                    />
                </section>
                <section className="bg-gray-800 py-12 px-4 rounded-lg shadow-lg text-center mt-16">
                    <h3 className="text-2xl font-semibold mb-4">
                        Why It Works
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                        Unlike traditional platforms, PseudoAI focuses on
                        incremental progress and understanding. By addressing
                        roadblocks and offering strategic guidance, we ensure
                        you stay engaged and continue learning effectively.
                    </p>
                </section>
            </main>
            <Footer />
        </div>
    );
}

function FeatureCard({ title, description, Icon }) {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <Icon className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h4 className="text-xl font-semibold">{title}</h4>
            <p className="text-gray-400 mt-2">{description}</p>
        </div>
    );
}

export default About;
