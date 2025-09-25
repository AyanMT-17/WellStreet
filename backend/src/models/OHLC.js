// In models/OHLC.js
import mongoose from 'mongoose';

const ohlcSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    timestamp: { type: Date, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, required: true },
});

// Ensures we don't store duplicate data for the same stock on the same day
ohlcSchema.index({ symbol: 1, timestamp: 1 }, { unique: true });

const OHLC = mongoose.model('OHLC', ohlcSchema);

export default OHLC;