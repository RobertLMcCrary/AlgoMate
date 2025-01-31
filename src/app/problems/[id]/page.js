'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

//react markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

//resizable panels
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

//code mirror
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';

import { indentUnit } from '@codemirror/language';
//clerk user
import { useUser } from '@clerk/nextjs';

//uuid for collab room
import { v4 as uuidv4 } from 'uuid';

//toast for popup notifications
import { toast } from 'react-hot-toast';

export default function ProblemPage() {
    //fetching the problems
    const params = useParams();
    const [problem, setProblem] = useState(null);

    //user input state management for the ai chatbot
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    //state management for code editor
    const [code, setCode] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    //state management for pyodide
    const [pyodide, setPyodide] = useState(null);
    //user for update user progress
    const { user } = useUser();

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

    //language map for selecting language
    const languageMap = {
        javascript: javascript({ jsx: true }),
        python: python(),
        java: java(),
        cpp: cpp(),
    };

    useEffect(() => {
        if (problem && problem.starterCodes) {
            setCode(problem.starterCodes[selectedLanguage]);
        }
    }, [problem, selectedLanguage]);

    //fetch problems from mongodb
    useEffect(() => {
        if (params.id) {
            console.log('Fetching problem with ID:', params.id);
            fetch(`/api/problems/${params.id}`)
                .then((res) => {
                    console.log('Response status:', res.status);
                    return res.json();
                })
                .then((data) => {
                    console.log('Received data:', data);
                    setProblem(data);
                })
                .catch((error) => console.error('Error:', error));
        }
    }, [params.id]);

    const handleUserInput = async (e) => {
        e.preventDefault();
        if (userInput.trim()) {
            const systemMessage = {
                role: 'system',
                content: `You are a coding mentor helping the user solve the LeetCode problem "${problem?.title}". Do not provide all the information at once—answer step by step based on the user's input and maintain brevity.
                         Your primary role is to guide the user step by step without directly providing a complete solution or code. NEVER provide the direct solution ever. 
                         Follow these guidelines but remember, be concise and uncluttered in your responses. 
                         1. Provide hints and ask leading questions: Help the user break the problem into smaller parts and think critically about their approach.
                         2. Explain relevant concepts: Focus on the key ideas and logic needed to understand and solve the problem.
                         3. Suggest strategies, not solutions: Offer general approaches, like using specific data structures or algorithms, without writing the code for them
                         4. Redirect solution requests: If asked for the solution, remind the user of your mentoring role and guide them back to problem-solving.
                         5. Motivate and affirm progress: Provide encouragement and acknowledge their efforts to keep them engaged.
                         6. Encourage incremental solutions: Suggest building and testing small chunks of code to validate progress.
                         7. Guide debugging efforts: Ask questions to help the user identify and resolve issues in their code.
                         8. Highlight edge cases: Encourage the user to consider and handle unusual scenarios, such as empty inputs or large datasets.
                         9. Dont give irrelevant information 
                         10. Again be concise there should never be more than a paragraph of text in all your responses.

                         IMPORTANT NOTE: If the user asks for syntax help give them code snippets and explain how to do what ever they are asking.
                         EXAMPLE: if a user forgets how to make an array in python with a specific length you can give them a code snippet on how to do it and explain it.
                         
                         Problem Context:
                         ${problem?.description}
                         Difficulty: ${problem?.difficulty}
                         Topics: ${problem?.topics}
                         Starter Code: ${problem?.starterCodes[selectedLanguage]}
                         User Code: ${code}
                         Language: ${selectedLanguage}`,
            };

            const userMessage = { role: 'user', content: userInput };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setUserInput('');
            setLoading(true);

            // Create temporary message for streaming
            const tempMessage = { role: 'assistant', content: '' };
            setMessages((prevMessages) => [...prevMessages, tempMessage]);

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [...messages, systemMessage, userMessage],
                    }),
                });

                if (!res.ok)
                    throw new Error(`HTTP error! status: ${res.status}`);

                const reader = res.body.getReader();
                let accumulatedContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = new TextDecoder().decode(value);
                    accumulatedContent += text;

                    setMessages((prevMessages) => {
                        const newMessages = [...prevMessages];
                        newMessages[newMessages.length - 1].content =
                            accumulatedContent;
                        return newMessages;
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                setResponse('Something went wrong. Please try again.');
            }
            setLoading(false);
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        setResults(null);

        try {
            // Fetch the problem document to get functionCalls and testCases
            const res = await fetch(`/api/problems/${params.id}`);
            const problem = await res.json();

            if (!problem) {
                throw new Error('Problem not found');
            }

            const functionCall = problem.functionCalls[selectedLanguage];
            if (!functionCall) {
                throw new Error(
                    `Function call not found for language: ${selectedLanguage}`
                );
            }

            let results;

            // JavaScript Execution
            if (selectedLanguage === 'javascript') {
                const res = await fetch('/api/code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: selectedLanguage,
                        problemId: problem.id,
                        userId: user?.id,
                    }),
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                results = data.results;
            }

            // Python Execution (using Pyodide)
            else if (selectedLanguage === 'python' && pyodide) {
                results = problem.testCases.map((testCase, index) => {
                    try {
                        // Redirect stdout to capture console logs
                        pyodide.runPython(`
                            import sys
                            import io
                            sys.stdout = io.StringIO()
                        `);

                        // Set input and execute the code
                        pyodide.globals.set('input', testCase.input);
                        pyodide.runPython(code.trim() + '\n' + functionCall);

                        // Get the result and stdout
                        const result = pyodide.globals.get('result');
                        const stdout = pyodide.runPython(
                            'sys.stdout.getvalue()'
                        );

                        // Convert PyProxy to JavaScript if necessary
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
                            stdout: stdout,
                        };
                    } catch (error) {
                        // Extract line number and error message
                        const lines = error.message.split('\n');
                        for (let i = lines.length - 1; i >= 0; i--) {
                            if (lines[i].includes('line')) {
                                const match = lines[i].match(/line (\d+)/);
                                if (match) {
                                    const lineNumber = parseInt(match[1]);
                                    const errorMessage = error.message
                                        .split(':')
                                        .pop()
                                        .trim();
                                    return {
                                        testCase: index + 1,
                                        passed: false,
                                        error: `Line ${lineNumber}: ${errorMessage}`,
                                        input: testCase.input,
                                        expected: testCase.output,
                                        received: null,
                                        stdout: '',
                                    };
                                }
                            }
                        }
                    }
                });

                // Send Python results to backend for user progress update
                const res = await fetch('/api/code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: selectedLanguage,
                        problemId: problem.id,
                        userId: user?.id,
                        pythonResults: results,
                    }),
                });

                const data = await res.json();
                results = data.results;
            }

            // Java or C++ Execution (using Judge0)
            else if (['java', 'cpp'].includes(selectedLanguage)) {
                const res = await fetch('/api/code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language: selectedLanguage,
                        problemId: problem.id,
                        userId: user?.id,
                    }),
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                results = data.results;
            }

            // Set the results in state
            setResults(results);
        } catch (error) {
            console.error('Error in runCode function:', error);
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

    //generating pseudo code in the editor
    const generatePseudoCode = async () => {
        setLoading(true);
        try {
            const systemMessage = {
                role: 'system',
                content: `Generate only pseudocode for the following problem. Do not include any introductory text - provide only the pseudocode steps.
                     
                     Problem: "${problem?.title}"
                     ${problem?.description}
                     Difficulty: ${problem?.difficulty}
                     Topics: ${problem?.topics}`,
            };

            const userMessage = {
                role: 'user',
                content: 'Generate pseudocode for this problem.',
            };

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [systemMessage, userMessage],
                }),
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            // Create temporary message for streaming
            const tempMessage = { role: 'assistant', content: '' };
            setMessages((prevMessages) => [...prevMessages, tempMessage]);

            const reader = res.body.getReader();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                accumulatedContent += text;

                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[
                        newMessages.length - 1
                    ].content = `Here's the pseudocode for ${problem?.title}:\n\n${accumulatedContent}`;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error generating pseudo code:', error);
        }
        setLoading(false);
    };

    return (
        <div className="h-[100vh] bg-gray-800">
            <PanelGroup
                direction="horizontal"
                className="flex bg-gray-800 h-[100vh]"
            >
                {/* Problem Section */}
                <Panel
                    defaultSize={25}
                    minSize={20}
                    className="w-1/4 bg-gray-800 text-gray-200 p-6 h-[100vh] overflow-y-auto"
                >
                    <Link
                        className="text-blue-500 hover:underline"
                        href="/problems"
                    >
                        Back to Problems
                    </Link>
                    {problem ? (
                        <>
                            <h2 className="text-2xl font-bold">
                                {problem.title}
                            </h2>
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
                                {problem?.constraints?.map(
                                    (constraint, idx) => (
                                        <li key={idx}>{constraint}</li>
                                    )
                                )}
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
                </Panel>

                <PanelResizeHandle className="w-[1px] bg-gray-700" />

                {/* Code Editor Section */}
                <Panel
                    defaultSize={50}
                    minSize={30}
                    className="w-[50vw] bg-gray-800 p-6 flex flex-col h-full"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-purple-400">
                            Code Editor
                        </h2>
                        <select
                            value={selectedLanguage}
                            onChange={(e) =>
                                setSelectedLanguage(e.target.value)
                            }
                            className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded border border-gray-600 
                                 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            {/*
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            */}
                        </select>
                    </div>

                    <CodeMirror
                        value={code}
                        height="50vh"
                        theme={vscodeDark}
                        extensions={[languageMap[selectedLanguage]]}
                        onChange={(value) => setCode(value)}
                        className="overflow-hidden text-black rounded-lg border border-gray-700"
                        basicSetup={{
                            lineNumbers: true,
                            highlightActiveLineGutter: true,
                            highlightSpecialChars: true,
                            history: true,
                            foldGutter: true,
                            drawSelection: true,
                            dropCursor: true,
                            allowMultipleSelections: true,
                            indentOnInput: true,
                            syntaxHighlighting: true,
                            bracketMatching: true,
                            closeBrackets: true,
                            autocompletion: true,
                            rectangularSelection: true,
                            crosshairCursor: true,
                            highlightActiveLine: true,
                            highlightSelectionMatches: true,
                            closeBracketsKeymap: true,
                            defaultKeymap: true,
                            searchKeymap: true,
                            historyKeymap: true,
                            foldKeymap: true,
                            completionKeymap: true,
                            lintKeymap: true,
                        }}
                        style={{
                            fontSize: '14px',
                            backgroundColor: '#1e1e1e',
                        }}
                    />
                    <div className="flex gap-2 mt-4">
                        <button className="px-4 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-500 transition text-sm font-medium flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            Collaborate
                        </button>
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className="flex-1 bg-purple-700 text-white px-6 py-2.5 rounded shadow 
                     hover:bg-purple-600 transition disabled:opacity-50 
                     font-medium text-sm"
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
                        <button
                            onClick={generatePseudoCode}
                            className="px-4 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-500 transition text-sm font-medium"
                        >
                            {loading ? 'Thinking...' : 'Generate Pseudo Code'}
                        </button>
                        <button
                            onClick={() =>
                                setCode(problem?.starterCodes[selectedLanguage])
                            }
                            className="px-4 py-2.5 rounded border border-gray-600 text-gray-300 
                     hover:bg-gray-700 transition text-sm font-medium"
                        >
                            Reset Code
                        </button>
                    </div>

                    {/* Test Results */}
                    {results && (
                        <div className="mt-4 bg-gray-900 p-4 rounded-lg overflow-y-auto max-h-[30vh]">
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
                                                    {result.error
                                                        .split('\n')
                                                        .pop()}{' '}
                                                    {/* Only show last line of error */}
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
                                    {result.stdout && (
                                        <div className="text-sm mt-2">
                                            <div className="font-semibold">
                                                Stdout:
                                            </div>
                                            <pre className="bg-gray-800 p-2 rounded mt-1 whitespace-pre-wrap">
                                                {result.stdout}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>

                <PanelResizeHandle className="w-[1px] bg-gray-700" />

                {/* AI Chat Section */}
                <Panel
                    defaultSize={25}
                    minSize={20}
                    className="w-1/4 bg-gray-800 p-6 flex flex-col overflow-y-auto"
                >
                    <h2 className="text-xl font-bold text-purple-400">
                        AI Assistant
                    </h2>
                    <div className="flex-grow mt-4 overflow-y-auto bg-gray-900 p-4 rounded border border-gray-700">
                        {messages.map((message, index) =>
                            message.role === 'user' ||
                            message.role === 'assistant' ? (
                                <div
                                    key={index}
                                    className={`mb-4 ${
                                        message.role === 'user'
                                            ? 'text-blue-400'
                                            : 'text-gray-300'
                                    }`}
                                >
                                    <div className="font-bold mb-1">
                                        {message.role === 'user'
                                            ? 'You:'
                                            : 'AI Assistant:'}
                                    </div>
                                    <ReactMarkdown
                                        className="prose prose-invert max-w-none"
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            code({
                                                node,
                                                inline,
                                                className,
                                                children,
                                                ...props
                                            }) {
                                                return (
                                                    <code
                                                        className={`${className} bg-gray-800 rounded px-1`}
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            pre({ node, children, ...props }) {
                                                return (
                                                    <div>
                                                        <pre
                                                            className="bg-gray-800 p-4 rounded-lg overflow-x-auto"
                                                            {...props}
                                                        >
                                                            {children}
                                                        </pre>
                                                        {message.content.includes(
                                                            "Here's the pseudocode"
                                                        ) && (
                                                            <button
                                                                onClick={() =>
                                                                    navigator.clipboard.writeText(
                                                                        message.content
                                                                    )
                                                                }
                                                                className="mt-2 px-3 py-1 bg-gray-700 text-sm text-gray-300 rounded hover:bg-gray-600"
                                                            >
                                                                Copy Pseudocode
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            },
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            ) : null
                        )}
                        {messages.length === 0 && (
                            <p className="text-gray-400">
                                Ask for hints or pseudocode here.
                            </p>
                        )}
                    </div>
                    <form onSubmit={handleUserInput} className="mt-4">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="w-full p-2 rounded border border-gray-700 text-gray-200 bg-gray-800 resize-none"
                            placeholder="Ask something..."
                            rows="2"
                        />
                        <button
                            type="submit"
                            className="mt-2 w-full bg-purple-700 text-white px-4 py-2 rounded shadow hover:bg-purple-600 transition"
                        >
                            {loading ? 'Thinking...' : 'Send'}
                        </button>
                    </form>
                </Panel>
            </PanelGroup>
        </div>
    );
}
