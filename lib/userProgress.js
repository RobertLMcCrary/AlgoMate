const User = require('./models/User');

async function updateUserProgress(clerkId, problemId, difficulty) {
    const update = {
        $inc: {
            [`problemsSolved.${difficulty.toLowerCase()}`]: 1,
        },
        $push: {
            solvedProblems: {
                problemId,
                difficulty,
                solvedAt: new Date(),
            },
        },
    };

    return await User.findOneAndUpdate({ clerkId }, update, { new: true });
}
