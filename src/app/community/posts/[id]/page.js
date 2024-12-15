'use client';
import { useParams } from 'next/navigation';
import blogData from '../../../../data/blogData.json';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

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
                className="text-purple-500 font-bold hover:underline mb-8 inline-block"
                href="/community"
            >
                Back to Posts
            </Link>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                <p className="text-gray-400 text-sm mb-8">
                    {post.date} - {post.author}
                </p>
                <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                        className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                        components={{
                            p: ({ node, ...props }) => (
                                <p className="mb-4" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                                <ul
                                    className="list-disc list-inside mb-4 space-y-2"
                                    {...props}
                                />
                            ),
                            li: ({ node, ...props }) => (
                                <li className="text-gray-300" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                                <h2
                                    className="text-2xl font-bold mt-8 mb-4"
                                    {...props}
                                />
                            ),
                            strong: ({ node, ...props }) => (
                                <strong
                                    className="text-purple-400 font-bold"
                                    {...props}
                                />
                            ),
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

export default BlogPostPage;
