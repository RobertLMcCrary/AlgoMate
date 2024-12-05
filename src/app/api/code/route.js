const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';

export async function POST(req) {
    const { code, language, problemId, testCases } = await req.json();

    // Language IDs for Judge0
    const languageIds = {
        python: 71,
        cpp: 54,
        java: 62,
    };

    //handle javascript locally
    if (language === 'javascript') {
        return new Response(
            JSON.stringify({
                results: runJavaScriptLocally(code, testCases, problemId),
            }),
            { status: 200 }
        );
    }

    function runJavaScriptLocally(code, testCases, problemId) {
        return testCases.map((testCase, index) => {
            try {
                const sandbox = {
                    console: { log: () => { } },
                    JSON: JSON,
                };

                // Create dynamic function call based on problem ID
                let functionCall;
                switch (problemId) {
                    case 'two-sum':
                        functionCall = `
                            ${code}
                            const nums = input.nums;
                            const target = input.target;
                            return twoSum(nums, target);
                        `;
                        break;
                    case 'reverse-string':
                        functionCall = `
                            ${code}
                            const s = input.s;
                            return reverseString(s);
                        `;
                        break;
                    case 'palindrome-number':
                        functionCall = `
                        ${code}
                        const x = input.x;
                        return isPalindrome(x);
                        `;
                        break;
                    case 'roman-to-integer':
                        functionCall = `
                        ${code}
                        const s = input.s;
                        return romanToInt(s);
                        `;
                        break;
                    default:
                        functionCall = `
                            ${code}
                            return solution(input);
                        `;
                }

                const fn = new Function('input', functionCall);
                const result = fn(testCase.input);

                return {
                    testCase: index + 1,
                    passed:
                        JSON.stringify(result) ===
                        JSON.stringify(testCase.output),
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
}
