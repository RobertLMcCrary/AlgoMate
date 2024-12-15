import { javascriptFunctionCalls } from '@/utils/codeExecutionUtils';
import { MongoClient } from 'mongodb';

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

export async function POST(req) {
    const {
        code,
        language,
        problemId,
        testCases,
        difficulty,
        userId,
        results: pythonResults,
    } = await req.json();

    try {
        let results;
        if (language === 'javascript') {
            results = runJavaScriptLocally(code, testCases, problemId);
        } else if (language === 'python') {
            results = pythonResults;
        }

        const allTestsPassed = results.every((result) => result.passed);

        if (allTestsPassed && userId) {
            const client = await MongoClient.connect(process.env.MONGO_URI);
            const db = client.db('PseudoAI');
            const Users = db.collection('Users');

            // Only increment and add to solvedProblems if this problem hasn't been solved before
            await Users.updateOne(
                {
                    clerkId: userId,
                    'solvedProblems.problemId': { $ne: problemId }, // Check if problem hasn't been solved
                },
                {
                    $inc: {
                        [`problemsSolved.${difficulty.toLowerCase()}`]: 1,
                    },
                    $push: {
                        solvedProblems: {
                            problemId,
                            difficulty,
                            language,
                            solvedAt: new Date(),
                        },
                    },
                }
            );

            await client.close();
        }

        return new Response(JSON.stringify({ results }), { status: 200 });
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
