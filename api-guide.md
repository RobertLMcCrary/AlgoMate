# How to make a call to the /api/chat
## Frontend
<code>

    const handleUserInput = async (e) => {
        alert('hello world');
        e.preventDefault();
        if (userInput.trim()) {
            const newMessage = { role: 'user', content: userInput };
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);
            setUserInput('');
            setLoading(true);

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ messages: updatedMessages }),
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                if (data && data.output) {
                    setResponse(data.output);
                } else {
                    throw new Error('Received an empty or invalid response');
                }
            } catch (error) {
                console.error('Error:', error);
                setResponse('Something went wrong. Please try again.');
            }

            setLoading(false);
        }
    };

</code>

## Backend (/api/chat/route.js)

<code>

    import { HfInference } from '@huggingface/inference';

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

</code>