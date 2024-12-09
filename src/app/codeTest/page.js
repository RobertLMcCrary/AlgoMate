'use client';
import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

export default function CodeTest() {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [pyodide, setPyodide] = useState(null);

    useEffect(() => {
        if (language === 'python' && !pyodide) {
            const loadPyodide = async () => {
                const pyodideInstance = await window.loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
                });
                setPyodide(pyodideInstance);
            };
            loadPyodide();
        }
    }, [language, pyodide]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (language === 'javascript') {
            try {
                const output = [];
                const consoleLog = (...args) => output.push(args.join(' '));
                const sandbox = { console: { log: consoleLog } };

                const runCode = new Function(
                    'sandbox',
                    `
                    with (sandbox) {
                        ${code}
                    }
                `
                );

                runCode(sandbox);
                setOutput(output.join('\n'));
            } catch (error) {
                setOutput('Error: ' + error.message);
            }
        } else if (language === 'python' && pyodide) {
            try {
                // Capture Python's stdout
                pyodide.runPython(`
                    import sys
                    import io
                    sys.stdout = io.StringIO()
                `);

                // Run the user's code
                await pyodide.runPythonAsync(code);

                // Get the captured output
                const stdout = pyodide.runPython('sys.stdout.getvalue()');
                setOutput(stdout);
            } catch (error) {
                setOutput('Error: ' + error.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-2xl font-bold mb-4">Code Execution Test</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-gray-800 p-2 rounded"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                    </select>
                </div>
                <div className="h-[400px] border border-gray-700 rounded">
                    <CodeMirror
                        value={code}
                        height="400px"
                        theme={vscodeDark}
                        extensions={[
                            language === 'python' ? python() : javascript(),
                        ]}
                        onChange={(value) => setCode(value)}
                        className="text-lg"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
                >
                    Run Code
                </button>
            </form>
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-2">Output:</h2>
                <pre className="bg-gray-800 p-4 rounded whitespace-pre-wrap">
                    {output}
                </pre>
            </div>
        </div>
    );
}
