import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectMongoDB from '../../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function POST(req) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    const payload = await req.json();
    console.log('Webhook payload:', payload);

    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);

    try {
        const evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });

        const { id, email_addresses, ...attributes } = evt.data;

        await connectMongoDB();
        const db = mongoose.connection.useDb('PseudoAI'); // Specify the correct database
        const collection = db.collection('Users');

        const result = await collection.updateOne(
            { clerkId: id },
            {
                $setOnInsert: {
                    clerkId: id,
                    email: email_addresses[0].email_address,
                    createdAt: new Date(),
                    solvedProblems: [],
                    attemptedProblems: [],
                    progress: {
                        easy: 0,
                        medium: 0,
                        hard: 0,
                    },
                },
            },
            { upsert: true }
        );

        //console.log('MongoDB operation result:', result);
        console.log('MongoDB operation result:', result);

        return new Response('Webhook received', { status: 200 });
    } catch (err) {
        console.error('Error:', err);
        return new Response('Webhook verification failed', { status: 400 });
    }
}
