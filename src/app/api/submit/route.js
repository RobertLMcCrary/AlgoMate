const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';

export async function POST(req) {
    const { code, language, problemId, testCases } = await req.json();

    // Language IDs for Judge0
    const languageIds = {
        javascript: 63,
        python: 71,
        cpp: 54,
        java: 62
    };

    try {
        // Create wrapper code based on language
        let wrappedCode = code;
        let formattedInput = '';
        
        switch (language) {
            case 'javascript':
                formattedInput = `const input = ${JSON.stringify(testCases[0].input)};\n` +
                                `const nums = input.nums;\n` +
                                `const target = input.target;\n` +
                                `console.log(JSON.stringify(twoSum(nums, target)));`;
                wrappedCode = `${code}\n${formattedInput}`;
                break;
            case 'python':
                formattedInput = `import json\n` +
                                `input = json.loads('${JSON.stringify(testCases[0].input)}')\n` +
                                `nums, target = input['nums'], input['target']\n` +
                                `print(json.dumps(twoSum(nums, target)))`;
                wrappedCode = `${code}\n${formattedInput}`;
                break;
            // Add other language cases as needed
        }

        const submission = await fetch(`${JUDGE0_API}/submissions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY
            },
            body: JSON.stringify({
                source_code: wrappedCode,
                language_id: languageIds[language],
                stdin: '',  // Input is now part of the code
                expected_output: JSON.stringify(testCases[0].output)
            })
        });

        if (!submission.ok) {
            throw new Error(`Submission failed: ${submission.status}`);
        }

        const { token } = await submission.json();
        const result = await pollSubmission(token, testCases[0]);

        return new Response(JSON.stringify({ results: [result] }), { status: 200 });
    } catch (error) {
        console.error('Submission error:', error);
        return new Response(
            JSON.stringify({
                results: [{
                    testCase: 'Error',
                    passed: false,
                    error: error.message,
                    input: testCases[0].input
                }]
            }),
            { status: 200 }
        );
    }
}

async function pollSubmission(token, testCase) {
    let attempts = 0;
    while (attempts < 10) {
        const response = await fetch(`${JUDGE0_API}/submissions/${token}`, {
            headers: {
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY
            }
        });

        const result = await response.json();
        
        if (result.status.id > 2) { // Not queued or processing
            try {
                const output = result.stdout ? JSON.parse(result.stdout.trim()) : null;
                const expected = testCase.output;
                
                // Compare arrays regardless of order
                const passed = Array.isArray(output) && 
                             Array.isArray(expected) &&
                             output.length === expected.length &&
                             output.every(val => expected.includes(val));

                return {
                    testCase: 1,
                    passed: passed,
                    error: result.status.id !== 3 ? result.status.description : null,
                    input: testCase.input,
                    expected: expected,
                    received: output
                };
            } catch (error) {
                return {
                    testCase: 1,
                    passed: false,
                    error: 'Invalid output format',
                    input: testCase.input,
                    expected: testCase.output,
                    received: result.stdout
                };
            }
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Submission timeout');
}

/*
export async function POST(req) {
    const { code, language, problemId, testCases } = await req.json();

    try {
        let results = [];

        switch (language) {
            case 'javascript':
                results = runJavaScript(code, testCases);
                break;
            case 'python':
                // You'll need a Python runtime or API
                break;
            case 'cpp':
                // You'll need a C++ compiler or API
                break;
            case 'java':
                // You'll need a Java runtime or API
                break;
            default:
                throw new Error('Unsupported language');
        }

        return new Response(JSON.stringify({ results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            results: [{
                testCase: 'Error',
                passed: false,
                error: error.message
            }]
        }), { status: 200 });
    }
}

function runJavaScript(code, testCases) {
    // Create a safe evaluation context
    const userFunction = new Function('nums', 'target', `
        ${code}
        return twoSum(nums, target);
    `);

    return testCases.map((testCase, index) => {
        try {
            const result = userFunction(testCase.input.nums, testCase.input.target);

            // Check if arrays are equal
            const passed = Array.isArray(result) &&
                result.length === testCase.output.length &&
                result.every((val, i) => val === testCase.output[i]);

            return {
                testCase: index + 1,
                passed,
                input: testCase.input,
                expected: testCase.output,
                received: result
            };
        } catch (error) {
            return {
                testCase: index + 1,
                passed: false,
                error: error.message,
                input: testCase.input
            };
        }
    });
}
*/