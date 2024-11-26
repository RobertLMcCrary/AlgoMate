'use client';
import { useParams } from 'next/navigation';
import blogData from '../../../../data/blogData.json';
import Link from 'next/link';

function BlogPostPage() {
    const { id } = useParams();

    const post = blogData.find((p) => p.id === id);

    if (!post) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">Post not found.</h1>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen p-8">
            <Link
                className="text-purple-500 font-bold hover:underline"
                href="/community"
            >
                Back to Posts
            </Link>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                <p className="text-gray-400 text-sm mb-8">
                    {post.date} - By {post.author}
                </p>
                <div className="text-gray-300 leading-relaxed">
                    {post.content}
                </div>
            </div>
        </div>
    );
}

export default BlogPostPage;
