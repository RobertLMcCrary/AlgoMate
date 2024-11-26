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
}
