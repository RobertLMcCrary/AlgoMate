'use client';
import Link from 'next/link';

export default function ProblemSection({ problem }) {
    return (
        <div className=" bg-gray-800 text-gray-200 p-6 h-[60vh] overflow-y-auto">
            <Link className="text-blue-500 hover:underline" href="/problems">
                Back to Problems
            </Link>
            {problem ? (
                <>
                    <h2 className="text-2xl font-bold">{problem.title}</h2>
                    <div className="flex gap-2 mt-2">
                        <span className="text-sm bg-blue-500 px-2 py-1 rounded">
                            {problem.difficulty}
                        </span>
                        <span className="text-sm bg-purple-500 px-2 py-1 rounded">
                            {problem.topics}
                        </span>
                    </div>
                    <p className="mt-4">{problem.description}</p>
                    <h3 className="mt-6 font-semibold">Constraints:</h3>
                    <ul className="list-disc list-inside mt-2">
                        {problem?.constraints?.map((constraint, idx) => (
                            <li key={idx}>{constraint}</li>
                        ))}
                    </ul>
                    <h3 className="mt-6 font-semibold">Examples:</h3>
                    {problem?.examples?.map((example, idx) => (
                        <pre
                            key={idx}
                            className="bg-gray-700 p-4 rounded mt-2 whitespace-pre-wrap break-words max-w-full overflow-x-hidden text-left"
                        >
                            Input: {example.input}
                            <br />
                            Output: {example.output}
                        </pre>
                    ))}
                </>
            ) : (
                <div>Loading problem...</div>
            )}
        </div>
    );
}
