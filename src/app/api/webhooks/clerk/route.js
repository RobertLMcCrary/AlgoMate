import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { MongoClient } from 'mongodb';
import connectMongoDB from '../../../../../lib/mongodb';

export async function POST(req) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const webhook = new Webhook(WEBHOOK_SECRET);
    const evt = webhook.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
    });
    const { id, email_addresses, ...attributes } = evt.data;
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db('PseudoAI');
    const Users = db.collection('Users');
    if (evt.type === 'user.created') {
        await Users.insertOne({
            clerkId: id,
            email: email_addresses[0].email_address,
            username:
                evt.data.username ||
                email_addresses[0].email_address.split('@')[0],
            imageUrl: evt.data.image_url,
            lastSignIn: new Date(),
            problemsSolved: {
                easy: 0,
                medium: 0,
                hard: 0,
            },
            solvedProblems: [],
        });
    }
    await client.close();
    return new Response('Webhook received', { status: 200 });
}
