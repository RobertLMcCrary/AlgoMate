import { auth } from '@clerk/nextjs';
import User from '../../../../lib/models/User';
import connectMongoDB from '../../../../lib/mongodb';

export async function POST(req) {
    const { userId } = auth();

    await connectMongoDB();

    const user = await User.findOneAndUpdate(
        { clerkId: userId },
        {
            clerkId: userId,
            email: req.email,
            lastSignIn: new Date(),
        },
        { upsert: true, new: true }
    );

    return new Response(JSON.stringify(user), { status: 200 });
}
