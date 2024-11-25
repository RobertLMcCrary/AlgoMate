const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';

export async function POST(req) {
    const { code, language, problemId, testCases } = await req.json();

    if (language === 'javascript') {
        return new Response(
            JSON.stringify({
                results: runJavaScriptLocally(code, testCases),
            }),
            { status: 200 }
        );
    }

    function runJavaScriptLocally(code, testCases) {
        return testCases.map((testCase, index) => {
            try {
                // Create a safe evaluation context
                const sandbox = {
                    console: { log: () => {} },
                    JSON: JSON,
                };

                const fn = new Function(
                    'input',
                    `
                    ${code}
                    const nums = input.nums;
                    const target = input.target;
                    return twoSum(nums, target);
                `
                );

                const result = fn(testCase.input);

                // Compare arrays regardless of order
                const passed =
                    Array.isArray(result) &&
                    Array.isArray(testCase.output) &&
                    result.length === testCase.output.length &&
                    result.every((val) => testCase.output.includes(val));

                return {
                    testCase: index + 1,
                    passed,
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

    // Language IDs for Judge0
    const languageIds = {
        javascript: 63,
        python: 71,
        cpp: 54,
        java: 62,
    };

    try {
        // Create wrapper code based on language
        let wrappedCode = code;
        let formattedInput = '';

        switch (language) {
            case 'javascript':
                switch (problemId) {
                    case 'two-sum':
                        formattedInput =
                            `const input = ${JSON.stringify(
                                testCases[0].input
                            )};\n` +
                            `const nums = input.nums;\n` +
                            `const target = input.target;\n` +
                            `console.log(JSON.stringify(twoSum(nums, target)));`;
                        break;
                    case 'reverse-string':
                        formattedInput =
                            `const input = ${JSON.stringify(
                                testCases[0].input
                            )};\n` +
                            `console.log(JSON.stringify(reverseString(input)));`;
                        break;
                    case 'valid-parentheses':
                        formattedInput =
                            `const input = ${JSON.stringify(
                                testCases[0].input
                            )};\n` +
                            `console.log(JSON.stringify(isValid(input)));`;
                        break;
                    case 'maximum-subarray':
                        formattedInput =
                            `const input = ${JSON.stringify(
                                testCases[0].input
                            )};\n` + `console.log(maxSubArray(input.nums));`;
                        break;
                    case 'merge-two-sorted-lists':
                        formattedInput =
                            `const input = ${JSON.stringify(
                                testCases[0].input
                            )};\n` +
                            `console.log(JSON.stringify(mergeTwoLists(input.l1, input.l2)));`;
                        break;
                    case 'climbing-stairs':
                        formattedInput =
                            `const input = ${JSON.stringify(
                                testCases[0].input
                            )};\n` + `console.log(climbStairs(input.n));`;
                        break;
                    // Add more cases for other problems as needed
                }
                wrappedCode = `${code}\n${formattedInput}`;
                break;

            case 'python':
                switch (problemId) {
                    case 'two-sum':
                        formattedInput =
                            `import json\n` +
                            `input = json.loads('${JSON.stringify(
                                testCases[0].input
                            )}')\n` +
                            `nums, target = input['nums'], input['target']\n` +
                            `print(json.dumps(twoSum(nums, target)))`;
                        break;
                    case 'reverse-string':
                        formattedInput =
                            `import json\n` +
                            `input = json.loads('${JSON.stringify(
                                testCases[0].input
                            )}')\n` +
                            `print(json.dumps(reverseString(input)))`;
                        break;
                    case 'valid-parentheses':
                        formattedInput =
                            `import json\n` +
                            `input = json.loads('${JSON.stringify(
                                testCases[0].input
                            )}')\n` +
                            `print(isValid(input))`;
                        break;
                    case 'maximum-subarray':
                        formattedInput =
                            `import json\n` +
                            `input = json.loads('${JSON.stringify(
                                testCases[0].input
                            )}')\n` +
                            `print(maxSubArray(input['nums']))`;
                        break;
                    case 'merge-two-sorted-lists':
                        formattedInput =
                            `import json\n` +
                            `input = json.loads('${JSON.stringify(
                                testCases[0].input
                            )}')\n` +
                            `print(mergeTwoLists(input['l1'], input['l2']))`;
                        break;
                    case 'climbing-stairs':
                        formattedInput =
                            `import json\n` +
                            `input = json.loads('${JSON.stringify(
                                testCases[0].input
                            )}')\n` +
                            `print(climbStairs(input['n']))`;
                        break;
                    // Add more cases for other problems as needed
                }
                wrappedCode = `${code}\n${formattedInput}`;
                break;

            // Add cases for C++ and Java as needed
        }

        const submission = await fetch(`${JUDGE0_API}/submissions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            },
            body: JSON.stringify({
                source_code: wrappedCode,
                language_id: languageIds[language],
                stdin: '', // Input is now part of the code
                expected_output: JSON.stringify(testCases[0].output),
            }),
        });

        if (!submission.ok) {
            throw new Error(`Submission failed: ${submission.status}`);
        }

        const { token } = await submission.json();
        const result = await pollSubmission(token, testCases[0]);

        return new Response(JSON.stringify({ results: [result] }), {
            status: 200,
        });
    } catch (error) {
        console.error('Submission error:', error);
        return new Response(
            JSON.stringify({
                results: [
                    {
                        testCase: 'Error',
                        passed: false,
                        error: error.message || 'An unexpected error occurred',
                        input: testCases?.[0]?.input || {},
                        expected: testCases?.[0]?.output || null,
                        received: null,
                    },
                ],
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
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            },
        });

        const result = await response.json();

        if (result.status.id > 2) {
            // Not queued or processing
            try {
                const output = result.stdout
                    ? JSON.parse(result.stdout.trim())
                    : null;
                const expected = testCase.output;

                // Compare arrays regardless of order
                const passed =
                    Array.isArray(output) &&
                    Array.isArray(expected) &&
                    output.length === expected.length &&
                    output.every((val) => expected.includes(val));

                return {
                    testCase: 1,
                    passed: passed,
                    error:
                        result.status.id !== 3
                            ? result.status.description
                            : null,
                    input: testCase.input,
                    expected: expected,
                    received: output,
                };
            } catch (error) {
                return {
                    testCase: 1,
                    passed: false,
                    error: 'Invalid output format',
                    input: testCase.input,
                    expected: testCase.output,
                    received: result.stdout,
                };
            }
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error('Submission timeout');
}
