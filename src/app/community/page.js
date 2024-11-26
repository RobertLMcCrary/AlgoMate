'use client';
import Link from 'next/link';
import blogData from '../../data/blogData.json';
import Navbar from '../components/Navbar';

function CommunityPage() {
    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <h1 className="text-4xl font-bold my-6 text-center">
                Community Updates
            </h1>
            <div className="flex flex-col items-center jutify-center gap-6">
                {blogData.map((post) => (
                    <div
                        key={post.id}
                        className="w-[70vw] bg-gray-800 p-6 rounded-lg shadow-lg"
                    >
                        <h2 className="text-2xl font-semibold">{post.title}</h2>
                        <p className="text-gray-400 text-sm mb-2">
                            {post.date} - By {post.author}
                        </p>
                        <p className="text-gray-300">{post.excerpt}</p>
                        <Link
                            href={`/community/posts/${post.id}`}
                            className="text-purple-500 font-bold hover:underline mt-4 inline-block"
                        >
                            Read More
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CommunityPage;
