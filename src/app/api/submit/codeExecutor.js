export class CodeExecutor {
    static executeJavaScript(code, testCases) {
        return testCases.map((testCase, index) => {
            try {
                // Create a safer sandbox environment
                const sandbox = {
                    console: { log: () => {} },
                    JSON: JSON,
                    // Add any other safe globals needed
                };

                // Create a more flexible function wrapper based on problem type
                const wrappedCode = `
                    ${code}
                    
                    // Get the main function name from the code
                    const mainFunctionName = Object.keys(this).find(key => 
                        typeof this[key] === 'function' && 
                        code.includes(function ${key})
                    );
                    
                    // Call the appropriate function based on input type
                    if (input.nums && input.target) {
                        return this[mainFunctionName](input.nums, input.target);
                    } else if (Array.isArray(input)) {
                        return this[mainFunctionName](input);
                    } else {
                        return this[mainFunctionName](input);
                    }
                `;

                const fn = new Function('input', wrappedCode).bind(sandbox);
                const result = fn(testCase.input);

                return {
                    testCase: index + 1,
                    passed: this.compareOutputs(result, testCase.output),
                    input: testCase.input,
                    expected: testCase.output,
                    received: result,
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
    }

    static executePython(code, testCases) {
        // Use Pyodide or similar for in-browser Python execution
        // This would require additional setup
        throw new Error('Python execution not implemented');
    }

    static compareOutputs(received, expected) {
        if (Array.isArray(received) && Array.isArray(expected)) {
            return (
                received.length === expected.length &&
                received.every((val) => expected.includes(val))
            );
        }
        return received === expected;
    }
}
