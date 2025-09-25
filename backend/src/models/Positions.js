import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        symbol: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        averagePrice: {
            type: Number,
            required: true
        }
});

positionSchema.index({ user: 1, symbol: 1 }, { unique: true });

const Position = mongoose.model('Position', positionSchema);

export default Position;