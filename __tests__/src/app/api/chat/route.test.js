const { HfInference } = require('@huggingface/inference');
const { POST } = require('@/app/api/chat/route');

jest.mock('@huggingface/inference');

describe('Chat API Route', () => {
    let mockStream;
    let mockWriter;
    let consoleErrorSpy;

    beforeEach(() => {
        mockWriter = {
            write: jest.fn(),
            close: jest.fn(),
        };

        global.TransformStream = jest.fn().mockImplementation(() => ({
            writable: { getWriter: () => mockWriter },
            readable: {},
        }));

        global.TextEncoder = jest.fn().mockImplementation(() => ({
            encode: jest.fn((text) => text),
        }));

        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should process chat messages and stream responses successfully', async () => {
        const mockMessages = [{ role: 'user', content: 'Hello' }];
        const mockChunks = [
            { choices: [{ delta: { content: 'Hello' } }] },
            { choices: [{ delta: { content: ' world!' } }] },
        ];

        HfInference.mockImplementation(() => ({
            chatCompletionStream: jest.fn().mockReturnValue(mockChunks),
        }));

        const req = {
            json: jest.fn().mockResolvedValue({ messages: mockMessages }),
        };

        const response = await POST(req);

        expect(response.status).toBe(200);
        expect(mockWriter.write).toHaveBeenCalledTimes(2);
        expect(mockWriter.close).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
        const mockError = new Error('API Error');
        HfInference.mockImplementation(() => ({
            chatCompletionStream: jest.fn().mockRejectedValue(mockError),
        }));

        const req = {
            json: jest.fn().mockResolvedValue({ messages: [] }),
        };

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to process request');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error during API call:',
            mockError
        );
    });

    it('should stream multiple chunks of content', async () => {
        const mockMessages = [{ role: 'user', content: 'Test message' }];
        const mockChunks = [
            { choices: [{ delta: { content: 'Part 1' } }] },
            { choices: [{ delta: { content: 'Part 2' } }] },
            { choices: [{ delta: { content: 'Part 3' } }] },
        ];

        HfInference.mockImplementation(() => ({
            chatCompletionStream: jest.fn().mockReturnValue(mockChunks),
        }));

        const req = {
            json: jest.fn().mockResolvedValue({ messages: mockMessages }),
        };

        const response = await POST(req);

        expect(response.headers.get('Content-Type')).toBe(
            'text/plain; charset=utf-8'
        );
        expect(mockWriter.write).toHaveBeenCalledTimes(3);
        expect(mockWriter.write).toHaveBeenCalledWith('Part 1');
        expect(mockWriter.write).toHaveBeenCalledWith('Part 2');
        expect(mockWriter.write).toHaveBeenCalledWith('Part 3');
    });
});
