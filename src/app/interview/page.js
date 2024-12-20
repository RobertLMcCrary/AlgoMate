'use client';
import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import { useUser } from '@clerk/nextjs';

export default function InterviewPage() {
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [messages, setMessages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [userInput, setUserInput] = useState('');
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [pyodide, setPyodide] = useState(null);

    //initialize pyodide
    useEffect(() => {
        if (selectedLanguage === 'python' && !pyodide) {
            const loadPyodide = async () => {
                const pyodideInstance = await window.loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
                });
                setPyodide(pyodideInstance);
            };
            loadPyodide();
        }
    }, [selectedLanguage, pyodide]);

    //fetches random problem and starts the interview and ai interviewer
    const startInterview = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/problems/random');
            const randomProblem = await res.json();
            setProblem(randomProblem);

            const systemMessage = {
                role: 'system',
                content: `You are conducting a technical interview. The candidate will solve: ${randomProblem.title}.
                         Follow this structure:
                         1. Introduce yourself
                         2. Ask them to explain their approach
                         3. Guide them with hints if needed
                         4. Discuss complexity
                         5. Ask follow-up questions`,
            };

            setMessages([systemMessage]);
            await triggerInterviewer(
                "Hello! I'm your technical interviewer today. Let's discuss how you'd solve this problem."
            );
        } catch (error) {
            console.error('Failed to start interview:', error);
        } finally {
            setIsLoading(false);
        }
    };

    //chatbot functionality
    const triggerInterviewer = async (content) => {
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'assistant', content }],
                }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: data.output },
            ]);
        } catch (error) {
            console.error('Interview API error:', error);
        }
    };

    const handleUserInput = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        // Add user message to chat
        const userMessage = { role: 'user', content: userInput };
        setMessages((prev) => [...prev, userMessage]);
        setUserInput('');

        // Get AI response
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: data.output },
            ]);
        } catch (error) {
            console.error('Chat error:', error);
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        setResults(null);

        try {
            if (selectedLanguage === 'javascript') {
                const res = await fetch('/api/code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: selectedLanguage,
                        problemId: problem.id,
                        testCases: problem.testCases,
                        difficulty: problem.difficulty,
                        userId: user?.id,
                    }),
                });

                const data = await res.json();
                setResults(data.results);
            } else if (selectedLanguage === 'python' && pyodide) {
                const results = problem.testCases.map((testCase, index) => {
                    try {
                        const functionCall =
                            pythonFunctionCalls[problem.id] ||
                            pythonFunctionCalls.default;
                        pyodide.globals.set('input', testCase.input);
                        pyodide.runPython(functionCall(code));
                        const result = pyodide.globals.get('result');
                        const jsResult =
                            result instanceof pyodide.ffi.PyProxy
                                ? result.toJs()
                                : result;

                        return {
                            testCase: index + 1,
                            passed:
                                JSON.stringify(jsResult) ===
                                JSON.stringify(testCase.output),
                            input: testCase.input,
                            expected: testCase.output,
                            received: jsResult,
                        };
                    } catch (error) {
                        return {
                            testCase: index + 1,
                            passed: false,
                            error: error.message,
                            input: testCase.input,
                            expected: testCase.output,
                            received: null,
                        };
                    }
                });

                // Send results to backend for progress tracking
                await fetch('/api/code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: selectedLanguage,
                        problemId: problem.id,
                        testCases: problem.testCases,
                        difficulty: problem.difficulty,
                        userId: user?.id,
                        results,
                    }),
                });

                setResults(results);
            }
        } catch (error) {
            console.error('Frontend error:', error);
            setResults([
                {
                    testCase: 'Error',
                    passed: false,
                    error: 'Failed to run code. Please try again.',
                },
            ]);
        } finally {
            setIsRunning(false);
        }
    };

    useEffect(() => {
        if (problem && problem.starterCodes) {
            setCode(problem.starterCodes[selectedLanguage]);
        }
    }, [problem, selectedLanguage]);

    return (
        <div className="h-screen bg-gray-800">
            <PanelGroup direction="horizontal">
                <Panel defaultSize={30} className="p-4">
                    <div className="text-white">
                        <h1 className="text-2xl font-bold mb-4">
                            Technical Interview Practice
                        </h1>
                        {!problem ? (
                            <button
                                onClick={startInterview}
                                disabled={isLoading}
                                className="bg-green-600 px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-green-500 transition disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Loading Interview...
                                    </>
                                ) : (
                                    'Start New Interview'
                                )}
                            </button>
                        ) : (
                            <div className="space-y-4 overflow-y-auto">
                                {isLoading ? (
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-gray-700 rounded"></div>
                                            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 overflow-y-auto">
                                        {isLoading ? (
                                            <div className="animate-pulse space-y-4">
                                                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                                                <div className="space-y-3">
                                                    <div className="h-4 bg-gray-700 rounded"></div>
                                                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                                    <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                                                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h2 className="text-xl font-bold">
                                                    {problem.title}
                                                </h2>

                                                <div className="mt-4">
                                                    <h3 className="text-lg font-semibold mb-2">
                                                        Problem Description
                                                    </h3>
                                                    <ReactMarkdown className="prose prose-invert">
                                                        {problem.description}
                                                    </ReactMarkdown>
                                                </div>

                                                <div className="mt-4">
                                                    <h3 className="text-lg font-semibold mb-2">
                                                        Constraints
                                                    </h3>
                                                    <ul className="list-disc list-inside">
                                                        {problem.constraints?.map(
                                                            (
                                                                constraint,
                                                                idx
                                                            ) => (
                                                                <li key={idx}>
                                                                    {constraint}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>

                                                <div className="mt-4">
                                                    <h3 className="text-lg font-semibold mb-2">
                                                        Examples
                                                    </h3>
                                                    {problem.examples?.map(
                                                        (example, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="bg-gray-700 p-4 rounded mb-2"
                                                            >
                                                                <pre className="whitespace-pre-wrap">
                                                                    <strong>
                                                                        Input:
                                                                    </strong>{' '}
                                                                    {JSON.stringify(
                                                                        example.input
                                                                    )}
                                                                    <br />
                                                                    <strong>
                                                                        Output:
                                                                    </strong>{' '}
                                                                    {JSON.stringify(
                                                                        example.output
                                                                    )}
                                                                    {example.explanation && (
                                                                        <>
                                                                            <br />
                                                                            <strong>
                                                                                Explanation:
                                                                            </strong>{' '}
                                                                            {
                                                                                example.explanation
                                                                            }
                                                                        </>
                                                                    )}
                                                                </pre>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Panel>

                <PanelResizeHandle className="w-[1px] bg-gray-700" />

                <Panel defaultSize={40}>
                    <div className="flex justify-between items-center p-2 bg-gray-900">
                        <select
                            value={selectedLanguage}
                            onChange={(e) =>
                                setSelectedLanguage(e.target.value)
                            }
                            className="bg-gray-800 text-white px-3 py-1 rounded"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                        </select>
                    </div>
                    <CodeMirror
                        value={code}
                        height="70vh"
                        theme={vscodeDark}
                        extensions={[
                            selectedLanguage === 'javascript'
                                ? javascript()
                                : python(),
                        ]}
                        onChange={setCode}
                    />
                    <div className="mt-4">
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className="w-full bg-purple-700 text-white px-6 py-2.5 rounded shadow hover:bg-purple-600 transition disabled:opacity-50 font-medium text-sm"
                        >
                            {isRunning ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Running...
                                </span>
                            ) : (
                                'Run Code'
                            )}
                        </button>
                    </div>

                    {/* Test Results */}
                    {results && (
                        <div className="mt-4 bg-gray-900 p-4 rounded-lg overflow-y-auto max-h-[37vh]">
                            <h3 className="text-lg font-semibold text-purple-400 mb-2">
                                Test Results
                            </h3>
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={`p-2 mb-2 rounded ${
                                        result.passed
                                            ? 'bg-green-900/50 text-green-200'
                                            : 'bg-red-900/50 text-red-200'
                                    }`}
                                >
                                    <div className="font-semibold flex items-center gap-2">
                                        <span>
                                            Test Case {result.testCase}:
                                        </span>
                                        {result.passed ? (
                                            <span className="text-green-400">
                                                ✓ Passed
                                            </span>
                                        ) : (
                                            <span className="text-red-400">
                                                ✗ Failed
                                            </span>
                                        )}
                                    </div>
                                    {!result.passed && (
                                        <div className="text-sm mt-1">
                                            {result.error ? (
                                                <div className="text-red-300">
                                                    Error: {result.error}
                                                </div>
                                            ) : (
                                                <>
                                                    <div>
                                                        Input:{' '}
                                                        {JSON.stringify(
                                                            result.input
                                                        )}
                                                    </div>
                                                    <div>
                                                        Expected:{' '}
                                                        {JSON.stringify(
                                                            result.expected
                                                        )}
                                                    </div>
                                                    <div>
                                                        Received:{' '}
                                                        {JSON.stringify(
                                                            result.received
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>

                <PanelResizeHandle className="w-[1px] bg-gray-700" />

                <Panel defaultSize={30} className="p-4">
                    <div className="text-white h-full flex flex-col">
                        <h2 className="text-xl font-bold mb-4">Interviewer</h2>
                        <div className="flex-1 overflow-y-auto mb-4">
                            {messages.map(
                                (msg, idx) =>
                                    msg.role !== 'system' && (
                                        <div
                                            key={idx}
                                            className={`mb-4 ${
                                                msg.role === 'user'
                                                    ? 'text-green-400'
                                                    : 'text-gray-300'
                                            }`}
                                        >
                                            <div className="font-bold mb-1">
                                                {msg.role === 'user'
                                                    ? 'You:'
                                                    : 'Interviewer:'}
                                            </div>
                                            <ReactMarkdown className="prose prose-invert">
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )
                            )}
                        </div>
                        <form onSubmit={handleUserInput} className="mt-auto">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className="w-full p-2 rounded border border-gray-700 text-gray-200 bg-gray-800"
                                placeholder="Ask the interviewer something..."
                            />
                            <button
                                type="submit"
                                className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-500 transition"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
}
