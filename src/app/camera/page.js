'use client';
import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function CameraPage() {
    const videoRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [pyodide, setPyodide] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const languageMap = {
        javascript: javascript({ jsx: true }),
        python: python(),
    };

    useEffect(() => {
        startCamera();
    }, []);

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

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setHasPermission(true);
            }
        } catch (err) {
            setHasPermission(false);
        }
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('');

        if (selectedLanguage === 'javascript') {
            try {
                const output = [];
                const consoleLog = (...args) => output.push(args.join(' '));
                const sandbox = { console: { log: consoleLog } };

                const runCode = new Function(
                    'sandbox',
                    `with (sandbox) {
                        ${code}
                    }`
                );

                runCode(sandbox);
                setOutput(output.join('\n'));
            } catch (error) {
                setOutput('Error: ' + error.message);
            }
        } else if (selectedLanguage === 'python' && pyodide) {
            try {
                pyodide.runPython(`
                    import sys
                    import io
                    sys.stdout = io.StringIO()
                `);

                await pyodide.runPythonAsync(code);
                const stdout = pyodide.runPython('sys.stdout.getvalue()');
                setOutput(stdout);
            } catch (error) {
                setOutput('Error: ' + error.message);
            }
        }
        setIsRunning(false);
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto py-8 px-4">
                <h1 className="text-4xl font-bold text-center mb-8 text-purple-400">
                    UI Testing
                </h1>
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <div className="flex justify-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="rounded-lg shadow-xl w-full"
                            />
                        </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-purple-400">
                                Code Editor
                            </h2>
                            <div className="flex gap-4">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) =>
                                        setSelectedLanguage(e.target.value)
                                    }
                                    className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded border border-gray-600 
                                         focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="javascript">
                                        JavaScript
                                    </option>
                                    <option value="python">Python</option>
                                </select>
                                <button
                                    onClick={handleRunCode}
                                    disabled={isRunning}
                                    className="px-4 py-1.5 bg-purple-700 text-white rounded hover:bg-purple-600 transition disabled:opacity-50"
                                >
                                    {isRunning ? 'Running...' : 'Run Code'}
                                </button>
                            </div>
                        </div>
                        <CodeMirror
                            value={code}
                            height="60vh"
                            theme={vscodeDark}
                            extensions={[languageMap[selectedLanguage]]}
                            onChange={(value) => setCode(value)}
                            className="overflow-hidden rounded-lg border border-gray-700"
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
                        />
                        {output && (
                            <div className="mt-4 bg-gray-800 p-4 rounded-lg max-h-[20vh] overflow-y-auto">
                                <h3 className="text-lg font-semibold text-purple-400 mb-2">
                                    Output:
                                </h3>
                                <pre className="whitespace-pre-wrap break-words">
                                    {output}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default CameraPage;
