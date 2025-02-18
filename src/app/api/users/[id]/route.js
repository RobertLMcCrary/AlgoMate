import { MongoClient } from 'mongodb';

function calculateRank(problemsSolved) {
    const total =
        problemsSolved.easy + problemsSolved.medium + problemsSolved.hard;

    if (total >= 100) return 'Grand Master';
    if (total >= 50) return 'Master';
    if (total >= 25) return 'Expert';
    if (total >= 10) return 'Intermediate';
    if (total >= 1) return 'Beginner';
    return 'Novice';
}

export async function PUT(request, { params }) {
    const id = params.id;
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db('PseudoAI');
    const Users = db.collection('Users');

    const user = await Users.findOne({ clerkId: id });
    const newRank = calculateRank(user.problemsSolved);

    await Users.updateOne({ clerkId: id }, { $set: { rank: newRank } });

    await client.close();

    return new Response(JSON.stringify({ rank: newRank }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}

export async function GET(request, { params }) {
    const id = await params.id;
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db('PseudoAI');
    const Users = db.collection('Users');

    const userData = await Users.findOne({ clerkId: id });

    await client.close();

    return new Response(JSON.stringify(userData), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}
