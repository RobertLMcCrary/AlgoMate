'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

//ui components
import CodeEditor from '../../components/CodeEditor';
import ProblemMetaData from '../../components/ProblemMetaData';
import NotePad from '../../components/NotePad';

/* 
can not make a separate component for the chat because it can't get context of the code editor or problem metadata
*/

//react markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

//resizable panels
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

//clerk user
import { useUser } from '@clerk/nextjs';

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

    //state management for the tabs
    const [activeTab, setActiveTab] = useState('code');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    //state management for pyodide
    const [pyodide, setPyodide] = useState(null);

    //user for update user progress
    const { user } = useUser();

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

    //load the start code templates for the problem
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

    //fetch the notes for the current problem when the page loads
    useEffect(() => {
        if (user && problem) {
            fetch(`/api/users/${user.id}/notes/${problem.id}`)
                .then((res) => res.json())
                .then((data) => {
                    setNotes(data.note || '');
                })
                .catch((error) =>
                    console.error('Error fetching notes:', error)
                );
        }
    }, [user, problem]);

    const saveNotes = async () => {
        if (user && problem) {
            setIsSaving(true);
            try {
                const response = await fetch(
                    `/api/users/${user.id}/notes/${problem.id}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ notes }),
                    }
                );

                if (response.ok) {
                    toast.success('Notes saved successfully!');
                } else {
                    toast.error('Failed to save notes');
                }
            } catch (error) {
                console.error('Error saving notes:', error);
                toast.error('Error saving notes');
            } finally {
                setIsSaving(false);
            }
        }
    };

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

                         - If the user asks for pseudo code provide it, don't be specific with syntax and keep the pseudo code simple.
                         - If the user asks what the next step is on their solution and they are already on the right track, tell them what to do next.
                         
                         Problem Context:
                         ${problem?.description}
                         Difficulty: ${problem?.difficulty}
                         Topics: ${problem?.topics}
                         Starter Code: ${problem?.starterCodes[selectedLanguage]}
                         User Code: ${code}
                         Language: ${selectedLanguage}
                         Test Cases Results: ${results}}`,
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
                <Panel defaultSize={25} minSize={20}>
                    <ProblemMetaData problem={problem} />
                </Panel>

                <PanelResizeHandle className="w-[1px] bg-gray-700 hover:w-1 cursor-col-resize" />

                {/* Code Editor Section */}
                <Panel
                    defaultSize={50}
                    minSize={30}
                    className="w-[50vw] bg-gray-800 p-6 flex flex-col h-full"
                >
                    {/* Tabbing System */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`px-4 py-2 rounded ${
                                activeTab === 'code'
                                    ? 'bg-purple-700 text-white'
                                    : 'bg-gray-700 text-gray-200'
                            }`}
                        >
                            Code Editor
                        </button>

                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-4 py-2 rounded ${
                                activeTab === 'notes'
                                    ? 'bg-purple-700 text-white'
                                    : 'bg-gray-700 text-gray-200'
                            }`}
                        >
                            Notes
                        </button>
                    </div>

                    {/* Render Active Tab */}
                    {activeTab === 'code' && (
                        <CodeEditor
                            code={code}
                            setCode={setCode}
                            selectedLanguage={selectedLanguage}
                            setSelectedLanguage={setSelectedLanguage}
                            runCode={runCode}
                            isRunning={isRunning}
                            problem={problem}
                            results={results}
                        />
                    )}

                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <NotePad
                            notes={notes}
                            setNotes={setNotes}
                            saveNotes={saveNotes}
                            isSaving={isSaving}
                        />
                    )}
                </Panel>

                <PanelResizeHandle className="w-[1px] bg-gray-700 hover:w-1 cursor-col-resize" />

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
