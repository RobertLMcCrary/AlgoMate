import { HfInference } from '@huggingface/inference';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res
            .status(400)
            .json({
                error: 'Invalid request body. Provide an array of messages.',
            });
    }

    const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

    try {
        let out = '';
        const stream = client.chatCompletionStream({
            model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
            messages,
            max_tokens: 500,
        });

        for await (const chunk of stream) {
            if (chunk.choices && chunk.choices.length > 0) {
                const newContent = chunk.choices[0].delta.content;
                out += newContent;
            }
        }

        return res.status(200).json({ output: out });
    } catch (error) {
        console.error('Error during Qwen API call:', error);
        return res.status(500).json({ error: 'Failed to process the request' });
    }
}
