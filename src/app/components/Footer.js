import React from 'react';
import Link from 'next/link';
import { FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';

function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300 py-8">
            <div className="container mx-auto px-4">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-600 pb-6">
                    {/* Branding */}
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <h1 className="text-2xl font-bold text-white">
                            PseudoAI
                        </h1>
                        <p className="text-sm text-gray-400">
                            Gamifying DSA Study for Interview Success
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex space-x-6">
                        <Link href="/pricing" className="hover:text-purple-400">
                            Pricing
                        </Link>
                        <Link href="/contact" className="hover:text-purple-400">
                            Contact
                        </Link>
                        <Link href="/about" className="hover:text-purple-400">
                            About Us
                        </Link>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-6">
                    {/* Social Links */}
                    <div className="flex space-x-4 mb-4 md:mb-0">
                        <a
                            href="https://www.linkedin.com/company/pseudoai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-purple-400 transition"
                            aria-label="LinkedIn"
                        >
                            <FaLinkedin size={24} />
                        </a>
                        <a
                            href="https://github.com/RobertLMcCrary/PseudoAI"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-purple-400 transition"
                            aria-label="GitHub"
                        >
                            <FaGithub size={24} />
                        </a>
                    </div>

                    {/* Copyright */}
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} PseudoAI.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
