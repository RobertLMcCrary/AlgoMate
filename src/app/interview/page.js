'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function InterviewPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    const startRecording = () => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const recorder = new MediaRecorder(stream);
                setMediaRecorder(recorder);
                const chunks = [];
                recorder.ondataavailable = (event) => {
                    chunks.push(event.data);
                };

                recorder.onstop = async () => {
                    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'audio.webm');

                    const response = await fetch('/api/transcribe', {
                        method: 'POST',
                        body: formData,
                    });

                    const { text } = await response.json();
                    sendToGPT(text);
                };

                recorder.start();
                setIsRecording(true);
            })
            .catch((err) => {
                console.error('Error accessing the microphone:', err);
            });
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const sendToGPT = async (text) => {
        const response = await fetch('/api/voice', {
            method: 'POST',
            body: JSON.stringify({ message: text }),
            headers: { 'Content-Type': 'application/json' },
        });

        const { responseText, audioUrl } = await response.json();
        setTranscript(text);
        setResponse(responseText);
        playAudio(audioUrl); // Play the AI's voice response from the audio URL
    };

    const playAudio = (audioUrl) => {
        const audio = new Audio(audioUrl);
        audio.play();
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-purple-400 mb-4">
                        Voice Interview
                    </h1>
                    <p className="text-gray-300">
                        Have a conversation with your AI interviewer
                    </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
                    <div className="flex justify-center mb-8">
                        <button
                            onClick={
                                isRecording ? stopRecording : startRecording
                            }
                            className={`px-8 py-4 rounded-full text-xl font-bold transition ${
                                isRecording
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                        >
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </button>
                    </div>

                    <div className="space-y-6">
                        {transcript && (
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h2 className="text-xl font-semibold text-purple-400 mb-2">
                                    You:
                                </h2>
                                <p>{transcript}</p>
                            </div>
                        )}

                        {response && (
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h2 className="text-xl font-semibold text-purple-400 mb-2">
                                    AI Interviewer:
                                </h2>
                                <p>{response}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default InterviewPage;
