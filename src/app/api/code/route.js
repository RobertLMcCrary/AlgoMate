import { javascriptFunctionCalls } from '@/utils/codeExecutionUtils';
import { updateUserProgress } from '@/lib/userProgress';
import { auth } from '@clerk/nextjs';

//we not using judge0 api anymore because it is lowkey too expensive
//keep this code snippet just in case though
//const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
/*
const languageIds = {
    python: 71,
    cpp: 54,
    java: 62,
};
*/

//running javascript locally
function runJavaScriptLocally(code, testCases, problemId) {
    return testCases.map((testCase, index) => {
        try {
            const functionCall =
                javascriptFunctionCalls[problemId] ||
                javascriptFunctionCalls.default;
            const fn = new Function('input', functionCall(code));
            const result = fn(testCase.input);

            return {
                testCase: index + 1,
                passed:
                    JSON.stringify(result) === JSON.stringify(testCase.output),
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

//post request for running the code
export async function POST(req) {
    const { code, language, problemId, testCases } = await req.json();
    const { userId } = auth();

    try {
        if (language === 'javascript') {
            const results = runJavaScriptLocally(code, testCases, problemId);

            // Check if all test cases passed
            const allTestsPassed = results.every((result) => result.passed);

            if (allTestsPassed && userId) {
                await updateUserProgress(userId, problemId, problem.difficulty);
            }

            return new Response(JSON.stringify({ results }), { status: 200 });
        }
    } catch (error) {
        return new Response(
            JSON.stringify({
                results: [
                    {
                        testCase: 1,
                        passed: false,
                        error: 'Failed to execute code: ' + error.message,
                    },
                ],
            }),
            { status: 200 }
        );
    }
}
