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
