const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    lastSignIn: Date,
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
});

module.exports = mongoose.model('User', userSchema);
