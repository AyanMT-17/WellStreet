import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        googleId: { type: String, required: true, unique: true },
        email: { type: String },
        name: { type: String },
        avatar: { type: String },
        createdAt: { type: Date, default: Date.now },
        cash: {
        type: Number,
        default: 1000000
    },
        watchlist: {
        type: [String], // An array of stock symbols
        default: []
    }
});

const User = mongoose.model('User', userSchema);

export default User;