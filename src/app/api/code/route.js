import { MongoClient } from 'mongodb';

// Language IDs for Judge0
const languageIds = {
    java: 62,
    cpp: 54,
};

// Function to execute code using Judge0
async function executeJudge0Code(code, language, testCase, functionCall) {
    const fullCode = `${functionCall}\n${code}`;

    console.log('Full Code:', fullCode);

    // Create submission
    const createResponse = await fetch(
        'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-key': process.env.RAPID_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            },
            body: JSON.stringify({
                language_id: languageIds[language],
                source_code: Buffer.from(fullCode).toString('base64'),
                stdin: Buffer.from(JSON.stringify(testCase.input)).toString(
                    'base64'
                ),
            }),
        }
    );

    const submission = await createResponse.json();
    console.log('Submission:', submission);

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get results
    const statusResponse = await fetch(
        `https://judge0-ce.p.rapidapi.com/submissions/${submission.token}?base64_encoded=true&fields=*`,
        {
            method: 'GET',
            headers: {
                'x-rapidapi-key': process.env.RAPID_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            },
        }
    );

    const result = await statusResponse.json();
    console.log('Result:', result);

    // Decode the output
    const output = result.stdout
        ? Buffer.from(result.stdout, 'base64').toString()
        : '';
    const error = result.stderr
        ? Buffer.from(result.stderr, 'base64').toString()
        : '';

    return {
        passed: output === JSON.stringify(testCase.output),
        input: testCase.input,
        expected: testCase.output,
        received: output,
        error,
    };
}

// Function to run JavaScript locally
function runJavaScriptLocally(code, testCases, functionCall) {
    return testCases.map((testCase, index) => {
        try {
            const stdout = [];
            const sandbox = {
                console: {
                    log: (...args) => stdout.push(args.join(' ')),
                },
            };

            const fn = new Function(
                'input',
                'sandbox',
                `with (sandbox) {
                    ${code}
                    ${functionCall}
                }`
            );

            const result = fn(testCase.input, sandbox);

            return {
                testCase: index + 1,
                passed:
                    JSON.stringify(result) === JSON.stringify(testCase.output),
                input: testCase.input,
                expected: testCase.output,
                received: result,
                stdout: stdout.join('\n'),
            };
        } catch (error) {
            return {
                testCase: index + 1,
                passed: false,
                error: error.message,
                input: testCase.input,
                expected: testCase.output,
                received: null,
                stdout: '',
            };
        }
    });
}

// POST method
export async function POST(req) {
    const { code, language, problemId, userId, pythonResults } =
        await req.json();

    try {
        const client = await MongoClient.connect(process.env.MONGO_URI);
        const db = client.db('PseudoAI');
        const problem = await db
            .collection('Problems')
            .findOne({ id: problemId });

        if (!problem) {
            throw new Error('Problem not found');
        }

        const functionCall = problem.functionCalls[language];
        if (!functionCall) {
            throw new Error(
                `Function call not found for language: ${language}`
            );
        }

        let results;
        if (language === 'javascript') {
            results = runJavaScriptLocally(
                code,
                problem.testCases,
                functionCall
            );
        } else if (language === 'python') {
            results = pythonResults;
        } else if (['cpp', 'java'].includes(language)) {
            results = await Promise.all(
                problem.testCases.map((testCase) =>
                    executeJudge0Code(code, language, testCase, functionCall)
                )
            );
        }

        const allTestsPassed = results.every((result) => result.passed);
        if (allTestsPassed && userId) {
            const Users = db.collection('Users');
            await Users.updateOne(
                {
                    clerkId: userId,
                    'solvedProblems.problemId': { $ne: problemId },
                },
                {
                    $inc: {
                        [`problemsSolved.${problem.difficulty.toLowerCase()}`]: 1,
                    },
                    $push: {
                        solvedProblems: {
                            problemId,
                            difficulty: problem.difficulty,
                            language,
                            solvedAt: new Date(),
                        },
                    },
                }
            );
        }

        await client.close();
        return new Response(JSON.stringify({ results }), { status: 200 });
    } catch (error) {
        console.error('Error in POST function:', error);
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
