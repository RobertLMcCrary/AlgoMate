import { MongoClient } from 'mongodb';

export async function GET(request) {
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db('PseudoAI');
    const Users = db.collection('Users');

    const users = await Users.find({}).toArray();

    await client.close();

    return new Response(JSON.stringify(users), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}
