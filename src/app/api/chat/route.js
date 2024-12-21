import { HfInference } from '@huggingface/inference';

export const maxDuration = 30; // Set max duration for Vercel serverless function
export const dynamic = 'force-dynamic'; // Disable static optimization

/*
export async function POST(req) {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
        return new Response(
            JSON.stringify({
                error: 'Invalid request body. Provide an array of messages.',
            }),
            { status: 400 }
        );
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

        return new Response(JSON.stringify({ output: out }), { status: 200 });
    } catch (error) {
        console.error('Error during Qwen API call:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process the request' }),
            { status: 500 }
        );
    }
}
*/

//updated post request to handle the streaming output
export async function POST(req) {
    const { messages } = await req.json();
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

    try {
        const llmStream = client.chatCompletionStream({
            model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
            messages,
            max_tokens: 500,
        });

        (async () => {
            for await (const chunk of llmStream) {
                if (chunk.choices && chunk.choices.length > 0) {
                    const newContent = chunk.choices[0].delta.content;
                    await writer.write(encoder.encode(newContent));
                }
            }
            await writer.close();
        })();

        return new Response(stream.readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch (error) {
        console.error('Error during API call:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process request' }),
            { status: 500 }
        );
    }
}
