// In jobs/dataSync.js
import cron from 'node-cron';
import yahooFinance from 'yahoo-finance2';
import OHLC from '../models/OHLC.js';

// A list of important NIFTY 50 stocks to track
const SYMBOLS_TO_TRACK = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS',
    'ICICIBANK.NS', 'HINDUNILVR.NS', 'SBIN.NS', 'BAJFINANCE.NS'
];

const syncMarketData = async () => {
    console.log('🗓️ Starting daily market data sync...');
    
    for (const symbol of SYMBOLS_TO_TRACK) {
        try {
            const result = await yahooFinance.historical(symbol, {
                period1: '2023-01-01', // Fetch data from a fixed start date
                interval: '1d'
            });

            for (const bar of result) {
                // 'Upsert' operation: Update if exists, insert if not.
                // This prevents duplicate entries.
                await OHLC.updateOne(
                    { symbol: symbol, timestamp: bar.date },
                    {
                        $set: {
                            open: bar.open,
                            high: bar.high,
                            low: bar.low,
                            close: bar.close,
                            volume: bar.volume
                        }
                    },
                    { upsert: true }
                );
            }
            console.log(`✅ Synced data for ${symbol}`);
        } catch (err) {
            console.error(`❌ Failed to sync data for ${symbol}:`, err.message);
        }
    }
    console.log('Market data sync finished.');
};

// Schedule the job to run at 8:00 PM every day (IST)
// Cron syntax: 'minute hour day-of-month month day-of-week'
const scheduleDataSync = () => {
    cron.schedule('0 20 * * *', syncMarketData, {
        timezone: "Asia/Kolkata"
    });
    console.log('Scheduler started. Data sync will run daily at 8:00 PM IST.');
};

export default scheduleDataSync;