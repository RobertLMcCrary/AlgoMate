import JSCPP from 'jscpp';

export const executeCppCode = async (code, functionCall, testCases) => {
    return testCases.map((testCase, index) => {
        try {
            let stdout = '';
            const config = {
                stdio: {
                    write: (str) => {
                        stdout += str;
                    },
                },
            };

            // Prepare full code with necessary includes and function call
            const fullCode = `
#include <iostream>
#include <vector>
#include <string>
#include <cstdlib>
${code}

int main() {
  ${functionCall.replace('result =', 'auto result =')}
  return 0;
}`;

            // Execute the code
            JSCPP.run(fullCode, JSON.stringify(testCase.input), config);

            return {
                testCase: index + 1,
                passed: true, // You'll need to determine this based on the output
                input: testCase.input,
                expected: testCase.output,
                received: null, // Update this based on your function call results
                stdout: stdout,
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
};
