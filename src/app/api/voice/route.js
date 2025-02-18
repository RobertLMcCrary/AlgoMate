import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    const { message } = req.body; // Get the user's message

    // Get the GPT response
    const chatResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: message }],
    });

    const text = chatResponse.choices[0].message.content;

    // Convert the response text to speech
    const speechResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy', // Choose the AI's voice (adjust as needed)
        input: text,
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(speechResponse.audio); // Send the audio file as a response
}
