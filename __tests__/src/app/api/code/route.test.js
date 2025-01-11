import { POST } from './route';
import { MongoClient } from 'mongodb';

jest.mock('mongodb');

describe('Code Execution API', () => {
    let mockCollection;
    let mockDb;
    let mockClient;

    beforeEach(() => {
        mockCollection = {
            findOne: jest.fn(),
            updateOne: jest.fn(),
        };
        mockDb = {
            collection: jest.fn().mockReturnValue(mockCollection),
        };
        mockClient = {
            db: jest.fn().mockReturnValue(mockDb),
            close: jest.fn(),
        };
        MongoClient.connect = jest.fn().mockResolvedValue(mockClient);
    });

    describe('runJavaScriptLocally', () => {
        const testCode = `
            function sum(nums) {
                return nums.reduce((a, b) => a + b, 0);
            }
        `;

        test('successfully executes valid JavaScript code', async () => {
            const req = {
                json: () =>
                    Promise.resolve({
                        code: testCode,
                        language: 'javascript',
                        problemId: 'test1',
                        userId: 'user1',
                    }),
            };

            mockCollection.findOne.mockResolvedValue({
                id: 'test1',
                testCases: [{ input: [1, 2, 3], output: 6 }],
                functionCalls: {
                    javascript: 'return sum(input);',
                },
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.results[0].passed).toBe(true);
            expect(data.results[0].received).toBe(6);
        });

        test('handles runtime errors in code execution', async () => {
            const req = {
                json: () =>
                    Promise.resolve({
                        code: 'function sum(nums) { return nums.undefined(); }',
                        language: 'javascript',
                        problemId: 'test2',
                        userId: 'user1',
                    }),
            };

            mockCollection.findOne.mockResolvedValue({
                id: 'test2',
                testCases: [{ input: [1, 2, 3], output: 6 }],
                functionCalls: {
                    javascript: 'return sum(input);',
                },
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.results[0].passed).toBe(false);
            expect(data.results[0].error).toBeTruthy();
        });

        test('handles Python results correctly', async () => {
            const pythonResults = [
                {
                    testCase: 1,
                    passed: true,
                    input: [1, 2],
                    output: 3,
                    received: 3,
                },
            ];

            const req = {
                json: () =>
                    Promise.resolve({
                        code: '',
                        language: 'python',
                        problemId: 'test3',
                        userId: 'user1',
                        pythonResults,
                    }),
            };

            mockCollection.findOne.mockResolvedValue({
                id: 'test3',
                testCases: [{ input: [1, 2], output: 3 }],
            });

            const response = await POST(req);
            const data = await response.json();

            expect(data.results).toEqual(pythonResults);
        });

        test('updates user progress when all tests pass', async () => {
            const req = {
                json: () =>
                    Promise.resolve({
                        code: testCode,
                        language: 'javascript',
                        problemId: 'test4',
                        userId: 'user1',
                    }),
            };

            mockCollection.findOne.mockResolvedValue({
                id: 'test4',
                difficulty: 'Easy',
                testCases: [{ input: [1, 2, 3], output: 6 }],
                functionCalls: {
                    javascript: 'return sum(input);',
                },
            });

            await POST(req);

            expect(mockCollection.updateOne).toHaveBeenCalled();
        });

        test('handles database errors gracefully', async () => {
            const req = {
                json: () =>
                    Promise.resolve({
                        code: testCode,
                        language: 'javascript',
                        problemId: 'test5',
                        userId: 'user1',
                    }),
            };

            MongoClient.connect.mockRejectedValue(new Error('Database error'));

            const response = await POST(req);
            const data = await response.json();

            expect(data.results[0].passed).toBe(false);
            expect(data.results[0].error).toContain('Failed to execute code');
        });
    });
});
