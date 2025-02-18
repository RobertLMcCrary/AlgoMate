import formidable from 'formidable';
import fs from 'fs';
import { OpenAI } from 'openai';

// Disable body parsing for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        // Handle the file upload and transcription
        const file = fs.createReadStream(files.file[0].filepath);

        try {
            const transcript = await openai.audio.transcriptions.create({
                file,
                model: 'whisper-1',
            });

            res.json({ text: transcript.text }); // Send back transcribed text
        } catch (error) {
            res.status(500).json({ error: 'Failed to transcribe the audio.' });
        }
    });
}
