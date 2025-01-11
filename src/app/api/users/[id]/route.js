import { MongoClient } from 'mongodb';

export async function GET(request, { params }) {
    const id = await params.id;
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db('PseudoAI');
    const Users = db.collection('Users');

    const userData = await Users.findOne({ clerkId: params.id });

    await client.close();

    return new Response(JSON.stringify(userData), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}
