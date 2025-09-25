import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    side: { // 'BUY' or 'SELL'
        type: String,
        required: true,
        enum: ['BUY', 'SELL']
    },
    type: { // 'MARKET' or 'LIMIT'
        type: String,
        required: true,
        enum: ['MARKET', 'LIMIT']
    },
    quantity: {
        type: Number,
        required: true
    },
    price: { // The price the order was filled at
        type: Number,
        required: true
    },
    status: { // 'FILLED', 'PENDING', 'CANCELED'
        type: String,
        required: true,
        default: 'FILLED'
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;