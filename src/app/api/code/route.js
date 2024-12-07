const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';

const languageIds = {
    python: 71,
    cpp: 54,
    java: 62,
};

function runJavaScriptLocally(code, testCases, problemId) {
    return testCases.map((testCase, index) => {
        try {
            const sandbox = {
                console: { log: () => {} },
                JSON: JSON,
            };

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

async function runWithJudge0(code, language, testCases) {
    const results = [];

    for (const testCase of testCases) {
        try {
            if (results.length > 0) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }

            const processedCode = `
import json
import sys

def main():
    try:
        input_data = json.loads(input())
        result = None
        
        if 'nums' in input_data:
            result = twoSum(input_data['nums'], input_data['target'])
        elif 'x' in input_data:
            result = isPalindrome(input_data['x'])
        elif 's' in input_data:
            if isinstance(input_data['s'], list):
                s = input_data['s']
                result = reverseString(s)
            else:
                result = romanToInt(input_data['s'])
        
        print(json.dumps(result))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        raise

${code}

if __name__ == "__main__":
    main()`;

            const submitResponse = await fetch(
                `${JUDGE0_API}/submissions?base64_encoded=true&wait=false&fields=*`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                    },
                    body: JSON.stringify({
                        language_id: languageIds[language],
                        source_code: processedCode,
                        stdin: JSON.stringify(testCase.input),
                    }),
                }
            );

            if (submitResponse.status === 429) {
                results.push({
                    testCase: results.length + 1,
                    passed: false,
                    error: 'Rate limit exceeded. Please wait a moment and try again.',
                    input: testCase.input,
                    expected: testCase.output,
                    received: null,
                });
                continue;
            }

            const submitData = await submitResponse.json();
            if (!submitData.token) {
                throw new Error('No token received from Judge0');
            }

            const result = submitData;
            let receivedOutput = null;

            if (result.stdout) {
                try {
                    receivedOutput = JSON.parse(result.stdout.trim());
                } catch {
                    receivedOutput = result.stdout.trim();
                }
            }

            results.push({
                testCase: results.length + 1,
                passed:
                    JSON.stringify(receivedOutput) ===
                    JSON.stringify(testCase.output),
                input: testCase.input,
                expected: testCase.output,
                received: receivedOutput,
                error: result.stderr || null,
            });
        } catch (error) {
            results.push({
                testCase: results.length + 1,
                passed: false,
                error: error.message || 'Execution error',
                input: testCase.input,
                expected: testCase.output,
                received: null,
            });
        }
    }

    return results;
}

export async function POST(req) {
    const { code, language, problemId, testCases } = await req.json();

    if (language === 'javascript') {
        return new Response(
            JSON.stringify({
                results: runJavaScriptLocally(code, testCases, problemId),
            }),
            { status: 200 }
        );
    } else {
        const results = await runWithJudge0(code, language, testCases);
        return new Response(JSON.stringify({ results }), { status: 200 });
    }
}

/*
async function runWithJudge0(code, language, testCases) {
    const results = [];

    for (const testCase of testCases) {
        try {
            console.log('Starting submission with code:', code);
            console.log('Test case:', testCase);

            let processedCode = code;
            if (language === 'python') {
                processedCode = `
import json

def main():
    # Parse input
    input_data = json.loads(input())
    nums = input_data['nums']
    target = input_data['target']
    
    # Call the solution function
    result = twoSum(nums, target)
    
    # Print result as JSON
    print(json.dumps(result))

${code}

if __name__ == "__main__":
    main()
`;
            }

            const submitResponse = await fetch(`${JUDGE0_API}/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                },
                body: JSON.stringify({
                    language_id: languageIds[language],
                    source_code: processedCode,
                    stdin: JSON.stringify(testCase.input),
                    wait: true,
                    memory_limit: 262144,
                    cpu_time_limit: 5,
                    expected_output: JSON.stringify(testCase.output),
                }),
            });

            const submitData = await submitResponse.json();
            console.log('Submit response:', submitData);
            const { token } = submitData;

            // Add delay to ensure processing
            await new Promise((resolve) => setTimeout(resolve, 5000));

            const resultResponse = await fetch(
                `${JUDGE0_API}/submissions/${token}?base64_encoded=false&fields=*`,
                {
                    headers: {
                        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                    },
                }
            );

            const result = await resultResponse.json();
            console.log('Judge0 complete response:', result);

            let receivedOutput = null;
            if (result.stdout) {
                try {
                    receivedOutput = JSON.parse(result.stdout.trim());
                    console.log('Parsed output:', receivedOutput);
                } catch {
                    receivedOutput = result.stdout.trim();
                    console.log('Raw output:', receivedOutput);
                }
            }

            results.push({
                testCase: results.length + 1,
                passed:
                    JSON.stringify(receivedOutput) ===
                    JSON.stringify(testCase.output),
                input: testCase.input,
                expected: testCase.output,
                received: receivedOutput,
                error: result.stderr || result.compile_output || null,
                status: result.status?.description,
                compile_output: result.compile_output,
                stdout: result.stdout,
                stderr: result.stderr,
            });
        } catch (error) {
            console.error('Error in execution:', error);
            results.push({
                testCase: results.length + 1,
                passed: false,
                error: error.message || 'Execution error',
                input: testCase.input,
                expected: testCase.output,
                received: null,
            });
        }
    }

    return results;
}
*/
