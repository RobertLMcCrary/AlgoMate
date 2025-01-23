import { POST } from './route';
import { MongoClient } from 'mongodb';
import { createMocks } from 'node-mocks-http';

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

    test('successfully executes JavaScript code and returns results', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                code: 'function sum(a,b) { return a + b; }',
                language: 'javascript',
                problemId: 'test123',
                userId: 'user123',
            },
        });

        mockCollection.findOne.mockResolvedValue({
            id: 'test123',
            testCases: [
                { input: [1, 2], output: 3 },
                { input: [0, 0], output: 0 },
            ],
            functionCalls: {
                javascript: 'return sum(input[0], input[1]);',
            },
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results).toHaveLength(2);
        expect(data.results[0].passed).toBe(true);
        expect(data.results[1].passed).toBe(true);
    });

    test('handles Python results correctly', async () => {
        const pythonResults = [
            {
                testCase: 1,
                passed: true,
                input: [1, 2],
                expected: 3,
                received: 3,
            },
        ];

        const { req, res } = createMocks({
            method: 'POST',
            body: {
                code: 'def sum(a,b): return a + b',
                language: 'python',
                problemId: 'test123',
                userId: 'user123',
                pythonResults,
            },
        });

        mockCollection.findOne.mockResolvedValue({
            id: 'test123',
            testCases: [{ input: [1, 2], output: 3 }],
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results).toEqual(pythonResults);
    });

    test('handles JavaScript execution errors', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                code: 'function sum(a,b) { throw new Error("Test error"); }',
                language: 'javascript',
                problemId: 'test123',
                userId: 'user123',
            },
        });

        mockCollection.findOne.mockResolvedValue({
            id: 'test123',
            testCases: [{ input: [1, 2], output: 3 }],
            functionCalls: {
                javascript: 'return sum(input[0], input[1]);',
            },
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.results[0].passed).toBe(false);
        expect(data.results[0].error).toBeDefined();
    });

    test('updates user progress when all tests pass', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                code: 'function sum(a,b) { return a + b; }',
                language: 'javascript',
                problemId: 'test123',
                userId: 'user123',
            },
        });

        mockCollection.findOne.mockResolvedValue({
            id: 'test123',
            difficulty: 'Easy',
            testCases: [{ input: [1, 2], output: 3 }],
            functionCalls: {
                javascript: 'return sum(input[0], input[1]);',
            },
        });

        await POST(req);

        expect(mockCollection.updateOne).toHaveBeenCalled();
    });
});
