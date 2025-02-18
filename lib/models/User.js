const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        clerkId: { type: String, required: true, unique: true },
        email: { type: String, required: true },
        lastSignIn: Date,
        visibility: { type: Boolean, default: true },
        problemsSolved: {
            easy: { type: Number, default: 0 },
            medium: { type: Number, default: 0 },
            hard: { type: Number, default: 0 },
        },
        solvedProblems: [
            {
                problemId: String,
                difficulty: String,
                solvedAt: { type: Date, default: Date.now },
            },
        ],
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId, // Reference to another user
                ref: 'User', // Reference the 'User' collection
            },
        ],
        notes: [
            {
                problemId: String,
                note: String,
            },
        ],
        rank: {
            type: String,
            default: 'Unranked',
        },
    },
    { collection: 'Users' }
);

module.exports = mongoose.model('User', userSchema);
